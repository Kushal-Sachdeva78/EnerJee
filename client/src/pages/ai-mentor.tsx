import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Brain } from "lucide-react";
import ChatAssistant from "@/components/ChatAssistant";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { ChatRequest, ChatResponse } from "@shared/api-types";

export default function AIMentorPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please log in to continue",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  const handleSendMessage = async (message: string): Promise<string> => {
    try {
      const chatRequest: ChatRequest = {
        message,
        context: undefined,
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
      throw new Error("Failed to get response from EnerJeePT");
    }
  };

  if (isLoading) {
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
          <Brain className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold">EnerJeePT</h1>
        </div>
        <p className="text-muted-foreground">
          Get expert guidance on renewable energy, optimization strategies, and sustainability insights
        </p>
      </div>

      <div className="h-[calc(100vh-250px)] min-h-[500px]">
        <ChatAssistant onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
