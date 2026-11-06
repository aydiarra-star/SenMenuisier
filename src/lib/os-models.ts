/**
 * Catalogue de la maquette : quatre modèles sélectionnables.
 * Les dimensions sont des valeurs de départ indicatives, jamais un débit :
 * elles sont ajustées à la main et doivent être vérifiées sur place.
 */
export type OsModel = {
  id: string;
  title: string;
  short: string;
  image: string;
  width: number;
  height: number;
  depth: number;
};

export const osModels: OsModel[] = [
  {
    id: "armoire",
    title: "Armoire 3 Portes",
    short: "Rangements et tiroirs bas",
    image: "/os/modele-armoire.jpg",
    width: 120,
    height: 200,
    depth: 60,
  },
  {
    id: "cuisine",
    title: "Cuisine Modulaire en L",
    short: "Plan de travail et caissons",
    image: "/os/modele-cuisine.jpg",
    width: 280,
    height: 85,
    depth: 60,
  },
  {
    id: "lit",
    title: "Lit 2 Places Luxe",
    short: "Tête intégrée et coffre",
    image: "/os/modele-lit.jpg",
    width: 160,
    height: 110,
    depth: 200,
  },
  {
    id: "bureau",
    title: "Bureau Sur-Mesure",
    short: "Caisson et passage câbles",
    image: "/os/modele-bureau.jpg",
    width: 140,
    height: 75,
    depth: 70,
  },
];

export const woodEssences = ["Chêne", "Hêtre", "Iroko", "Khaya", "Vène", "Teck", "Fromager"] as const;

export const woodFinishes = [
  "Vernis mat",
  "Vernis satiné",
  "Huile naturelle",
  "Laque mate",
  "Brut poncé",
] as const;

export function findOsModel(id: string): OsModel {
  return osModels.find((model) => model.id === id) ?? osModels[0];
}

/**
 * Cours moyen MDF 18 mm affiché dans l'entête du catalogue.
 * Aucun tarif n'est publié sans provenance : tant que la base de prix ne
 * contient aucune observation vérifiée pour le MDF 18 mm, l'affichage reste
 * explicitement « non renseigné ».
 */
export function averageVerifiedMdfPrice(observed: { item: string; unit: string; price: number; status: string }[]) {
  const matching = observed.filter(
    (entry) => entry.status === "validated" && /mdf/i.test(entry.item) && /18/.test(entry.item),
  );
  if (matching.length === 0) return null;
  const total = matching.reduce((sum, entry) => sum + entry.price, 0);
  return { average: Math.round(total / matching.length), count: matching.length };
}
