import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export interface EmissionData {
  name: string;
  value: number;
}

interface EmissionChartProps {
  data: EmissionData[];
}

const COLORS = ['#10b981', '#94a3b8'];

export default function EmissionChart({ data }: EmissionChartProps) {
  const totalEmissions = data.reduce((acc, item) => acc + item.value, 0);
  const savedPercentage = ((data[0].value / totalEmissions) * 100).toFixed(1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Emission Reduction</CardTitle>
        <CardDescription>
          CO₂ emissions saved through optimization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-3xl font-bold text-green-600" data-testid="text-emission-saved">
              {savedPercentage}%
            </p>
            <p className="text-sm text-muted-foreground">
              Emissions Reduced
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
