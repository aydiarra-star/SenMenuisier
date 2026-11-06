import { z } from "zod";

/** XOF amounts are stored as whole FCFA, never floating-point currency. */
export const xofAmountSchema = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);

export const materialUnitSchema = z.enum([
  "piece",
  "panel",
  "m2",
  "linear_m",
  "m3",
  "kg",
  "liter",
  "hour",
]);

export const materialKindSchema = z.enum([
  "solid_wood",
  "panel",
  "hardware",
  "finish",
  "consumable",
]);

export const workshopRoleSchema = z.enum([
  "owner",
  "manager",
  "carpenter",
  "apprentice",
]);

export const workshopSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(120),
  city: z.string().trim().min(2).max(80),
  countryCode: z.literal("SN").default("SN"),
  timezone: z.literal("Africa/Dakar").default("Africa/Dakar"),
}).strict();

export const workshopMemberSchema = z.object({
  workshopId: z.string().uuid(),
  userId: z.string().uuid(),
  role: workshopRoleSchema,
  active: z.boolean().default(true),
}).strict();

export const clientSchema = z.object({
  workshopId: z.string().uuid(),
  fullName: z.string().trim().min(2).max(140),
  phone: z.string().trim().regex(/^\+?[0-9][0-9\s().-]{7,22}$/),
  email: z.string().trim().email().optional(),
  whatsappConsent: z.boolean().default(false),
  whatsappConsentAt: z.string().datetime().optional(),
  internalNotes: z.string().max(2000).optional(),
}).strict().superRefine((client, context) => {
  if (client.whatsappConsent && !client.whatsappConsentAt) {
    context.addIssue({
      code: "custom",
      path: ["whatsappConsentAt"],
      message: "La date du consentement WhatsApp est obligatoire.",
    });
  }
});

export const materialSchema = z.object({
  workshopId: z.string().uuid(),
  name: z.string().trim().min(2).max(140),
  kind: materialKindSchema,
  unit: materialUnitSchema,
  purchasePriceXof: xofAmountSchema,
  currency: z.literal("XOF").default("XOF"),
  supplierId: z.string().uuid().optional(),
  priceObservedAt: z.string().datetime(),
  priceSource: z.string().trim().min(2).max(240),
}).strict();

export const quoteLineSchema = z.object({
  description: z.string().trim().min(2).max(240),
  kind: z.enum(["material", "hardware", "finish", "labor", "transport", "other"]),
  quantity: z.number().finite().positive().max(1_000_000),
  unit: materialUnitSchema,
  unitPriceXof: xofAmountSchema,
}).strict();

export const quoteInternalCostsSchema = z.object({
  materialCostXof: xofAmountSchema,
  laborCostXof: xofAmountSchema,
  hardwareCostXof: xofAmountSchema,
  finishCostXof: xofAmountSchema,
  overheadCostXof: xofAmountSchema,
  transportCostXof: xofAmountSchema,
}).strict();

export const quoteSchema = z.object({
  quoteNumber: z.string().trim().regex(/^[A-Z0-9-]{3,32}$/),
  workshopId: z.string().uuid(),
  clientId: z.string().uuid(),
  version: z.number().int().positive(),
  status: z.enum(["draft", "shared", "accepted", "rejected", "expired", "cancelled"]),
  currency: z.literal("XOF").default("XOF"),
  validUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  lines: z.array(quoteLineSchema).min(1).max(100),
  internalCosts: quoteInternalCostsSchema,
  sellingPriceXof: xofAmountSchema,
  marginBasisPoints: z.number().int().min(0).max(9999),
  internalNotes: z.string().max(4000).optional(),
  customerNotes: z.string().max(2000).optional(),
  sharedAt: z.string().datetime().optional(),
  acceptedAt: z.string().datetime().optional(),
  rejectedAt: z.string().datetime().optional(),
}).strict().superRefine((quote, context) => {
  if ((quote.status === "shared" || quote.status === "accepted") && !quote.sharedAt) {
    context.addIssue({
      code: "custom",
      path: ["sharedAt"],
      message: "Un devis partagé doit conserver sa date de partage.",
    });
  }
  if (quote.status === "accepted" && !quote.acceptedAt) {
    context.addIssue({
      code: "custom",
      path: ["acceptedAt"],
      message: "Un devis accepté doit conserver sa date d’acceptation.",
    });
  }
  if (quote.status === "rejected" && !quote.rejectedAt) {
    context.addIssue({
      code: "custom",
      path: ["rejectedAt"],
      message: "Un devis refusé doit conserver sa date de refus.",
    });
  }
});

/** Explicit allow-list for a customer-facing quote. Internal costs and margin cannot pass through. */
export const publicQuoteViewSchema = z.object({
  quoteNumber: z.string(),
  status: z.enum(["shared", "accepted", "rejected", "expired"]),
  currency: z.literal("XOF"),
  sellingPriceXof: xofAmountSchema,
  customerNotes: z.string().optional(),
  lineItems: z.array(z.object({
    description: z.string(),
    quantity: z.number().positive(),
    unit: materialUnitSchema,
    unitPriceXof: xofAmountSchema,
    lineTotalXof: xofAmountSchema,
  }).strict()),
}).strict();

export type PrivateQuote = z.infer<typeof quoteSchema>;
export type PublicQuoteView = z.infer<typeof publicQuoteViewSchema>;

export function toPublicQuoteView(quote: PrivateQuote): PublicQuoteView {
  return publicQuoteViewSchema.parse({
    quoteNumber: quote.quoteNumber,
    status: quote.status,
    currency: quote.currency,
    sellingPriceXof: quote.sellingPriceXof,
    customerNotes: quote.customerNotes,
    lineItems: quote.lines.map((line) => ({
      description: line.description,
      quantity: line.quantity,
      unit: line.unit,
      unitPriceXof: line.unitPriceXof,
      lineTotalXof: Math.round(line.quantity * line.unitPriceXof),
    })),
  });
}

export const priceObservationSchema = z.object({
  materialName: z.string().trim().min(2).max(140),
  kind: materialKindSchema,
  quality: z.string().trim().min(2).max(120),
  unit: materialUnitSchema,
  priceXof: xofAmountSchema,
  currency: z.literal("XOF").default("XOF"),
  region: z.string().trim().min(2).max(80),
  sourceKind: z.enum(["supplier_quote", "artisan_observation", "historical_record", "market_estimate"]),
  sourceName: z.string().trim().min(2).max(180),
  observedAt: z.string().datetime(),
  confidence: z.number().int().min(0).max(100).default(0),
  validated: z.boolean().default(false),
}).strict();

export const stockMovementSchema = z.object({
  workshopId: z.string().uuid(),
  stockItemId: z.string().uuid(),
  movementType: z.enum(["receipt", "issue", "reservation", "release", "adjustment"]),
  quantity: z.number().finite().positive().max(1_000_000),
  unit: materialUnitSchema,
  unitCostXof: xofAmountSchema.optional(),
  sourceDocumentId: z.string().uuid().optional(),
  createdBy: z.string().uuid(),
}).strict();

export const productionTaskSchema = z.object({
  workshopId: z.string().uuid(),
  dossierId: z.string().uuid(),
  title: z.string().trim().min(2).max(160),
  status: z.enum(["pending", "in_progress", "blocked", "completed", "cancelled"]),
  assignedTo: z.string().uuid().optional(),
  sequence: z.number().int().positive(),
  dueAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
}).strict().superRefine((task, context) => {
  if (task.status === "completed" && !task.completedAt) {
    context.addIssue({
      code: "custom",
      path: ["completedAt"],
      message: "Une tâche terminée doit conserver sa date de réalisation.",
    });
  }
});

/** Safe public fields only: never include client identity, supplier, costs or private notes. */
export const productPassportPublicSchema = z.object({
  publicId: z.string().regex(/^[A-Za-z0-9_-]{24,128}$/),
  productName: z.string().trim().min(2).max(140),
  workshopDisplayName: z.string().trim().min(2).max(120),
  description: z.string().max(1000).optional(),
  materials: z.array(z.string().trim().min(2).max(100)).max(30),
  deliveredAt: z.string().datetime().optional(),
  warrantyUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
}).strict();
