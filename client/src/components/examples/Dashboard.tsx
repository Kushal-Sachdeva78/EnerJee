import Dashboard from "../Dashboard";

export default function DashboardExample() {
  const mockResults = {
    optimized: {
      cost: 3250.45,
      emissions: 1850.32,
      reliability: 97.8,
      renewableShare: 68.5
    },
    baseline: {
      cost: 4120.80,
      emissions: 2650.75,
      reliability: 94.2,
      renewableShare: 52.3
    }
  };

  const mockEnergyMixData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    solar: Math.max(0, Math.sin((i - 6) * Math.PI / 12) * 45 + Math.random() * 5),
    wind: 15 + Math.random() * 25,
    hydro: 20 + Math.random() * 10,
    demand: 75 + Math.random() * 10
  }));

  const mockPriceData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    optimized: 3000 + Math.random() * 600 + Math.sin(i * Math.PI / 12) * 300,
    baseline: 3800 + Math.random() * 700 + Math.sin(i * Math.PI / 12) * 400
  }));

  const mockEmissionData = [
    { name: "Saved", value: 800 },
    { name: "Remaining", value: 1850 }
  ];

  return (
    <div className="p-8 bg-background">
      <Dashboard
        results={mockResults}
        energyMixData={mockEnergyMixData}
        priceData={mockPriceData}
        emissionData={mockEmissionData}
      />
    </div>
  );
}
