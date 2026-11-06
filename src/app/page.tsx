"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Axe, Drill, Hammer, Layers, Paintbrush, Ruler, TreePine, Wrench
} from "lucide-react";
import { calculateWorkshopEstimate } from "@/lib/estimate";
import { productSpaces as sections } from "@/lib/product-spaces";

type Section = (typeof sections)[number]["id"];
type WorkshopModel = {
  id: string;
  title: string;
  short: string;
  width: number;
  height: number;
  depth: number;
  icon: typeof Hammer;
};



const models: WorkshopModel[] = [
  { id: "armoire", title: "Armoire 3 Portes", short: "Rangements et tiroirs bas", width: 180, height: 220, depth: 60, icon: Layers },
  { id: "cuisine", title: "Cuisine Modulaire en L", short: "Plan de travail et caissons", width: 280, height: 85, depth: 60, icon: Ruler },
  { id: "lit", title: "Lit 2 Places Luxe", short: "Tête intégrée et coffre optionnel", width: 180, height: 110, depth: 200, icon: TreePine },
  { id: "bureau", title: "Bureau Sur-Mesure", short: "Caisson et passage de câbles", width: 160, height: 75, depth: 80, icon: Hammer },
];

const sheetMaterials = [
  "MDF standard 18 mm",
  "MDF hydrofuge 18 mm",
  "Contreplaqué 18 mm",
  "Panneau mélaminé 18 mm",
] as const;

const finishOptions = [
  "Vernis satiné",
  "Huile naturelle",
  "Laque mate",
  "Brut poncé",
] as const;

const roadmap = [
  ["Atelier digital", "Clients, devis, commandes et documents de travail", "Socle prioritaire"],
  ["Production & stocks", "Ordres de fabrication, tâches, mouvements et inventaires", "À construire"],
  ["Calculateur bois", "Nomenclature, débit, chutes et optimisation des panneaux", "À construire"],
  ["Passeport numérique", "QR public filtré, traçabilité et garantie", "À construire"],
  ["Intelligence atelier", "Conseils fondés sur les données réelles et expliquables", "À construire"],
  ["Réseau professionnel", "Fournisseurs, sous-traitants et entraide métier", "À construire"],
  ["Marketplace artisans", "Vitrines, portfolios et demandes de devis", "À construire"],
];

const money = (value: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(value)) + " FCFA";

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="empty-state">
      <div className="empty-woodmark" aria-hidden="true"><Layers size={25} /></div>
      <h3>{title}</h3>
      <p>{detail}</p>
      <span className="status-note">Données réelles requises · aucune démonstration fictive</span>
    </div>
  );
}

export default function HomePage() {
  const [section, setSection] = useState<Section>("catalogue");
  const [modelId, setModelId] = useState("armoire");
  const [width, setWidth] = useState("180");
  const [height, setHeight] = useState("220");
  const [depth, setDepth] = useState("60");
  const [measurementsVerified, setMeasurementsVerified] = useState(false);
  const [material, setMaterial] = useState("");
  const [finishType, setFinishType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [waste, setWaste] = useState("");
  const [labor, setLabor] = useState("");
  const [hardware, setHardware] = useState("");
  const [finishCost, setFinishCost] = useState("");
  const [overhead, setOverhead] = useState("");
  const [margin, setMargin] = useState("");
  const [estimateRequested, setEstimateRequested] = useState(false);

  const selectedModel = models.find((model) => model.id === modelId) ?? models[0];
  const active = sections.find((item) => item.id === section)!;
  const ActiveIcon = active.icon;

  const estimate = useMemo(() => {
    const rawValues = [quantity, unitPrice, waste, labor, hardware, finishCost, overhead, margin];
    if (material.trim() === "" || finishType.trim() === "" || rawValues.some((value) => value.trim() === "")) return null;
    const values = rawValues.map(Number);
    if (values.some((value) => !Number.isFinite(value) || value < 0) || values[0] <= 0 || values[1] <= 0 || values[2] > 100 || values[7] >= 100) return null;
    try {
      return calculateWorkshopEstimate({
        materials: [{ name: material, quantity: values[0], unit: "panel", unitPrice: values[1], priceUnit: "panel" }],
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
  }, [material, finishType, quantity, unitPrice, waste, labor, hardware, finishCost, overhead, margin]);

  function chooseModel(model: WorkshopModel) {
    setModelId(model.id);
    setWidth(String(model.width));
    setHeight(String(model.height));
    setDepth(String(model.depth));
    setMeasurementsVerified(false);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topline">
          <Link className="brand" href="/" aria-label="SenMenuisier, accueil">
            <div className="brand-mark">SM</div>
            <div>
              <div className="brand-name">SenMenuisier <span className="version">OS V1.0</span></div>
              <p>Le savoir-faire sénégalais, connecté au monde.</p>
            </div>
          </Link>
          <div className="top-actions">
            <Link className="site-link" href="/vitrine">Site public</Link>
            <div className="workspace-chip"><TreePine className="wood-dot" size={16} aria-hidden="true" /><span><b>Espace atelier</b><small>Aperçu · aucun atelier connecté</small></span></div>
            <span className="language-chip">FR <i>·</i> WOLOF EN VALIDATION</span>
            <button className="health-chip" type="button" onClick={() => setSection("sante")}><Ruler size={15} /><span>Score Santé : <b>Non calculé</b></span></button>
            <button className="quote-chip" type="button" onClick={() => { setSection("catalogue"); setEstimateRequested(true); }}><Hammer size={15} /><span>Préparer une estimation</span></button>
          </div>
        </div>
        <nav className="tab-nav" aria-label="Les six espaces SenMenuisier">
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
            <div className="eyebrow"><ActiveIcon size={16} /> L’OS DE LA MENUISERIE AFRICAINE</div>
            <h1>{section === "catalogue" ? "Du modèle à l’ouvrage sur mesure." : active.label.replace(/^\d\. /, "")}</h1>
            <p>{section === "catalogue"
              ? "Choisissez un modèle, ajustez ses dimensions et préparez une estimation à partir de matières et de coûts vérifiés."
              : "Un espace métier conçu pour organiser l’atelier, suivre les ouvrages et valoriser le savoir-faire du menuisier."}</p>
          </div>
          <div className="welcome-stamp"><TreePine size={22} /><span>BOIS · MESURE · OUVRAGE</span></div>
        </section>

        {section === "catalogue" && (
          <>
            <div className="section-intro"><div><span className="section-kicker">01 / CONCEPTION & ESTIMATION</span><h2>Catalogue intelligent de meubles</h2></div><span className="local-only">Modèle de départ · non enregistré</span></div>
            <div className="catalogue-layout">
              <section className="model-column">
                <h3 className="subsection-heading"><Layers size={17} /> Modèles standardisés</h3>
                <div className="model-list">
                  {models.map(({ id, title, short, icon: Icon }) => (
                    <button type="button" key={id} onClick={() => chooseModel(models.find((item) => item.id === id)!)} className={modelId === id ? "model-card selected" : "model-card"}>
                      <span className="craft-icon"><Icon size={24} /></span>
                      <span className="model-copy"><b>{title}</b><small>{short}</small></span>
                      <span className="model-edge">{modelId === id ? "Choisi" : "Sélectionner"}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="panel parametric-panel">
                <div className="panel-heading"><div><span className="section-kicker">AJUSTEMENT PARAMÉTRIQUE</span><h2>{selectedModel.title}</h2></div><Ruler size={22} /></div>
                <p className="panel-lead">Valeurs de départ du modèle. Ajustez-les selon le besoin du client et les contraintes du lieu.</p>
                <div className="dimension-sliders">
                  <label><span>Largeur (L)</span><b>{width} cm</b><input aria-label="Largeur en centimètres" type="range" min="60" max="400" value={width} onChange={(event) => { setWidth(event.target.value); setMeasurementsVerified(false); }} /></label>
                  <label><span>Hauteur (H)</span><b>{height} cm</b><input aria-label="Hauteur en centimètres" type="range" min="50" max="300" value={height} onChange={(event) => { setHeight(event.target.value); setMeasurementsVerified(false); }} /></label>
                  <label><span>Profondeur (P)</span><b>{depth} cm</b><input aria-label="Profondeur en centimètres" type="range" min="30" max="250" value={depth} onChange={(event) => { setDepth(event.target.value); setMeasurementsVerified(false); }} /></label>
                </div>
                <div className="measurement-check">
                  <div className="measurement-check-copy">
                    <span className="section-kicker">CONTRÔLE SUR PLACE</span>
                    <strong>Vérifier les trois cotes avant le devis</strong>
                    <p>Relevez largeur, hauteur et profondeur au mètre. L’aide caméra/AR du téléphone n’est pas encore active : aucune mesure automatique n’est simulée.</p>
                  </div>
                  <button className={measurementsVerified ? "measurement-confirm is-verified" : "measurement-confirm"} type="button" aria-pressed={measurementsVerified} onClick={() => setMeasurementsVerified((value) => !value)}>
                    <Ruler size={16} /> {measurementsVerified ? "Relevé vérifié" : "Confirmer le relevé"}
                  </button>
                </div>
                <p className={measurementsVerified ? "measurement-status is-verified" : "measurement-status"} role="status">
                  {measurementsVerified ? "Les trois cotes sont marquées comme vérifiées pour cette session. Toute modification annulera cette confirmation." : "Relevé non confirmé · vérifiez les dimensions sur place."}
                </p>
                <div className="material-callout"><Ruler size={19} /><div><b>Mesures de référence</b><p>Ces dimensions ne génèrent pas automatiquement une liste de pièces. Le débit doit être établi à partir d’une nomenclature validée, des épaisseurs et du sens du fil.</p></div></div>
              </section>
            </div>

            <div className="section-intro estimate-intro"><div><span className="section-kicker">CALCUL TRANSPARENT</span><h2>Préparer le coût de fabrication</h2></div><span className="local-only">Calcul local · non enregistré</span></div>
            <section className="panel estimate-panel-new" id="estimate-panel">
              <div className="panel-heading"><div><span className="section-kicker">MATIÈRES & FINITIONS</span><h2>Nomenclature et coûts vérifiés</h2></div><Paintbrush size={22} /></div>
              <p className="panel-lead">Renseignez les montants réellement constatés auprès de vos fournisseurs. Aucun tarif de démonstration n’est prérempli.</p>
              <div className="cost-fields">
                <label className="wide-field">Essence / matériau de base<select value={material} onChange={(event) => setMaterial(event.target.value)}><option value="">Choisir un panneau</option>{sheetMaterials.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                <label>Nombre de panneaux<input type="number" min="0.01" step="0.01" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label>
                <label>Prix par panneau (FCFA)<input type="number" min="0" value={unitPrice} onChange={(event) => setUnitPrice(event.target.value)} /></label>
                <label>Pertes matière (%)<input type="number" min="0" max="100" value={waste} onChange={(event) => setWaste(event.target.value)} /></label>
                <label>Finition & protection<select value={finishType} onChange={(event) => setFinishType(event.target.value)}><option value="">Choisir une finition</option>{finishOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                <label>Main-d’œuvre (FCFA)<input type="number" min="0" value={labor} onChange={(event) => setLabor(event.target.value)} /></label>
                <label>Quincaillerie (FCFA)<input type="number" min="0" value={hardware} onChange={(event) => setHardware(event.target.value)} /></label>
                <label>Coût de finition (FCFA)<input type="number" min="0" value={finishCost} onChange={(event) => setFinishCost(event.target.value)} /></label>
                <label>Charges atelier (FCFA)<input type="number" min="0" value={overhead} onChange={(event) => setOverhead(event.target.value)} /></label>
                <label>Marge brute cible (%)<input type="number" min="0" max="99.99" step="0.1" value={margin} onChange={(event) => setMargin(event.target.value)} /></label>
              </div>
              <div className="estimate-result">
                <div><span>Coût de fabrication estimé</span><b>{estimate ? money(estimate.totalCost) : "À renseigner"}</b></div>
                <div><span>Prix de vente cible</span><b>{estimate ? money(estimate.targetSellingPrice) : "À renseigner"}</b></div>
              </div>
              <p className="calculation-note">Cette première estimation calcule une ligne de matière et les coûts complémentaires saisis. Elle ne constitue pas encore un plan de débit ni une nomenclature multi-pièces complète.</p>
              <button className="wood-button" type="button" onClick={() => setEstimateRequested(true)}>Vérifier les hypothèses de calcul</button>
              {estimateRequested && <ul className="assumptions">{estimate?.assumptions.map((item) => <li key={item}>{item}</li>) ?? <li>Complétez tous les champs, choisissez une matière et une finition pour obtenir une estimation.</li>}</ul>}
            </section>
          </>
        )}

        {section === "production" && (
          <>
            <div className="section-intro"><div><span className="section-kicker">02 / SUIVI DE FABRICATION</span><h2>Production & passeport numérique QR</h2></div></div>
            <div className="production-steps">
              {[
                ["Préparation", "Dossier, mesures et nomenclature", Ruler],
                ["Débit", "Panneaux, pièces et chutes", Axe],
                ["Assemblage", "Montage et ajustements", Hammer],
                ["Finition", "Ponçage, huile, vernis ou laque", Paintbrush],
                ["Contrôle", "Vérification avant livraison", Wrench],
              ].map(([title, detail, Icon]) => {
                const StepIcon = Icon as typeof Hammer;
                return <article className="production-step" key={title as string}><StepIcon size={22} /><h3>{title as string}</h3><p>{detail as string}</p></article>;
              })}
            </div>
            <div className="feature-strip"><Hammer size={27} /><div><h3>Un dossier par ouvrage</h3><p>Les commandes réelles réuniront les tâches, responsables, dates, photos, contrôles, livraison et garantie. Le passeport QR sera généré uniquement après création d’un ouvrage enregistré.</p></div></div>
            <EmptyState title="Aucun dossier de fabrication connecté" detail="Les commandes fictives de l’ancienne maquette ont été retirées. Les passeports QR ne seront pas simulés : ils seront liés à un meuble réel et à des informations publiques autorisées." />
          </>
        )}

        {section === "sante" && (
          <>
            <div className="section-intro"><div><span className="section-kicker">03 / PILOTAGE D’ATELIER</span><h2>Score Santé de l’atelier</h2></div><span className="local-only">Score non calculé</span></div>
            <div className="metric-explain-grid">
              <article className="metric-explain"><Ruler /><h3>Respect des délais</h3><p>Calculé sur les dates promises et les livraisons réellement clôturées.</p></article>
              <article className="metric-explain"><Axe /><h3>Marge moyenne</h3><p>Calculée sur les coûts et prix de vente des dossiers complets.</p></article>
              <article className="metric-explain"><Hammer /><h3>Recouvrement clients</h3><p>Suivi des paiements enregistrés et des soldes dus.</p></article>
              <article className="metric-explain"><TreePine /><h3>Rotation des stocks</h3><p>Évaluée à partir des entrées, sorties et inventaires.</p></article>
            </div>
            <EmptyState title="Score Santé indisponible pour le moment" detail="Aucun 82/100 fictif n’est affiché. Le score et les conseils seront calculés lorsque les données de production, de coûts, de paiements et de stock seront fiables." />
          </>
        )}

        {section === "prix" && (
          <>
            <div className="section-intro"><div><span className="section-kicker">04 / INTELLIGENCE COLLECTIVE DU MARCHÉ</span><h2>Base de Prix Nationale (FCFA)</h2></div><span className="local-only">Aucune cotation validée</span></div>
            <div className="craft-grid price-category-grid">
              <article className="craft-card"><div className="craft-icon"><TreePine size={23} /></div><div><h3>Bois & panneaux</h3><p>Essences, MDF, contreplaqué, mélaminé et formats.</p></div></article>
              <article className="craft-card"><div className="craft-icon"><Wrench size={23} /></div><div><h3>Quincaillerie</h3><p>Charnières, glissières, vis, poignées et accessoires.</p></div></article>
              <article className="craft-card"><div className="craft-icon"><Paintbrush size={23} /></div><div><h3>Finitions & consommables</h3><p>Colles, abrasifs, huiles, vernis et peintures.</p></div></article>
              <article className="craft-card"><div className="craft-icon"><Ruler size={23} /></div><div><h3>Prix de vente d’ouvrages</h3><p>Fourchettes observées par type de meuble et région.</p></div></article>
            </div>
            <EmptyState title="Référentiel de prix à constituer" detail="Chaque observation devra indiquer la région, l’unité, la date, la source et la qualité du matériau. Aucun prix ne sera présenté comme national sans données suffisantes et vérifiées." />
          </>
        )}

        {section === "crm" && (
          <>
            <div className="section-intro"><div><span className="section-kicker">05 / FIDÉLISATION CLIENT</span><h2>CRM Artisan & carnet de clients</h2></div></div>
            <div className="feature-strip"><Drill size={27} /><div><h3>Une relation client simple et suivie</h3><p>Contacts, consentements, historique, devis, commandes, préférences et rappels. Les relances WhatsApp resteront manuelles tant qu’aucune intégration autorisée n’est configurée.</p></div></div>
            <EmptyState title="Carnet de clients vide" detail="Aucun nom, numéro ou achat fictif n’est conservé. Les fiches clients seront créées dans l’espace privé de chaque atelier." />
          </>
        )}

        {section === "roadmap" && (
          <>
            <div className="section-intro"><div><span className="section-kicker">06 / VISION STRATÉGIQUE</span><h2>Feuille de route SenMenuisier</h2></div></div>
            <div className="roadmap-list">{roadmap.map(([title, detail, status], index) => <article className="roadmap-row" key={title}><span className="roadmap-number">{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{detail}</p></div><span className="roadmap-status">{status}</span></article>)}</div>
          </>
        )}
      </main>
      <footer className="app-footer"><span>SenMenuisier</span><i>·</i> Le savoir-faire sénégalais, connecté au monde. <i>·</i> Aperçu de conception</footer>
    </div>
  );
}
