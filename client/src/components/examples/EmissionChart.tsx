import EmissionChart from "../EmissionChart";

export default function EmissionChartExample() {
  const mockData = [
    { name: "Saved", value: 800 },
    { name: "Remaining", value: 1850 }
  ];

  return (
    <div className="p-8 bg-background">
      <EmissionChart data={mockData} />
    </div>
  );
}
