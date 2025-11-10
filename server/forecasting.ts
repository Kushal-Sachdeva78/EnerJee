// Energy forecasting engine for simulating renewable energy generation data
// for 7 major Indian cities using different forecasting methods

export interface ForecastData {
  time: string;
  solar: number;
  wind: number;
  hydro: number;
  demand: number;
}

interface CityCharacteristics {
  solarMultiplier: number;
  windMultiplier: number;
  hydroMultiplier: number;
  baselineDemand: number;
}

// Region-specific characteristics based on renewable energy strengths
// Leaders have 2.0+ multiplier for their specialty, others much lower
const CITY_CHARACTERISTICS: Record<string, CityCharacteristics> = {
  "Jodhpur": {
    solarMultiplier: 2.2, // SOLAR LEADER - Highest solar potential in India (Thar Desert, Rajasthan)
    windMultiplier: 0.5,  // Low wind potential
    hydroMultiplier: 0.2, // Minimal hydro potential
    baselineDemand: 3500  // Large region with moderate demand
  },
  "Bangalore": {
    solarMultiplier: 2.0, // SOLAR LEADER - Excellent solar potential
    windMultiplier: 0.6,  // Moderate wind
    hydroMultiplier: 0.4, // Some hydro access
    baselineDemand: 2800  // Tech hub with high demand
  },
  "Chennai": {
    solarMultiplier: 0.8, // Moderate solar potential
    windMultiplier: 2.2,  // WIND LEADER - Excellent wind potential (coastal Tamil Nadu)
    hydroMultiplier: 0.3, // Limited hydro
    baselineDemand: 2500  // Coastal city
  },
  "Kutch": {
    solarMultiplier: 0.9, // Moderate solar potential
    windMultiplier: 2.5,  // WIND LEADER - Highest wind potential (Gujarat coastal region)
    hydroMultiplier: 0.2, // Limited hydro
    baselineDemand: 4200  // Industrial region with high demand
  },
  "Uttarakashi": {
    solarMultiplier: 0.7, // Lower solar (mountainous terrain)
    windMultiplier: 0.4,  // Lower wind potential
    hydroMultiplier: 2.3, // HYDRO LEADER - Excellent hydro potential (Himalayan rivers, Uttarakhand)
    baselineDemand: 1200  // Smaller region, lower demand
  },
  "Satara": {
    solarMultiplier: 0.8, // Moderate solar potential
    windMultiplier: 0.7,  // Moderate wind potential (Western Ghats, Maharashtra)
    hydroMultiplier: 2.0, // HYDRO LEADER - High hydro potential (multiple dams)
    baselineDemand: 5000  // Industrial region, high demand
  }
};

// Generate hourly solar generation pattern (follows sun trajectory)
function generateSolarPattern(hour: number, multiplier: number, seed: number): number {
  // Solar generation follows sine wave from sunrise (6 AM) to sunset (6 PM)
  const peakHour = 12; // Noon
  const sunriseHour = 6;
  const sunsetHour = 18;
  
  if (hour < sunriseHour || hour >= sunsetHour) {
    return 0; // No solar at night
  }
  
  // Sine wave for solar generation
  const normalizedTime = (hour - sunriseHour) / (sunsetHour - sunriseHour);
  const base = Math.sin(normalizedTime * Math.PI) * 50 * multiplier;
  
  // Add some randomness based on seed
  const random = ((seed * (hour + 1) * 9301 + 49297) % 233280) / 233280;
  return Math.max(0, base + (random - 0.5) * 10);
}

// Generate wind generation pattern
function generateWindPattern(hour: number, multiplier: number, seed: number): number {
  // Wind is more variable, with higher generation during certain hours
  const random1 = ((seed * (hour + 1) * 9301 + 49297) % 233280) / 233280;
  const random2 = ((seed * (hour + 2) * 7319 + 35951) % 233280) / 233280;
  
  // Base wind generation with diurnal variation
  const base = 20 + Math.sin(hour * Math.PI / 12) * 8;
  const variability = random1 * 15 + random2 * 10;
  
  return Math.max(5, (base + variability) * multiplier);
}

// Generate hydro generation pattern
function generateHydroPattern(hour: number, multiplier: number, seed: number): number {
  // Hydro is more stable but adjusted based on demand patterns
  const random = ((seed * (hour + 3) * 6271 + 28411) % 233280) / 233280;
  
  // More generation during peak hours
  const demandFactor = (hour >= 8 && hour <= 22) ? 1.2 : 0.8;
  const base = 25 * demandFactor * multiplier;
  
  return Math.max(10, base + (random - 0.5) * 8);
}

// Generate demand pattern
function generateDemandPattern(hour: number, baselineDemand: number, seed: number): number {
  const random = ((seed * (hour + 4) * 5381 + 19683) % 233280) / 233280;
  
  // Demand peaks in morning (8-10) and evening (18-22)
  let demandMultiplier = 0.6; // Base (night)
  
  if (hour >= 6 && hour < 10) demandMultiplier = 0.85; // Morning rise
  else if (hour >= 10 && hour < 17) demandMultiplier = 0.75; // Day
  else if (hour >= 17 && hour < 23) demandMultiplier = 1.0; // Evening peak
  
  const base = baselineDemand * demandMultiplier / 24; // Convert to hourly
  return base + (random - 0.5) * base * 0.1;
}

export function forecastEnergy(
  method: string,
  region: string
): ForecastData[] {
  const characteristics = CITY_CHARACTERISTICS[region] || CITY_CHARACTERISTICS["Jodhpur"];
  
  // Generate seed based on region and method for consistent but varied results
  const regionSeed = region.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const methodSeed = method.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = regionSeed + methodSeed;
  
  let hours = 24;
  let timeFormat = (i: number) => `${i}:00`;
  
  // Adjust number of data points based on forecast method
  switch (method) {
    case "Last Day Pattern":
      hours = 24;
      break;
    case "24 Hour Forecast":
      hours = 24;
      break;
    case "3 Month Prediction":
      hours = 90; // 90 days in hourly intervals (sampled)
      timeFormat = (i: number) => `Day ${i + 1}`;
      break;
    case "1 Year Forecast":
      hours = 365; // 365 days
      timeFormat = (i: number) => `Day ${i + 1}`;
      break;
    case "Exponential Smoothing":
      hours = 24;
      break;
  }
  
  const data: ForecastData[] = [];
  
  for (let i = 0; i < hours; i++) {
    const hour = i % 24;
    const daySeed = seed + Math.floor(i / 24);
    
    const solar = generateSolarPattern(hour, characteristics.solarMultiplier, daySeed);
    const wind = generateWindPattern(hour, characteristics.windMultiplier, daySeed);
    const hydro = generateHydroPattern(hour, characteristics.hydroMultiplier, daySeed);
    const demand = generateDemandPattern(hour, characteristics.baselineDemand, daySeed);
    
    data.push({
      time: timeFormat(i),
      solar,
      wind,
      hydro,
      demand
    });
  }
  
  return data;
}

export interface ForecastSummary {
  avgSolar: number;
  avgWind: number;
  avgHydro: number;
  avgDemand: number;
  totalGeneration: number;
  totalDemand: number;
}

export function summarizeForecast(data: ForecastData[]): ForecastSummary {
  const sum = data.reduce((acc, d) => ({
    solar: acc.solar + d.solar,
    wind: acc.wind + d.wind,
    hydro: acc.hydro + d.hydro,
    demand: acc.demand + d.demand
  }), { solar: 0, wind: 0, hydro: 0, demand: 0 });
  
  const count = data.length;
  
  return {
    avgSolar: sum.solar / count,
    avgWind: sum.wind / count,
    avgHydro: sum.hydro / count,
    avgDemand: sum.demand / count,
    totalGeneration: sum.solar + sum.wind + sum.hydro,
    totalDemand: sum.demand
  };
}
