import pandas as pd
import numpy as np

def forecast_next_24h(df, method='last_day', window=3, forecast_hours=24):
    """
    Forecast the next N hours of energy data.
    
    Args:
        df: DataFrame with columns [datetime, demand, solar_available, wind_available, hydro_available, price]
        method: 'last_day', 'average', 'moving_average', or 'exponential_smoothing'
        window: Number of days to use for moving average (default 3)
        forecast_hours: Number of hours to forecast (default 24)
    
    Returns:
        DataFrame with forecast
    """
    
    if method == 'last_day':
        # Use pattern from last N hours, repeating if needed
        pattern_length = min(forecast_hours, len(df))
        pattern = df.tail(pattern_length).copy()
        
        # Create new timestamps
        last_timestamp = df['datetime'].iloc[-1]
        new_timestamps = pd.date_range(
            start=last_timestamp + pd.Timedelta(hours=1),
            periods=forecast_hours,
            freq='H'
        )
        
        # Repeat pattern if needed for multi-day forecasts
        forecast_data = []
        for i, ts in enumerate(new_timestamps):
            pattern_idx = i % len(pattern)
            row = pattern.iloc[pattern_idx].copy()
            row['datetime'] = ts
            forecast_data.append(row)
        
        forecast_df = pd.DataFrame(forecast_data).reset_index(drop=True)
        
    elif method == 'average':
        # Average by hour of day across all available days
        df_copy = df.copy()
        df_copy['hour'] = pd.to_datetime(df_copy['datetime']).dt.hour
        
        hourly_avg = df_copy.groupby('hour').agg({
            'demand': 'mean',
            'solar_available': 'mean',
            'wind_available': 'mean',
            'hydro_available': 'mean',
            'price': 'mean'
        }).reset_index()
        
        # Create forecast for next N hours
        last_timestamp = df['datetime'].iloc[-1]
        new_timestamps = pd.date_range(
            start=last_timestamp + pd.Timedelta(hours=1),
            periods=forecast_hours,
            freq='H'
        )
        
        forecast_data = []
        for ts in new_timestamps:
            hour = ts.hour
            hour_data = hourly_avg[hourly_avg['hour'] == hour].iloc[0]
            forecast_data.append({
                'datetime': ts,
                'demand': hour_data['demand'],
                'solar_available': hour_data['solar_available'],
                'wind_available': hour_data['wind_available'],
                'hydro_available': hour_data['hydro_available'],
                'price': hour_data['price']
            })
        
        forecast_df = pd.DataFrame(forecast_data)
    
    elif method == 'moving_average':
        # Moving average of last N days for each hour
        df_copy = df.copy()
        df_copy['hour'] = pd.to_datetime(df_copy['datetime']).dt.hour
        
        # Take last window*24 hours
        recent_data = df_copy.tail(window * 24)
        
        # Average by hour of day
        hourly_avg = recent_data.groupby('hour').agg({
            'demand': 'mean',
            'solar_available': 'mean',
            'wind_available': 'mean',
            'hydro_available': 'mean',
            'price': 'mean'
        }).reset_index()
        
        # Create forecast for next N hours
        last_timestamp = df['datetime'].iloc[-1]
        new_timestamps = pd.date_range(
            start=last_timestamp + pd.Timedelta(hours=1),
            periods=forecast_hours,
            freq='H'
        )
        
        forecast_data = []
        for ts in new_timestamps:
            hour = ts.hour
            hour_data = hourly_avg[hourly_avg['hour'] == hour].iloc[0]
            forecast_data.append({
                'datetime': ts,
                'demand': hour_data['demand'],
                'solar_available': hour_data['solar_available'],
                'wind_available': hour_data['wind_available'],
                'hydro_available': hour_data['hydro_available'],
                'price': hour_data['price']
            })
        
        forecast_df = pd.DataFrame(forecast_data)
    
    elif method == 'exponential_smoothing':
        # Exponential smoothing with alpha=0.3
        df_copy = df.copy()
        df_copy['hour'] = pd.to_datetime(df_copy['datetime']).dt.hour
        
        alpha = 0.3
        last_timestamp = df['datetime'].iloc[-1]
        new_timestamps = pd.date_range(
            start=last_timestamp + pd.Timedelta(hours=1),
            periods=forecast_hours,
            freq='H'
        )
        
        forecast_data = []
        for ts in new_timestamps:
            hour = ts.hour
            
            # Get all historical data for this hour
            hour_data = df_copy[df_copy['hour'] == hour].tail(7)  # Last 7 occurrences
            
            if len(hour_data) == 0:
                # Fallback to overall average for this hour
                hour_data = df_copy[df_copy['hour'] == hour]
            
            # Apply exponential smoothing
            smoothed = {}
            for col in ['demand', 'solar_available', 'wind_available', 'hydro_available', 'price']:
                values = hour_data[col].values
                if len(values) > 0:
                    # Simple exponential smoothing
                    smoothed_value = values[-1]  # Start with most recent
                    for i in range(len(values) - 2, -1, -1):
                        smoothed_value = alpha * values[i] + (1 - alpha) * smoothed_value
                    smoothed[col] = smoothed_value
                else:
                    smoothed[col] = df_copy[col].mean()
            
            forecast_data.append({
                'datetime': ts,
                'demand': smoothed['demand'],
                'solar_available': smoothed['solar_available'],
                'wind_available': smoothed['wind_available'],
                'hydro_available': smoothed['hydro_available'],
                'price': smoothed['price']
            })
        
        forecast_df = pd.DataFrame(forecast_data)
    
    else:
        raise ValueError(f"Unknown forecasting method: {method}")
    
    return forecast_df


def add_forecast_uncertainty(forecast_df, uncertainty=0.1):
    """
    Add realistic uncertainty to forecasts.
    
    Args:
        forecast_df: Forecast DataFrame
        uncertainty: Fraction of uncertainty to add (default 0.1 = 10%)
    
    Returns:
        DataFrame with uncertainty bounds
    """
    df = forecast_df.copy()
    
    for col in ['demand', 'solar_available', 'wind_available', 'hydro_available']:
        df[f'{col}_lower'] = df[col] * (1 - uncertainty)
        df[f'{col}_upper'] = df[col] * (1 + uncertainty)
    
    return df
