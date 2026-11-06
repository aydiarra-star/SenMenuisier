"use client";

import { useMemo, useState } from "react";
import {
  Axe, Drill, Hammer, Layers, Paintbrush, Ruler, TreePine,
  ClipboardList, Wrench, Saw
} from "lucide-react";
import { calculateWorkshopEstimate } from "@/lib/estimate";

type Section = "catalogue" | "production" | "atelier" | "materiaux" | "clients" | "roadmap";

const sections: { id: Section; label: string; short: string; icon: typeof Hammer }[] = [
  { id: "catalogue", label: "Catalogue & devis", short: "Catalogue", icon: Layers },
  { id: "production", label: "Fabrication & QR", short: "Fabrication", icon: Hammer },
  { id: "atelier", label: "Pilotage atelier", short: "Atelier", icon: Ruler },
  { id: "materiaux", label: "Bois & matériaux", short: "Matériaux", icon: TreePine },
  { id: "clients", label: "Clients & relances", short: "Clients", icon: Drill },
  { id: "roadmap", label: "Évolution", short: "Évolution", icon: Saw },
];

const crafts = [
  { name: "Mobilier sur mesure", detail: "Armoires, lits, tables, bureaux et rangements.", icon: Layers },
  { name: "Cuisine & agencement", detail: "Caissons, plans de travail et aménagement intérieur.", icon: Ruler },
  { name: "Bois massif", detail: "Essences locales, assemblages et finitions.", icon: TreePine },
  { name: "Panneaux & dérivés", detail: "MDF, contreplaqué, mélaminé et stratifié.", icon: Layers },
];

const roadmap = [
  ["Socle atelier", "Comptes, ateliers, invitations et permissions"],
  ["Clients & devis", "Fiches clients, devis versionnés et documents PDF"],
  ["Matières & stock", "Référentiel bois, quincaillerie, mouvements et alertes"],
  ["Fabrication", "Dossiers, pièces, opérations, responsables et échéances"],
  ["Qualité & QR", "Contrôles, livraison, garantie et passeport public filtré"],
  ["Réseau professionnel", "Vitrines, portfolios et demandes de devis"],
];

const money = (value: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(value)) + " FCFA";

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="empty-state">
      <div className="empty-woodmark" aria-hidden="true"><Layers size={25} /></div>
      <h3>{title}</h3>
      <p>{detail}</p>
      <span className="status-note">En attente de connexion des données de l’atelier</span>
    </div>
  );
}

export default function HomePage() {
  const [section, setSection] = useState<Section>("catalogue");
  const [width, setWidth] = useState("180");
  const [height, setHeight] = useState("220");
  const [depth, setDepth] = useState("60");
  const [quantity, setQuantity] = useState("2");
  const [unitPrice, setUnitPrice] = useState("22500");
  const [waste, setWaste] = useState("12");
  const [labor, setLabor] = useState("25000");
  const [hardware, setHardware] = useState("8000");
  const [finish, setFinish] = useState("15000");
  const [overhead, setOverhead] = useState("5000");
  const [margin, setMargin] = useState("30");
  const [estimateRequested, setEstimateRequested] = useState(false);

  const estimate = useMemo(() => {
    const values = [quantity, unitPrice, waste, labor, hardware, finish, overhead, margin].map(Number);
    if (values.some((v) => !Number.isFinite(v) || v < 0) || values[2] > 100 || values[7] >= 100) return null;
    try {
      return calculateWorkshopEstimate({
        materials: [{ name: "Panneau MDF 18 mm", quantity: values[0], unit: "panel", unitPrice: values[1], priceUnit: "panel" }],
        wasteRate: values[2] / 100,
        laborCost: values[3],
        hardwareCost: values[4],
        finishCost: values[5],
        overheadCost: values[6],
        targetGrossMarginRate: values[7] / 100,
      });
    } catch {
      return null;
    }
  }, [quantity, unitPrice, waste, labor, hardware, finish, overhead, margin]);

  const active = sections.find((item) => item.id === section)!;
  const ActiveIcon = active.icon;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topline">
          <a className="brand" href="/" aria-label="SenMenuisier, accueil">
            <div className="brand-mark"><TreePine size={27} strokeWidth={1.8} /></div>
            <div>
              <div className="brand-name">SenMenuisier <span className="version">ATELIER OS</span></div>
              <p>Le savoir-faire sénégalais, connecté au monde.</p>
            </div>
          </a>
          <div className="top-actions">
            <div className="workspace-chip"><span className="wood-dot" /> <span><b>Espace atelier</b><small>Mode aperçu · aucune donnée réelle</small></span></div>
            <span className="language-chip">FR <i>·</i> WOLOF EN PRÉPARATION</span>
          </div>
        </div>
        <nav className="tab-nav" aria-label="Espaces de travail">
          {sections.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" onClick={() => setSection(id)} className={section === id ? "nav-item active" : "nav-item"} aria-current={section === id ? "page" : undefined}>
              <Icon size={17} strokeWidth={1.8} /><span>{label}</span>
            </button>
          ))}
        </nav>
      </header>

      <main className="main-wrap">
        <section className="welcome-band">
          <div className="welcome-copy">
            <div className="eyebrow"><ActiveIcon size={16} /> L’ATELIER NUMÉRIQUE DU MENUISIER</div>
            <h1>{section === "catalogue" ? "Du croquis au devis, avec méthode." : active.label}</h1>
            <p>{section === "catalogue"
              ? "Préparez vos ouvrages, détaillez les matières et estimez vos coûts sans masquer les hypothèses."
              : "Un espace pensé pour organiser le travail, préserver le savoir-faire et suivre chaque ouvrage."}</p>
          </div>
          <div className="welcome-stamp"><Axe size={22} /><span>BOIS · MESURE · OUVRAGE</span></div>
        </section>

        {section === "catalogue" && (
          <>
            <div className="section-intro"><div><span className="section-kicker">01 / CONCEPTION</span><h2>Votre ouvrage commence ici</h2></div><span className="local-only">Calcul local · non enregistré</span></div>
            <div className="craft-grid">
              {crafts.map(({ name, detail, icon: Icon }) => <article className="craft-card" key={name}><div className="craft-icon"><Icon size={23} /></div><div><h3>{name}</h3><p>{detail}</p></div></article>)}
            </div>
            <div className="work-grid">
              <section className="panel dimensions-panel">
                <div className="panel-heading"><div><span className="section-kicker">FICHE DE L’OUVRAGE</span><h2>Dimensions & matière</h2></div><Ruler size={22} /></div>
                <p className="panel-lead">Saisissez les mesures de votre meuble. Elles sont conservées uniquement dans cette page pour le moment.</p>
                <div className="dimension-grid">
                  <label>Largeur <span>cm</span><input type="number" min="1" max="1000" value={width} onChange={(e) => setWidth(e.target.value)} /></label>
                  <label>Hauteur <span>cm</span><input type="number" min="1" max="1000" value={height} onChange={(e) => setHeight(e.target.value)} /></label>
                  <label>Profondeur <span>cm</span><input type="number" min="1" max="1000" value={depth} onChange={(e) => setDepth(e.target.value)} /></label>
                </div>
                <div className="material-callout"><TreePine size={19} /><div><b>Choix du matériau</b><p>Le type, l’épaisseur, le format et le sens du fil doivent être précisés dans la nomenclature avant tout plan de débit.</p></div></div>
                <div className="dimension-foot"><span>Largeur : {width || "—"} cm</span><span>Hauteur : {height || "—"} cm</span><span>Profondeur : {depth || "—"} cm</span></div>
              </section>

              <section className="panel estimate-panel-new">
                <div className="panel-heading"><div><span className="section-kicker">CALCUL TRANSPARENT</span><h2>Estimation des coûts</h2></div><Hammer size={22} /></div>
                <p className="panel-lead">Renseignez les quantités et prix que vous avez vérifiés. Aucun tarif fournisseur n’est inventé.</p>
                <div className="cost-fields">
                  <label>Nombre de panneaux<input type="number" min="0" step="0.01" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></label>
                  <label>Prix par panneau (FCFA)<input type="number" min="0" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} /></label>
                  <label>Pertes matière (%)<input type="number" min="0" max="100" value={waste} onChange={(e) => setWaste(e.target.value)} /></label>
                  <label>Main-d’œuvre (FCFA)<input type="number" min="0" value={labor} onChange={(e) => setLabor(e.target.value)} /></label>
                  <label>Quincaillerie (FCFA)<input type="number" min="0" value={hardware} onChange={(e) => setHardware(e.target.value)} /></label>
                  <label>Finition (FCFA)<input type="number" min="0" value={finish} onChange={(e) => setFinish(e.target.value)} /></label>
                  <label>Charges (FCFA)<input type="number" min="0" value={overhead} onChange={(e) => setOverhead(e.target.value)} /></label>
                  <label>Marge brute cible (%)<input type="number" min="0" max="99.99" step="0.1" value={margin} onChange={(e) => setMargin(e.target.value)} /></label>
                </div>
                <div className="estimate-result">
                  <div><span>Coût total estimé</span><b>{estimate ? money(estimate.totalCost) : "À vérifier"}</b></div>
                  <div><span>Prix de vente cible</span><b>{estimate ? money(estimate.targetSellingPrice) : "À vérifier"}</b></div>
                </div>
                <p className="calculation-note">Ce calcul porte sur la nomenclature saisie. Il ne calcule ni les pièces, ni le débit, ni l’optimisation des panneaux à partir des dimensions.</p>
                <button className="wood-button" type="button" onClick={() => setEstimateRequested(true)}>Voir les hypothèses de calcul</button>
                {estimateRequested && <ul className="assumptions">{estimate?.assumptions.map((item) => <li key={item}>{item}</li>) ?? <li>Vérifiez les montants et pourcentages saisis.</li>}</ul>}
              </section>
            </div>
          </>
        )}

        {section === "production" && <><div className="section-intro"><div><span className="section-kicker">02 / FABRICATION</span><h2>Chaque ouvrage, un dossier clair</h2></div></div><div className="feature-strip"><Hammer size={27}/><div><h3>Du lancement à la livraison</h3><p>Ordres de fabrication, opérations, responsables, échéances, photos, contrôle qualité et garantie seront réunis dans un dossier unique.</p></div></div><EmptyState title="Aucun dossier de fabrication connecté" detail="Les commandes de démonstration ont été retirées. Connectez un atelier et créez un vrai dossier pour commencer le suivi." /></>}
        {section === "atelier" && <><div className="section-intro"><div><span className="section-kicker">03 / PILOTAGE</span><h2>Les indicateurs doivent refléter votre atelier</h2></div></div><div className="metric-explain-grid"><article className="metric-explain"><Ruler/><h3>Délais</h3><p>Respect des dates promises, calculé sur les commandes réelles.</p></article><article className="metric-explain"><Axe/><h3>Rentabilité</h3><p>Marge des dossiers clôturés et suffisamment renseignés.</p></article><article className="metric-explain"><Wrench/><h3>Qualité</h3><p>Contrôles, reprises et garanties documentés.</p></article></div><EmptyState title="Score non calculé" detail="Aucun score arbitraire n’est affiché. Il sera calculé lorsque les données de production, de coûts et de qualité seront fiables." /></>}
        {section === "materiaux" && <><div className="section-intro"><div><span className="section-kicker">04 / MATIÈRES PREMIÈRES</span><h2>Le bois et chaque composant sous contrôle</h2></div></div><div className="craft-grid material-grid">{["Bois massif & essences locales","MDF, mélaminé & contreplaqué","Charnières, glissières & visserie","Colles, vernis & abrasifs"].map((item) => <article className="craft-card" key={item}><div className="craft-icon"><TreePine size={22}/></div><h3>{item}</h3></article>)}</div><EmptyState title="Référentiel matières à initialiser" detail="Les prix seront associés à une unité, une région, une date et une source vérifiable. Aucun prix indicatif ne sera présenté comme un tarif national." /></>}
        {section === "clients" && <><div className="section-intro"><div><span className="section-kicker">05 / RELATION CLIENT</span><h2>Vos clients, vos échanges, vos engagements</h2></div></div><div className="feature-strip"><Drill size={27}/><div><h3>Un suivi respectueux et utile</h3><p>Contacts, consentements, historique, devis, commandes et rappels. Les relances WhatsApp resteront manuelles tant qu'aucune intégration autorisée n'est configurée.</p></div></div><EmptyState title="Carnet de clients vide" detail="Aucun faux client n’est affiché. Les fiches seront créées et sauvegardées après activation de l’identité et de la base de données." /></>}
        {section === "roadmap" && <><div className="section-intro"><div><span className="section-kicker">06 / CONSTRUCTION</span><h2>Les fondations avant les finitions</h2></div></div><div className="roadmap-list">{roadmap.map(([title, detail], index) => <article className="roadmap-row" key={title}><span className="roadmap-number">{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{detail}</p></div><span className="roadmap-status">À construire</span></article>)}</div></>}
      </main>
      <footer className="app-footer"><span>SenMenuisier</span><i>·</i> Le savoir-faire sénégalais, connecté au monde. <i>·</i> <span>Aperçu de conception</span></footer>
    </div>
  );
}
