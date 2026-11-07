"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight, Camera, Calculator, ChevronRight, Cog, Heart, Package,
  Ruler, ScanLine, Users, Wallet, Maximize2,
} from "lucide-react";
import { osCategories } from "@/lib/os-nav";
import { findOsModel, osModels, woodEssences } from "@/lib/os-models";
import { productionStages } from "@/lib/workshop-workspace";
import { neutralQrPayload } from "@/lib/qr";
import { useOs } from "./OsContext";
import QrCode from "./QrCode";
import Furniture3DPreview from "./Furniture3DPreview";
import OsReferenceDashboard from "./OsReferenceDashboard";

const money = (value: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(value)) + " FCFA";

function formatDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function OsHome() {
  const os = useOs();
  const model = findOsModel(os.selectedModelId);
  const [selectedCategory, setSelectedCategory] = useState("meubles");
  const [carouselPage, setCarouselPage] = useState(0);

  const activeJobs = os.workspace.production.filter((job) => job.status !== "livre");
  const pendingEstimates = os.quotes.filter((quote) => !quote.depositPaid).length;
  const latestJob = os.workspace.production[0] ?? null;

  const stageIndex = latestJob
    ? productionStages.findIndex((stage) => stage.id === latestJob.status)
    : -1;

  const pageCount = Math.max(1, Math.ceil(osModels.length / 4));
  const visibleModels = osModels.slice(carouselPage * 4, carouselPage * 4 + 4);

  const qrPayload = useMemo(() => {
    if (!latestJob) return neutralQrPayload();
    return `SENMENUISIER:LOCAL:${latestJob.id.slice(0, 8).toUpperCase()}`;
  }, [latestJob]);

  function calculateQuickEstimate() {
    os.notify(
      "Le calcul exige un prix de panneau réel : ouvrez l’onglet Estimation, où vous saisissez le prix, les pertes, la main-d’œuvre et la marge. Aucun tarif n’est deviné ici.",
    );
    os.go("sante");
  }

  return (
    <div className="os-module">
      <OsReferenceDashboard />
      <h2 className="os-existing-title">Votre espace atelier</h2>
      <div className="os-page">
        <div className="os-col-main">
          {/* ---------- Bandeau d'accueil ---------- */}
          <section className="os-hero" aria-labelledby="os-hero-title">
            <img className="os-hero-img" src="/os/hero-atelier.jpg" alt="" aria-hidden="true" />
            <div>
              <h1 id="os-hero-title">Transformez<br />vos idées en réalité</h1>
              <p>Concevez · Estimez · Produisez · Livrez</p>
              <button type="button" className="os-hero-cta" onClick={os.openExpress}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
                Nouveau projet
              </button>
            </div>
            <p className="os-hero-quote">Le bois,<br />une histoire qui dure.</p>
          </section>

          {/* ---------- Catégories ---------- */}
          <section className="os-cats" aria-label="Catégories d’ouvrages">
            {osCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                className="os-cat"
                aria-pressed={selectedCategory === category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  if (category.modelId) {
                    os.selectModel(category.modelId);
                    os.notify(`Catégorie « ${category.label} » : le catalogue s’ouvrira sur « ${findOsModel(category.modelId).title} ».`);
                  } else {
                    os.notify(`Catégorie « ${category.label} » : aucun modèle chiffré dans le catalogue pour l’instant. Aucun contenu n’est inventé.`);
                  }
                }}
              >
                <img src={category.image} alt="" aria-hidden="true" />
                <b>{category.label}</b>
              </button>
            ))}
          </section>

          {/* ---------- Modèles populaires ---------- */}
          <section className="os-card" aria-labelledby="os-models-title">
            <div className="os-card-head">
              <span className="os-flame" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.4 2.2c.3 2.3-.5 3.9-1.9 5.4-1.5 1.6-3.5 3.1-3.5 5.8 0 1 .3 1.9.8 2.6-.2-1.4.3-2.6 1.3-3.6.2 1.9 1.2 2.8 2.2 3.8 1 1 1.9 2 1.9 3.6 0 .6-.1 1.1-.4 1.6 2.5-.9 4.2-3.3 4.2-6.1 0-5-3.3-7.9-4.6-13.1z" />
                  <path d="M8.1 8.9C6.6 10.4 6 12.2 6 14.1c0 2.5 1.4 4.6 3.4 5.5-.5-1-.8-2-.8-3.1 0-2.3 1.1-3.9 2.1-5.2-1.2.2-2.1-.9-2.6-2.4z" opacity=".55" />
                </svg>
              </span>
              <h2 id="os-models-title">Modèles populaires</h2>
              <button type="button" className="os-head-link" onClick={() => os.go("catalogue")}>
                Voir tout <ArrowRight size={13} />
              </button>
            </div>

            <div className="os-models">
              {visibleModels.map((item) => (
                <article className="os-model" key={item.id}>
                  <div className="os-model-media">
                    <img src={item.image} alt={`${item.title} — ${item.short}`} loading="lazy" />
                    <button
                      type="button"
                      className="os-fav"
                      aria-pressed={os.favorites.includes(item.id)}
                      aria-label={os.favorites.includes(item.id) ? `Retirer ${item.title} des favoris` : `Ajouter ${item.title} aux favoris`}
                      onClick={() => os.toggleFavorite(item.id)}
                    >
                      <Heart size={12} fill={os.favorites.includes(item.id) ? "currentColor" : "none"} />
                    </button>
                  </div>
                  <div className="os-model-body">
                    <b>{item.title}</b>
                    <small>{item.short}</small>
                    <button
                      type="button"
                      className="os-model-use"
                      onClick={() => {
                        os.selectModel(item.id);
                        os.go("catalogue");
                      }}
                    >
                      Utiliser ce modèle
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="os-dots" role="tablist" aria-label="Pages de modèles">
              {Array.from({ length: 7 }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className="os-dot"
                  role="tab"
                  aria-selected={carouselPage === index}
                  aria-current={carouselPage === index}
                  aria-label={`Page ${index + 1}`}
                  onClick={() => {
                    if (index < pageCount) setCarouselPage(index);
                    else os.notify("Les pages suivantes du carrousel ne sont pas encore alimentées : quatre modèles existent aujourd’hui.");
                  }}
                />
              ))}
            </div>
          </section>

          {/* ---------- Concevez votre meuble ---------- */}
          <section className="os-config" aria-labelledby="os-config-title">
            <div className="os-config-head">
              <span className="os-tile" aria-hidden="true">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 20 20 4v16z" strokeLinejoin="round" />
                  <path d="M8.5 15.5h4M12 12V8.5" strokeLinecap="round" opacity=".8" />
                </svg>
              </span>
              <div>
                <h2 id="os-config-title">Concevez votre meuble</h2>
                <p>Ajustez les dimensions et les matériaux pour préparer votre estimation</p>
              </div>
            </div>

            <div className="os-config-grid">
              <div className="os-draft" aria-label="Aperçu volumétrique du meuble">
                <Furniture3DPreview
                  width={os.dimensions.width}
                  height={os.dimensions.height}
                  depth={os.dimensions.depth}
                  material={os.material}
                  finish={os.finish}
                />
              </div>

              <div className="os-config-form">
                <div className="os-config-row">
                  <label className="os-field">
                    <span>Largeur (cm)</span>
                    <input
                      type="number"
                      min={20}
                      max={600}
                      value={os.dimensions.width}
                      onChange={(event) => os.setDimension("width", event.target.value)}
                    />
                  </label>
                  <label className="os-field">
                    <span>Hauteur (cm)</span>
                    <input
                      type="number"
                      min={20}
                      max={400}
                      value={os.dimensions.height}
                      onChange={(event) => os.setDimension("height", event.target.value)}
                    />
                  </label>
                  <label className="os-field">
                    <span>Profondeur (cm)</span>
                    <input
                      type="number"
                      min={10}
                      max={300}
                      value={os.dimensions.depth}
                      onChange={(event) => os.setDimension("depth", event.target.value)}
                    />
                  </label>
                </div>

                <div className="os-config-row-2">
                  <label className="os-field">
                    <span>Essence de bois</span>
                    <select value={os.material} onChange={(event) => os.setMaterial(event.target.value)}>
                      {woodEssences.map((essence) => <option key={essence} value={essence}>{essence}</option>)}
                    </select>
                  </label>
                  <label className="os-field">
                    <span>Finition</span>
                    <select value={os.finish} onChange={(event) => os.setFinish(event.target.value)}>
                      {["Vernis mat", "Vernis satiné", "Huile naturelle", "Laque mate", "Brut poncé"].map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="os-config-actions">
                  <button
                    type="button"
                    className="os-gold"
                    onClick={() => {
                      os.selectModel(model.id);
                      os.go("catalogue");
                      os.notify("Le modèle et les cotes sont repris dans le catalogue. Le rendu 3D sera ajouté dans une prochaine étape.");
                    }}
                  >
                    <VisualIcon /> Préparer les cotes
                  </button>
                  <button
                    type="button"
                    className="os-square"
                    aria-label="Ouvrir le catalogue en grand"
                    onClick={() => os.go("catalogue")}
                  >
                    <Maximize2 size={15} />
                  </button>
                </div>
                <p className="os-config-note">
                  Aperçu volumétrique interactif indicatif. Le plan de débit et les assemblages techniques détaillés restent à intégrer.
                </p>
              </div>
            </div>
          </section>

          {/* ---------- Rangée basse ---------- */}
          <div className="os-row">
            <section className="os-card" aria-labelledby="os-quick-title">
              <div className="os-card-head">
                <span className="os-tile" aria-hidden="true"><Calculator size={17} /></span>
                <div>
                  <h2 id="os-quick-title">Estimation rapide</h2>
                </div>
              </div>
              <p className="os-sub">Calculez vos coûts en quelques clics</p>
              <div className="os-quick">
                <label htmlFor="quick-model">
                  Type de meuble
                  <select
                    id="quick-model"
                    value={os.selectedModelId}
                    onChange={(event) => os.selectModel(event.target.value)}
                  >
                    {osModels.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
                  </select>
                </label>
                <label htmlFor="quick-wood">
                  Essence de bois
                  <select id="quick-wood" value={os.material} onChange={(event) => os.setMaterial(event.target.value)}>
                    {woodEssences.map((essence) => <option key={essence} value={essence}>{essence}</option>)}
                  </select>
                </label>
                <div>
                  <span style={{ display: "block", fontSize: 10.5, fontWeight: 600, color: "#6F6357", marginBottom: 5 }}>Dimensions</span>
                  <div className="os-dims">
                    <input
                      aria-label="Largeur en centimètres"
                      type="number"
                      min={20}
                      value={os.dimensions.width}
                      onChange={(event) => os.setDimension("width", event.target.value)}
                    />
                    <i aria-hidden="true">×</i>
                    <input
                      aria-label="Hauteur en centimètres"
                      type="number"
                      min={20}
                      value={os.dimensions.height}
                      onChange={(event) => os.setDimension("height", event.target.value)}
                    />
                    <i aria-hidden="true">×</i>
                    <input
                      aria-label="Profondeur en centimètres"
                      type="number"
                      min={10}
                      value={os.dimensions.depth}
                      onChange={(event) => os.setDimension("depth", event.target.value)}
                    />
                    <i aria-hidden="true">cm</i>
                  </div>
                </div>
                <button type="button" className="os-primary" onClick={calculateQuickEstimate}>
                  Calculer l’estimation <ArrowRight size={14} />
                </button>
                {pendingEstimates > 0 ? (
                  <p className="os-result">
                    <b>{pendingEstimates} devis en attente</b>
                    <span>Les devis enregistrés sur cet appareil restent à confirmer avec le client.</span>
                  </p>
                ) : null}
              </div>
            </section>

            <section className="os-card" aria-labelledby="os-track-title">
              <div className="os-card-head">
                <span className="os-tile" aria-hidden="true"><Cog size={17} /></span>
                <h2 id="os-track-title">Suivi de production</h2>
              </div>
              {latestJob ? (
                <>
                  <p className="os-sub">
                    <b style={{ color: "#33291E" }}>{latestJob.title}</b> · {latestJob.client}
                  </p>
                  <div className="os-timeline">
                    {productionStages.slice(0, 5).map((stage, index) => {
                      const done = stageIndex >= index;
                      return (
                        <div
                          className="os-step"
                          key={stage.id}
                          data-done={done}
                          data-current={stageIndex === index}
                        >
                          <span className="os-step-ring" aria-hidden="true" />
                          <div>
                            <b>{stage.label}</b>
                            <small>
                              {done
                                ? index === stageIndex
                                  ? "Étape en cours"
                                  : "Étape validée"
                                : "En attente"}
                            </small>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button type="button" className="os-mini" style={{ marginTop: 12 }} onClick={() => os.go("production")}>
                    Ouvrir le dossier <ChevronRight size={13} />
                  </button>
                </>
              ) : (
                <div>
                  <div className="os-timeline">
                    {productionStages.slice(0, 5).map((stage) => (
                      <div className="os-step" key={stage.id} data-done="false">
                        <span className="os-step-ring" aria-hidden="true" />
                        <div>
                          <b>{stage.label}</b>
                          <small>En attente</small>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="os-note" style={{ marginTop: 9 }}>
                    Aucun dossier en fabrication : le suivi s’affichera dès la création d’un ouvrage.
                  </p>
                  <button type="button" className="os-mini" style={{ marginTop: 8 }} onClick={() => os.go("production")}>
                    <Package size={12} /> Créer un dossier <ChevronRight size={12} />
                  </button>
                </div>
              )}
            </section>

            <section className="os-card" aria-labelledby="os-qr-title">
              <div className="os-card-head">
                <span className="os-tile" aria-hidden="true"><ScanLine size={17} /></span>
                <div>
                  <h2 id="os-qr-title">Scan &amp; Suivez</h2>
                </div>
              </div>
              <p className="os-sub">Un passeport QR pour chaque ouvrage</p>
              <div className="os-qr-card">
                <div className="os-plaque">
                  <div className="os-plaque-frame">
                    <QrCode value={qrPayload} size={96} title={`QR de référence ${qrPayload}`} />
                  </div>
                  <div className="os-plaque-meta">
                    <b>{latestJob ? latestJob.title : model.title}</b>
                    <small>
                      {latestJob ? `N° ${latestJob.id.slice(0, 8).toUpperCase()}` : "Aperçu local — non publié"}
                    </small>
                  </div>
                </div>
                <button
                  type="button"
                  className="os-primary"
                  onClick={() => os.openPasseport(latestJob?.id)}
                >
                  <Camera size={15} /> Scanner un code
                </button>
              </div>
            </section>
          </div>

          {/* ---------- Bannière essences ---------- */}
          <section className="os-banner" aria-labelledby="os-banner-title">
            <div className="os-banner-text">
              <b id="os-banner-title">Des essences africaines, des réalisations exceptionnelles.</b>
              <small>Iroko · Khaya · Vène · Teck · Fromager</small>
            </div>
            <button type="button" className="os-banner-cta" onClick={() => os.go("prix")}>
              Découvrir nos essences <ChevronRight size={14} />
            </button>
          </section>
        </div>

        {/* ---------- Colonne latérale ---------- */}
        <aside className="os-col-side" aria-label="Mon atelier">
          <section className="os-side-card">
            <h3>Mon atelier</h3>
            <p className="os-status"><i aria-hidden="true" /> Aperçu local</p>
            <div className="os-side-media">
              <img src="/os/hero-atelier.jpg" alt="Atelier de menuiserie" loading="lazy" />
            </div>
            <div className="os-stats">
              <div className="os-stat">
                <span className="os-stat-icon sage" aria-hidden="true"><Package size={15} /></span>
                <div>
                  <b>{activeJobs.length}</b>
                  <small>Projets en cours</small>
                </div>
              </div>
              <div className="os-stat">
                <span className="os-stat-icon sand" aria-hidden="true"><Users size={15} /></span>
                <div>
                  <b>{os.workspace.contacts.length}</b>
                  <small>Clients actifs</small>
                </div>
              </div>
              <div className="os-stat">
                <span className="os-stat-icon blush" aria-hidden="true"><Calculator size={15} /></span>
                <div>
                  <b>{pendingEstimates}</b>
                  <small>Estimations à valider</small>
                </div>
              </div>
              <div className="os-stat">
                <span className="os-stat-icon mint" aria-hidden="true"><Wallet size={15} /></span>
                <div>
                  <b>Non mesurée</b>
                  <small>Satisfaction</small>
                </div>
              </div>
            </div>
            <p className="os-stat-note">
              Compteurs calculés sur les dossiers réellement enregistrés dans ce navigateur.
              Aucun chiffre de démonstration n’est affiché.
            </p>
          </section>

          <figure className="os-quote-card">
            <span className="os-mark" aria-hidden="true">“</span>
            <blockquote>Bien outillé, à moitié réalisé.</blockquote>
            <hr />
            <figcaption>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M3.5 20.5 12 12" strokeLinecap="round" />
                <path d="M9.5 6.5 15 4l5 5-2.5 5.5z" strokeLinejoin="round" />
                <path d="M12.5 9.5 15 12" opacity=".6" />
              </svg>
              Proverbe de menuisier
            </figcaption>
          </figure>
        </aside>
      </div>
    </div>
  );
}

function VisualIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
      <path d="M4 7.5l8 4.5 8-4.5M12 12v9" opacity=".6" />
    </svg>
  );
}

function DraftSketch({ width, height, depth }: { width: string; height: string; depth: string }) {
  return (
    <svg viewBox="0 0 300 200" role="img" aria-label={`Croquis coté ${width} × ${height} × ${depth} cm`}>
      <defs>
        <linearGradient id="osDraftFace" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F7F1E4" />
          <stop offset="1" stopColor="#E7DCC6" />
        </linearGradient>
      </defs>
      {/* meuble */}
      <g stroke="#4A3A2A" strokeWidth="1.2" fill="url(#osDraftFace)" strokeLinejoin="round">
        <path d="M62 62h150v96H62z" />
        <path d="M62 62l26-18h150l-26 18" fill="#F2EADB" />
        <path d="M212 62l26-18v96l-26 18" fill="#E2D5BE" />
      </g>
      {/* portes */}
      <g stroke="#8B7457" strokeWidth="1" fill="none" opacity=".9">
        <path d="M62 92h150M112 92v66M162 92v66" />
        <path d="M88 62v96M137 62v96M187 62v96" opacity=".25" />
        <rect x="72" y="102" width="30" height="46" rx="2" />
        <rect x="122" y="102" width="30" height="46" rx="2" />
        <rect x="172" y="102" width="30" height="46" rx="2" />
      </g>
      {/* cotes */}
      <g stroke="#5B4A34" strokeWidth=".9" fill="#3E3226" fontSize="8.5" fontFamily="Plus Jakarta Sans, sans-serif">
        <path d="M62 40h150" />
        <path d="M62 35v10M212 35v10" />
        <text x="120" y="34" stroke="none">{width} cm</text>
        <path d="M40 62v96" />
        <path d="M35 62h10M35 158h10" />
        <text x="12" y="114" stroke="none">{height} cm</text>
        <path d="M238 44l26 -18" />
        <path d="M232 42l8-4M258 30l8-4" />
        <text x="248" y="24" stroke="none">{depth} cm</text>
        <path d="M62 158l26 18h150" strokeDasharray="3 3" opacity=".55" />
        <path d="M72 176l-4 10M82 176l-4 10" strokeLinecap="round" opacity=".7" />
      </g>
    </svg>
  );
}

export { money as osMoney, formatDateTime as osFormatDateTime };
