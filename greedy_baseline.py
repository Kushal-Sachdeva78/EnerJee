import pandas as pd
import numpy as np

def greedy_energy_mix(forecast_df, battery_capacity=500, battery_initial=250):
    """
    Greedy baseline: Use renewable energy to meet demand, prioritizing cheapest sources.
    Store excess in battery if possible, discharge when renewables insufficient.
    
    Args:
        forecast_df: DataFrame with 24-hour forecast
        battery_capacity: Maximum battery capacity (MWh)
        battery_initial: Initial battery charge (MWh)
    
    Returns:
        Dictionary with greedy strategy results
    """
    
    hours = len(forecast_df)
    results = {
        'status': 'Greedy',
        'hours': []
    }
    
    battery_level = battery_initial
    efficiency = 0.9
    max_rate = battery_capacity * 0.2  # Max charge/discharge rate
    
    for t in range(hours):
        demand = forecast_df.iloc[t]['demand']
        solar_avail = forecast_df.iloc[t]['solar_available']
        wind_avail = forecast_df.iloc[t]['wind_available']
        hydro_avail = forecast_df.iloc[t]['hydro_available']
        price = forecast_df.iloc[t]['price']
        
        # Greedy strategy: use cheapest sources first to meet demand
        # Cost factors: solar=0.5, wind=0.6, hydro=0.7
        remaining_demand = demand
        solar_use = 0
        wind_use = 0
        hydro_use = 0
        battery_charge = 0
        battery_discharge = 0
        unmet_demand = 0
        
        # Priority order: solar (cheapest), wind, hydro
        # 1. Use solar
        solar_use = min(solar_avail, remaining_demand)
        remaining_demand -= solar_use
        
        # 2. Use wind
        if remaining_demand > 0:
            wind_use = min(wind_avail, remaining_demand)
            remaining_demand -= wind_use
        
        # 3. Use hydro
        if remaining_demand > 0:
            hydro_use = min(hydro_avail, remaining_demand)
            remaining_demand -= hydro_use
        
        # 4. If still short, discharge battery
        if remaining_demand > 0:
            battery_discharge = min(remaining_demand, max_rate, battery_level)
            battery_level -= battery_discharge
            remaining_demand -= battery_discharge
        
        # 5. Any remaining is unmet demand
        if remaining_demand > 0:
            unmet_demand = remaining_demand
        
        # Check for excess renewable energy that can be stored
        excess_solar = solar_avail - solar_use
        excess_wind = wind_avail - wind_use
        excess_hydro = hydro_avail - hydro_use
        total_excess = excess_solar + excess_wind + excess_hydro
        
        # Charge battery with excess if possible
        if total_excess > 0:
            battery_charge = min(total_excess, max_rate, (battery_capacity - battery_level) / efficiency)
            battery_level += battery_charge * efficiency
            
            # Allocate the charging proportionally from excess sources
            if total_excess > 0:
                charge_fraction = battery_charge / total_excess
                solar_use += excess_solar * charge_fraction
                wind_use += excess_wind * charge_fraction
                hydro_use += excess_hydro * charge_fraction
        
        hour_result = {
            'hour': t,
            'datetime': forecast_df.iloc[t]['datetime'],
            'demand': demand,
            'solar_use': solar_use,
            'wind_use': wind_use,
            'hydro_use': hydro_use,
            'battery_charge': battery_charge,
            'battery_discharge': battery_discharge,
            'battery_level': battery_level,
            'unmet_demand': unmet_demand,
            'price': price
        }
        
        results['hours'].append(hour_result)
    
    # Calculate total cost and emissions
    results_df = pd.DataFrame(results['hours'])
    
    # Carbon emission factors (kg CO2 per MWh) - lifecycle emissions
    # Solar panels: manufacturing, installation, transport
    # Wind turbines: manufacturing, installation
    # Hydro: construction, reservoir emissions
    emission_factors = {
        'solar': 45,
        'wind': 12,
        'hydro': 24,
    }
    
    results['total_cost'] = (
        (results_df['solar_use'] * results_df['price'] * 0.5).sum() +
        (results_df['wind_use'] * results_df['price'] * 0.6).sum() +
        (results_df['hydro_use'] * results_df['price'] * 0.7).sum()
    )
    
    results['total_emissions'] = (
        results_df['solar_use'] * emission_factors['solar'] +
        results_df['wind_use'] * emission_factors['wind'] +
        results_df['hydro_use'] * emission_factors['hydro']
    ).sum()
    
    results['total_unmet'] = results_df['unmet_demand'].sum()
    
    return results


def results_to_dataframe(results):
    """Convert greedy results to DataFrame."""
    return pd.DataFrame(results['hours'])
