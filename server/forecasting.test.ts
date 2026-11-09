import { describe, expect, it } from "vitest";
import { forecastEnergy, summarizeForecast } from "./forecasting";

describe("forecastEnergy", () => {
  it("produces identical outputs when called twice for the same region and method", () => {
    const run1 = forecastEnergy("24 Hour Forecast", "Jodhpur");
    const run2 = forecastEnergy("24 Hour Forecast", "Jodhpur");

    expect(run1).toEqual(run2);
  });

  it("produces different outputs for different regions", () => {
    const jodhpur = forecastEnergy("24 Hour Forecast", "Jodhpur");
    const chennai = forecastEnergy("24 Hour Forecast", "Chennai");

    expect(jodhpur).not.toEqual(chennai);
  });

  it("summarizes forecast data accurately", () => {
    const data = forecastEnergy("24 Hour Forecast", "Bangalore");
    const summary = summarizeForecast(data);

    expect(summary.totalGeneration).toBeCloseTo(
      summary.avgSolar * data.length +
        summary.avgWind * data.length +
        summary.avgHydro * data.length,
      5
    );
    expect(summary.totalDemand).toBeCloseTo(
      summary.avgDemand * data.length,
      5
    );
  });
});
