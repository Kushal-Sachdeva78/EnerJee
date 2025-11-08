import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def get_weather_forecast(latitude, longitude, hours=24):
    """
    Get weather forecast from Open-Meteo API for solar and wind predictions.
    
    Args:
        latitude: Location latitude
        longitude: Location longitude
        hours: Number of hours to forecast (default 24)
    
    Returns:
        DataFrame with weather forecast including solar radiation and wind speed
    """
    
    # Open-Meteo API endpoint (free, no API key required)
    url = "https://api.open-meteo.com/v1/forecast"
    
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": ["temperature_2m", "wind_speed_10m", "wind_speed_100m", 
                   "shortwave_radiation", "direct_radiation", "diffuse_radiation"],
        "forecast_days": max(1, (hours + 23) // 24),  # Round up to days
        "timezone": "auto"
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if 'hourly' not in data:
            raise ValueError("No hourly data in weather response")
        
        hourly = data['hourly']
        
        # Create DataFrame
        df = pd.DataFrame({
            'datetime': pd.to_datetime(hourly['time']),
            'temperature': hourly['temperature_2m'],
            'wind_speed_10m': hourly['wind_speed_10m'],
            'wind_speed_100m': hourly['wind_speed_100m'],
            'solar_radiation': hourly['shortwave_radiation'],
            'direct_radiation': hourly['direct_radiation'],
            'diffuse_radiation': hourly['diffuse_radiation']
        })
        
        # Take only requested hours
        df = df.head(hours)
        
        return df
    
    except requests.RequestException as e:
        raise ValueError(f"Weather API request failed: {e}")
    except (KeyError, ValueError) as e:
        raise ValueError(f"Failed to parse weather data: {e}")


def weather_to_energy_forecast(weather_df, solar_capacity=600, wind_capacity=300,
                                demand_baseline=1000):
    """
    Convert weather forecast to energy availability forecast.
    
    Args:
        weather_df: Weather forecast DataFrame
        solar_capacity: Maximum solar capacity (MWh)
        wind_capacity: Maximum wind capacity (MWh)
        demand_baseline: Baseline demand (MWh)
    
    Returns:
        DataFrame compatible with energy optimization
    """
    
    forecast_data = []
    
    for _, row in weather_df.iterrows():
        # Solar: Convert radiation (W/m²) to capacity factor
        # Peak radiation ~ 1000 W/m², typical panel efficiency ~ 20%
        radiation = row['solar_radiation']
        solar_capacity_factor = min(radiation / 1000, 1.0) if radiation > 0 else 0
        solar_available = solar_capacity * solar_capacity_factor
        
        # Wind: Convert wind speed to power using simplified power curve
        # Power = 0.5 * air_density * area * velocity^3 * efficiency
        # Simplified: capacity factor = (v/v_rated)^3 for v < v_rated
        wind_speed = row['wind_speed_100m']  # Use 100m height for better wind
        rated_speed = 12  # m/s
        
        if wind_speed < 3:  # Cut-in speed
            wind_capacity_factor = 0
        elif wind_speed > 25:  # Cut-out speed
            wind_capacity_factor = 0
        elif wind_speed < rated_speed:
            wind_capacity_factor = (wind_speed / rated_speed) ** 3
        else:
            wind_capacity_factor = 1.0
        
        wind_available = wind_capacity * wind_capacity_factor
        
        # Demand: Use baseline with typical daily pattern
        hour = row['datetime'].hour
        # Higher during day, lower at night
        demand_pattern = 0.7 + 0.3 * np.sin((hour - 6) * np.pi / 12)
        demand = demand_baseline * max(demand_pattern, 0.5)
        
        # Price: Simplified price based on demand pattern
        if 7 <= hour <= 10 or 17 <= hour <= 21:
            price = 60  # Peak hours
        elif 0 <= hour <= 5:
            price = 30  # Off-peak
        else:
            price = 50  # Normal
        
        forecast_data.append({
            'datetime': row['datetime'],
            'demand': round(demand, 2),
            'solar_available': round(solar_available, 2),
            'wind_available': round(wind_available, 2),
            'hydro_available': 140.0,  # Assume constant hydro availability
            'price': price
        })
    
    return pd.DataFrame(forecast_data)


# Region coordinates for weather API
REGION_COORDINATES = {
    'california': {'latitude': 36.7783, 'longitude': -119.4179},
    'texas': {'latitude': 31.9686, 'longitude': -99.9018},
    'norway': {'latitude': 60.4720, 'longitude': 8.4689},
}


def get_region_weather_forecast(region, hours=24):
    """
    Get weather-based energy forecast for a specific region.
    
    Args:
        region: Region name ('california', 'texas', 'norway')
        hours: Number of hours to forecast
    
    Returns:
        DataFrame with energy forecast
    """
    
    if region not in REGION_COORDINATES:
        raise ValueError(f"Unknown region: {region}. Available: {list(REGION_COORDINATES.keys())}")
    
    coords = REGION_COORDINATES[region]
    
    # Get weather forecast
    weather_df = get_weather_forecast(coords['latitude'], coords['longitude'], hours)
    
    # Convert to energy forecast with region-specific capacities
    region_params = {
        'california': {'solar_capacity': 600, 'wind_capacity': 300, 'demand_baseline': 1000},
        'texas': {'solar_capacity': 400, 'wind_capacity': 700, 'demand_baseline': 1200},
        'norway': {'solar_capacity': 150, 'wind_capacity': 400, 'demand_baseline': 800},
    }
    
    params = region_params[region]
    energy_forecast = weather_to_energy_forecast(
        weather_df,
        solar_capacity=params['solar_capacity'],
        wind_capacity=params['wind_capacity'],
        demand_baseline=params['demand_baseline']
    )
    
    return energy_forecast
