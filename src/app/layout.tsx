import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "SenMenuisier — Le savoir-faire sénégalais, connecté au monde.",
  description: "L'outil de gestion et de production pensé pour les ateliers de menuiserie sénégalais.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
