import {
  Calculator, CalendarDays, Cog, GraduationCap, Home, Layers, PencilRuler,
  QrCode, Settings, Users,
} from "lucide-react";

/**
 * Navigation de l'interface « OS de la menuiserie ».
 * L'ordre et les libellés sont ceux de la maquette de référence.
 * Les onglets qui ouvrent les six espaces documentés portent un identifiant
 * de module (`module`) ; les autres sont des accès de la maquette dont la page
 * n'est pas encore construite : ils sont déclarés indisponibles, jamais simulés.
 */
export type OsNavItem = {
  id: string;
  label: string;
  icon: typeof Home;
  module?: OsModuleId;
  href?: string;
};

export type OsModuleId = "catalogue" | "production" | "sante" | "prix" | "crm" | "roadmap";

export const osNavItems: OsNavItem[] = [
  { id: "accueil", label: "Accueil", icon: Home },
  { id: "catalogues", label: "Catalogues", icon: Layers, module: "catalogue" },
  { id: "conception", label: "Conception", icon: PencilRuler, module: "catalogue" },
  { id: "materiaux", label: "Matériaux", icon: Cog, module: "prix" },
  { id: "production", label: "Production", icon: Cog, module: "production" },
  { id: "estimation", label: "Estimation", icon: Calculator, module: "sante" },
  { id: "clients", label: "Clients", icon: Users, module: "crm" },
  { id: "planning", label: "Planning", icon: CalendarDays },
  { id: "passeport", label: "Passeport QR", icon: QrCode, module: "production" },
  { id: "apprendre", label: "Apprendre", icon: GraduationCap, module: "roadmap" },
  { id: "parametres", label: "Paramètres", icon: Settings },
];

export type OsCategory = {
  id: string;
  label: string;
  image: string;
  /** Modèle du catalogue ouvert par la vignette, si la catégorie en propose un. */
  modelId?: string;
};

export const osCategories: OsCategory[] = [
  { id: "meubles", label: "Meubles", image: "/os/cat-meubles.jpg", modelId: "armoire" },
  { id: "portes", label: "Portes", image: "/os/cat-portes.jpg" },
  { id: "fenetres", label: "Fenêtres", image: "/os/cat-fenetres.jpg" },
  { id: "cuisines", label: "Cuisines", image: "/os/cat-cuisines.jpg", modelId: "cuisine" },
  { id: "escaliers", label: "Escaliers", image: "/os/cat-escaliers.jpg" },
  { id: "agencement", label: "Agencement", image: "/os/cat-agencement.jpg", modelId: "bureau" },
];
