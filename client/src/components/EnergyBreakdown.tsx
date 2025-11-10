import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Sun, Wind, Droplets } from "lucide-react";
import { EnergyMixData } from "./EnergyMixChart";
import { PriceData } from "./PriceAnalysisChart";
import { OptimizationResults } from "./ResultsTable";

interface EnergyBreakdownProps {
  energyMixData: EnergyMixData[];
  priceData: PriceData[];
  results: OptimizationResults;
  region: string;
}

export default function EnergyBreakdown({ energyMixData, priceData, results, region }: EnergyBreakdownProps) {
  const calculateAveragePercentages = () => {
    const totals = energyMixData.reduce(
      (acc, data) => ({
        solar: acc.solar + data.solar,
        wind: acc.wind + data.wind,
        hydro: acc.hydro + data.hydro,
      }),
      { solar: 0, wind: 0, hydro: 0 }
    );

    const totalRenewable = totals.solar + totals.wind + totals.hydro;

    return {
      solar: (totals.solar / totalRenewable) * 100,
      wind: (totals.wind / totalRenewable) * 100,
      hydro: (totals.hydro / totalRenewable) * 100,
    };
  };

  const handleExportCSV = () => {
    const percentages = calculateAveragePercentages();
    
    let csvContent = "EnerJee - Optimization Export\n";
    csvContent += `Region: ${region}\n`;
    csvContent += `Export Date: ${new Date().toLocaleString()}\n\n`;
    
    csvContent += "=== RENEWABLE ENERGY BREAKDOWN ===\n";
    csvContent += "Source,Percentage\n";
    csvContent += `Solar,${percentages.solar.toFixed(2)}%\n`;
    csvContent += `Wind,${percentages.wind.toFixed(2)}%\n`;
    csvContent += `Hydro,${percentages.hydro.toFixed(2)}%\n\n`;
    
    csvContent += "=== OPTIMIZATION RESULTS ===\n";
    csvContent += "Metric,Optimized,Baseline,Improvement\n";
    csvContent += `Cost (₹/MWh),${results.optimized.cost.toFixed(2)},${results.baseline.cost.toFixed(2)},${(((results.baseline.cost - results.optimized.cost) / results.baseline.cost) * 100).toFixed(1)}%\n`;
    csvContent += `Emissions (kg CO₂),${results.optimized.emissions.toFixed(2)},${results.baseline.emissions.toFixed(2)},${(((results.baseline.emissions - results.optimized.emissions) / results.baseline.emissions) * 100).toFixed(1)}%\n`;
    csvContent += `Reliability,${(results.optimized.reliability * 100).toFixed(2)}%,${(results.baseline.reliability * 100).toFixed(2)}%,${(((results.optimized.reliability - results.baseline.reliability) / results.baseline.reliability) * 100).toFixed(1)}%\n`;
    csvContent += `Renewable Share,${results.optimized.renewableShare.toFixed(1)}%,${results.baseline.renewableShare.toFixed(1)}%,${((results.optimized.renewableShare - results.baseline.renewableShare)).toFixed(1)}%\n\n`;
    
    csvContent += "=== ENERGY MIX TIME SERIES ===\n";
    csvContent += "Time,Solar (MWh),Wind (MWh),Hydro (MWh),Demand (MWh)\n";
    energyMixData.forEach(row => {
      csvContent += `${row.time},${row.solar.toFixed(2)},${row.wind.toFixed(2)},${row.hydro.toFixed(2)},${row.demand.toFixed(2)}\n`;
    });
    
    csvContent += "\n=== PRICE ANALYSIS ===\n";
    csvContent += "Time,Optimized Cost (₹/MWh),Baseline Cost (₹/MWh)\n";
    priceData.forEach(row => {
      csvContent += `${row.time},${row.optimized.toFixed(2)},${row.baseline.toFixed(2)}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `enerjee-optimization-${region}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const percentages = calculateAveragePercentages();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Renewable Energy Breakdown</CardTitle>
            <CardDescription>
              Average distribution of renewable energy sources in optimized solution
            </CardDescription>
          </div>
          <Button 
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            data-testid="button-export-csv"
          >
            <Download className="w-4 h-4 mr-2" />
            Export to CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <Sun className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Solar Power</p>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-400" data-testid="text-solar-percentage">
                {percentages.solar.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-lg bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800">
            <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/30 rounded-lg flex items-center justify-center">
              <Wind className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Wind Power</p>
              <p className="text-2xl font-bold text-sky-700 dark:text-sky-400" data-testid="text-wind-percentage">
                {percentages.wind.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-lg bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800">
            <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
              <Droplets className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hydro Power</p>
              <p className="text-2xl font-bold text-teal-700 dark:text-teal-400" data-testid="text-hydro-percentage">
                {percentages.hydro.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
