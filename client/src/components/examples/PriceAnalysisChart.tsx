import PriceAnalysisChart from "../PriceAnalysisChart";

export default function PriceAnalysisChartExample() {
  const mockData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    optimized: 3000 + Math.random() * 600 + Math.sin(i * Math.PI / 12) * 300,
    baseline: 3800 + Math.random() * 700 + Math.sin(i * Math.PI / 12) * 400
  }));

  return (
    <div className="p-8 bg-background">
      <PriceAnalysisChart data={mockData} />
    </div>
  );
}
