import { describe, expect, it } from "vitest";
import {
  clientSchema,
  priceObservationSchema,
  productionTaskSchema,
  productPassportPublicSchema,
  quoteSchema,
  toPublicQuoteView,
  xofAmountSchema,
} from "./schemas";

const workshopId = "00000000-0000-4000-8000-000000000001";
const clientId = "00000000-0000-4000-8000-000000000002";
const quoteDraft = {
  quoteNumber: "SM-2026-0001",
  workshopId,
  clientId,
  version: 1,
  status: "shared" as const,
  currency: "XOF" as const,
  validUntil: "2026-12-31",
  lines: [{
    description: "Panneau MDF 18 mm",
    kind: "material" as const,
    quantity: 2,
    unit: "panel" as const,
    unitPriceXof: 22500,
  }],
  internalCosts: {
    materialCostXof: 45000,
    laborCostXof: 25000,
    hardwareCostXof: 8000,
    finishCostXof: 12000,
    overheadCostXof: 5000,
    transportCostXof: 3000,
  },
  sellingPriceXof: 140000,
  marginBasisPoints: 3000,
  internalNotes: "Ne pas montrer au client",
  customerNotes: "Livraison après validation des dimensions.",
  sharedAt: "2026-11-06T10:00:00.000Z",
};

describe("SenMenuisier domain schemas", () => {
  it("stores FCFA amounts as non-negative safe integers", () => {
    expect(xofAmountSchema.safeParse(125000).success).toBe(true);
    expect(xofAmountSchema.safeParse(12.5).success).toBe(false);
    expect(xofAmountSchema.safeParse(-1).success).toBe(false);
  });

  it("requires a dated consent before WhatsApp relances", () => {
    const client = {
      workshopId,
      fullName: "Client Atelier",
      phone: "+221 77 000 00 00",
      whatsappConsent: true,
    };
    expect(clientSchema.safeParse(client).success).toBe(false);
    expect(clientSchema.safeParse({
      ...client,
      whatsappConsentAt: "2026-11-06T10:00:00.000Z",
    }).success).toBe(true);
  });

  it("requires lifecycle timestamps for accepted and rejected quotes", () => {
    expect(quoteSchema.safeParse({ ...quoteDraft, status: "accepted" }).success).toBe(false);
    expect(quoteSchema.safeParse({
      ...quoteDraft,
      status: "accepted",
      acceptedAt: "2026-11-06T11:00:00.000Z",
    }).success).toBe(true);
    expect(quoteSchema.safeParse({ ...quoteDraft, status: "rejected" }).success).toBe(false);
  });

  it("creates a customer view without internal costs, margin or notes", () => {
    const privateQuote = quoteSchema.parse(quoteDraft);
    const publicQuote = toPublicQuoteView(privateQuote);
    expect(publicQuote.sellingPriceXof).toBe(140000);
    expect(publicQuote.lineItems[0].lineTotalXof).toBe(45000);
    expect(publicQuote).not.toHaveProperty("internalCosts");
    expect(publicQuote).not.toHaveProperty("marginBasisPoints");
    expect(publicQuote).not.toHaveProperty("internalNotes");
  });

  it("requires a region, observation date and named source for price records", () => {
    const observation = {
      materialName: "MDF 18 mm",
      kind: "panel" as const,
      quality: "Standard",
      unit: "panel" as const,
      priceXof: 22500,
      region: "Dakar",
      sourceKind: "supplier_quote" as const,
      sourceName: "Devis fournisseur vérifié",
      observedAt: "2026-11-06T10:00:00.000Z",
    };
    expect(priceObservationSchema.safeParse(observation).success).toBe(true);
    expect(priceObservationSchema.safeParse({ ...observation, sourceName: "" }).success).toBe(false);
  });

  it("does not allow a completed production task without its completion time", () => {
    const task = {
      workshopId,
      dossierId: clientId,
      title: "Assemblage du caisson",
      status: "completed" as const,
      sequence: 2,
    };
    expect(productionTaskSchema.safeParse(task).success).toBe(false);
    expect(productionTaskSchema.safeParse({
      ...task,
      completedAt: "2026-11-06T12:00:00.000Z",
    }).success).toBe(true);
  });

  it("rejects private fields from the public product passport", () => {
    const passport = {
      publicId: "a".repeat(32),
      productName: "Armoire sur mesure",
      workshopDisplayName: "Atelier Bois",
      materials: ["MDF 18 mm", "Charnières"],
      internalCostXof: 85000,
    };
    expect(productPassportPublicSchema.safeParse(passport).success).toBe(false);
    const publicPassport = {\n      publicId: passport.publicId,\n      productName: passport.productName,\n      workshopDisplayName: passport.workshopDisplayName,\n      materials: passport.materials,\n    };
    expect(productPassportPublicSchema.safeParse(publicPassport).success).toBe(true);
  });
});
