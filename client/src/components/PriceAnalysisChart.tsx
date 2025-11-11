import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface PriceData {
  time: string;
  optimized: number;
  baseline: number;
}

interface PriceAnalysisChartProps {
  data: PriceData[];
}

export default function PriceAnalysisChart({ data }: PriceAnalysisChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Analysis</CardTitle>
        <CardDescription>
          Cost comparison: Optimized vs Baseline
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="time" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              label={{ value: 'Cost (₹/MWh)', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))' } }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="optimized" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 3 }}
              name="Optimized"
            />
            <Line 
              type="monotone" 
              dataKey="baseline" 
              stroke="#ef4444" 
              strokeWidth={2}
              dot={{ fill: '#ef4444', r: 3 }}
              name="Baseline"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
