import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // Redirect to home if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/home");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }

    setLoggingIn(true);
    try {
      await apiRequest("POST", "/api/login", { username, password });
      
      toast({
        title: "Login Successful",
        description: "Welcome to EnerJee!",
      });
      
      // Refresh auth state and redirect
      window.location.href = "/home";
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    } finally {
      setLoggingIn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
              <Leaf className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-[110px] text-[#167a5f] italic font-bold" style={{ fontFamily: "'Times New Roman MT Condensed', 'Times New Roman', serif" }}>EnerJee</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-2">
            AI-Powered Energy Optimization for a Sustainable Future
          </p>
          <p className="text-sm text-muted-foreground">
            Predict, optimize, and explain the best mix of renewable energy sources for Indian regions
          </p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Info className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Demo login credentials: <strong>demo1234</strong> / <strong>123456</strong>
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loggingIn}
                  data-testid="input-username"
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loggingIn}
                  data-testid="input-password"
                  autoComplete="current-password"
                />
              </div>

              <Button 
                type="submit"
                size="lg"
                className="w-full"
                disabled={loggingIn}
                data-testid="button-login"
              >
                {loggingIn ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
