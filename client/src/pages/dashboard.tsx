import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import ConfigSidebar, { type OptimizationConfig } from "@/components/ConfigSidebar";
import Dashboard from "@/components/Dashboard";
import { Button } from "@/components/ui/button";
import { LogOut, Leaf } from "lucide-react";
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

  const sidebarStyle = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  } as React.CSSProperties;

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
    <SidebarProvider style={sidebarStyle}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarContent className="p-4">
            <ConfigSidebar onRunOptimization={handleRunOptimization} isLoading={isLoading} />
          </SidebarContent>
        </Sidebar>
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b bg-card">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-bold">EnerJee</h1>
              </div>
            </div>
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              data-testid="button-logout"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </header>
          
          <main className="flex-1 overflow-y-auto p-8 bg-background">
            <Dashboard
              results={results}
              energyMixData={energyMixData}
              priceData={priceData}
              region={currentRegion}
              onSendMessage={handleSendMessage}
            />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
