import { describe, expect, it } from "vitest";
import { neutralQrPayload, qrMatrix, qrSvgPath } from "./qr";

describe("qrMatrix", () => {
  it("encode une chaîne en matrice carrée de modules", () => {
    const { size, modules } = qrMatrix(neutralQrPayload());
    expect(size).toBeGreaterThanOrEqual(21);
    expect(modules).toHaveLength(size);
    expect(modules[0]).toHaveLength(size);
  });

  it("place les trois motifs de repérage dans les coins", () => {
    const { size, modules } = qrMatrix(neutralQrPayload());
    // Le coin supérieur gauche d'un motif de repérage est toujours sombre.
    expect(modules[0][0]).toBe(true);
    expect(modules[0][size - 1]).toBe(true);
    expect(modules[size - 1][0]).toBe(true);
    // Le module situé à l'intérieur du repérage est clair.
    expect(modules[1][1]).toBe(false);
  });

  it("produit un chemin SVG non vide et borné dans la matrice", () => {
    const { size, path } = qrSvgPath(neutralQrPayload());
    expect(path.startsWith("M")).toBe(true);
    for (const match of path.matchAll(/M(\d+) (\d+)h1v1h-1z/g)) {
      const column = Number(match[1]);
      const row = Number(match[2]);
      expect(column).toBeGreaterThanOrEqual(0);
      expect(column).toBeLessThan(size);
      expect(row).toBeGreaterThanOrEqual(0);
      expect(row).toBeLessThan(size);
    }
  });

  it("encode deux valeurs différentes différemment", () => {
    const first = qrMatrix("SENMENUISIER:LOCAL:AAAAAAAA").modules.flat().join("");
    const second = qrMatrix("SENMENUISIER:LOCAL:BBBBBBBB").modules.flat().join("");
    expect(first).not.toEqual(second);
  });

  it("n’expose aucune donnée client dans le QR neutre", () => {
    expect(neutralQrPayload()).not.toMatch(/@|\+?\d{6,}/);
    expect(neutralQrPayload().startsWith("SENMENUISIER")).toBe(true);
  });
});
