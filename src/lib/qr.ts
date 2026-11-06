/**
 * Encodage QR réel (norme QR Code Model 2) à partir d'une chaîne.
 * Le rendu est fait en SVG pour rester net à l'impression.
 * Aucun service externe n'est appelé : aucn code n'est « vérifié » à distance.
 */
export function qrMatrix(value: string): { size: number; modules: boolean[][] } {
  // Import différé pour éviter toute dépendance au rendu serveur.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const qrcode = require("qrcode-generator") as (
    typeNumber: number,
    level: "L" | "M" | "Q" | "H",
  ) => {
    addData: (data: string) => void;
    make: () => void;
    getModuleCount: () => number;
    isDark: (row: number, col: number) => boolean;
  };
  const code = qrcode(0, "M");
  code.addData(value);
  code.make();
  const count = code.getModuleCount();
  const modules: boolean[][] = [];
  for (let row = 0; row < count; row += 1) {
    const line: boolean[] = [];
    for (let col = 0; col < count; col += 1) line.push(code.isDark(row, col));
    modules.push(line);
  }
  return { size: count, modules };
}

export function qrSvgPath(value: string): { size: number; path: string } {
  const { size, modules } = qrMatrix(value);
  let path = "";
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (modules[row][col]) path += `M${col} ${row}h1v1h-1z`;
    }
  }
  return { size, path };
}

/** QR « aperçu » de la maquette : aucune donnée client n'est encodée. */
export function neutralQrPayload(): string {
  return "SENMENUISIER:APERCU:LOCAL:4EFA1C";
}
