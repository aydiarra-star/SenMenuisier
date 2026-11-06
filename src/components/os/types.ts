export type OsSectionId = "accueil" | "catalogue" | "production" | "sante" | "prix" | "crm" | "roadmap";

export type OsNotify = (message: string) => void;

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
  deliveryTarget: string;
  createdAt: string;
  lines: { label: string; amount: number }[];
};
