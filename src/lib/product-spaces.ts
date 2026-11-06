import { Axe, Drill, Hammer, Layers, Ruler, TreePine } from "lucide-react";

export const productSpaces = [
  {
    id: "catalogue",
    label: "1. Catalogue Intelligent",
    title: "Catalogue intelligent",
    summary: "Préparer un modèle, ajuster les dimensions et structurer une nomenclature avant le devis.",
    icon: Layers,
  },
  {
    id: "production",
    label: "2. Production & Passeport QR",
    title: "Production & passeport QR",
    summary: "Organiser les opérations, suivre les contrôles et préparer la traçabilité du meuble.",
    icon: Hammer,
  },
  {
    id: "sante",
    label: "3. Score Santé de l’atelier",
    title: "Score Santé de l’atelier",
    summary: "Comprendre les délais, les coûts, les paiements et les stocks à partir de données fiables.",
    icon: Ruler,
  },
  {
    id: "prix",
    label: "4. Base de Prix Nationale",
    title: "Base de Prix nationale",
    summary: "Documenter les prix par région, unité, qualité, date et source vérifiable.",
    icon: TreePine,
  },
  {
    id: "crm",
    label: "5. CRM Artisan & Relances",
    title: "CRM Artisan & Relances",
    summary: "Garder les contacts, les consentements, les devis et les relances au même endroit.",
    icon: Drill,
  },
  {
    id: "roadmap",
    label: "6. Feuille de Route",
    title: "Feuille de route",
    summary: "Suivre les étapes de construction de l’outil, les priorités métier et les prochaines évolutions de l’atelier numérique.",
    icon: Axe,
  },
] as const;
