"use client";

import { useMemo } from "react";
import { qrMatrix } from "@/lib/qr";

type Props = {
  value: string | null;
  size?: number;
  title?: string;
  className?: string;
};

/**
 * Rend un QR réellement encodé à partir de `value`.
 * Quand aucune valeur ne peut être publiée, aucun faux QR n'est dessiné :
 * un cadre neutre l'indique explicitement.
 */
export default function QrCode({ value, size = 150, title, className }: Props) {
  const matrix = useMemo(() => {
    if (!value) return null;
    try {
      return qrMatrix(value);
    } catch {
      return null;
    }
  }, [value]);

  if (!matrix) {
    return (
      <div
        className={className}
        role="img"
        aria-label="Aucun QR publié"
        style={{
          width: size,
          height: size,
          display: "grid",
          placeItems: "center",
          borderRadius: 8,
          background: "#FFFDF8",
          border: "1px dashed #C7A578",
          color: "#8A7358",
          fontSize: 9,
          lineHeight: 1.4,
          textAlign: "center",
          padding: 8,
        }}
      >
        Aucun QR publié
        <br />
        Passeport non activé
      </div>
    );
  }

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox={`0 0 ${matrix.size} ${matrix.size}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label={title ?? "QR Code"}
    >
      <rect width={matrix.size} height={matrix.size} fill="#fff" />
      {matrix.modules.map((row, rowIndex) =>
        row.map((dark, colIndex) =>
          dark ? (
            <rect key={`${rowIndex}-${colIndex}`} x={colIndex} y={rowIndex} width={1} height={1} fill="#14251F" />
          ) : null,
        ),
      )}
    </svg>
  );
}
