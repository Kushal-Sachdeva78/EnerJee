import { useState, useEffect } from "react";
import ConfigSidebar, { type OptimizationConfig } from "@/components/ConfigSidebar";
import Dashboard from "@/components/Dashboard";
import { TrendingUp } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { 
  OptimizationResults, 
  EnergyMixData, 
  PriceData,
  OptimizeResponse,
  ChatResponse,
  ChatRequest
} from "@shared/api-types";

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<OptimizationResults | undefined>();
  const [energyMixData, setEnergyMixData] = useState<EnergyMixData[] | undefined>();
  const [priceData, setPriceData] = useState<PriceData[] | undefined>();
  const [currentRegion, setCurrentRegion] = useState<string | undefined>();
  const [optimizationContext, setOptimizationContext] = useState<ChatRequest['context']>(undefined);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please log in to continue",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/logout", {});
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/";
    }
  };

  const handleRunOptimization = async (config: OptimizationConfig) => {
    setIsLoading(true);
    
    try {
      const res = await apiRequest("POST", "/api/optimize", config);
      const response = await res.json() as OptimizeResponse;
      
      setResults(response.results);
      setEnergyMixData(response.energyMixData);
      setPriceData(response.priceData);
      setCurrentRegion(config.region);
      
      // Save context for chat
      setOptimizationContext({
        region: config.region,
        optimizedCost: response.results.optimized.cost,
        baselineCost: response.results.baseline.cost,
        optimizedEmissions: response.results.optimized.emissions,
        baselineEmissions: response.results.baseline.emissions,
        renewableShare: response.results.optimized.renewableShare,
      });
      
      toast({
        title: "Optimization Complete",
        description: `Successfully optimized energy mix for ${config.region}`,
      });
    } catch (error: any) {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in to continue",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
        return;
      }
      
      console.error("Error running optimization:", error);
      toast({
        title: "Optimization Failed",
        description: "Failed to run optimization. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message: string): Promise<string> => {
    try {
      const chatRequest: ChatRequest = {
        message,
        context: optimizationContext,
      };
      const res = await apiRequest("POST", "/api/chat", chatRequest);
      const response = await res.json() as ChatResponse;
      
      return response.response;
    } catch (error: any) {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in to continue",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
        throw error;
      }
      
      console.error("Error sending message:", error);
      throw new Error("Failed to get response from AI mentor");
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold">Energy Forecasting Dashboard</h1>
        </div>
        <p className="text-muted-foreground">Math-powered optimization for renewable energy planning across Indian regions</p>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="xl:col-span-1">
          <ConfigSidebar onRunOptimization={handleRunOptimization} isLoading={isLoading} />
        </div>
        
        {/* Results Panel */}
        <div className="xl:col-span-2">
          <Dashboard
            results={results}
            energyMixData={energyMixData}
            priceData={priceData}
            region={currentRegion}
          />
        </div>
      </div>
    </div>
  );
}
