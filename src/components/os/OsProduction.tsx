"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowRight, Camera, Check, CircleAlert, Clock, Plus, Printer, QrCode, ScanLine, Trash2,
} from "lucide-react";
import {
  nextProductionStatus, productionStages, type ProductionStatus,
} from "@/lib/workshop-workspace";
import { useOs } from "./OsContext";
import QrCodeView from "./QrCode";

const dateTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(date);
};

export default function OsProduction() {
  const os = useOs();
  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [dueDate, setDueDate] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  const jobs = os.workspace.production;
  const active = jobs.filter((job) => job.status !== "livre");
  const delivered = jobs.filter((job) => job.status === "livre");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !client.trim() || !dueDate) return;
    os.setWorkspace((current) => ({
      ...current,
      production: [{
        id: crypto.randomUUID(),
        title: title.trim(),
        client: client.trim(),
        dueDate,
        status: "preparation" as ProductionStatus,
        createdAt: new Date().toISOString(),
      }, ...current.production],
    }));
    setTitle(""); setClient(""); setDueDate("");
    os.notify("Dossier de fabrication créé et enregistré sur cet appareil.");
  }

  function advance(id: string, status: ProductionStatus) {
    const next = nextProductionStatus(status);
    os.setWorkspace((current) => ({
      ...current,
      production: current.production.map((job) => job.id === id
        ? { ...job, status: next, ...(next === "livre" ? { completedAt: new Date().toISOString() } : {}) }
        : job),
    }));
  }

  return (
    <div className="os-module">
      <header className="os-module-title">
        <div>
          <span>02 / PRODUCTION &amp; PASSEPORT QR</span>
          <h1>Production &amp; Passeport QR</h1>
          <p>
            Chaque dossier contient le client, le modèle, les matériaux, le statut, l’avancement et les
            événements de fabrication. Le passeport public reste séparé des données internes.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span className="os-chip local">{active.length} en cours</span>
          <span className="os-chip">{delivered.length} livré(s)</span>
        </div>
      </header>

      <section className="os-card">
        <div className="os-card-head">
          <span className="os-tile" aria-hidden="true"><Plus size={17} /></span>
          <h2>Créer un dossier de fabrication</h2>
        </div>
        <form className="os-form" onSubmit={submit}>
          <label>
            Nom de l’ouvrage
            <input required maxLength={100} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex. Armoire 3 Portes" />
          </label>
          <label>
            Client
            <input required maxLength={100} value={client} onChange={(event) => setClient(event.target.value)} placeholder="Nom du client" />
          </label>
          <label>
            Date promise
            <input required type="date" min={today} value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          </label>
          <button type="submit" className="os-primary" style={{ width: "auto", padding: "0 15px" }}>
            <Plus size={14} /> Créer le dossier
          </button>
        </form>
      </section>

      <section>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <h2 style={{ margin: 0, fontFamily: "var(--display)", fontSize: 16, fontWeight: 800 }}>Tableau de fabrication</h2>
          <span className="os-chip">Données locales</span>
        </div>

        {jobs.length === 0 ? (
          <div className="os-empty">
            <ScanLine size={24} />
            <b>Aucun dossier pour le moment</b>
            <p>Créez le premier ouvrage ci-dessus. Aucun faux dossier n’est préchargé.</p>
          </div>
        ) : (
          <div className="os-list">
            {jobs.map((job) => {
              const stageIndex = productionStages.findIndex((stage) => stage.id === job.status);
              const stage = productionStages[Math.max(0, stageIndex)];
              const overdue = job.status !== "livre" && job.dueDate < today;
              return (
                <article className="os-row-item" key={job.id} style={{ alignItems: "flex-start" }}>
                  <div className="grow">
                    <p style={{ fontSize: 9, letterSpacing: ".1em", fontWeight: 800, color: "#B98252" }}>
                      DOSSIER · {job.id.slice(0, 8).toUpperCase()}
                    </p>
                    <h4>{job.title}</h4>
                    <p>
                      {job.client} · Livraison promise le {job.dueDate}
                      {job.completedAt ? ` · Livré le ${dateTime(job.completedAt)}` : ""}
                    </p>
                    <div className="os-meter" style={{ marginTop: 8, maxWidth: 360 }} aria-hidden="true">
                      <span style={{ width: `${((stageIndex + 1) / productionStages.length) * 100}%` }} />
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 7, flexWrap: "wrap" }}>
                      {overdue ? (
                        <span className="os-chip warn"><Clock size={11} /> En retard</span>
                      ) : null}
                      <span className="os-chip">Étape : {stage.label}</span>
                      <span className="os-chip">Ouvert le {dateTime(job.createdAt)}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                    {job.status !== "livre" ? (
                      <button type="button" className="os-mini" onClick={() => advance(job.id, job.status)}>
                        Étape suivante <ArrowRight size={12} />
                      </button>
                    ) : (
                      <span className="os-chip local"><Check size={12} /> Livré</span>
                    )}
                    <button
                      type="button"
                      className="os-icon-btn"
                      aria-label={`Passeport QR de ${job.title}`}
                      onClick={() => os.openPasseport(job.id)}
                    >
                      <QrCode size={15} />
                    </button>
                    <button
                      type="button"
                      className="os-icon-btn danger"
                      aria-label={`Supprimer le dossier ${job.title}`}
                      onClick={() => os.setWorkspace((current) => ({
                        ...current,
                        production: current.production.filter((item) => item.id !== job.id),
                      }))}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <div className="os-grid-2">
        <section className="os-card">
          <div className="os-card-head">
            <span className="os-tile" aria-hidden="true"><QrCode size={17} /></span>
            <h2>Passeport numérique</h2>
          </div>
          <p className="os-note">
            Le QR encode un identifiant local. La page publique sécurisée, révocable, n’est pas encore
            publiée : aucun nom ni contact client n’est exposé.
          </p>
          <div className="os-qr-card" style={{ marginTop: 12 }}>
            <QrCodeView value={jobs[0] ? `SENMENUISIER:LOCAL:${jobs[0].id.slice(0, 8).toUpperCase()}` : null} size={110} />
            <button type="button" className="os-mini" onClick={() => os.openPasseport(jobs[0]?.id)}>
              <Camera size={13} /> Ouvrir le passeport
            </button>
            <button
              type="button"
              className="os-mini"
              disabled={!jobs[0]}
              onClick={() => {
                os.setPassportJob(jobs[0].id);
                os.requestPrint("label");
              }}
            >
              <Printer size={13} /> Imprimer l’étiquette
            </button>
          </div>
        </section>

        <section className="os-card">
          <div className="os-card-head">
            <span className="os-tile" aria-hidden="true"><CircleAlert size={17} /></span>
            <h2>Limites actuelles</h2>
          </div>
          <ul className="os-note" style={{ paddingLeft: 18, lineHeight: 1.9, marginTop: 4 }}>
            <li>Les dossiers sont enregistrés dans ce navigateur, pas encore synchronisés entre les membres.</li>
            <li>Le QR n’ouvre pas encore de page publique : le lien révocable nécessite un serveur.</li>
            <li>Les événements de fabrication sont horodatés localement à chaque changement d’étape.</li>
          </ul>
        </section>
      </div>

      {/* Étiquette imprimable */}
      <article className="os-print" data-active={os.printTarget === "label"} aria-hidden="true">
        {(() => {
          const job = os.workspace.production.find((item) => item.id === os.passportJob) ?? null;
          return (
            <div className="label">
              <QrCodeView
                value={job ? `SENMENUISIER:LOCAL:${job.id.slice(0, 8).toUpperCase()}` : null}
                size={174}
              />
              <b>{job ? job.title : "Aucun dossier sélectionné"}</b>
              <span className="serial">{job ? `N° ${job.id.slice(0, 8).toUpperCase()}` : "—"}</span>
              <small>
                {job ? `${job.client} · Livraison ${job.dueDate}` : "Sélectionnez un dossier de fabrication"}
              </small>
              <small>SenMenuisier · étiquette locale, données internes</small>
            </div>
          );
        })()}
      </article>
    </div>
  );
}
