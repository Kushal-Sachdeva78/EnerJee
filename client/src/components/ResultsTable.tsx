import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingDown, TrendingUp } from "lucide-react";

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

interface ResultsTableProps {
  results: OptimizationResults;
}

export default function ResultsTable({ results }: ResultsTableProps) {
  const calculateImprovement = (optimized: number, baseline: number, inverse: boolean = false) => {
    const improvement = ((baseline - optimized) / baseline) * 100;
    return inverse ? -improvement : improvement;
  };

  const renderChange = (optimized: number, baseline: number, inverse: boolean = false) => {
    const improvement = calculateImprovement(optimized, baseline, inverse);
    const isPositive = improvement > 0;
    
    return (
      <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        <span>{Math.abs(improvement).toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Optimization Results</CardTitle>
        <CardDescription>
          Comparison between AI-optimized solution and greedy baseline
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead className="text-right">Optimized Solution</TableHead>
              <TableHead className="text-right">Greedy Baseline</TableHead>
              <TableHead className="text-right">Change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Cost (₹/MWh)</TableCell>
              <TableCell className="text-right font-semibold" data-testid="text-cost-optimized">
                ₹{results.optimized.cost.toFixed(2)}
              </TableCell>
              <TableCell className="text-right" data-testid="text-cost-baseline">
                ₹{results.baseline.cost.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                {renderChange(results.optimized.cost, results.baseline.cost)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Emissions (kg CO₂)</TableCell>
              <TableCell className="text-right font-semibold" data-testid="text-emissions-optimized">
                {results.optimized.emissions.toFixed(2)}
              </TableCell>
              <TableCell className="text-right" data-testid="text-emissions-baseline">
                {results.baseline.emissions.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                {renderChange(results.optimized.emissions, results.baseline.emissions)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Reliability (%)</TableCell>
              <TableCell className="text-right font-semibold" data-testid="text-reliability-optimized">
                {results.optimized.reliability.toFixed(1)}%
              </TableCell>
              <TableCell className="text-right" data-testid="text-reliability-baseline">
                {results.baseline.reliability.toFixed(1)}%
              </TableCell>
              <TableCell className="text-right">
                {renderChange(results.optimized.reliability, results.baseline.reliability, true)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
