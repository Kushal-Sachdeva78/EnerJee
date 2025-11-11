import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Zap, TrendingUp, Brain, BarChart3, ArrowRight } from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Accurate Renewable Forecasting",
      description: "Predict solar, wind, and hydro energy generation with multiple forecasting methods"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Smart City Energy Optimization",
      description: "Simulate and optimize renewable energy mix for major Indian cities"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Interactive EnerJeePT for Sustainability",
      description: "Get expert guidance on renewable energy decisions and optimization results"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Data-Driven Carbon Impact Insights",
      description: "Track emissions reductions and sustainability metrics in real-time"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Zap className="w-12 h-12 text-primary" />
            <h1 className="md:text-[125px] italic text-[#1c9776] bg-[transparent] font-normal text-[125px]" style={{ fontFamily: "'Times New Roman MT Condensed', 'Times New Roman', serif", letterSpacing: '-0.08em' }}>
              EnerJee
            </h1>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            AI for Smarter Renewable Energy Planning
          </h2>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Forecast. Optimize. Simulate. Sustain.
          </p>

          <Link href="/forecasting">
            <Button size="lg" className="gap-2" data-testid="button-get-started">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
      {/* Features Section */}
      <div className="container mx-auto px-4 pb-16">
        <h3 className="text-2xl font-bold text-center mb-12">
          Key Features
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover-elevate">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                  {feature.icon}
                </div>
                <h4 className="font-semibold mb-2 text-lg">
                  {feature.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      {/* CTA Section */}
      <div className="container mx-auto px-4 pb-16">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">
              Ready to optimize your renewable energy strategy?
            </h3>
            <p className="text-muted-foreground mb-6">
              Start forecasting and optimizing today with AI-powered insights
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/forecasting">
                <Button size="lg" data-testid="link-forecasting">
                  Forecasting Dashboard
                </Button>
              </Link>
              <Link href="/smart-city">
                <Button size="lg" variant="outline" data-testid="link-smart-city">
                  Smart City Simulator
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
