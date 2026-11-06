"use client";

import { CircleAlert } from "lucide-react";
import { useOs } from "./OsContext";

type Status = "in_progress" | "planned" | "blocked";

const roadmap: { title: string; detail: string; status: Status; evidence: string }[] = [
  {
    title: "Atelier Digital",
    detail: "Clients, devis, commandes et documents de travail.",
    status: "in_progress",
    evidence: "Catalogue, devis brouillon et carnet client fonctionnent localement ; aucune synchronisation serveur.",
  },
  {
    title: "Production & Stocks",
    detail: "Ordres de fabrication, tâches, mouvements et inventaires.",
    status: "in_progress",
    evidence: "Suivi des étapes disponible localement ; stocks et mouvements non implémentés.",
  },
  {
    title: "Calculateur Bois",
    detail: "Nomenclature, débit, chutes et optimisation des panneaux.",
    status: "planned",
    evidence: "Aucun calcul de débit ni d’optimisation n’est livré : l’estimation actuelle ne chiffre qu’une ligne de matière.",
  },
  {
    title: "Passeport Numérique",
    detail: "QR public filtré, traçabilité et garantie.",
    status: "planned",
    evidence: "Le QR encode un identifiant local ; aucune page publique révocable n’est publiée.",
  },
  {
    title: "SenMenuisier Intelligence",
    detail: "Conseils fondés sur les données réelles et expliquables.",
    status: "blocked",
    evidence: "Dépend d’un historique de production et de ventes fiable, non disponible aujourd’hui.",
  },
  {
    title: "Réseau Professionnel",
    detail: "Fournisseurs, sous-traitants et entraide métier.",
    status: "planned",
    evidence: "Aucune fonctionnalité réseau n’est ouverte.",
  },
  {
    title: "Marketplace Artisans",
    detail: "Vitrines, portfolios et demandes de devis.",
    status: "planned",
    evidence: "Aucune vitrine marchande n’est en ligne ; la page publique reste une présentation.",
  },
];

const statusLabels: Record<Status, { label: string; className: string }> = {
  in_progress: { label: "En construction", className: "os-chip warn" },
  planned: { label: "Planifié", className: "os-chip" },
  blocked: { label: "Bloqué — prérequis manquant", className: "os-chip" },
};

export default function OsRoadmap() {
  const os = useOs();

  return (
    <div className="os-module">
      <header className="os-module-title">
        <div>
          <span>06 / FEUILLE DE ROUTE</span>
          <h1>Feuille de Route</h1>
          <p>
            Sept chantiers structurants. Aucun statut « achevé » n’est affiché sans livraison vérifiée :
            cette page décrit uniquement ce qui existe réellement dans le dépôt.
          </p>
        </div>
        <span className="os-chip">{roadmap.length} chantiers</span>
      </header>

      <div className="os-roadmap">
        {roadmap.map((item, index) => (
          <article className="os-roadmap-item" key={item.title}>
            <span className="os-roadmap-num">{String(index + 1).padStart(2, "0")}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ margin: 0, fontFamily: "var(--display)", fontSize: 13.5, fontWeight: 800 }}>{item.title}</h3>
              <p className="os-note" style={{ marginTop: 4 }}>{item.detail}</p>
              <p className="os-note" style={{ marginTop: 4, color: "#8A7B68" }}>{item.evidence}</p>
            </div>
            <span className={statusLabels[item.status].className}>{statusLabels[item.status].label}</span>
          </article>
        ))}
      </div>

      <div className="os-grid-2">
        <section className="os-card">
          <h3 style={{ margin: 0, fontFamily: "var(--display)", fontSize: 14 }}>État réel de cet espace</h3>
          <div className="os-table" style={{ marginTop: 8 }}>
            <div className="os-table-row"><span>Devis enregistrés localement</span><b>{os.quotes.length}</b></div>
            <div className="os-table-row"><span>Dossiers de fabrication</span><b>{os.workspace.production.length}</b></div>
            <div className="os-table-row"><span>Relevés de prix</span><b>{os.workspace.prices.length}</b></div>
            <div className="os-table-row"><span>Contacts</span><b>{os.workspace.contacts.length}</b></div>
            <div className="os-table-row"><span>Comptes connectés</span><b>0</b></div>
          </div>
        </section>

        <section className="os-card">
          <h3 style={{ margin: 0, fontFamily: "var(--display)", fontSize: 14 }}>Ce qui reste à livrer</h3>
          <ul className="os-note" style={{ marginTop: 8, paddingLeft: 18, lineHeight: 1.9 }}>
            <li>Authentification, ateliers, rôles et isolation par atelier.</li>
            <li>Cycle devis → acceptation → fabrication → passeport QR.</li>
            <li>Page publique de passeport, révocable, et impression d’étiquettes.</li>
            <li>Feuille de route administrable et versionnée côté serveur.</li>
          </ul>
        </section>
      </div>

      <div className="os-alert">
        <CircleAlert size={15} />
        <div>
          Cette feuille de route est décrite dans le code de l’application. Elle n’est pas encore
          modifiable par un administrateur : aucune donnée de statut n’est pilotée côté serveur.
        </div>
      </div>
    </div>
  );
}
