# WattWeaver - Renewable Energy Mix Optimization

## Overview

WattWeaver is a renewable energy optimization application that forecasts and optimizes the 24-hour energy mix from renewable sources (solar, wind, hydro) to minimize cost and emissions while meeting demand. The system uses linear programming optimization to determine the optimal energy allocation and battery storage strategy, comparing it against a greedy baseline approach. Built with Streamlit for the web interface and PuLP for optimization, it provides visual analysis of energy generation, costs, and emissions across different regions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology:** Streamlit web application framework

**Rationale:** Streamlit provides rapid prototyping for data-driven applications with minimal boilerplate code. It enables interactive controls, real-time updates, and seamless integration with Python data science libraries (pandas, plotly).

**Key Components:**
- **Interactive Dashboard** (`app.py`): Main application interface with sidebar controls for region selection, forecasting method, battery configuration, and optimization weights
- **Visualization:** Plotly for interactive charts showing energy mix, battery levels, and comparative metrics
- **Caching:** Uses `@st.cache_data` decorator to optimize data loading performance

**Design Decision:** Wide layout configuration to accommodate multiple visualization panels side-by-side, improving user experience when comparing optimization results against baseline.

### Backend Architecture

**Pattern:** Modular functional architecture with separation of concerns

**Core Modules:**

1. **Forecasting Module** (`forecasting.py`)
   - **Purpose:** Predict next 24-hour (or multi-day) energy demand and renewable availability
   - **Methods:** 
     - Last day pattern (uses previous 24 hours as forecast, repeating for multi-day)
     - Hourly average (averages by hour of day across historical data)
     - Moving average (3-day window for smoothed predictions)
     - Exponential smoothing (alpha=0.3 for trend-sensitive forecasts)
     - Weather API integration (real-time solar radiation and wind speed data)
   - **Rationale:** Multiple forecasting methods enable users to compare prediction accuracy and choose methods appropriate for their data patterns and requirements

2. **Optimization Module** (`optimization.py`)
   - **Technology:** PuLP linear programming solver
   - **Purpose:** Find optimal energy mix minimizing weighted cost and emissions
   - **Decision Variables:**
     - Energy usage from each source (solar, wind, hydro) per hour
     - Battery charge/discharge amounts per hour
     - Battery state of charge tracking
     - Unmet demand (penalty variable)
   - **Constraints:**
     - Energy balance (supply must meet demand)
     - Renewable availability limits
     - Battery capacity and charge/discharge rate limits
     - Battery efficiency modeling (90% round-trip efficiency)
   - **Objective Function:** Weighted combination of operational costs and carbon emissions
   - **Rationale:** Linear programming provides guaranteed optimal solutions for this convex problem space, with fast solve times suitable for interactive use

3. **Greedy Baseline** (`greedy_baseline.py`)
   - **Purpose:** Comparison benchmark using simple heuristic strategy
   - **Strategy:** Prioritize cheapest renewable sources (solar→wind→hydro), use battery opportunistically
   - **Rationale:** Provides intuitive baseline to demonstrate optimization value versus rule-based approaches

4. **Multi-Day Optimization** (`multiday_optimization.py`)
   - **Purpose:** Extend optimization planning across multiple days (typically 3 days)
   - **Features:** Battery planning with multi-day constraints, end-of-period battery level targets
   - **Rationale:** Enables strategic battery management across day boundaries for improved long-term cost and emission reduction

5. **Carbon Intensity Module** (`carbon_intensity.py`)
   - **Purpose:** Provide time-varying carbon intensity factors that change by hour of day
   - **Model:** Grid carbon intensity impacts renewable lifecycle emissions differently based on when manufacturing/installation occurred
   - **Rationale:** More accurate emission accounting that reflects actual grid conditions at different times

6. **Sensitivity Analysis** (`sensitivity_analysis.py`)
   - **Purpose:** Analyze how optimization results change with different price scenarios
   - **Features:** Tests multiple price multipliers (50%, 75%, 100%, 125%, 150%), calculates price elasticity
   - **Rationale:** Helps users understand cost sensitivity and plan for price volatility

7. **Weather API Integration** (`weather_api.py`)
   - **Purpose:** Real-time solar and wind predictions using Open-Meteo weather forecast API
   - **Features:** Converts solar radiation and wind speed to energy availability, supports multi-day forecasts
   - **Rationale:** Provides more accurate forecasts based on actual weather conditions rather than historical patterns

8. **Data Generation** (`generate_sample_data.py`)
   - **Purpose:** Create realistic synthetic energy data for multiple regions
   - **Features:** Region-specific parameters (capacity, demand patterns), hourly time series with realistic variation
   - **Rationale:** Enables testing and demonstration without requiring real utility data

### Data Architecture

**Format:** CSV files stored in `/data` directory

**Schema Structure:**
- `datetime`: Timestamp for each hourly record
- `demand`: Energy demand (MWh)
- `solar_available`: Available solar generation capacity (MWh)
- `wind_available`: Available wind generation capacity (MWh)
- `hydro_available`: Available hydro generation capacity (MWh)
- `price`: Energy price ($/MWh)

**Design Decisions:**
- Hourly granularity balances detail with computational efficiency for 24-hour optimization windows
- Separate CSV per region enables easy expansion to new geographic areas
- All energy values in MWh for consistency

### Energy Model

**Battery Model:**
- Configurable capacity (100-1000 MWh)
- 90% round-trip efficiency
- Maximum charge/discharge rate: 20% of capacity per hour
- State-of-charge tracking across optimization horizon

**Cost Model:**
- Renewable source costs: Solar (0.5 relative), Wind (0.6 relative), Hydro (0.7 relative)
- High penalty for unmet demand (1000x base cost)
- Price variation by hour from historical data

**Emission Model:**
- Lifecycle carbon emissions (kg CO2/MWh): Solar (45), Wind (12), Hydro (24)
- Battery storage: 0 operational emissions
- Includes manufacturing and installation impacts

**Rationale:** Multi-objective optimization (cost vs. emissions) reflects real-world tradeoffs in energy planning. User-adjustable weights enable exploration of different policy priorities.

## External Dependencies

### Python Libraries

**Core Data & Computation:**
- `pandas`: Time series data manipulation and analysis
- `numpy`: Numerical computations for data generation

**Optimization:**
- `pulp`: Linear programming solver for energy mix optimization

**Visualization & UI:**
- `streamlit`: Web application framework
- `plotly`: Interactive charting library

**Rationale:** Established scientific Python stack ensures reliability, extensive documentation, and community support. PuLP chosen over alternatives (scipy.optimize, cvxpy) for its intuitive syntax and automatic solver selection.

### Data Sources

**Current:** Synthetic data generated via `generate_sample_data.py`

**Design for Extension:** CSV-based architecture allows easy integration of real utility data, weather APIs, or energy market price feeds without code changes.

### File System Dependencies

- Region data files expected in `data/` directory with `.csv` extension
- File naming convention: `{region_name}.csv` (e.g., `california.csv`, `texas.csv`, `norway.csv`)