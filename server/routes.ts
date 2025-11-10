import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./testAuth";
import { forecastEnergy } from "./forecasting";
import { optimizeEnergyMix } from "./optimizer";
import { getEnergyMentorResponse } from "./openai";
import { z } from "zod";

const optimizationConfigSchema = z.object({
  region: z.string(),
  forecastMethod: z.string(),
  energyFocus: z.array(z.string()),
  costWeight: z.number().min(0).max(1),
});

const chatMessageSchema = z.object({
  message: z.string(),
  context: z.object({
    region: z.string().optional(),
    optimizedCost: z.number().optional(),
    baselineCost: z.number().optional(),
    optimizedEmissions: z.number().optional(),
    baselineEmissions: z.number().optional(),
    renewableShare: z.number().optional(),
  }).optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication middleware
  await setupAuth(app);

  // Auth routes are now handled in testAuth.ts

  // Optimization route - run energy optimization
  app.post('/api/optimize', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const config = optimizationConfigSchema.parse(req.body);

      // Forecast energy generation
      const forecastData = forecastEnergy(config.forecastMethod, config.region);

      // Optimize energy mix
      const optimization = optimizeEnergyMix(forecastData, config);

      // Save results to database
      const savedResult = await storage.saveOptimizationResult({
        userId,
        region: config.region,
        forecastMethod: config.forecastMethod,
        energyFocus: config.energyFocus,
        costWeight: config.costWeight,
        optimizedCost: optimization.results.optimized.cost,
        baselineCost: optimization.results.baseline.cost,
        optimizedEmissions: optimization.results.optimized.emissions,
        baselineEmissions: optimization.results.baseline.emissions,
        optimizedReliability: optimization.results.optimized.reliability,
        baselineReliability: optimization.results.baseline.reliability,
        optimizedRenewableShare: optimization.results.optimized.renewableShare,
        baselineRenewableShare: optimization.results.baseline.renewableShare,
        energyMixData: optimization.energyMixData,
        priceData: optimization.priceData,
        emissionData: optimization.emissionData,
      });

      res.json({
        id: savedResult.id,
        ...optimization,
      });
    } catch (error) {
      console.error("Error running optimization:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to run optimization" });
      }
    }
  });

  // Get user's optimization history
  app.get('/api/optimizations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const results = await storage.getUserOptimizationResults(userId, limit);
      res.json(results);
    } catch (error) {
      console.error("Error fetching optimization history:", error);
      res.status(500).json({ message: "Failed to fetch optimization history" });
    }
  });

  // Get specific optimization result
  app.get('/api/optimizations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const result = await storage.getOptimizationResult(req.params.id);
      
      if (!result) {
        return res.status(404).json({ message: "Optimization result not found" });
      }
      
      // Verify the result belongs to the user
      const userId = req.user.id;
      if (result.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching optimization result:", error);
      res.status(500).json({ message: "Failed to fetch optimization result" });
    }
  });

  // Chat with AI Energy Mentor
  app.post('/api/chat', isAuthenticated, async (req: any, res) => {
    try {
      const { message, context } = chatMessageSchema.parse(req.body);
      
      const response = await getEnergyMentorResponse(message, context);
      
      res.json({ response });
    } catch (error) {
      console.error("Error in chat:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to get chat response" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
