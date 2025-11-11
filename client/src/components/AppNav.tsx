import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Zap, Home, BarChart3, Building2, Brain, Mail, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

interface AppNavProps {
  isAuthenticated: boolean;
}

const NAV_ITEMS = [
  { path: "/home", label: "Home", icon: Home, requiresAuth: true },
  { path: "/forecasting", label: "Forecasting", icon: BarChart3, requiresAuth: true },
  { path: "/smart-city", label: "Smart City", icon: Building2, requiresAuth: true },
  { path: "/ai-mentor", label: "EnerJeePT", icon: Brain, requiresAuth: true },
  { path: "/contact", label: "Contact", icon: Mail, requiresAuth: false },
];

export default function AppNav({ isAuthenticated }: AppNavProps) {
  const [location] = useLocation();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      
      if (response.ok) {
        window.location.href = "/";
      } else {
        console.error("Logout failed with status:", response.status);
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/";
    }
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={isAuthenticated ? "/home" : "/"}>
            <div className="flex items-center gap-2 hover-elevate active-elevate-2 cursor-pointer px-3 py-2 rounded-md" data-testid="link-logo">
              <Zap className="w-6 h-6 text-primary" />
              <span className="text-xl text-primary italic font-bold" style={{ fontFamily: "'Times New Roman MT Condensed', 'Times New Roman', serif" }}>
                EnerJee
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              if (item.requiresAuth && !isAuthenticated) return null;
              const isActive = location === item.path;
              const Icon = item.icon;
              
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "gap-2",
                      isActive && "bg-accent"
                    )}
                    data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
            
            {isAuthenticated && (
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="gap-2"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
