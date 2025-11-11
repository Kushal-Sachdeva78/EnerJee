import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Building2, Zap, TrendingUp, Award, Sun, Wind, Droplets, Waves, History } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, RadialBarChart, RadialBar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// City configurations with unique characteristics
const CITIES = {
  Delhi: {
    solarEfficiency: 0.85,
    windEfficiency: 0.50,
    hydroEfficiency: 0.40,
    tidalEfficiency: 0,
    baselineCO2: 12000,
    description: "High solar potential, limited water resources"
  },
  Pune: {
    solarEfficiency: 0.80,
    windEfficiency: 0.75,
    hydroEfficiency: 0.60,
    tidalEfficiency: 0,
    baselineCO2: 9000,
    description: "Balanced renewable mix, good wind conditions"
  },
  Chennai: {
    solarEfficiency: 0.88,
    windEfficiency: 0.82,
    hydroEfficiency: 0.45,
    tidalEfficiency: 0.70,
    baselineCO2: 10000,
    description: "Excellent solar and tidal potential"
  },
  Mumbai: {
    solarEfficiency: 0.75,
    windEfficiency: 0.65,
    hydroEfficiency: 0.50,
    tidalEfficiency: 0.75,
    baselineCO2: 15000,
    description: "Strong tidal energy, high energy demand"
  },
  Kolkata: {
    solarEfficiency: 0.70,
    windEfficiency: 0.55,
    hydroEfficiency: 0.80,
    tidalEfficiency: 0.65,
    baselineCO2: 11000,
    description: "Excellent hydro resources, moderate tidal"
  }
};

// Energy source parameters
const ENERGY_SOURCES = {
  solar: {
    setupCost: 8000,
    maintenanceCost: 500,
    carbonOffset: 0.85,
    baseOutput: 200
  },
  wind: {
    setupCost: 12000,
    maintenanceCost: 800,
    carbonOffset: 0.92,
    baseOutput: 180
  },
  hydro: {
    setupCost: 15000,
    maintenanceCost: 600,
    carbonOffset: 0.88,
    baseOutput: 220
  },
  tidal: {
    setupCost: 20000,
    maintenanceCost: 1200,
    carbonOffset: 0.95,
    baseOutput: 160
  }
};

// Random events that affect simulation
const RANDOM_EVENTS = [
  { message: "Unexpected drought reduces hydro output by 25%", impact: { hydro: -0.25 } },
  { message: "Government subsidies boost solar investment by 20%", impact: { solar: 0.20 } },
  { message: "Storm damages wind turbines, reducing output by 15%", impact: { wind: -0.15 } },
  { message: "Monsoon season increases hydro efficiency by 30%", impact: { hydro: 0.30 } },
  { message: "Heat wave increases solar output by 10%", impact: { solar: 0.10 } },
  { message: "Calm weather period reduces wind generation by 20%", impact: { wind: -0.20 } },
  { message: "Technological breakthrough improves tidal efficiency by 25%", impact: { tidal: 0.25 } },
  { message: "Perfect weather conditions boost all renewable sources by 10%", impact: { solar: 0.10, wind: 0.10, hydro: 0.10, tidal: 0.10 } }
];

interface SimulationResult {
  energyGenerated: number;
  budgetRemaining: number;
  co2Saved: number;
  publicSatisfaction: number;
  rank: string;
  eventMessage: string;
  breakdown: {
    solar: number;
    wind: number;
    hydro: number;
    tidal: number;
  };
}

interface HistoricalResult {
  year: number;
  energyGenerated: number;
  co2Saved: number;
  publicSatisfaction: number;
  budgetRemaining: number;
}

const COLORS = {
  solar: "#f59e0b",
  wind: "#06b6d4",
  hydro: "#3b82f6",
  tidal: "#8b5cf6"
};

export default function SmartCityPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedCity, setSelectedCity] = useState<keyof typeof CITIES>("Delhi");
  const [investments, setInvestments] = useState({
    solar: 25,
    wind: 25,
    hydro: 25,
    tidal: 25
  });
  const [results, setResults] = useState<SimulationResult | null>(null);
  const [simulationCount, setSimulationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoricalResult[]>([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please log in to continue",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const cityConfig = CITIES[selectedCity];
  const totalInvestment = Object.values(investments).reduce((sum, val) => sum + val, 0);

  // Reset history when city changes to avoid mixing scenarios
  useEffect(() => {
    setHistory([]);
    setResults(null);
    setSimulationCount(0);
  }, [selectedCity]);

  const handleInvestmentChange = (source: keyof typeof investments, value: number[]) => {
    const newValue = value[0];
    setInvestments({ ...investments, [source]: newValue });
  };

  const getRank = (satisfaction: number): string => {
    if (satisfaction >= 90) return "Platinum Sustainability";
    if (satisfaction >= 80) return "Gold Sustainability";
    if (satisfaction >= 70) return "Silver Sustainability";
    if (satisfaction >= 60) return "Bronze Sustainability";
    return "Developing";
  };

  const runSimulation = () => {
    if (totalInvestment !== 100) {
      toast({
        title: "Invalid Investment",
        description: "Total investment must equal 100%",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Select a random event
      const randomEvent = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
      
      // Base budget (in lakhs)
      const TOTAL_BUDGET = 100;
      
      // Calculate costs and generation for each source
      const breakdown = {
        solar: 0,
        wind: 0,
        hydro: 0,
        tidal: 0
      };
      
      let totalCost = 0;
      let totalEnergy = 0;
      let totalCO2Offset = 0;

      (Object.keys(ENERGY_SOURCES) as Array<keyof typeof ENERGY_SOURCES>).forEach(source => {
        const investmentPercent = investments[source] / 100;
        const sourceConfig = ENERGY_SOURCES[source];
        const cityEfficiency = cityConfig[`${source}Efficiency` as keyof typeof cityConfig] as number;
        
        // Calculate cost
        const setupCost = sourceConfig.setupCost * investmentPercent;
        const maintenanceCost = sourceConfig.maintenanceCost * investmentPercent;
        totalCost += (setupCost + maintenanceCost) / 1000; // Convert to lakhs
        
        // Calculate energy output with weather variation (±15%)
        const weatherFactor = 0.85 + Math.random() * 0.30;
        
        // Apply random event impact
        const eventImpact = randomEvent.impact[source] || 0;
        const eventFactor = 1 + eventImpact;
        
        // Final energy calculation
        const energy = sourceConfig.baseOutput * investmentPercent * cityEfficiency * weatherFactor * eventFactor;
        breakdown[source] = Math.max(0, energy);
        totalEnergy += breakdown[source];
        
        // Calculate CO2 offset
        totalCO2Offset += energy * sourceConfig.carbonOffset * 10;
      });

      const budgetRemaining = TOTAL_BUDGET - totalCost;
      
      // Calculate public satisfaction (based on multiple factors)
      const energyScore = Math.min(100, (totalEnergy / 200) * 100);
      const budgetScore = Math.min(100, (budgetRemaining / TOTAL_BUDGET) * 100);
      const co2Score = Math.min(100, (totalCO2Offset / cityConfig.baselineCO2) * 100);
      const publicSatisfaction = (energyScore * 0.4 + budgetScore * 0.3 + co2Score * 0.3);

      const result: SimulationResult = {
        energyGenerated: Math.round(totalEnergy * 10) / 10,
        budgetRemaining: Math.round(budgetRemaining * 100) / 100,
        co2Saved: Math.round(totalCO2Offset),
        publicSatisfaction: Math.round(publicSatisfaction * 10) / 10,
        rank: getRank(publicSatisfaction),
        eventMessage: randomEvent.message,
        breakdown
      };

      setResults(result);
      setSimulationCount(prev => prev + 1);
      setHistory(prev => [...prev, {
        year: simulationCount + 1,
        energyGenerated: result.energyGenerated,
        co2Saved: result.co2Saved,
        publicSatisfaction: result.publicSatisfaction,
        budgetRemaining: result.budgetRemaining
      }]);
      setIsLoading(false);

      toast({
        title: "Simulation Complete",
        description: `Year ${simulationCount + 1} results are ready!`
      });
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold">Smart City Energy Optimizer</h1>
        </div>
        <p className="text-muted-foreground">
          Simulate renewable energy planning for major Indian cities
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="xl:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>City Selection</CardTitle>
              <CardDescription>Choose your smart city</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select City</Label>
                <Select value={selectedCity} onValueChange={(value: keyof typeof CITIES) => setSelectedCity(value)}>
                  <SelectTrigger data-testid="select-city">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(CITIES) as Array<keyof typeof CITIES>).map(city => (
                      <SelectItem key={city} value={city} data-testid={`option-city-${city.toLowerCase()}`}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">{cityConfig.description}</p>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <p className="text-sm font-medium">City Efficiency Profile</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Solar:</span>
                    <span className="font-medium">{(cityConfig.solarEfficiency * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wind:</span>
                    <span className="font-medium">{(cityConfig.windEfficiency * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hydro:</span>
                    <span className="font-medium">{(cityConfig.hydroEfficiency * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tidal:</span>
                    <span className="font-medium">{(cityConfig.tidalEfficiency * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Investment Allocation</CardTitle>
              <CardDescription>
                Distribute 100% investment across energy sources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {(Object.keys(investments) as Array<keyof typeof investments>).map(source => {
                  const icons = {
                    solar: Sun,
                    wind: Wind,
                    hydro: Droplets,
                    tidal: Waves
                  };
                  const Icon = icons[source];
                  
                  return (
                    <div key={source} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" style={{ color: COLORS[source] }} />
                          <Label className="capitalize">{source} Energy</Label>
                        </div>
                        <span className="text-sm font-bold" style={{ color: COLORS[source] }}>
                          {investments[source]}%
                        </span>
                      </div>
                      <Slider
                        value={[investments[source]]}
                        onValueChange={(value) => handleInvestmentChange(source, value)}
                        max={100}
                        step={1}
                        data-testid={`slider-${source}`}
                        className="cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Total Allocated:</span>
                  <span className={`text-sm font-bold ${totalInvestment === 100 ? 'text-green-600' : 'text-destructive'}`}>
                    {totalInvestment}%
                  </span>
                </div>
                <Progress value={totalInvestment} className="h-2" />
                {totalInvestment !== 100 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {totalInvestment < 100 
                      ? `Add ${100 - totalInvestment}% more` 
                      : `Reduce by ${totalInvestment - 100}%`}
                  </p>
                )}
              </div>

              {/* Live Investment Pie Chart */}
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-3">Investment Distribution</p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={Object.entries(investments).map(([key, value]) => ({
                        name: key.charAt(0).toUpperCase() + key.slice(1),
                        value: value
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => value > 0 ? `${name}: ${value}%` : ''}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.keys(investments).map((key) => (
                        <Cell key={key} fill={COLORS[key as keyof typeof COLORS]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <Button 
                onClick={runSimulation} 
                className="w-full" 
                disabled={totalInvestment !== 100 || isLoading}
                data-testid="button-run-simulation"
              >
                {isLoading ? "Running Simulation..." : `Run Year ${simulationCount + 1} Simulation`}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="xl:col-span-2 space-y-6">
          {results ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Simulation Results - Year {simulationCount}
                  </CardTitle>
                  <CardDescription>
                    City: {selectedCity}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-background/50 rounded-lg p-3 border">
                    <p className="text-sm font-medium mb-1">Random Event:</p>
                    <p className="text-sm text-muted-foreground">{results.eventMessage}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-background/50 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Energy Generated</p>
                      <p className="text-2xl font-bold">{results.energyGenerated}</p>
                      <p className="text-xs text-muted-foreground">MWh</p>
                    </div>

                    <div className="bg-background/50 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Budget Remaining</p>
                      <p className="text-2xl font-bold">₹{results.budgetRemaining}M</p>
                      <p className="text-xs text-muted-foreground">of ₹100M</p>
                    </div>

                    <div className="bg-background/50 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">CO₂ Saved</p>
                      <p className="text-2xl font-bold">{results.co2Saved}</p>
                      <p className="text-xs text-muted-foreground">tons</p>
                    </div>

                    <div className="bg-background/50 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Public Satisfaction</p>
                      <p className="text-2xl font-bold">{results.publicSatisfaction}%</p>
                      <Progress value={results.publicSatisfaction} className="h-1 mt-2" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-background/50 rounded-lg p-4">
                    <Award className="w-8 h-8 text-amber-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Sustainability Rank</p>
                      <p className="text-lg font-bold">{results.rank}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Energy Breakdown
                    </CardTitle>
                    <CardDescription>
                      Output by source (MWh)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={Object.entries(results.breakdown).map(([key, value]) => ({
                        name: key.charAt(0).toUpperCase() + key.slice(1),
                        value: value,
                        fill: COLORS[key as keyof typeof COLORS]
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                          contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                          formatter={(value: number) => [`${value.toFixed(1)} MWh`, 'Energy']}
                        />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>
                      Key indicators
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center">
                    <div style={{ width: '100%', height: '300px', position: 'relative' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart 
                          cx="50%" 
                          cy="50%" 
                          innerRadius="60%" 
                          outerRadius="90%" 
                          data={[
                            {
                              name: 'Satisfaction',
                              value: results.publicSatisfaction,
                              fill: '#167a5f'
                            }
                          ]}
                          startAngle={90}
                          endAngle={90 - (results.publicSatisfaction / 100) * 360}
                        >
                          <RadialBar
                            background={{ fill: 'hsl(var(--muted))' }}
                            dataKey="value"
                            cornerRadius={10}
                            isAnimationActive={true}
                          />
                        </RadialBarChart>
                      </ResponsiveContainer>
                      <div style={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center'
                      }}>
                        <div className="text-4xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                          {results.publicSatisfaction.toFixed(1)}%
                        </div>
                        <div className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          Public Satisfaction
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {history.length > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="w-5 h-5" />
                      Historical Performance
                    </CardTitle>
                    <CardDescription>
                      Track your progress over {history.length} simulation years
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis 
                          dataKey="year" 
                          label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          yAxisId="left"
                          label={{ value: 'Energy (MWh)', angle: -90, position: 'insideLeft' }}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          yAxisId="right" 
                          orientation="right"
                          label={{ value: 'Satisfaction (%)', angle: 90, position: 'insideRight' }}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip 
                          contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                        />
                        <Legend />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="energyGenerated" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          name="Energy Generated"
                          dot={{ r: 4 }}
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="publicSatisfaction" 
                          stroke="#22c55e" 
                          strokeWidth={2}
                          name="Public Satisfaction"
                          dot={{ r: 4 }}
                        />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="co2Saved" 
                          stroke="#8b5cf6" 
                          strokeWidth={2}
                          name="CO₂ Saved (tons)"
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="h-full flex items-center justify-center min-h-[400px]">
              <CardContent className="text-center p-8">
                <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Simulation Yet</h3>
                <p className="text-muted-foreground max-w-md">
                  Select a city, allocate your investments across renewable sources, and run the simulation to see the results.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
