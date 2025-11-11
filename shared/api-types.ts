// Shared API types for type-safe frontend-backend communication

export interface OptimizationResults {
  optimized: {
    cost: number;
    emissions: number;
    reliability: number;
    renewableShare: number;
  };
  baseline: {
    cost: number;
    emissions: number;
    reliability: number;
    renewableShare: number;
  };
}

export interface EnergyMixData {
  time: string;
  solar: number;
  wind: number;
  hydro: number;
  demand: number;
}

export interface PriceData {
  time: string;
  optimized: number;
  baseline: number;
}

export interface EmissionData {
  name: string;
  value: number;
}

export interface OptimizeResponse {
  id: number;
  results: OptimizationResults;
  energyMixData: EnergyMixData[];
  priceData: PriceData[];
  emissionData: EmissionData[];
}

export interface ChatResponse {
  response: string;
}

export interface ChatRequest {
  message: string;
  context?: {
    region?: string;
    optimizedCost?: number;
    baselineCost?: number;
    optimizedEmissions?: number;
    baselineEmissions?: number;
    renewableShare?: number;
  };
}

export interface OptimizationConfig {
  region: string;
  forecastMethod: string;
  energyFocus: string[];
  costWeight: number;
}
