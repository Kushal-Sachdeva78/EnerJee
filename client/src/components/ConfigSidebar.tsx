import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Zap } from "lucide-react";

interface ConfigSidebarProps {
  onRunOptimization: (config: OptimizationConfig) => void;
  isLoading?: boolean;
}

export interface OptimizationConfig {
  region: string;
  forecastMethod: string;
  energyFocus: string[];
  costWeight: number;
}

const REGIONS = [
  "Jodhpur",
  "Bangalore",
  "Chennai",
  "Kutch",
  "Uttarakashi",
  "Satara"
];

const FORECAST_METHODS = [
  "Last Day Pattern",
  "24 Hour Forecast",
  "3 Month Prediction",
  "1 Year Forecast",
  "Exponential Smoothing"
];

const ENERGY_FOCUS = [
  { value: "solar", label: "Solar Priority" },
  { value: "wind", label: "Wind Priority" },
  { value: "hydro", label: "Hydro Priority" }
];

export default function ConfigSidebar({ onRunOptimization, isLoading = false }: ConfigSidebarProps) {
  const [region, setRegion] = useState("Jodhpur");
  const [forecastMethod, setForecastMethod] = useState("24 Hour Forecast");
  const [energyFocus, setEnergyFocus] = useState<string[]>(["solar", "wind", "hydro"]);
  const [costWeight, setCostWeight] = useState([0.5]);

  const handleToggleEnergyFocus = (value: string) => {
    setEnergyFocus(prev => {
      if (prev.includes(value)) {
        // Don't allow deselecting all options
        if (prev.length === 1) return prev;
        return prev.filter(v => v !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const handleRunOptimization = () => {
    onRunOptimization({
      region,
      forecastMethod,
      energyFocus,
      costWeight: costWeight[0]
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Configuration
        </CardTitle>
        <CardDescription>
          Configure your energy optimization parameters
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-6 overflow-y-auto">
        <div className="space-y-2">
          <Label htmlFor="region">Select Region</Label>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger id="region" data-testid="select-region">
              <SelectValue placeholder="Choose a region" />
            </SelectTrigger>
            <SelectContent>
              {REGIONS.map((r) => (
                <SelectItem key={r} value={r} data-testid={`option-region-${r.toLowerCase()}`}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="forecast">Forecasting Method</Label>
          <Select value={forecastMethod} onValueChange={setForecastMethod}>
            <SelectTrigger id="forecast" data-testid="select-forecast">
              <SelectValue placeholder="Choose forecast method" />
            </SelectTrigger>
            <SelectContent>
              {FORECAST_METHODS.map((method) => (
                <SelectItem 
                  key={method} 
                  value={method}
                  data-testid={`option-forecast-${method.toLowerCase().replace(/ /g, '-')}`}
                >
                  {method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label>Energy Focus</Label>
          <p className="text-xs text-muted-foreground">
            Select one or more energy sources to prioritize in the optimization
          </p>
          <div className="space-y-2">
            {ENERGY_FOCUS.map((focus) => (
              <div key={focus.value} className="flex items-center space-x-2">
                <Checkbox 
                  id={focus.value}
                  checked={energyFocus.includes(focus.value)}
                  onCheckedChange={() => handleToggleEnergyFocus(focus.value)}
                  data-testid={`checkbox-${focus.value}`}
                />
                <Label htmlFor={focus.value} className="font-normal cursor-pointer">
                  {focus.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="cost-weight">Cost vs Emissions Priority</Label>
            <span className="text-sm font-medium text-muted-foreground" data-testid="text-cost-weight">
              {costWeight[0].toFixed(1)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Slide left to prioritize <strong>reducing emissions</strong> (environmental focus), or right to prioritize <strong>minimizing cost</strong> (economic focus). Balanced (0.5) optimizes both equally.
          </p>
          <Slider
            id="cost-weight"
            data-testid="slider-cost-weight"
            min={0}
            max={1}
            step={0.1}
            value={costWeight}
            onValueChange={setCostWeight}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>🌱 Emissions Priority</span>
            <span>💰 Cost Priority</span>
          </div>
        </div>

        <Separator />

        <Button
          onClick={handleRunOptimization}
          disabled={isLoading}
          className="w-full bg-accent hover:bg-accent text-accent-foreground"
          data-testid="button-run-optimization"
        >
          {isLoading ? "Running..." : "Run Optimization"}
        </Button>
      </CardContent>
    </Card>
  );
}
