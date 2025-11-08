import pandas as pd
import numpy as np

def get_carbon_intensity(hour, source='solar'):
    """
    Get time-varying carbon intensity factors.
    
    Carbon intensity varies by:
    - Time of day (grid carbon intensity affects renewable lifecycle emissions)
    - Energy source type
    
    Args:
        hour: Hour of day (0-23)
        source: Energy source ('solar', 'wind', 'hydro')
    
    Returns:
        Carbon intensity in kg CO2 per MWh
    """
    
    # Base lifecycle emissions (kg CO2/MWh)
    base_emissions = {
        'solar': 45,
        'wind': 12,
        'hydro': 24,
    }
    
    # Time-of-day multiplier for grid carbon intensity
    # During peak hours, manufacturing and installation had higher grid carbon
    # Night hours benefit from lower grid carbon intensity
    if 0 <= hour < 6:
        # Night: lower grid intensity when built
        time_multiplier = 0.85
    elif 6 <= hour < 9:
        # Morning ramp: moderate
        time_multiplier = 1.0
    elif 9 <= hour < 17:
        # Day: higher grid intensity
        time_multiplier = 1.15
    elif 17 <= hour < 21:
        # Evening peak: highest
        time_multiplier = 1.25
    else:
        # Late evening: moderate
        time_multiplier = 0.95
    
    return base_emissions.get(source, 0) * time_multiplier


def get_all_carbon_intensities(hours=24):
    """
    Get carbon intensity for all hours and all sources.
    
    Args:
        hours: Number of hours (default 24)
    
    Returns:
        DataFrame with columns [hour, solar_intensity, wind_intensity, hydro_intensity]
    """
    
    data = []
    for hour in range(hours):
        data.append({
            'hour': hour % 24,
            'solar_intensity': get_carbon_intensity(hour % 24, 'solar'),
            'wind_intensity': get_carbon_intensity(hour % 24, 'wind'),
            'hydro_intensity': get_carbon_intensity(hour % 24, 'hydro')
        })
    
    return pd.DataFrame(data)
