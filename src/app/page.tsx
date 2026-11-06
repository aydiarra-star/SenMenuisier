import type { Metadata } from "next";
import { OsProvider } from "@/components/os/OsContext";
import OsShell from "@/components/os/OsShell";
import "./os.css";

export const metadata: Metadata = {
  title: "SenMenuisier — OS de la menuiserie",
  description:
    "L’OS de la menuiserie sénégalaise : concevez, estimez, produisez et livrez, avec un passeport numérique par ouvrage.",
};

/**
 * Racine du site : elle affiche l’interface « OS de la menuiserie »
 * (rail de navigation, entête, accueil complet).
 * L’ancienne page de conception reste accessible sur /espace-atelier/ sans
 * aucune modification de son contenu.
 */
export default function RootPage() {
  return (
    <OsProvider>
      <OsShell />
    </OsProvider>
  );
}
