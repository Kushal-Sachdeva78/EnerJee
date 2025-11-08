import pulp
import pandas as pd
import numpy as np
from carbon_intensity import get_carbon_intensity

def optimize_energy_mix(forecast_df, battery_capacity=500, battery_initial=250, 
                        cost_weight=0.7, emission_weight=0.3, use_time_varying_carbon=True):
    """
    Optimize energy mix to minimize cost and emissions while meeting demand.
    
    Args:
        forecast_df: DataFrame with 24-hour forecast
        battery_capacity: Maximum battery capacity (MWh)
        battery_initial: Initial battery charge (MWh)
        cost_weight: Weight for cost in objective (0-1)
        emission_weight: Weight for emissions in objective (0-1)
    
    Returns:
        Dictionary with optimization results
    """
    
    hours = len(forecast_df)
    
    # Carbon emission factors (kg CO2 per MWh) - lifecycle emissions
    # Solar panels: manufacturing, installation, transport
    # Wind turbines: manufacturing, installation
    # Hydro: construction, reservoir emissions
    emission_factors = {
        'solar': 45,
        'wind': 12,
        'hydro': 24,
        'battery': 0
    }
    
    # Create optimization problem
    prob = pulp.LpProblem("Energy_Mix_Optimization", pulp.LpMinimize)
    
    # Decision variables
    # Energy used from each source at each hour
    solar_use = pulp.LpVariable.dicts("solar", range(hours), lowBound=0)
    wind_use = pulp.LpVariable.dicts("wind", range(hours), lowBound=0)
    hydro_use = pulp.LpVariable.dicts("hydro", range(hours), lowBound=0)
    
    # Battery charge and discharge
    battery_charge = pulp.LpVariable.dicts("battery_charge", range(hours), lowBound=0)
    battery_discharge = pulp.LpVariable.dicts("battery_discharge", range(hours), lowBound=0)
    battery_level = pulp.LpVariable.dicts("battery_level", range(hours + 1), lowBound=0, upBound=battery_capacity)
    
    # Unmet demand (penalty variable)
    unmet_demand = pulp.LpVariable.dicts("unmet", range(hours), lowBound=0)
    
    # Set initial battery level
    prob += battery_level[0] == battery_initial
    
    # Objective: Minimize cost + emissions + penalty for unmet demand
    total_cost = 0
    total_emissions = 0
    
    for t in range(hours):
        price = forecast_df.iloc[t]['price']
        hour_of_day = forecast_df.iloc[t]['datetime'].hour
        
        # Cost from using energy sources
        hour_cost = (
            solar_use[t] * price * 0.5 +  # Solar has lower cost
            wind_use[t] * price * 0.6 +   # Wind moderate cost
            hydro_use[t] * price * 0.7    # Hydro moderate cost
        )
        
        # Emissions (lifecycle emissions from renewable energy sources)
        if use_time_varying_carbon:
            # Use time-varying carbon intensity
            solar_intensity = get_carbon_intensity(hour_of_day, 'solar')
            wind_intensity = get_carbon_intensity(hour_of_day, 'wind')
            hydro_intensity = get_carbon_intensity(hour_of_day, 'hydro')
        else:
            # Use fixed carbon intensity
            solar_intensity = emission_factors['solar']
            wind_intensity = emission_factors['wind']
            hydro_intensity = emission_factors['hydro']
        
        hour_emissions = (
            solar_use[t] * solar_intensity +
            wind_use[t] * wind_intensity +
            hydro_use[t] * hydro_intensity
        )
        
        total_cost += hour_cost
        total_emissions += hour_emissions
    
    # Normalize emissions to same scale as cost for objective
    # Use carbon price of $100/ton CO2 = $0.1/kg CO2 to convert emissions to cost equivalent
    # Add large penalty for unmet demand
    carbon_price = 0.1  # $/kg CO2
    prob += (
        cost_weight * total_cost + 
        emission_weight * total_emissions * carbon_price + 
        10000 * pulp.lpSum(unmet_demand[t] for t in range(hours))
    )
    
    # Constraints
    for t in range(hours):
        demand = forecast_df.iloc[t]['demand']
        solar_avail = forecast_df.iloc[t]['solar_available']
        wind_avail = forecast_df.iloc[t]['wind_available']
        hydro_avail = forecast_df.iloc[t]['hydro_available']
        
        # Supply must meet demand
        prob += (
            solar_use[t] + wind_use[t] + hydro_use[t] + 
            battery_discharge[t] - battery_charge[t] + unmet_demand[t] == demand,
            f"Demand_constraint_{t}"
        )
        
        # Cannot use more than available
        prob += solar_use[t] <= solar_avail, f"Solar_limit_{t}"
        prob += wind_use[t] <= wind_avail, f"Wind_limit_{t}"
        prob += hydro_use[t] <= hydro_avail, f"Hydro_limit_{t}"
        
        # Battery dynamics
        efficiency = 0.9  # 90% round-trip efficiency
        prob += (
            battery_level[t + 1] == battery_level[t] + 
            battery_charge[t] * efficiency - battery_discharge[t],
            f"Battery_dynamics_{t}"
        )
        
        # Battery charge/discharge rate limits (max 20% of capacity per hour)
        max_rate = battery_capacity * 0.2
        prob += battery_charge[t] <= max_rate, f"Charge_rate_{t}"
        prob += battery_discharge[t] <= max_rate, f"Discharge_rate_{t}"
        
        # Cannot charge and discharge simultaneously (linearized)
        prob += battery_charge[t] + battery_discharge[t] <= max_rate, f"No_simultaneous_{t}"
    
    # Solve the problem
    prob.solve(pulp.PULP_CBC_CMD(msg=False))
    
    # Check if optimization was successful
    if prob.status != pulp.LpStatusOptimal:
        return {
            'status': pulp.LpStatus[prob.status],
            'error': f'Optimization failed with status: {pulp.LpStatus[prob.status]}',
            'hours': [],
            'total_cost': float('inf'),
            'total_emissions': float('inf'),
            'total_unmet': float('inf')
        }
    
    # Extract results
    results = {
        'status': pulp.LpStatus[prob.status],
        'objective_value': pulp.value(prob.objective),
        'hours': []
    }
    
    for t in range(hours):
        hour_result = {
            'hour': t,
            'datetime': forecast_df.iloc[t]['datetime'],
            'demand': forecast_df.iloc[t]['demand'],
            'solar_use': pulp.value(solar_use[t]),
            'wind_use': pulp.value(wind_use[t]),
            'hydro_use': pulp.value(hydro_use[t]),
            'battery_charge': pulp.value(battery_charge[t]),
            'battery_discharge': pulp.value(battery_discharge[t]),
            'battery_level': pulp.value(battery_level[t + 1]),
            'unmet_demand': pulp.value(unmet_demand[t]),
            'price': forecast_df.iloc[t]['price']
        }
        results['hours'].append(hour_result)
    
    # Calculate total cost and emissions
    results_df = pd.DataFrame(results['hours'])
    
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
    """Convert optimization results to DataFrame."""
    return pd.DataFrame(results['hours'])
