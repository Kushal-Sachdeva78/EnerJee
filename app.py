import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import os

from forecasting import forecast_next_24h
from optimization import optimize_energy_mix, results_to_dataframe as opt_to_df
from greedy_baseline import greedy_energy_mix, results_to_dataframe as greedy_to_df
from sensitivity_analysis import run_price_sensitivity
from multiday_optimization import optimize_multiday_energy_mix, results_to_dataframe as multiday_to_df
from weather_api import get_region_weather_forecast
from firebase_client import (
    FirebaseAuthError,
    FirebaseConfigError,
    FirebaseDatabaseError,
    FirebaseUser,
    authenticate_user,
    export_firestore_rules,
    export_web_config,
    fetch_user_profile,
    validate_settings,
)

st.set_page_config(page_title="WattWeaver", layout="wide")

st.title("⚡ WattWeaver")
st.markdown("### Renewable Energy Mix Optimization")
st.markdown(
    "Predict and optimize the best 24-hour mix of renewable energy sources to minimize cost and emissions."
)

if "user" not in st.session_state:
    st.session_state["user"] = None
if "user_profile" not in st.session_state:
    st.session_state["user_profile"] = None


def render_login() -> None:
    """Render the login form and authenticate the user."""

    st.markdown("#### Sign in to continue")
    try:
        validate_settings()
    except FirebaseConfigError as exc:
        st.error(str(exc))
        st.stop()

    st.info(
        "Use your Firebase Authentication credentials. "
        "The application is pre-configured with production Firebase keys, but you can override them "
        "via environment variables or Streamlit secrets if needed."
    )

    with st.expander("Firebase setup details"):
        st.markdown(
            "Register a Web app in the Firebase console using the following configuration snippet "
            "(the Python backend uses the same values by default):"
        )
        st.code(export_web_config(), language="json")
        st.markdown(
            "Firestore security rules to copy & paste so each signed-in user can only access their own profile document:"
        )
        st.code(export_firestore_rules(), language="text")

    auth_error_container = st.empty()
    with st.form("login_form", clear_on_submit=False):
        email = st.text_input("Email", placeholder="you@example.com")
        password = st.text_input("Password", type="password")
        submitted = st.form_submit_button("Sign in", type="primary")

    if submitted:
        if not email or not password:
            auth_error_container.error("Please supply both email and password.")
            return

        try:
            firebase_user: FirebaseUser = authenticate_user(email, password)
            profile = fetch_user_profile(firebase_user.local_id, firebase_user.id_token)
        except FirebaseAuthError as exc:
            auth_error_container.error(f"Authentication failed: {exc}")
            return
        except FirebaseDatabaseError as exc:
            auth_error_container.warning(
                f"Signed in but unable to load profile: {exc}. Proceeding without profile data."
            )
            profile = None

        st.session_state["user"] = firebase_user
        st.session_state["user_profile"] = profile
        st.experimental_rerun()


if st.session_state["user"] is None:
    render_login()
    st.stop()


def render_user_sidebar() -> None:
    """Display authentication details and logout controls in the sidebar."""

    user: FirebaseUser = st.session_state["user"]
    profile = st.session_state.get("user_profile")

    st.sidebar.header("Account")
    st.sidebar.markdown(f"**Email:** {user.email}")
    if profile:
        display_name = profile.get("displayName") or profile.get("name")
        if display_name:
            st.sidebar.markdown(f"**Name:** {display_name}")
        role = profile.get("role")
        if role:
            st.sidebar.markdown(f"**Role:** {role}")

    if st.sidebar.button("Log out"):
        st.session_state["user"] = None
        st.session_state["user_profile"] = None
        st.experimental_rerun()


render_user_sidebar()

# Sidebar controls
st.sidebar.header("Configuration")

# Region selection
available_regions = [f.replace('.csv', '') for f in os.listdir('data') if f.endswith('.csv')]
region = st.sidebar.selectbox("Select Region", available_regions, index=0)

# Forecasting method
forecast_method = st.sidebar.selectbox(
    "Forecasting Method",
    ["last_day", "average", "moving_average", "exponential_smoothing", "weather_api"],
    format_func=lambda x: {
        "last_day": "Last Day Pattern",
        "average": "Hourly Average",
        "moving_average": "Moving Average (3 days)",
        "exponential_smoothing": "Exponential Smoothing",
        "weather_api": "Real-Time Weather API"
    }.get(x, x)
)

# Battery parameters
st.sidebar.subheader("Battery Configuration")
battery_capacity = st.sidebar.slider("Battery Capacity (MWh)", 100, 1000, 500, 50)
battery_initial = st.sidebar.slider("Initial Charge (MWh)", 0, battery_capacity, battery_capacity // 2, 50)

# Optimization weights
st.sidebar.subheader("Optimization Weights")
cost_weight = st.sidebar.slider("Cost Weight", 0.0, 1.0, 0.7, 0.1)
emission_weight = 1.0 - cost_weight
st.sidebar.text(f"Emission Weight: {emission_weight:.1f}")

# Advanced options
with st.sidebar.expander("Advanced Options"):
    optimization_horizon = st.selectbox(
        "Optimization Horizon",
        ["Single Day (24h)", "Multi-Day (3 days)"],
        help="Optimize for 24 hours or plan across multiple days"
    )
    use_time_varying_carbon = st.checkbox("Time-Varying Carbon Intensity", value=True,
                                          help="Carbon intensity varies by hour based on grid conditions")
    run_sensitivity = st.checkbox("Run Price Sensitivity Analysis", value=False,
                                  help="Analyze how results change with different price scenarios")

# Run optimization button
run_button = st.sidebar.button("🚀 Run Optimization", type="primary")

# Load and display data
@st.cache_data
def load_data(region_name):
    df = pd.read_csv(f'data/{region_name}.csv')
    df['datetime'] = pd.to_datetime(df['datetime'])
    return df

# Main content
if run_button:
    with st.spinner("Loading data and running optimization..."):
        # Load historical data
        df = load_data(region)
        
        # Determine forecast length based on optimization horizon
        is_multiday = "Multi-Day" in optimization_horizon
        forecast_hours = 72 if is_multiday else 24
        days = 3 if is_multiday else 1
        
        # Generate forecast
        if forecast_method == "weather_api":
            try:
                forecast_df = get_region_weather_forecast(region, hours=forecast_hours)
            except Exception as e:
                st.error(f"❌ Weather API Error: {e}")
                st.info("Falling back to last day pattern method.")
                forecast_df = forecast_next_24h(df, method="last_day", forecast_hours=forecast_hours)
        else:
            forecast_df = forecast_next_24h(df, method=forecast_method, forecast_hours=forecast_hours)
        
        # Run optimization
        if is_multiday:
            opt_results = optimize_multiday_energy_mix(
                forecast_df,
                days=days,
                battery_capacity=battery_capacity,
                battery_initial=battery_initial,
                cost_weight=cost_weight,
                emission_weight=emission_weight,
                use_time_varying_carbon=use_time_varying_carbon
            )
        else:
            opt_results = optimize_energy_mix(
                forecast_df,
                battery_capacity=battery_capacity,
                battery_initial=battery_initial,
                cost_weight=cost_weight,
                emission_weight=emission_weight,
                use_time_varying_carbon=use_time_varying_carbon
            )
        
        # Check if optimization failed
        if 'error' in opt_results:
            st.error(f"❌ Optimization Failed: {opt_results['error']}")
            st.info("Try adjusting battery parameters or check the forecast data.")
            st.stop()
        
        # Run greedy baseline
        greedy_results = greedy_energy_mix(
            forecast_df,
            battery_capacity=battery_capacity,
            battery_initial=battery_initial
        )
        
        # Convert to DataFrames
        opt_df = opt_to_df(opt_results)
        greedy_df = greedy_to_df(greedy_results)
    
    # Display results summary
    st.header("📊 Results Summary")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric(
            "Optimization Status",
            opt_results['status'],
            delta=None
        )
    
    with col2:
        cost_savings = greedy_results['total_cost'] - opt_results['total_cost']
        st.metric(
            "Cost Savings vs Greedy",
            f"${cost_savings:,.0f}",
            delta=f"{(cost_savings/greedy_results['total_cost']*100):.1f}%"
        )
    
    with col3:
        emission_reduction = greedy_results['total_emissions'] - opt_results['total_emissions']
        st.metric(
            "Emission Reduction",
            f"{emission_reduction:,.0f} kg CO₂",
            delta=f"{(emission_reduction/max(greedy_results['total_emissions'], 1)*100):.1f}%"
        )
    
    # Detailed comparison
    st.subheader("Strategy Comparison")
    
    comparison_df = pd.DataFrame({
        'Metric': ['Total Cost ($)', 'Total Emissions (kg CO₂)', 'Unmet Demand (MWh)'],
        'Optimized': [
            f"${opt_results['total_cost']:,.2f}",
            f"{opt_results['total_emissions']:,.2f}",
            f"{opt_results['total_unmet']:,.2f}"
        ],
        'Greedy Baseline': [
            f"${greedy_results['total_cost']:,.2f}",
            f"{greedy_results['total_emissions']:,.2f}",
            f"{greedy_results['total_unmet']:,.2f}"
        ]
    })
    
    st.dataframe(comparison_df, use_container_width=True, hide_index=True)
    
    # Visualizations
    st.header("📈 Energy Mix Visualization")
    
    # Create tabs for different views
    tab1, tab2, tab3 = st.tabs(["Optimized Strategy", "Greedy Baseline", "Comparison"])
    
    with tab1:
        st.subheader("Optimized Energy Mix")
        
        # Generation vs Demand chart
        fig1 = go.Figure()
        
        fig1.add_trace(go.Scatter(
            x=opt_df['datetime'],
            y=opt_df['demand'],
            name='Demand',
            line=dict(color='black', width=3, dash='dash')
        ))
        
        fig1.add_trace(go.Scatter(
            x=opt_df['datetime'],
            y=opt_df['solar_use'],
            name='Solar',
            fill='tonexty',
            line=dict(color='#FFD700')
        ))
        
        fig1.add_trace(go.Scatter(
            x=opt_df['datetime'],
            y=opt_df['solar_use'] + opt_df['wind_use'],
            name='Wind',
            fill='tonexty',
            line=dict(color='#87CEEB')
        ))
        
        fig1.add_trace(go.Scatter(
            x=opt_df['datetime'],
            y=opt_df['solar_use'] + opt_df['wind_use'] + opt_df['hydro_use'],
            name='Hydro',
            fill='tonexty',
            line=dict(color='#4682B4')
        ))
        
        fig1.add_trace(go.Scatter(
            x=opt_df['datetime'],
            y=opt_df['solar_use'] + opt_df['wind_use'] + opt_df['hydro_use'] + opt_df['battery_discharge'],
            name='Battery Discharge',
            fill='tonexty',
            line=dict(color='#32CD32')
        ))
        
        fig1.update_layout(
            title='Optimized Generation vs Demand',
            xaxis_title='Time',
            yaxis_title='Power (MWh)',
            hovermode='x unified',
            height=500
        )
        
        st.plotly_chart(fig1, use_container_width=True)
        
        # Battery state of charge
        fig2 = go.Figure()
        
        fig2.add_trace(go.Scatter(
            x=opt_df['datetime'],
            y=opt_df['battery_level'],
            name='Battery Level',
            fill='tozeroy',
            line=dict(color='#32CD32', width=2)
        ))
        
        fig2.add_hline(
            y=battery_capacity,
            line_dash="dash",
            line_color="red",
            annotation_text="Max Capacity"
        )
        
        fig2.update_layout(
            title='Battery State of Charge',
            xaxis_title='Time',
            yaxis_title='Battery Level (MWh)',
            hovermode='x unified',
            height=400
        )
        
        st.plotly_chart(fig2, use_container_width=True)
    
    with tab2:
        st.subheader("Greedy Baseline Energy Mix")
        
        # Generation vs Demand chart for greedy
        fig3 = go.Figure()
        
        fig3.add_trace(go.Scatter(
            x=greedy_df['datetime'],
            y=greedy_df['demand'],
            name='Demand',
            line=dict(color='black', width=3, dash='dash')
        ))
        
        fig3.add_trace(go.Scatter(
            x=greedy_df['datetime'],
            y=greedy_df['solar_use'],
            name='Solar',
            fill='tonexty',
            line=dict(color='#FFD700')
        ))
        
        fig3.add_trace(go.Scatter(
            x=greedy_df['datetime'],
            y=greedy_df['solar_use'] + greedy_df['wind_use'],
            name='Wind',
            fill='tonexty',
            line=dict(color='#87CEEB')
        ))
        
        fig3.add_trace(go.Scatter(
            x=greedy_df['datetime'],
            y=greedy_df['solar_use'] + greedy_df['wind_use'] + greedy_df['hydro_use'],
            name='Hydro',
            fill='tonexty',
            line=dict(color='#4682B4')
        ))
        
        fig3.add_trace(go.Scatter(
            x=greedy_df['datetime'],
            y=greedy_df['solar_use'] + greedy_df['wind_use'] + greedy_df['hydro_use'] + greedy_df['battery_discharge'],
            name='Battery Discharge',
            fill='tonexty',
            line=dict(color='#32CD32')
        ))
        
        fig3.update_layout(
            title='Greedy Generation vs Demand',
            xaxis_title='Time',
            yaxis_title='Power (MWh)',
            hovermode='x unified',
            height=500
        )
        
        st.plotly_chart(fig3, use_container_width=True)
        
        # Battery state of charge for greedy
        fig4 = go.Figure()
        
        fig4.add_trace(go.Scatter(
            x=greedy_df['datetime'],
            y=greedy_df['battery_level'],
            name='Battery Level',
            fill='tozeroy',
            line=dict(color='#32CD32', width=2)
        ))
        
        fig4.add_hline(
            y=battery_capacity,
            line_dash="dash",
            line_color="red",
            annotation_text="Max Capacity"
        )
        
        fig4.update_layout(
            title='Battery State of Charge (Greedy)',
            xaxis_title='Time',
            yaxis_title='Battery Level (MWh)',
            hovermode='x unified',
            height=400
        )
        
        st.plotly_chart(fig4, use_container_width=True)
    
    with tab3:
        st.subheader("Side-by-Side Comparison")
        
        # Cost comparison over time
        fig5 = go.Figure()
        
        opt_df['cumulative_cost'] = (
            (opt_df['solar_use'] * opt_df['price'] * 0.5).cumsum() +
            (opt_df['wind_use'] * opt_df['price'] * 0.6).cumsum() +
            (opt_df['hydro_use'] * opt_df['price'] * 0.7).cumsum()
        )
        
        greedy_df['cumulative_cost'] = (
            (greedy_df['solar_use'] * greedy_df['price'] * 0.5).cumsum() +
            (greedy_df['wind_use'] * greedy_df['price'] * 0.6).cumsum() +
            (greedy_df['hydro_use'] * greedy_df['price'] * 0.7).cumsum()
        )
        
        fig5.add_trace(go.Scatter(
            x=opt_df['datetime'],
            y=opt_df['cumulative_cost'],
            name='Optimized',
            line=dict(color='#2E86AB', width=3)
        ))
        
        fig5.add_trace(go.Scatter(
            x=greedy_df['datetime'],
            y=greedy_df['cumulative_cost'],
            name='Greedy',
            line=dict(color='#A23B72', width=3, dash='dash')
        ))
        
        fig5.update_layout(
            title='Cumulative Cost Comparison',
            xaxis_title='Time',
            yaxis_title='Cumulative Cost ($)',
            hovermode='x unified',
            height=400
        )
        
        st.plotly_chart(fig5, use_container_width=True)
        
        # Battery usage comparison
        fig6 = make_subplots(rows=1, cols=2, subplot_titles=('Optimized Battery', 'Greedy Battery'))
        
        fig6.add_trace(
            go.Scatter(x=opt_df['datetime'], y=opt_df['battery_level'], 
                      name='Optimized', line=dict(color='#2E86AB')),
            row=1, col=1
        )
        
        fig6.add_trace(
            go.Scatter(x=greedy_df['datetime'], y=greedy_df['battery_level'], 
                      name='Greedy', line=dict(color='#A23B72')),
            row=1, col=2
        )
        
        fig6.update_xaxes(title_text="Time", row=1, col=1)
        fig6.update_xaxes(title_text="Time", row=1, col=2)
        fig6.update_yaxes(title_text="Battery Level (MWh)", row=1, col=1)
        fig6.update_yaxes(title_text="Battery Level (MWh)", row=1, col=2)
        
        fig6.update_layout(height=400, showlegend=False)
        
        st.plotly_chart(fig6, use_container_width=True)
    
    # Sensitivity Analysis
    if run_sensitivity:
        st.header("📊 Price Sensitivity Analysis")
        
        with st.spinner("Running sensitivity analysis..."):
            sensitivity_results = run_price_sensitivity(
                forecast_df,
                battery_capacity=battery_capacity,
                battery_initial=battery_initial,
                cost_weight=cost_weight,
                emission_weight=emission_weight,
                price_scenarios=[0.5, 0.75, 1.0, 1.25, 1.5],
                use_time_varying_carbon=use_time_varying_carbon
            )
        
        # Create sensitivity charts
        fig_sens = make_subplots(
            rows=1, cols=2,
            subplot_titles=('Total Cost vs Price Level', 'Total Emissions vs Price Level')
        )
        
        # Cost sensitivity
        opt_sens_df = pd.DataFrame(sensitivity_results['optimized'])
        greedy_sens_df = pd.DataFrame(sensitivity_results['greedy'])
        
        fig_sens.add_trace(
            go.Scatter(
                x=opt_sens_df['multiplier'] * 100,
                y=opt_sens_df['total_cost'],
                name='Optimized',
                line=dict(color='#2E86AB', width=3)
            ),
            row=1, col=1
        )
        
        fig_sens.add_trace(
            go.Scatter(
                x=greedy_sens_df['multiplier'] * 100,
                y=greedy_sens_df['total_cost'],
                name='Greedy',
                line=dict(color='#A23B72', width=3, dash='dash')
            ),
            row=1, col=1
        )
        
        # Emissions sensitivity
        fig_sens.add_trace(
            go.Scatter(
                x=opt_sens_df['multiplier'] * 100,
                y=opt_sens_df['total_emissions'],
                name='Optimized',
                line=dict(color='#2E86AB', width=3),
                showlegend=False
            ),
            row=1, col=2
        )
        
        fig_sens.add_trace(
            go.Scatter(
                x=greedy_sens_df['multiplier'] * 100,
                y=greedy_sens_df['total_emissions'],
                name='Greedy',
                line=dict(color='#A23B72', width=3, dash='dash'),
                showlegend=False
            ),
            row=1, col=2
        )
        
        fig_sens.update_xaxes(title_text="Price Level (%)", row=1, col=1)
        fig_sens.update_xaxes(title_text="Price Level (%)", row=1, col=2)
        fig_sens.update_yaxes(title_text="Total Cost ($)", row=1, col=1)
        fig_sens.update_yaxes(title_text="Total Emissions (kg CO₂)", row=1, col=2)
        
        fig_sens.update_layout(height=400, hovermode='x unified')
        
        st.plotly_chart(fig_sens, use_container_width=True)
        
        # Show sensitivity insights
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("Cost Impact")
            base_cost = opt_sens_df[opt_sens_df['multiplier'] == 1.0]['total_cost'].values[0]
            high_cost = opt_sens_df[opt_sens_df['multiplier'] == 1.5]['total_cost'].values[0]
            low_cost = opt_sens_df[opt_sens_df['multiplier'] == 0.5]['total_cost'].values[0]
            
            st.write(f"**Baseline (100% price):** ${base_cost:,.2f}")
            st.write(f"**High prices (150%):** ${high_cost:,.2f} (+{((high_cost/base_cost - 1) * 100):.1f}%)")
            st.write(f"**Low prices (50%):** ${low_cost:,.2f} ({((low_cost/base_cost - 1) * 100):.1f}%)")
        
        with col2:
            st.subheader("Emission Impact")
            base_emission = opt_sens_df[opt_sens_df['multiplier'] == 1.0]['total_emissions'].values[0]
            high_emission = opt_sens_df[opt_sens_df['multiplier'] == 1.5]['total_emissions'].values[0]
            low_emission = opt_sens_df[opt_sens_df['multiplier'] == 0.5]['total_emissions'].values[0]
            
            st.write(f"**Baseline:** {base_emission:,.0f} kg CO₂")
            st.write(f"**High prices:** {high_emission:,.0f} kg CO₂ ({((high_emission/base_emission - 1) * 100):+.1f}%)")
            st.write(f"**Low prices:** {low_emission:,.0f} kg CO₂ ({((low_emission/base_emission - 1) * 100):+.1f}%)")

else:
    st.info("👈 Configure parameters in the sidebar and click 'Run Optimization' to begin.")
    
    # Show sample data preview
    st.subheader("Available Regions")
    
    for region_name in available_regions:
        with st.expander(f"📍 {region_name.title()}"):
            sample_df = load_data(region_name)
            st.write(f"**Data Points:** {len(sample_df)} hours")
            st.write(f"**Date Range:** {sample_df['datetime'].min()} to {sample_df['datetime'].max()}")
            
            # Show quick stats
            col1, col2, col3 = st.columns(3)
            with col1:
                st.metric("Avg Demand", f"{sample_df['demand'].mean():.0f} MWh")
            with col2:
                st.metric("Peak Solar", f"{sample_df['solar_available'].max():.0f} MWh")
            with col3:
                st.metric("Peak Wind", f"{sample_df['wind_available'].max():.0f} MWh")
            
            # Show sample data
            st.dataframe(sample_df.head(10), use_container_width=True)

st.sidebar.markdown("---")
st.sidebar.markdown("**About WattWeaver**")
st.sidebar.markdown("A renewable energy optimization tool that uses linear programming to find the optimal mix of solar, wind, hydro, and battery storage.")
