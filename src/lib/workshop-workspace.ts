export type ProductionStatus = "preparation" | "debit" | "assemblage" | "finition" | "controle" | "livre";
export type ProductionJob = {
  id: string;
  title: string;
  client: string;
  dueDate: string;
  status: ProductionStatus;
  createdAt: string;
  completedAt?: string;
};
export type CrmContact = {
  id: string;
  name: string;
  phone: string;
  city: string;
  notes: string;
  consentWhatsApp: boolean;
  nextFollowUp: string;
  createdAt: string;
};
export type PriceObservation = {
  id: string;
  category: string;
  item: string;
  region: string;
  quality: string;
  unit: string;
  price: number;
  source: string;
  observedAt: string;
  status: "pending" | "validated";
};
export type WorkshopWorkspace = {
  production: ProductionJob[];
  contacts: CrmContact[];
  prices: PriceObservation[];
};
export const emptyWorkspace: WorkshopWorkspace = { production: [], contacts: [], prices: [] };
export const productionStages: { id: ProductionStatus; label: string }[] = [
  { id: "preparation", label: "Préparation" },
  { id: "debit", label: "Débit" },
  { id: "assemblage", label: "Assemblage" },
  { id: "finition", label: "Finition" },
  { id: "controle", label: "Contrôle qualité" },
  { id: "livre", label: "Livré" },
];
export function nextProductionStatus(status: ProductionStatus): ProductionStatus {
  const index = productionStages.findIndex((stage) => stage.id === status);
  return productionStages[Math.min(index + 1, productionStages.length - 1)].id;
}
export function calculateOperationalHealth(jobs: ProductionJob[]) {
  const completed = jobs.filter((job) => job.status === "livre" && job.completedAt);
  if (completed.length < 3) return { score: null, completedCount: completed.length, onTimeCount: 0, overdueCount: jobs.filter((job) => job.status !== "livre" && job.dueDate < new Date().toISOString().slice(0, 10)).length };
  const onTimeCount = completed.filter((job) => (job.completedAt as string).slice(0, 10) <= job.dueDate).length;
  return {
    score: Math.round((onTimeCount / completed.length) * 100),
    completedCount: completed.length,
    onTimeCount,
    overdueCount: jobs.filter((job) => job.status !== "livre" && job.dueDate < new Date().toISOString().slice(0, 10)).length,
  };
}
