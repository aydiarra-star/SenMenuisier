"use client";

import { ArrowDown, ArrowRight, Axe, Calculator, Hammer, Layers, Ruler, ScanLine } from "lucide-react";
import { osModels, woodEssences, woodFinishes } from "@/lib/os-models";
import { useOs } from "./OsContext";

const categories = [
  { label: "Chambres", model: "lit" },
  { label: "Cuisines", model: "cuisine" },
  { label: "Rangements", model: "armoire" },
  { label: "Bureaux", model: "bureau" },
];

export default function OsReferenceDashboard() {
  const os = useOs();
  const selected = osModels.find((model) => model.id === os.selectedModelId) ?? osModels[0];
  const activeJobs = os.workspace.production.filter((job) => job.status !== "livre").length;

  return (
    <div className="ref-dashboard" aria-label="Espace de conception SenMenuisier">
      <div className="ref-top">
        <div className="ref-workshop ref-panel">
          <div><strong>Espace atelier</strong><small>{activeJobs} projet{activeJobs === 1 ? "" : "s"} en cours · aperçu local</small></div>
          <img src="/os/hero-atelier.jpg" alt="" />
        </div>
        <button className="ref-health ref-panel" type="button" onClick={() => os.go("sante")}>
          <span>Score Santé</span><Ruler aria-hidden="true" /><small>Ouvrir l’espace</small>
        </button>
        <button className="ref-estimate ref-panel" type="button" onClick={() => os.go("sante")}>
          <Calculator aria-hidden="true" /><strong>Préparer estimation</strong>
        </button>
      </div>

      <section className="ref-hero ref-panel" aria-labelledby="ref-title">
        <div className="ref-hero-copy"><p>L’OS DE LA MENUISERIE AFRICAINE</p><h1 id="ref-title">Du modèle à<br />l’ouvrage sur<br />mesure.</h1></div>
        <img className="ref-hero-image" src={selected.image} alt={selected.title} />
        <div className="ref-categories" aria-label="Catégories de meubles">
          {categories.map((category) => {
            const model = osModels.find((item) => item.id === category.model)!;
            return <button type="button" key={category.label} aria-pressed={os.selectedModelId === model.id} onClick={() => os.selectModel(model.id)}><img src={model.image} alt="" /><span>{category.label}</span></button>;
          })}
        </div>
      </section>

      <section className="ref-models ref-panel" aria-label="Sélection du modèle">
        {osModels.map((model) => <button key={model.id} type="button" aria-pressed={os.selectedModelId === model.id} onClick={() => os.selectModel(model.id)}><img src={model.image} alt="" /><span>{model.title}</span></button>)}
      </section>

      <section className="ref-adjust ref-panel" aria-labelledby="ref-adjust-title">
        <h2 id="ref-adjust-title"><Hammer size={20} aria-hidden="true" /> AJUSTEMENT PARAMÉTRIQUE</h2>
        <div className="ref-adjust-grid">
          <div className="ref-dimensions">
            {([ ["height", "Hauteur", 400], ["width", "Largeur", 600], ["depth", "Profondeur", 300] ] as const).map(([key, label, max]) => (
              <label key={key}><span>{label} <b>{os.dimensions[key]} cm</b></span><input type="range" min="20" max={max} value={os.dimensions[key]} onChange={(event) => os.setDimension(key, event.target.value)} /></label>
            ))}
          </div>
          <div className="ref-materials">
            <label>Essence de bois<select value={os.material} onChange={(event) => os.setMaterial(event.target.value)}>{woodEssences.map((wood) => <option key={wood}>{wood}</option>)}</select></label>
            <label>Finition<select value={os.finish} onChange={(event) => os.setFinish(event.target.value)}>{woodFinishes.map((finish) => <option key={finish}>{finish}</option>)}</select></label>
          </div>
          <div className="ref-measure"><strong>Dimensions indicatives</strong><span>Hauteur <b>{os.dimensions.height} cm</b></span><span>Largeur <b>{os.dimensions.width} cm</b></span><span>Profondeur <b>{os.dimensions.depth} cm</b></span><small>À vérifier sur place</small></div>
        </div>
      </section>

      <div className="ref-bottom">
        <button className="ref-panel ref-info" type="button" onClick={() => os.go("prix")}><h2><Layers size={20} aria-hidden="true" /> PROVENANCE &amp; MATÉRIAUX</h2><div><span><b>Essences de bois</b><small>Découvrir les matériaux</small><ArrowRight aria-hidden="true" /></span><Axe className="ref-large-icon" aria-hidden="true" /></div></button>
        <button className="ref-panel ref-info" type="button" onClick={() => os.go("production")}><h2><ScanLine size={20} aria-hidden="true" /> Production &amp; Passeport QR</h2><div><span><b>Suivi de l’ouvrage</b><small>Passeport local et fabrication</small><ArrowDown aria-hidden="true" /></span><ScanLine className="ref-large-icon" aria-hidden="true" /></div></button>
      </div>
      <nav className="ref-steps" aria-label="Étapes du projet"><button type="button" onClick={() => os.go("catalogue")}>Catalogue</button><ArrowRight size={16} /><a href="#ref-adjust-title" aria-current="step">Conception</a><ArrowRight size={16} /><button type="button" onClick={() => os.go("production")}>Fabrication</button><ArrowRight size={16} /><button type="button" onClick={() => os.notify("Le suivi d’installation n’est pas encore disponible.")}>Installation</button></nav>
    </div>
  );
}
