export type CutPart = {
  id: string;
  label: string;
  widthMm: number;
  heightMm: number;
  quantity: number;
  rotatable?: boolean;
};

export type CutPlanInput = {
  panelWidthMm: number;
  panelHeightMm: number;
  kerfMm: number;
  marginMm: number;
  parts: CutPart[];
};

export type PlacedCut = {
  partId: string;
  label: string;
  panel: number;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  rotated: boolean;
};

export type CutPlan = {
  placements: PlacedCut[];
  panelCount: number;
  usablePanelAreaMm2: number;
  usedPartAreaMm2: number;
  wasteRate: number;
  warnings: string[];
};

type Shelf = { y: number; height: number; nextX: number };
type Panel = { shelves: Shelf[] };

/**
 * Heuristic shelf layout for rectangular parts. It is a workshop pre-plan,
 * not a certified nesting/CNC plan: grain direction, defects, clamps and
 * saw sequence must be checked by the craftsperson before cutting.
 */
export function calculateShelfCutPlan(input: CutPlanInput): CutPlan {
  const positive = (value: number, label: string) => {
    if (!Number.isFinite(value) || value <= 0) throw new Error(label + " doit être supérieur à zéro.");
  };
  positive(input.panelWidthMm, "Largeur du panneau");
  positive(input.panelHeightMm, "Hauteur du panneau");
  if (!Number.isFinite(input.kerfMm) || input.kerfMm < 0) throw new Error("Le trait de scie doit être positif ou nul.");
  if (!Number.isFinite(input.marginMm) || input.marginMm < 0) throw new Error("La marge de rive doit être positive ou nulle.");
  if (input.parts.length === 0) throw new Error("Ajoutez au moins une pièce à débiter.");
  const usableWidth = input.panelWidthMm - 2 * input.marginMm;
  const usableHeight = input.panelHeightMm - 2 * input.marginMm;
  if (usableWidth <= 0 || usableHeight <= 0) throw new Error("Les marges ne laissent aucune surface utile.");

  const expanded = input.parts.flatMap((part) => {
    if (!part.label.trim()) throw new Error("Chaque pièce doit avoir un nom.");
    positive(part.widthMm, "Largeur de pièce");
    positive(part.heightMm, "Hauteur de pièce");
    if (!Number.isInteger(part.quantity) || part.quantity < 1 || part.quantity > 500) {
      throw new Error("La quantité de chaque pièce doit être un entier entre 1 et 500.");
    }
    return Array.from({ length: part.quantity }, (_, index) => ({
      ...part,
      id: part.id + ":" + index,
    }));
  }).sort((a, b) => b.widthMm * b.heightMm - a.widthMm * a.heightMm);

  const panels: Panel[] = [];
  const placements: PlacedCut[] = [];
  const warnings: string[] = [];
  let usedPartAreaMm2 = 0;

  for (const part of expanded) {
    const orientations = [{ width: part.widthMm, height: part.heightMm, rotated: false }];
    if (part.rotatable && part.widthMm !== part.heightMm) {
      orientations.push({ width: part.heightMm, height: part.widthMm, rotated: true });
    }
    let placed = false;

    for (let p = 0; p < panels.length && !placed; p++) {
      const panel = panels[p];
      for (const orientation of orientations) {
        const w = orientation.width + input.kerfMm;
        const h = orientation.height + input.kerfMm;
        const shelf = panel.shelves
          .filter((row) => h <= row.height && row.nextX + w <= usableWidth)
          .sort((a, b) => (usableWidth - (a.nextX + w)) - (usableWidth - (b.nextX + w)))[0];
        if (shelf) {
          placements.push({
            partId: part.id, label: part.label, panel: p + 1,
            xMm: input.marginMm + shelf.nextX, yMm: input.marginMm + shelf.y,
            widthMm: orientation.width, heightMm: orientation.height, rotated: orientation.rotated,
          });
          shelf.nextX += w;
          usedPartAreaMm2 += orientation.width * orientation.height;
          placed = true;
          break;
        }
      }
      if (placed) break;
      for (const orientation of orientations) {
        const w = orientation.width + input.kerfMm;
        const h = orientation.height + input.kerfMm;
        const nextY = panel.shelves.reduce((max, row) => Math.max(max, row.y + row.height), 0);
        if (w <= usableWidth && nextY + h <= usableHeight) {
          panel.shelves.push({ y: nextY, height: h, nextX: w });
          placements.push({
            partId: part.id, label: part.label, panel: p + 1,
            xMm: input.marginMm, yMm: input.marginMm + nextY,
            widthMm: orientation.width, heightMm: orientation.height, rotated: orientation.rotated,
          });
          usedPartAreaMm2 += orientation.width * orientation.height;
          placed = true;
          break;
        }
      }
    }

    if (!placed) {
      const orientation = orientations.find((item) =>
        item.width + input.kerfMm <= usableWidth && item.height + input.kerfMm <= usableHeight
      );
      if (!orientation) {
        warnings.push(`${part.label} : pièce trop grande pour un panneau utile de ${usableWidth} × ${usableHeight} mm.`);
        continue;
      }
      const panel: Panel = { shelves: [{ y: 0, height: orientation.height + input.kerfMm, nextX: orientation.width + input.kerfMm }] };
      panels.push(panel);
      placements.push({
        partId: part.id, label: part.label, panel: panels.length,
        xMm: input.marginMm, yMm: input.marginMm,
        widthMm: orientation.width, heightMm: orientation.height, rotated: orientation.rotated,
      });
      usedPartAreaMm2 += orientation.width * orientation.height;
    }
  }

  const usablePanelAreaMm2 = panels.length * usableWidth * usableHeight;
  return {
    placements,
    panelCount: panels.length,
    usablePanelAreaMm2,
    usedPartAreaMm2,
    wasteRate: usablePanelAreaMm2 === 0 ? 0 : Math.max(0, 1 - usedPartAreaMm2 / usablePanelAreaMm2),
    warnings,
  };
}
