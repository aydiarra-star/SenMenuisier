"use client";

import { useMemo, useRef, useState } from "react";
import {
  Bell, ChevronDown, Github, Instagram, Linkedin, Moon, Search, Sun, Youtube,
} from "lucide-react";
import { osNavItems, type OsNavItem } from "@/lib/os-nav";
import { osModels } from "@/lib/os-models";
import { useOs } from "./OsContext";
import OsHome from "./OsHome";
import OsCatalogue from "./OsCatalogue";
import OsProduction from "./OsProduction";
import OsSante from "./OsSante";
import OsPrix from "./OsPrix";
import OsCrm from "./OsCrm";
import OsRoadmap from "./OsRoadmap";
import OsExpressModal from "./OsExpressModal";
import OsPasseportModal from "./OsPasseportModal";
import type { OsSectionId } from "./types";

/** Un seul onglet est marqué actif : celui qui porte le module affiché. */
function navIdForSection(section: OsSectionId): string {
  switch (section) {
    case "catalogue": return "catalogues";
    case "production": return "production";
    case "sante": return "estimation";
    case "prix": return "materiaux";
    case "crm": return "clients";
    case "roadmap": return "apprendre";
    default: return "accueil";
  }
}

export default function OsShell() {
  const os = useOs();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const activeNav = navIdForSection(os.section);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (term.length < 2) return [];
    const navHits = osNavItems
      .filter((item) => item.label.toLowerCase().includes(term))
      .map((item) => ({ key: `nav-${item.id}`, label: item.label, hint: "Rubrique", run: () => openItem(item) }));
    const modelHits = osModels
      .filter((model) => `${model.title} ${model.short}`.toLowerCase().includes(term))
      .map((model) => ({
        key: `model-${model.id}`,
        label: model.title,
        hint: "Modèle",
        run: () => {
          os.selectModel(model.id);
          os.go("catalogue");
        },
      }));
    const jobHits = os.workspace.production
      .filter((job) => `${job.title} ${job.client}`.toLowerCase().includes(term))
      .map((job) => ({
        key: `job-${job.id}`,
        label: `${job.title} · ${job.client}`,
        hint: "Dossier",
        run: () => os.go("production"),
      }));
    const contactHits = os.workspace.contacts
      .filter((contact) => `${contact.name} ${contact.city}`.toLowerCase().includes(term))
      .map((contact) => ({
        key: `contact-${contact.id}`,
        label: contact.name,
        hint: "Client",
        run: () => os.go("crm"),
      }));
    return [...navHits, ...modelHits, ...jobHits, ...contactHits].slice(0, 8);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, os.workspace.production, os.workspace.contacts, os]);

  function openItem(item: OsNavItem, current?: string) {
    if (item.id === "accueil") {
      os.go("accueil");
      return;
    }
    const isActive = item.id === (current ?? activeNav);
    if (isActive) {
      os.go("accueil");
      return;
    }
    if (item.module) {
      os.go(item.module);
      return;
    }
    os.notify(`« ${item.label} » n’est pas encore disponible dans cet espace. Aucune page n’est simulée.`);
  }

  return (
    <div className="os-root" data-theme={os.theme}>
      <aside className="os-rail">
        <div className="os-brand">
          <span className="os-brand-mark"><span>SM</span></span>
          <span className="os-brand-text">
            <b>SenMenuisier</b>
            <small>Du bois aux belles réalisations</small>
          </span>
        </div>

        <nav className="os-nav" aria-label="Navigation principale">
          {osNavItems.map((item) => {
            const Icon = item.icon;
            const current = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className="os-nav-item"
                aria-current={current ? "page" : undefined}
                onClick={() => openItem(item, activeNav)}
              >
                <Icon size={17} strokeWidth={1.7} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="os-rail-foot">
          <div className="os-rail-motto">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
              <path d="M12 3 8.5 8h2L7 13h2.5L6 18h12l-3.5-5H17l-3.5-5h2z" strokeLinejoin="round" />
              <path d="M12 18v3" strokeLinecap="round" />
            </svg>
            <p>Le bois<br />construit<br />nos rêves</p>
            <span className="os-rail-flag" aria-label="Sénégal"><i /><i /><i /></span>
          </div>
          <div className="os-rail-meta">
            <b>SenMenuisier</b>
            <small>v1.0.0 • 2026</small>
            <button
              type="button"
              aria-label="Aperçu de conception — aucune autre version disponible"
              onClick={() => os.notify("Aucune autre version n’est installée sur cet appareil.")}
            >
              <ChevronDown size={13} />
            </button>
          </div>
        </div>
      </aside>

      <div className="os-main">
        <header className="os-header">
          <div className="os-search">
            <div className="os-search-field">
              <Search size={15} aria-hidden="true" />
              <input
                ref={searchRef}
                type="search"
                value={query}
                placeholder="Rechercher un modèle, un projet, un client..."
                aria-label="Rechercher un modèle, un projet, un client"
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => window.setTimeout(() => setSearchOpen(false), 150)}
              />
            </div>
            {searchOpen && query.trim().length >= 2 ? (
              <div className="os-search-results" role="listbox">
                {results.length === 0 ? (
                  <p className="os-search-empty">Aucun résultat local pour « {query.trim()} ».</p>
                ) : (
                  results.map((result) => (
                    <button
                      key={result.key}
                      type="button"
                      role="option"
                      aria-selected={false}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        result.run();
                        setSearchOpen(false);
                        setQuery("");
                      }}
                    >
                      {result.label}
                      <span>{result.hint}</span>
                    </button>
                  ))
                )}
              </div>
            ) : null}
          </div>

          <div className="os-header-actions">
            <button
              type="button"
              className="os-theme"
              data-theme={os.theme}
              onClick={os.toggleTheme}
              aria-label={os.theme === "dark" ? "Passer au thème clair" : "Passer au thème sombre"}
              aria-pressed={os.theme === "dark"}
            >
              <span className="os-theme-thumb" aria-hidden="true" />
              <span className="os-theme-icons" aria-hidden="true">
                <Sun />
                <Moon />
              </span>
            </button>

            <button
              type="button"
              className="os-bell"
              aria-label="Notifications"
              onClick={() => {
                const pending = os.quotes.filter((quote) => !quote.depositPaid).length;
                os.notify(pending === 0
                  ? "Aucun devis en attente d’acompte sur cet appareil."
                  : `${pending} devis enregistré(s) sans acompte confirmé.`);
              }}
            >
              <Bell size={18} />
              {os.quotes.length > 0 ? (
                <span className="os-bell-badge" aria-label={`${os.quotes.length} notification(s)`}>
                  {Math.min(os.quotes.length, 9)}
                </span>
              ) : null}
            </button>

            <button
              type="button"
              className="os-profile"
              onClick={() => os.notify("Profil « Wolf · Mon atelier » : aucune authentification n’est encore active, les données restent sur cet appareil.")}
            >
              <span className="os-avatar" aria-hidden="true">W</span>
              <span className="os-profile-text">
                <b>Wolf</b>
                <small>Mon atelier</small>
              </span>
              <ChevronDown size={15} aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="os-body">
          {os.section === "accueil" ? <OsHome /> : null}
          {os.section === "catalogue" ? <OsCatalogue /> : null}
          {os.section === "production" ? <OsProduction /> : null}
          {os.section === "sante" ? <OsSante /> : null}
          {os.section === "prix" ? <OsPrix /> : null}
          {os.section === "crm" ? <OsCrm /> : null}
          {os.section === "roadmap" ? <OsRoadmap /> : null}
        </div>

        <footer className="os-footer">
          <b>SenMenuisier 2026</b>
          <span className="os-sep">|</span>
          <span>Le savoir-faire sénégalais, pour un monde plus beau.</span>
          <div className="os-footer-links">
            <button type="button" onClick={() => os.notify("Interface en français. La version wolof est en cours de relecture.")}>FR</button>
            <span className="os-sep">|</span>
            <button
              type="button"
              onClick={() => os.notify("Wolof : traduction non disponible. Les libellés techniques et financiers doivent être relus par des locuteurs compétents.")}
            >
              WOLOF
            </button>
            <span className="os-sep">|</span>
            <button type="button" onClick={() => os.notify("Aide : la documentation utilisateur n’est pas encore publiée.")}>Aide</button>
            <span className="os-sep">|</span>
            <button type="button" onClick={() => os.notify("Contact : aucune adresse de support n’est configurée dans cet aperçu.")}>Contact</button>
          </div>
          <div className="os-socials" aria-label="Réseaux sociaux">
            <span aria-label="YouTube — lien non configuré" title="YouTube — lien non configuré"><Youtube size={16} /></span>
            <span aria-label="Instagram — lien non configuré" title="Instagram — lien non configuré"><Instagram size={16} /></span>
            <span aria-label="GitHub — lien non configuré" title="GitHub — lien non configuré"><Github size={16} /></span>
            <span aria-label="LinkedIn — lien non configuré" title="LinkedIn — lien non configuré"><Linkedin size={16} /></span>
          </div>
        </footer>
      </div>

      <OsExpressModal />
      <OsPasseportModal />

      {os.notice ? (
        <div className="os-toast" role="status">
          <span>{os.notice}</span>
          <button type="button" onClick={os.clearNotice} aria-label="Fermer">×</button>
        </div>
      ) : null}

    </div>
  );
}
