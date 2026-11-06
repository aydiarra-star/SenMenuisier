import { describe, expect, it } from "vitest";
import { calculateShelfCutPlan } from "./cut-plan";

const base = {
  panelWidthMm: 2800,
  panelHeightMm: 2070,
  kerfMm: 3,
  marginMm: 10,
  parts: [
    { id: "side", label: "Côtés", widthMm: 600, heightMm: 2000, quantity: 2, rotatable: false },
    { id: "shelf", label: "Étagères", widthMm: 560, heightMm: 500, quantity: 4, rotatable: true },
  ],
};

describe("calculateShelfCutPlan", () => {
  it("places every requested part inside usable panel bounds", () => {
    const plan = calculateShelfCutPlan(base);
    expect(plan.panelCount).toBeGreaterThan(0);
    expect(plan.placements).toHaveLength(6);
    expect(plan.warnings).toHaveLength(0);
    for (const item of plan.placements) {
      expect(item.xMm).toBeGreaterThanOrEqual(10);
      expect(item.yMm).toBeGreaterThanOrEqual(10);
      expect(item.xMm + item.widthMm).toBeLessThanOrEqual(2790);
      expect(item.yMm + item.heightMm).toBeLessThanOrEqual(2060);
    }
  });

  it("accounts for edge margins and saw kerf", () => {
    const plan = calculateShelfCutPlan({ ...base, marginMm: 100, kerfMm: 5 });
    expect(plan.panelCount).toBeGreaterThan(0);
    expect(plan.placements.every((item) => item.xMm >= 100 && item.yMm >= 100)).toBe(true);
  });

  it("reports parts that cannot fit instead of silently dropping them", () => {
    const plan = calculateShelfCutPlan({
      ...base,
      parts: [{ id: "oversize", label: "Panneau hors format", widthMm: 3000, heightMm: 2200, quantity: 1 }],
    });
    expect(plan.placements).toHaveLength(0);
    expect(plan.warnings).toHaveLength(1);
  });

  it("rejects missing, invalid and excessive quantities", () => {
    expect(() => calculateShelfCutPlan({ ...base, parts: [] })).toThrow(/Ajoutez au moins une pièce/);
    expect(() => calculateShelfCutPlan({ ...base, parts: [{ id: "x", label: "X", widthMm: 0, heightMm: 20, quantity: 1 }] })).toThrow(/supérieur à zéro/);
    expect(() => calculateShelfCutPlan({ ...base, parts: [{ id: "x", label: "X", widthMm: 20, heightMm: 20, quantity: 501 }] })).toThrow(/entre 1 et 500/);
  });
});
