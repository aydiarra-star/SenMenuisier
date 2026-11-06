"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import {
  Drill, Hammer, Layers, Paintbrush, Ruler, TreePine, Plus, Trash2, MessageCircle, Phone, CalendarClock, Check, CircleAlert
} from "lucide-react";
import { calculateWorkshopEstimate } from "@/lib/estimate";
import { productSpaces as sections } from "@/lib/product-spaces";
import {
  calculateOperationalHealth, emptyWorkspace, nextProductionStatus, productionStages,
  type WorkshopWorkspace, type ProductionStatus,
} from "@/lib/workshop-workspace";

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

export default function HomePage() {
  const [section, setSection] = useState<Section>("catalogue");
  const [modelId, setModelId] = useState("armoire");
  const [width, setWidth] = useState("180");
  const [height, setHeight] = useState("220");
  const [depth, setDepth] = useState("60");
  const [measurementsVerified, setMeasurementsVerified] = useState(false);
  const [boardThickness, setBoardThickness] = useState("18 mm");
  const [edgeBanding, setEdgeBanding] = useState("PVC 2 mm");
  const [workshopNotes, setWorkshopNotes] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [deliveryTarget, setDeliveryTarget] = useState("");
  const [quotePrepared, setQuotePrepared] = useState(false);
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
  const [workspace, setWorkspace] = useState<WorkshopWorkspace>(emptyWorkspace);
  const [workspaceLoaded, setWorkspaceLoaded] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobClient, setJobClient] = useState("");
  const [jobDueDate, setJobDueDate] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactCity, setContactCity] = useState("");
  const [contactNotes, setContactNotes] = useState("");
  const [contactConsent, setContactConsent] = useState(false);
  const [contactFollowUp, setContactFollowUp] = useState("");
  const [priceCategory, setPriceCategory] = useState("Bois & panneaux");
  const [priceItem, setPriceItem] = useState("");
  const [priceRegion, setPriceRegion] = useState("Dakar");
  const [priceQuality, setPriceQuality] = useState("");
  const [priceUnit, setPriceUnit] = useState("unité");
  const [priceAmount, setPriceAmount] = useState("");
  const [priceSource, setPriceSource] = useState("");
  const [priceDate, setPriceDate] = useState(new Date().toISOString().slice(0, 10));
  const [workspaceNotice, setWorkspaceNotice] = useState("");
  useEffect(() => {
    setQuotePrepared(false);
  }, [width, height, depth, boardThickness, edgeBanding, workshopNotes, material, finishType, quantity, unitPrice, waste, labor, hardware, finishCost, overhead, margin, clientName, clientContact, deliveryTarget]);
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("senmenuisier-workspace-v1");
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<WorkshopWorkspace>;
        setWorkspace({
          production: Array.isArray(parsed.production) ? parsed.production : [],
          contacts: Array.isArray(parsed.contacts) ? parsed.contacts : [],
          prices: Array.isArray(parsed.prices) ? parsed.prices : [],
        });
      }
    } catch {
      setWorkspaceNotice("Les données locales n’ont pas pu être lues. Vérifiez le stockage de ce navigateur.");
    } finally {
      setWorkspaceLoaded(true);
    }
  }, []);
  useEffect(() => {
    if (!workspaceLoaded) return;
    try {
      window.localStorage.setItem("senmenuisier-workspace-v1", JSON.stringify(workspace));
    } catch {
      setWorkspaceNotice("Enregistrement local impossible : espace de stockage indisponible.");
    }
  }, [workspace, workspaceLoaded]);
  const operationalHealth = useMemo(
    () => calculateOperationalHealth(workspace.production),
    [workspace.production],
  );
  const today = new Date().toISOString().slice(0, 10);
  const dueFollowUps = workspace.contacts.filter((contact) => contact.nextFollowUp && contact.nextFollowUp <= today).length;
  function addProductionJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!jobTitle.trim() || !jobClient.trim() || !jobDueDate) return;
    setWorkspace((current) => ({
      ...current,
      production: [{
        id: crypto.randomUUID(), title: jobTitle.trim(), client: jobClient.trim(),
        dueDate: jobDueDate, status: "preparation" as ProductionStatus,
        createdAt: new Date().toISOString(),
      }, ...current.production],
    }));
    setJobTitle(""); setJobClient(""); setJobDueDate("");
    setWorkspaceNotice("Dossier ajouté et enregistré dans ce navigateur.");
  }
  function addContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) return;
    setWorkspace((current) => ({
      ...current,
      contacts: [{
        id: crypto.randomUUID(), name: contactName.trim(), phone: contactPhone.trim(),
        city: contactCity.trim(), notes: contactNotes.trim(), consentWhatsApp: contactConsent,
        nextFollowUp: contactFollowUp, createdAt: new Date().toISOString(),
      }, ...current.contacts],
    }));
    setContactName(""); setContactPhone(""); setContactCity(""); setContactNotes("");
    setContactConsent(false); setContactFollowUp("");
    setWorkspaceNotice("Contact ajouté et enregistré dans ce navigateur.");
  }
  function addPriceObservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(priceAmount);
    if (!priceItem.trim() || !priceQuality.trim() || !priceSource.trim() || !priceDate || !Number.isFinite(amount) || amount <= 0) return;
    setWorkspace((current) => ({
      ...current,
      prices: [{
        id: crypto.randomUUID(), category: priceCategory, item: priceItem.trim(),
        region: priceRegion, quality: priceQuality.trim(), unit: priceUnit,
        price: amount, source: priceSource.trim(), observedAt: priceDate, status: "pending" as const,
      }, ...current.prices],
    }));
    setPriceItem(""); setPriceQuality(""); setPriceAmount(""); setPriceSource("");
    setWorkspaceNotice("Observation ajoutée en attente de vérification.");
  }
  function advanceProduction(id: string, status: ProductionStatus) {
    const next = nextProductionStatus(status);
    setWorkspace((current) => ({
      ...current,
      production: current.production.map((job) => job.id === id
        ? { ...job, status: next, ...(next === "livre" ? { completedAt: new Date().toISOString() } : {}) }
        : job),
    }));
  }


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
    setQuotePrepared(false);
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
                <section className="furniture-sheet" aria-labelledby="furniture-sheet-title">
                  <div className="panel-heading"><div><span className="section-kicker">FICHE DE L’OUVRAGE</span><h2 id="furniture-sheet-title">Préciser la fabrication</h2></div><Layers size={21} /></div>
                  <p className="panel-lead">Complétez les choix techniques avec le client avant de préparer le devis et le travail en atelier.</p>
                  <div className="cost-fields furniture-fields">
                    <label>Épaisseur principale<select value={boardThickness} onChange={(event) => setBoardThickness(event.target.value)}><option>12 mm</option><option>15 mm</option><option>18 mm</option><option>22 mm</option><option>25 mm</option><option>À confirmer</option></select></label>
                    <label>Chant / bordure<select value={edgeBanding} onChange={(event) => setEdgeBanding(event.target.value)}><option>PVC 0,8 mm</option><option>PVC 2 mm</option><option>Bois massif</option><option>Sans chant</option><option>À confirmer</option></select></label>
                    <label className="wide-field">Consignes et contraintes de l’atelier<textarea rows={3} value={workshopNotes} onChange={(event) => setWorkshopNotes(event.target.value)} placeholder="Ex. : mur irrégulier, prise à gauche, finition à valider avec le client…" /></label>
                  </div>
                  <div className="furniture-summary">
                    <div className="furniture-summary-head"><b>Récapitulatif de l’ouvrage</b><span>Brouillon local</span></div>
                    <p><strong>{selectedModel.title}</strong> · {width} × {height} × {depth} cm</p>
                    <p>{material || "Matériau à choisir"} · {boardThickness} · {finishType || "Finition à choisir"} · {edgeBanding}</p>
                    {workshopNotes.trim() && <p className="furniture-notes">{workshopNotes}</p>}
                    <small>Ce récapitulatif n’est pas encore enregistré ni partagé avec un client. La liste de débit reste à établir et à valider par le menuisier.</small>
                  </div>
                </section>
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
              {estimate && (
                <div className="estimate-breakdown" aria-label="Détail du calcul de fabrication">
                  <div className="estimate-breakdown-heading"><b>Comprendre le calcul</b><span>Montants saisis par l’atelier</span></div>
                  <div><span>Matières</span><b>{money(estimate.materialSubtotal)}</b></div>
                  <div><span>Pertes matière ({(Number(waste) || 0).toLocaleString("fr-FR")} %)</span><b>{money(estimate.wasteCost)}</b></div>
                  <div><span>Main-d’œuvre</span><b>{money(estimate.laborCost)}</b></div>
                  <div><span>Quincaillerie</span><b>{money(estimate.hardwareCost)}</b></div>
                  <div><span>Finition</span><b>{money(estimate.finishCost)}</b></div>
                  <div><span>Charges atelier</span><b>{money(estimate.overheadCost)}</b></div>
                  <div className="estimate-breakdown-total"><span>Coût total</span><b>{money(estimate.totalCost)}</b></div>
                  <div className="estimate-breakdown-margin"><span>Marge brute cible sur prix de vente ({(Number(margin) || 0).toLocaleString("fr-FR")} %)</span><b>{money(estimate.targetSellingPrice - estimate.totalCost)}</b></div>
                </div>
              )}
              <p className="calculation-note">Cette première estimation calcule une ligne de matière et les coûts complémentaires saisis. Elle ne constitue pas encore un plan de débit ni une nomenclature multi-pièces complète.</p>
              <button className="wood-button" type="button" onClick={() => setEstimateRequested(true)}>Vérifier les hypothèses de calcul</button>
              {estimateRequested && <ul className="assumptions">{estimate?.assumptions.map((item) => <li key={item}>{item}</li>) ?? <li>Complétez tous les champs, choisissez une matière et une finition pour obtenir une estimation.</li>}</ul>}
              <section className="quote-draft" aria-labelledby="quote-draft-title">
                <div className="panel-heading"><div><span className="section-kicker">ÉTAPE SUIVANTE</span><h2 id="quote-draft-title">Préparer le devis client</h2></div><Hammer size={21} /></div>
                <p className="panel-lead">Le devis ne peut être préparé qu’après contrôle des mesures et saisie des coûts. Il reste un brouillon tant qu’il n’est pas enregistré et envoyé par l’atelier.</p>
                <div className="cost-fields quote-fields">
                  <label>Nom du client<input value={clientName} onChange={(event) => setClientName(event.target.value)} placeholder="Nom et prénom" /></label>
                  <label>Téléphone / WhatsApp<input type="tel" value={clientContact} onChange={(event) => setClientContact(event.target.value)} placeholder="Numéro communiqué par le client" /></label>
                  <label className="wide-field">Date souhaitée de livraison<input type="date" value={deliveryTarget} onChange={(event) => setDeliveryTarget(event.target.value)} /></label>
                </div>
                <button className="wood-button quote-prepare-button" type="button" disabled={!estimate || !measurementsVerified || !clientName.trim()} onClick={() => setQuotePrepared(true)}>Préparer l’aperçu du devis</button>
                {!measurementsVerified && <p className="quote-hint">Confirmez d’abord les mesures sur place.</p>}
                {measurementsVerified && !estimate && <p className="quote-hint">Complétez les coûts pour calculer un montant fiable.</p>}
                {quotePrepared && estimate && <><div className="quote-preview" role="status">
                  <div className="furniture-summary-head"><b>Aperçu du devis · brouillon</b><span>Non envoyé</span></div>
                  <p><strong>Client :</strong> {clientName} {clientContact.trim() ? "· " + clientContact : ""}</p>
                  <p><strong>Ouvrage :</strong> {selectedModel.title} · {width} × {height} × {depth} cm</p>
                  <p><strong>Fiche technique :</strong> {material} · {boardThickness} · {finishType} · {edgeBanding}</p>
                  <p><strong>Prix cible indicatif :</strong> {money(estimate.targetSellingPrice)}</p>
                  <p><strong>Livraison souhaitée :</strong> {deliveryTarget || "À convenir avec le client"}</p>
                  <small>Avant envoi : vérifier les quantités, la portée du devis, les conditions de paiement et la date avec le client. L’acceptation devra être enregistrée pour ouvrir une commande.</small>
                  <button className="wood-button quote-print-button" type="button" onClick={() => window.print()}>Imprimer / Enregistrer en PDF</button>
                </div>
                <article className="quote-print-sheet" aria-label="Document de devis à imprimer">
                  <header className="quote-print-header">
                    <div className="quote-print-brand">SenMenuisier</div>
                    <span>DOCUMENT DE TRAVAIL · BROUILLON</span>
                  </header>
                  <h1>Devis estimatif</h1>
                  <p className="quote-print-intro">Le savoir-faire sénégalais, connecté au monde.</p>
                  <div className="quote-print-rule" />
                  <h2>Client</h2>
                  <p>{clientName}{clientContact.trim() ? " · " + clientContact : ""}</p>
                  <h2>Ouvrage proposé</h2>
                  <p><strong>{selectedModel.title}</strong></p>
                  <p>Dimensions : {width} × {height} × {depth} cm</p>
                  <p>Matériau : {material} · Épaisseur : {boardThickness}</p>
                  <p>Finition : {finishType} · Chant : {edgeBanding}</p>
                  {workshopNotes.trim() && <><h2>Consignes particulières</h2><p className="quote-print-notes">{workshopNotes}</p></>}
                  <h2>Estimation financière</h2>
                  <div className="quote-print-total"><span>Prix de vente cible indicatif</span><strong>{money(estimate.targetSellingPrice)}</strong></div>
                  <p>Date souhaitée de livraison : {deliveryTarget || "À convenir avec le client"}</p>
                  <div className="quote-print-rule" />
                  <p className="quote-print-disclaimer">Document de préparation non contractuel. Montant calculé à partir des informations saisies par l’atelier. Les quantités, fournitures, délais, conditions de paiement et taxes éventuelles restent à confirmer avec le client. Ce document n’est ni une facture, ni une preuve d’acceptation, ni une commande.</p>
                  <footer className="quote-print-footer">SenMenuisier · Brouillon local non enregistré · {new Date().toLocaleDateString("fr-FR")}</footer>
                </article></>}
              </section>
            </section>
          </>
        )}

        {section === "production" && (
          <>
            <div className="section-intro"><div><span className="section-kicker">02 / SUIVI DE FABRICATION</span><h2>Production & suivi des ouvrages</h2></div><span className="local-only">{workspace.production.length} dossier(s)</span></div>
            <div className="feature-strip"><Hammer size={27} /><div><h3>Un suivi concret, étape par étape</h3><p>Créez un dossier, affectez-le à une étape, faites avancer la fabrication et clôturez-le à la livraison. Les données sont actuellement conservées sur cet appareil, pas encore synchronisées entre les membres.</p></div></div>
            <section className="panel module-panel">
              <div className="panel-heading"><div><span className="section-kicker">NOUVEL OUVRAGE</span><h2>Créer un dossier de fabrication</h2></div><Plus size={22} /></div>
              <form className="module-form" onSubmit={addProductionJob}>
                <label>Nom de l’ouvrage<input required maxLength={100} value={jobTitle} onChange={(event) => setJobTitle(event.target.value)} placeholder="Ex. Armoire 3 portes" /></label>
                <label>Client<input required maxLength={100} value={jobClient} onChange={(event) => setJobClient(event.target.value)} placeholder="Nom du client" /></label>
                <label>Date promise<input required type="date" min={today} value={jobDueDate} onChange={(event) => setJobDueDate(event.target.value)} /></label>
                <button className="wood-button" type="submit"><Plus size={16} /> Créer le dossier</button>
              </form>
            </section>
            <div className="section-intro"><div><span className="section-kicker">TABLEAU DE FABRICATION</span><h2>Ouvrages en cours et livrés</h2></div></div>
            <div className="module-list">
              {workspace.production.length === 0 ? <div className="module-empty"><Hammer size={24} /><b>Aucun dossier pour le moment</b><p>Créez le premier ouvrage ci-dessus. Aucun faux dossier n’est préchargé.</p></div> :
                workspace.production.map((job) => {
                  const stageIndex = productionStages.findIndex((stage) => stage.id === job.status);
                  const stage = productionStages[stageIndex];
                  return <article className="module-record" key={job.id}>
                    <div className="record-main"><span className="section-kicker">DOSSIER · {job.id.slice(0, 8).toUpperCase()}</span><h3>{job.title}</h3><p>{job.client} · Livraison prévue le {job.dueDate}</p><div className="stage-track">{productionStages.map((item, index) => <span key={item.id} className={index <= stageIndex ? "stage-dot done" : "stage-dot"} title={item.label} />)}</div><small>Étape : {stage.label}</small></div>
                    <div className="record-actions">{job.status !== "livre" ? <button type="button" className="wood-button" onClick={() => advanceProduction(job.id, job.status)}>Étape suivante <span aria-hidden="true">→</span></button> : <span className="record-status"><Check size={15} /> Livré</span>}<button type="button" className="icon-action" aria-label={`Supprimer le dossier ${job.title}`} onClick={() => setWorkspace((current) => ({ ...current, production: current.production.filter((item) => item.id !== job.id) }))}><Trash2 size={17} /></button></div>
                  </article>;
                })}
            </div>
            <div className="feature-strip"><CircleAlert size={24} /><div><h3>Passeport QR : étape suivante</h3><p>Le suivi de fabrication est actif localement. Le QR public sera activé après connexion à une base sécurisée afin de ne jamais exposer les coordonnées du client ou les informations internes de l’atelier.</p></div></div>
          </>
        )}

        {section === "sante" && (
          <>
            <div className="section-intro"><div><span className="section-kicker">03 / PILOTAGE D’ATELIER</span><h2>Score Santé opérationnel</h2></div><span className="local-only">Calcul transparent · sans données financières</span></div>
            <div className="health-score-panel panel">
              <div><span className="section-kicker">RESPECT DES DÉLAIS</span><strong>{operationalHealth.score === null ? "—" : `${operationalHealth.score}/100`}</strong><p>{operationalHealth.score === null ? `Il faut au moins 3 ouvrages livrés pour calculer un indicateur fiable. ${operationalHealth.completedCount}/3 actuellement.` : `Calcul basé sur ${operationalHealth.completedCount} ouvrages livrés et leurs dates promises.`}</p></div>
              <div className="health-meter"><span style={{ width: `${operationalHealth.score ?? 0}%` }} /></div>
              {operationalHealth.score !== null && <small>{operationalHealth.onTimeCount} livraison(s) dans les délais sur {operationalHealth.completedCount}.</small>}
            </div>
            <div className="metric-explain-grid">
              <article className="metric-explain"><Ruler /><h3>Ouvrages livrés</h3><p>{operationalHealth.completedCount} dossier(s) clôturé(s), sur la base des enregistrements de cet appareil.</p></article>
              <article className="metric-explain"><CalendarClock /><h3>Retards en cours</h3><p>{operationalHealth.overdueCount} dossier(s) non livré(s) dont la date promise est dépassée.</p></article>
              <article className="metric-explain"><Drill /><h3>Clients suivis</h3><p>{workspace.contacts.length} contact(s) dans le carnet de l’atelier.</p></article>
              <article className="metric-explain"><MessageCircle /><h3>Relances à faire</h3><p>{dueFollowUps} contact(s) avec une date de suivi arrivée ou dépassée.</p></article>
            </div>
            <div className="feature-strip"><CircleAlert size={24} /><div><h3>Lecture honnête des indicateurs</h3><p>Le score affiché mesure uniquement la ponctualité des livraisons. Il n’intègre ni marge, ni encaissements, ni dépenses, ni stock : ces données nécessitent un système sécurisé et des droits propriétaire. Aucun score n’est inventé en l’absence d’échantillon suffisant.</p></div></div>
          </>
        )}

        {section === "prix" && (
          <>
            <div className="section-intro"><div><span className="section-kicker">04 / INTELLIGENCE COLLECTIVE DU MARCHÉ</span><h2>Base de Prix documentée (FCFA)</h2></div><span className="local-only">{workspace.prices.length} observation(s)</span></div>
            <div className="feature-strip"><TreePine size={25} /><div><h3>Des prix sourcés, jamais inventés</h3><p>Chaque relevé doit contenir la région, l’unité, la qualité, la date et une source. Les observations restent en attente tant qu’elles ne sont pas vérifiées.</p></div></div>
            <section className="panel module-panel">
              <div className="panel-heading"><div><span className="section-kicker">NOUVELLE OBSERVATION</span><h2>Ajouter un prix constaté</h2></div><Plus size={22} /></div>
              <form className="module-form price-form" onSubmit={addPriceObservation}>
                <label>Catégorie<select value={priceCategory} onChange={(event) => setPriceCategory(event.target.value)}><option>Bois & panneaux</option><option>Quincaillerie</option><option>Finitions & consommables</option><option>Prix de vente d’ouvrages</option></select></label>
                <label>Matériau / article<input required maxLength={100} value={priceItem} onChange={(event) => setPriceItem(event.target.value)} placeholder="Ex. MDF 18 mm" /></label>
                <label>Région<select value={priceRegion} onChange={(event) => setPriceRegion(event.target.value)}>{["Dakar","Thiès","Diourbel","Saint-Louis","Louga","Fatick","Kaolack","Kaffrine","Tambacounda","Kédougou","Kolda","Sédhiou","Ziguinchor","Matam"].map((region) => <option key={region}>{region}</option>)}</select></label>
                <label>Qualité / référence<input required maxLength={100} value={priceQuality} onChange={(event) => setPriceQuality(event.target.value)} placeholder="Épaisseur, essence, gamme…" /></label>
                <label>Unité<select value={priceUnit} onChange={(event) => setPriceUnit(event.target.value)}><option>unité</option><option>panneau</option><option>m²</option><option>mètre linéaire</option><option>litre</option><option>kg</option><option>lot</option></select></label>
                <label>Prix constaté (FCFA)<input required type="number" min="1" step="1" value={priceAmount} onChange={(event) => setPriceAmount(event.target.value)} /></label>
                <label>Source vérifiable<input required maxLength={160} value={priceSource} onChange={(event) => setPriceSource(event.target.value)} placeholder="Fournisseur, facture ou relevé" /></label>
                <label>Date du relevé<input required type="date" max={today} value={priceDate} onChange={(event) => setPriceDate(event.target.value)} /></label>
                <button className="wood-button" type="submit"><Plus size={16} /> Ajouter l’observation</button>
              </form>
            </section>
            <div className="section-intro"><div><span className="section-kicker">RELEVÉS SAISIS</span><h2>Historique des observations</h2></div></div>
            <div className="module-list">
              {workspace.prices.length === 0 ? <div className="module-empty"><TreePine size={24} /><b>Aucun prix enregistré</b><p>Ajoutez un prix réellement constaté. Aucune valeur nationale n’est préchargée.</p></div> :
                workspace.prices.map((item) => <article className="module-record" key={item.id}>
                  <div className="record-main"><span className="section-kicker">{item.category} · {item.region}</span><h3>{item.item} — {money(item.price)} / {item.unit}</h3><p>{item.quality} · Source : {item.source} · Relevé du {item.observedAt}</p><span className={item.status === "validated" ? "record-status" : "record-pending"}>{item.status === "validated" ? "Vérifié sur cet appareil" : "En attente de vérification"}</span></div>
                  <div className="record-actions">{item.status === "pending" && <button type="button" className="wood-button" onClick={() => setWorkspace((current) => ({ ...current, prices: current.prices.map((entry) => entry.id === item.id ? { ...entry, status: "validated" as const } : entry) }))}>Marquer vérifié</button>}<button type="button" className="icon-action" aria-label={`Supprimer l’observation ${item.item}`} onClick={() => setWorkspace((current) => ({ ...current, prices: current.prices.filter((entry) => entry.id !== item.id) }))}><Trash2 size={17} /></button></div>
                </article>)}
            </div>
            <div className="feature-strip"><CircleAlert size={24} /><div><h3>Important : pas encore une base nationale publique</h3><p>Les relevés sont locaux à ce navigateur. « Vérifié » signifie seulement que vous avez contrôlé la source sur cet appareil. La publication nationale nécessitera une modération serveur et une comparaison des relevés régionaux.</p></div></div>
          </>
        )}

        {section === "crm" && (
          <>
            <div className="section-intro"><div><span className="section-kicker">05 / FIDÉLISATION CLIENT</span><h2>CRM Artisan & carnet de clients</h2></div><span className="local-only">{workspace.contacts.length} contact(s)</span></div>
            <div className="feature-strip"><Drill size={27} /><div><h3>Un carnet simple, utile et respectueux du consentement</h3><p>Enregistrez les coordonnées, la ville, les notes et la prochaine relance. WhatsApp s’ouvre avec un message prérempli seulement si le client a accepté les relances.</p></div></div>
            <section className="panel module-panel">
              <div className="panel-heading"><div><span className="section-kicker">NOUVEAU CONTACT</span><h2>Ajouter un client</h2></div><Plus size={22} /></div>
              <form className="module-form" onSubmit={addContact}>
                <label>Nom du client<input required maxLength={100} value={contactName} onChange={(event) => setContactName(event.target.value)} placeholder="Nom et prénom" /></label>
                <label>Téléphone<input required type="tel" maxLength={24} value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} placeholder="+221 77 000 00 00" /></label>
                <label>Ville<input maxLength={80} value={contactCity} onChange={(event) => setContactCity(event.target.value)} placeholder="Ex. Dakar" /></label>
                <label>Prochaine relance<input type="date" value={contactFollowUp} onChange={(event) => setContactFollowUp(event.target.value)} /></label>
                <label className="module-wide">Notes<textarea maxLength={500} rows={3} value={contactNotes} onChange={(event) => setContactNotes(event.target.value)} placeholder="Préférences, demande, historique utile…" /></label>
                <label className="consent-check"><input type="checkbox" checked={contactConsent} onChange={(event) => setContactConsent(event.target.checked)} /> Le client accepte les relances WhatsApp.</label>
                <button className="wood-button" type="submit"><Plus size={16} /> Enregistrer le contact</button>
              </form>
            </section>
            <div className="section-intro"><div><span className="section-kicker">CARNET DE CLIENTS</span><h2>Contacts et relances</h2></div></div>
            <div className="module-list">
              {workspace.contacts.length === 0 ? <div className="module-empty"><Drill size={24} /><b>Aucun client enregistré</b><p>Ajoutez un client pour démarrer votre carnet. Les données restent sur cet appareil.</p></div> :
                workspace.contacts.map((contact) => {
                  const digits = contact.phone.replace(/[^0-9]/g, "");
                  const waMessage = encodeURIComponent(`Bonjour ${contact.name}, je vous contacte au sujet de votre projet de menuiserie.`);
                  return <article className="module-record" key={contact.id}>
                    <div className="record-main"><span className="section-kicker">{contact.city || "Ville non renseignée"}</span><h3>{contact.name}</h3><p>{contact.phone}{contact.nextFollowUp ? ` · Relance : ${contact.nextFollowUp}` : ""}</p>{contact.notes && <p>{contact.notes}</p>}<small>{contact.consentWhatsApp ? "Consentement WhatsApp enregistré" : "Pas de consentement WhatsApp"}</small></div>
                    <div className="record-actions"><a className="icon-action" href={`tel:${contact.phone}`} aria-label={`Appeler ${contact.name}`}><Phone size={17} /></a>{contact.consentWhatsApp && digits.length >= 8 && <a className="icon-action" href={`https://wa.me/${digits}?text=${waMessage}`} target="_blank" rel="noreferrer" aria-label={`Ouvrir WhatsApp pour ${contact.name}`}><MessageCircle size={17} /></a>}<button type="button" className="icon-action" aria-label={`Supprimer ${contact.name}`} onClick={() => setWorkspace((current) => ({ ...current, contacts: current.contacts.filter((item) => item.id !== contact.id) }))}><Trash2 size={17} /></button></div>
                  </article>;
                })}
            </div>
          </>
        )}

        {section === "roadmap" && (
          <>
            <div className="section-intro"><div><span className="section-kicker">06 / VISION STRATÉGIQUE</span><h2>Feuille de route SenMenuisier</h2></div></div>
            <div className="roadmap-list">{roadmap.map(([title, detail, status], index) => <article className="roadmap-row" key={title}><span className="roadmap-number">{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{detail}</p></div><span className="roadmap-status">{status}</span></article>)}</div>
          </>
        )}
        <section className="premium-preview" aria-labelledby="premium-preview-title" style={{ marginTop: 34, padding: 22, borderRadius: 22, background: "var(--paper)", border: "1px solid var(--line)", boxShadow: "var(--shadow)" }}>
          <div className="section-intro" style={{ marginTop: 0 }}>
            <div>
              <span className="section-kicker">APERÇU VISUEL · INTERFACE PREMIUM</span>
              <h2 id="premium-preview-title">L’interface premium SenMenuisier</h2>
            </div>
            <span className="local-only">Image conservée telle quelle</span>
          </div>
          <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 4px" }}>
            <img
              src="/interface-premium.png"
              alt="Aperçu de l’interface premium SenMenuisier : accueil, meubles, portes, fenêtres, escaliers, conception, matériaux, production, estimation, livraison, passeport QR, clients et planning."
              width={1024}
              height={1536}
              style={{ display: "block", width: "100%", maxWidth: 520, height: "auto", borderRadius: 18, border: "1px solid var(--line)", boxShadow: "0 18px 48px -28px #3b291b40" }}
            />
          </div>
          <p style={{ margin: "12px 0 0", textAlign: "center", fontSize: 9, color: "var(--muted)" }}>
            Visuel fourni, conservé sans retouche — l’interface SenMenuisier reste inchangée.
          </p>
        </section>
      </main>
      {workspaceNotice && <div className="workspace-toast" role="status">{workspaceNotice}<button type="button" onClick={() => setWorkspaceNotice("")} aria-label="Fermer">×</button></div>}
      <footer className="app-footer"><span>SenMenuisier</span><i>·</i> Le savoir-faire sénégalais, connecté au monde. <i>·</i> Aperçu de conception</footer>
    </div>
  );
}
