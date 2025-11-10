import { useState } from "react";
import ResultsTable, { type OptimizationResults } from "./ResultsTable";
import EnergyMixChart, { type EnergyMixData } from "./EnergyMixChart";
import PriceAnalysisChart, { type PriceData } from "./PriceAnalysisChart";
import EnergyBreakdown from "./EnergyBreakdown";
import ChatAssistant from "./ChatAssistant";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface DashboardProps {
  results?: OptimizationResults;
  energyMixData?: EnergyMixData[];
  priceData?: PriceData[];
  region?: string;
  onSendMessage?: (message: string) => Promise<string>;
}

export default function Dashboard({
  results,
  energyMixData,
  priceData,
  region,
  onSendMessage
}: DashboardProps) {
  const hasResults = results && energyMixData && priceData;

  if (!hasResults) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Ready to Optimize</h3>
              <p className="text-sm text-muted-foreground">
                Configure your parameters in the sidebar and click "Run Optimization" to see AI-powered energy forecasting and cost analysis.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ResultsTable results={results} />
      
      <EnergyBreakdown 
        energyMixData={energyMixData}
        priceData={priceData}
        results={results}
        region={region || "Unknown"}
      />
      
      <div className="space-y-6">
        <EnergyMixChart data={energyMixData} />
        <PriceAnalysisChart data={priceData} />
      </div>

      <div className="h-[500px]">
        <ChatAssistant onSendMessage={onSendMessage} />
      </div>
    </div>
  );
}
