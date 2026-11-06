import Link from "next/link";
import { Axe, Hammer, Ruler, TreePine, Wrench } from "lucide-react";
import { productSpaces } from "@/lib/product-spaces";

export default function VitrinePage() {
  return (
    <main className="public-site">
      <header className="public-header">
        <Link className="public-brand" href="/">
          <span className="brand-mark">SM</span>
          <span><b>SenMenuisier</b><small>Le savoir-faire sénégalais, connecté au monde.</small></span>
        </Link>
        <nav aria-label="Navigation du site">
          <a href="#espaces">Les espaces</a>
          <a href="#atelier">Notre vision</a>
          <Link className="public-header-cta" href="/">Aperçu atelier</Link>
        </nav>
      </header>

      <section className="public-hero">
        <div className="public-hero-copy">
          <span className="public-eyebrow"><TreePine size={16} /> L’OS DE LA MENUISERIE AFRICAINE</span>
          <h1>Le savoir-faire sénégalais, <em>connecté au monde.</em></h1>
          <p>SenMenuisier ambitionne de réunir la conception, les devis, les matières, la fabrication et la relation client dans un espace de travail clair, pensé pour les ateliers.</p>
          <div className="public-actions">
            <Link className="public-primary" href="/">Découvrir l’aperçu atelier <Hammer size={16} /></Link>
            <a className="public-secondary" href="#espaces">Explorer les six espaces</a>
          </div>
          <span className="public-disclaimer">Préversion de conception · les fonctions métier sont en cours de construction</span>
        </div>
        <div className="timber-visual" role="img" aria-label="Composition de planches de bois et de panneaux de menuiserie">
          <div className="timber-board board-back"><span>BOIS MASSIF</span></div>
          <div className="timber-board board-middle"><span>MESURE · DÉBIT · ASSEMBLAGE</span></div>
          <div className="timber-board board-front"><span>SENMENUISIER</span></div>
          <div className="timber-measure"><Ruler size={22} /><span>FAIT POUR L’ATELIER</span></div>
        </div>
      </section>

      <section className="public-section" id="espaces">
        <div className="public-section-heading">
          <span className="public-eyebrow">UN OUTIL, SIX ESPACES MÉTIER</span>
          <h2>Tout le parcours du meuble, avec méthode.</h2>
          <p>Les fonctions sont construites autour des gestes et des réalités de l’atelier, pas autour d’indicateurs inventés.</p>
        </div>
        <div className="public-feature-grid">
          {productSpaces.map(({ title, summary, icon: Icon }, index) => (
            <article className="public-feature" key={title}>
              <span className="public-feature-number">0{index + 1}</span>
              <div className="public-feature-icon"><Icon size={24} /></div>
              <h3>{title}</h3>
              <p>{summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="public-workshop" id="atelier">
        <div className="public-workshop-icon"><Wrench size={28} /></div>
        <div>
          <span className="public-eyebrow">CONSTRUIT AVEC EXIGENCE</span>
          <h2>La technologie doit simplifier le geste du menuisier.</h2>
          <p>Pas de faux stocks, de prix sans source ou de QR décoratif. Chaque fonction devra être utile, lisible sur téléphone, protégée par les bons droits et confirmée par des données réellement enregistrées.</p>
        </div>
        <Link className="public-primary" href="/">Voir l’aperçu de l’application <Axe size={16} /></Link>
      </section>

      <footer className="public-footer">
        <span className="public-footer-brand">SenMenuisier</span>
        <span>Le savoir-faire sénégalais, connecté au monde.</span>
        <span>Préversion · 2026</span>
      </footer>
    </main>
  );
}
