import EnergyMixChart from "../EnergyMixChart";

export default function EnergyMixChartExample() {
  const mockData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    solar: Math.max(0, Math.sin((i - 6) * Math.PI / 12) * 45 + Math.random() * 5),
    wind: 15 + Math.random() * 25,
    hydro: 20 + Math.random() * 10,
    demand: 75 + Math.random() * 10
  }));

  return (
    <div className="p-8 bg-background">
      <EnergyMixChart data={mockData} />
    </div>
  );
}
