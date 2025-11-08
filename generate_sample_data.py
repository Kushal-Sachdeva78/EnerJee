import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_region_data(region_name, days=7):
    """Generate sample energy data for a region."""
    
    # Base parameters by region
    region_params = {
        'california': {
            'base_demand': 1000,
            'solar_capacity': 600,
            'wind_capacity': 300,
            'hydro_capacity': 200,
            'price_base': 50,
        },
        'texas': {
            'base_demand': 1200,
            'solar_capacity': 400,
            'wind_capacity': 700,
            'hydro_capacity': 100,
            'price_base': 45,
        },
        'norway': {
            'base_demand': 800,
            'solar_capacity': 150,
            'wind_capacity': 400,
            'hydro_capacity': 600,
            'price_base': 40,
        }
    }
    
    params = region_params[region_name]
    hours = days * 24
    
    # Generate timestamps
    start_date = datetime(2025, 1, 1)
    timestamps = [start_date + timedelta(hours=i) for i in range(hours)]
    
    data = []
    
    for i, ts in enumerate(timestamps):
        hour = ts.hour
        day = ts.day
        
        # Demand pattern: higher during day, lower at night
        demand_pattern = 0.7 + 0.3 * np.sin((hour - 6) * np.pi / 12)
        demand_noise = np.random.normal(0, 0.05)
        demand = params['base_demand'] * (demand_pattern + demand_noise)
        demand = max(demand, params['base_demand'] * 0.5)
        
        # Solar: only during day (6am-6pm), peak at noon
        if 6 <= hour <= 18:
            solar_pattern = np.sin((hour - 6) * np.pi / 12)
            solar_noise = np.random.normal(0, 0.1)
            solar = params['solar_capacity'] * (solar_pattern + solar_noise)
            solar = max(solar, 0)
        else:
            solar = 0
        
        # Wind: variable throughout day, higher at night
        wind_pattern = 0.5 + 0.3 * np.sin(hour * np.pi / 12) + 0.2 * np.random.random()
        wind = params['wind_capacity'] * wind_pattern
        wind = max(wind, 0)
        
        # Hydro: relatively stable with some variation
        hydro_pattern = 0.7 + 0.2 * np.random.random()
        hydro = params['hydro_capacity'] * hydro_pattern
        hydro = max(hydro, 0)
        
        # Price: higher during peak hours (7-10am, 5-9pm), lower at night
        if 7 <= hour <= 10 or 17 <= hour <= 21:
            price_multiplier = 1.5
        elif 0 <= hour <= 5:
            price_multiplier = 0.6
        else:
            price_multiplier = 1.0
        
        price_noise = np.random.normal(0, 0.1)
        price = params['price_base'] * (price_multiplier + price_noise)
        price = max(price, params['price_base'] * 0.3)
        
        data.append({
            'datetime': ts,
            'demand': round(demand, 2),
            'solar_available': round(solar, 2),
            'wind_available': round(wind, 2),
            'hydro_available': round(hydro, 2),
            'price': round(price, 2)
        })
    
    df = pd.DataFrame(data)
    return df

# Generate data for three regions
regions = ['california', 'texas', 'norway']

for region in regions:
    df = generate_region_data(region)
    df.to_csv(f'data/{region}.csv', index=False)
    print(f"Generated data/{region}.csv with {len(df)} hours of data")
