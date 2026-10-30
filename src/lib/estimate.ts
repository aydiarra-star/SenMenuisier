export type MaterialUnit = "panel" | "m2" | "linear_m";

export interface MaterialLine {
  name: string;
  quantity: number;
  unit: MaterialUnit;
  unitPrice: number;
  priceUnit: MaterialUnit;
}

export interface EstimateInput {
  materials: MaterialLine[];
  wasteRate: number;
  laborCost: number;
  hardwareCost: number;
  finishCost: number;
  overheadCost: number;
  targetGrossMarginRate: number;
}

export interface EstimateResult {
  materialSubtotal: number;
  wasteCost: number;
  laborCost: number;
  hardwareCost: number;
  finishCost: number;
  overheadCost: number;
  totalCost: number;
  targetSellingPrice: number;
  targetGrossMarginRate: number;
  assumptions: string[];
}

/**
 * Transparent estimate only. This does not generate a cut list or infer
 * material quantities from furniture dimensions. Quantities must come from
 * a validated bill of materials supplied by the workshop.
 */
export function calculateWorkshopEstimate(input: EstimateInput): EstimateResult {
  const nonNegative = (value: number, label: string) => {
    if (!Number.isFinite(value) || value < 0) throw new Error(label + " doit être un nombre positif ou nul.");
  };

  for (const [value, label] of [
    [input.laborCost, "Main-d'œuvre"],
    [input.hardwareCost, "Quincaillerie"],
    [input.finishCost, "Finition"],
    [input.overheadCost, "Charges"],
  ] as const) nonNegative(value, label);

  if (!Number.isFinite(input.wasteRate) || input.wasteRate < 0 || input.wasteRate > 1) {
    throw new Error("Le taux de perte doit être compris entre 0 et 1.");
  }
  if (!Number.isFinite(input.targetGrossMarginRate) || input.targetGrossMarginRate < 0 || input.targetGrossMarginRate >= 1) {
    throw new Error("La marge cible doit être comprise entre 0 inclus et 1 exclu.");
  }

  const materialSubtotal = input.materials.reduce((sum, line) => {
    nonNegative(line.quantity, "Quantité matière");
    nonNegative(line.unitPrice, "Prix matière");
    if (line.unit !== line.priceUnit) {
      throw new Error(`Unité incompatible pour « ${line.name} » : quantité en ${line.unit}, prix en ${line.priceUnit}.`);
    }
    return sum + line.quantity * line.unitPrice;
  }, 0);

  const wasteCost = materialSubtotal * input.wasteRate;
  const totalCost = materialSubtotal + wasteCost + input.laborCost
    + input.hardwareCost + input.finishCost + input.overheadCost;

  return {
    materialSubtotal,
    wasteCost,
    laborCost: input.laborCost,
    hardwareCost: input.hardwareCost,
    finishCost: input.finishCost,
    overheadCost: input.overheadCost,
    totalCost,
    targetSellingPrice: totalCost / (1 - input.targetGrossMarginRate),
    targetGrossMarginRate: input.targetGrossMarginRate,
    assumptions: [
      "Les quantités proviennent d'une nomenclature validée par l'atelier.",
      "Les pertes sont appliquées aux matières uniquement.",
      "Le prix cible utilise une marge brute sur prix de vente, pas une majoration du coût.",
      "Aucun plan de débit n'est calculé par cette fonction.",
    ],
  };
}
