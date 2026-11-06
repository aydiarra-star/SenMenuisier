import { describe, expect, it } from "vitest";
import { calculateWorkshopEstimate } from "./estimate";

const base = {
  materials: [{ name: "MDF 18 mm", quantity: 4, unit: "panel" as const, unitPrice: 22500, priceUnit: "panel" as const }],
  wasteRate: 0.12,
  laborCost: 25000,
  hardwareCost: 8000,
  finishCost: 15000,
  overheadCost: 5000,
  targetGrossMarginRate: 0.3,
};

describe("calculateWorkshopEstimate", () => {
  it("applies waste only to materials and computes gross margin on selling price", () => {
    const result = calculateWorkshopEstimate(base);
    expect(result.materialSubtotal).toBe(90000);
    expect(result.wasteCost).toBe(10800);
    expect(result.totalCost).toBe(153800);
    expect(result.targetSellingPrice).toBeCloseTo(219714.2857, 3);
  });

  it("rejects incompatible quantity and price units", () => {
    expect(() => calculateWorkshopEstimate({
      ...base,
      materials: [{ name: "Fraké", quantity: 2, unit: "m2", unitPrice: 45000, priceUnit: "panel" }],
    })).toThrow(/Unité incompatible/);
  });

  it("rejects invalid waste rates and a 100% target margin", () => {
    expect(() => calculateWorkshopEstimate({ ...base, wasteRate: 1.2 })).toThrow(/taux de perte/);
    expect(() => calculateWorkshopEstimate({ ...base, targetGrossMarginRate: 1 })).toThrow(/marge cible/);
  });

  it("does not claim to produce a cut list", () => {
    expect(calculateWorkshopEstimate(base).assumptions.at(-1)).toContain("Aucun plan de débit");
  });
});
