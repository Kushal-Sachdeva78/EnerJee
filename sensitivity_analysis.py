import pandas as pd
import numpy as np
from optimization import optimize_energy_mix
from greedy_baseline import greedy_energy_mix

def run_price_sensitivity(forecast_df, battery_capacity=500, battery_initial=250,
                          cost_weight=0.7, emission_weight=0.3, 
                          price_scenarios=None, use_time_varying_carbon=True):
    """
    Run sensitivity analysis on price scenarios.
    
    Args:
        forecast_df: Base forecast DataFrame
        battery_capacity: Battery capacity in MWh
        battery_initial: Initial battery charge
        cost_weight: Cost weight in optimization
        emission_weight: Emission weight in optimization
        price_scenarios: List of price multipliers (e.g., [0.5, 0.75, 1.0, 1.25, 1.5])
        use_time_varying_carbon: Whether to use time-varying carbon intensity
    
    Returns:
        Dictionary with sensitivity results
    """
    
    if price_scenarios is None:
        price_scenarios = [0.5, 0.75, 1.0, 1.25, 1.5]
    
    results = {
        'scenarios': [],
        'optimized': [],
        'greedy': []
    }
    
    for multiplier in price_scenarios:
        # Create modified forecast with adjusted prices
        scenario_df = forecast_df.copy()
        scenario_df['price'] = scenario_df['price'] * multiplier
        
        # Run optimization
        opt_result = optimize_energy_mix(
            scenario_df,
            battery_capacity=battery_capacity,
            battery_initial=battery_initial,
            cost_weight=cost_weight,
            emission_weight=emission_weight,
            use_time_varying_carbon=use_time_varying_carbon
        )
        
        # Run greedy
        greedy_result = greedy_energy_mix(
            scenario_df,
            battery_capacity=battery_capacity,
            battery_initial=battery_initial
        )
        
        # Store results
        results['scenarios'].append({
            'multiplier': multiplier,
            'label': f"{int(multiplier * 100)}% Price"
        })
        
        if 'error' not in opt_result:
            results['optimized'].append({
                'multiplier': multiplier,
                'total_cost': opt_result['total_cost'],
                'total_emissions': opt_result['total_emissions'],
                'total_unmet': opt_result['total_unmet']
            })
        
        results['greedy'].append({
            'multiplier': multiplier,
            'total_cost': greedy_result['total_cost'],
            'total_emissions': greedy_result['total_emissions'],
            'total_unmet': greedy_result['total_unmet']
        })
    
    return results


def calculate_elasticity(sensitivity_results, strategy='optimized'):
    """
    Calculate price elasticity of total cost.
    
    Args:
        sensitivity_results: Results from run_price_sensitivity
        strategy: 'optimized' or 'greedy'
    
    Returns:
        Average elasticity value
    """
    
    data = sensitivity_results[strategy]
    
    if len(data) < 2:
        return 0.0
    
    elasticities = []
    for i in range(1, len(data)):
        prev = data[i-1]
        curr = data[i]
        
        price_change = (curr['multiplier'] - prev['multiplier']) / prev['multiplier']
        cost_change = (curr['total_cost'] - prev['total_cost']) / prev['total_cost']
        
        if price_change != 0:
            elasticity = cost_change / price_change
            elasticities.append(elasticity)
    
    return np.mean(elasticities) if elasticities else 0.0
