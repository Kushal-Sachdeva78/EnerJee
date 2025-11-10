import ResultsTable from "../ResultsTable";

export default function ResultsTableExample() {
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

  return (
    <div className="p-8 bg-background">
      <ResultsTable results={mockResults} />
    </div>
  );
}
