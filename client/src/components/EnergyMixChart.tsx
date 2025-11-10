import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, Legend, Line, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from "recharts";

export interface EnergyMixData {
  time: string;
  solar: number;
  wind: number;
  hydro: number;
  demand: number;
}

interface EnergyMixChartProps {
  data: EnergyMixData[];
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-md p-3 shadow-lg">
        <p className="text-sm font-semibold mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="font-medium">{entry.name}:</span>
            <span className="text-muted-foreground">
              {entry.value?.toFixed(2)} MWh
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function EnergyMixChart({ data }: EnergyMixChartProps) {
  // Calculate the max value for proper Y-axis scaling
  const maxValue = Math.max(
    ...data.map(d => Math.max(d.demand, d.solar + d.wind + d.hydro))
  );
  const yAxisMax = Math.ceil(maxValue * 1.1); // Add 10% padding at the top

  return (
    <Card>
      <CardHeader>
        <CardTitle>Energy Mix Over Time</CardTitle>
        <CardDescription>
          Solar, Wind, and Hydro generation meeting demand
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorWind" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorHydro" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="time" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              label={{ value: 'Power (MWh)', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))' } }}
              domain={[0, yAxisMax]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="hydro" 
              stackId="1"
              stroke="#14b8a6" 
              fill="url(#colorHydro)" 
              name="Hydro"
            />
            <Area 
              type="monotone" 
              dataKey="wind" 
              stackId="1"
              stroke="#0ea5e9" 
              fill="url(#colorWind)" 
              name="Wind"
            />
            <Area 
              type="monotone" 
              dataKey="solar" 
              stackId="1"
              stroke="#fbbf24" 
              fill="url(#colorSolar)" 
              name="Solar"
            />
            <Line 
              type="monotone" 
              dataKey="demand" 
              stroke="#64748b" 
              strokeWidth={2}
              dot={false}
              name="Demand"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
