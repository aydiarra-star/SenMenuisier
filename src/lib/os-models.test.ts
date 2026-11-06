import { describe, expect, it } from "vitest";
import { averageVerifiedMdfPrice, findOsModel, osModels } from "./os-models";
import { osCategories, osNavItems } from "./os-nav";

describe("catalogue OS", () => {
  it("expose exactement quatre modèles avec des cotes de départ", () => {
    expect(osModels).toHaveLength(4);
    for (const model of osModels) {
      expect(model.width).toBeGreaterThan(0);
      expect(model.height).toBeGreaterThan(0);
      expect(model.depth).toBeGreaterThan(0);
      expect(model.image).toMatch(/^\/os\/[\w-]+\.jpg$/);
    }
  });

  it("retombe sur le premier modèle pour un identifiant inconnu", () => {
    expect(findOsModel("inconnu").id).toBe(osModels[0].id);
  });

  it("garde l’ordre et les libellés de la navigation de référence", () => {
    expect(osNavItems.map((item) => item.label)).toEqual([
      "Accueil", "Catalogues", "Conception", "Matériaux", "Production",
      "Estimation", "Clients", "Planning", "Passeport QR", "Apprendre", "Paramètres",
    ]);
  });

  it("ne déclare six catégories que si elles ont un visuel", () => {
    expect(osCategories).toHaveLength(6);
    for (const category of osCategories) {
      expect(category.image).toMatch(/^\/os\/[\w-]+\.jpg$/);
    }
  });
});

describe("averageVerifiedMdfPrice", () => {
  it("ne publie aucun tarif sans relevé vérifié", () => {
    expect(averageVerifiedMdfPrice([])).toBeNull();
    expect(averageVerifiedMdfPrice([
      { item: "MDF standard 18 mm", unit: "panneau", price: 32000, status: "pending" },
    ])).toBeNull();
  });

  it("ignore les articles qui ne sont pas du MDF 18 mm", () => {
    expect(averageVerifiedMdfPrice([
      { item: "Contreplaqué 18 mm", unit: "panneau", price: 30000, status: "validated" },
      { item: "MDF 25 mm", unit: "panneau", price: 41000, status: "validated" },
    ])).toBeNull();
  });

  it("moyenne les relevés vérifiés de MDF 18 mm en arrondissant au franc", () => {
    const result = averageVerifiedMdfPrice([
      { item: "MDF standard 18 mm", unit: "panneau", price: 32000, status: "validated" },
      { item: "MDF hydrofuge 18 mm", unit: "panneau", price: 35001, status: "validated" },
    ]);
    expect(result).toEqual({ average: 33501, count: 2 });
  });
});
