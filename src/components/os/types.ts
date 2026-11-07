export type OsSectionId = "accueil" | "catalogue" | "production" | "sante" | "prix" | "crm" | "roadmap" | "planning" | "settings";

export type OsNotify = (message: string) => void;

export type FurnitureConfiguration = {
  doors: boolean;
  handles: boolean;
  drawers: number;
  shelves: number;
};

export const defaultFurnitureConfiguration: FurnitureConfiguration = {
  doors: true,
  handles: true,
  drawers: 0,
  shelves: 2,
};

export type QuoteDraft = {
  id: string;
  number: string;
  clientName: string;
  clientContact: string;
  modelTitle: string;
  dimensions: string;
  material: string;
  finish: string;
  targetPrice: number;
  deposit: number;
  depositPaid: boolean;
  status?: "draft" | "accepted" | "rejected";
  productionJobId?: string;
  deliveryTarget: string;
  createdAt: string;
  lines: { label: string; amount: number }[];
};
