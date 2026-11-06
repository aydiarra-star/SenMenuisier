"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { CircleAlert, Check, Plus, Tag, TreePine, Trash2 } from "lucide-react";
import { useOs } from "./OsContext";

const money = (value: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(value)) + " FCFA";

const regions = [
  "Dakar", "Thiès", "Diourbel", "Saint-Louis", "Louga", "Fatick", "Kaolack", "Kaffrine",
  "Tambacounda", "Kédougou", "Kolda", "Sédhiou", "Ziguinchor", "Matam",
];

const categories = ["Bois & panneaux", "Quincaillerie", "Finitions & consommables", "Prix de vente d’ouvrages"];
const units = ["unité", "panneau", "m²", "mètre linéaire", "litre", "kg", "lot"];

export default function OsPrix() {
  const os = useOs();
  const [category, setCategory] = useState(categories[0]);
  const [item, setItem] = useState("");
  const [region, setRegion] = useState("Dakar");
  const [quality, setQuality] = useState("");
  const [unit, setUnit] = useState("panneau");
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const today = new Date().toISOString().slice(0, 10);

  const [filter, setFilter] = useState("all");
  const observations = os.workspace.prices;
  const visible = filter === "all" ? observations : observations.filter((entry) => entry.category === filter);

  const validated = observations.filter((entry) => entry.status === "validated");
  const pending = observations.filter((entry) => entry.status === "pending");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(amount);
    if (!item.trim() || !quality.trim() || !source.trim() || !date) return;
    if (!Number.isFinite(value) || value <= 0) return;
    os.setWorkspace((current) => ({
      ...current,
      prices: [{
        id: crypto.randomUUID(),
        category, item: item.trim(), region, quality: quality.trim(), unit,
        price: value, source: source.trim(), observedAt: date, status: "pending" as const,
      }, ...current.prices],
    }));
    setItem(""); setQuality(""); setAmount(""); setSource("");
    os.notify("Observation ajoutée, en attente de vérification.");
  }

  return (
    <div className="os-module">
      <header className="os-module-title">
        <div>
          <span>04 / BASE DE PRIX NATIONALE</span>
          <h1>Base de Prix Nationale</h1>
          <p>
            Chaque relevé porte son unité, sa zone, sa qualité, sa date, sa provenance et son statut de
            modération. Aucune valeur n’est publiée comme tarif national.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span className="os-chip local">{validated.length} vérifié(s) sur cet appareil</span>
          <span className="os-chip warn">{pending.length} en attente</span>
        </div>
      </header>

      <section className="os-card">
        <div className="os-card-head">
          <span className="os-tile" aria-hidden="true"><Plus size={17} /></span>
          <h2>Ajouter un prix constaté</h2>
        </div>
        <form className="os-form" onSubmit={submit}>
          <label>
            Catégorie
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
            </select>
          </label>
          <label>
            Matériau / article
            <input required maxLength={100} value={item} onChange={(event) => setItem(event.target.value)} placeholder="Ex. MDF standard 18 mm" />
          </label>
          <label>
            Région
            <select value={region} onChange={(event) => setRegion(event.target.value)}>
              {regions.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
            </select>
          </label>
          <label>
            Qualité / référence
            <input required maxLength={100} value={quality} onChange={(event) => setQuality(event.target.value)} placeholder="Épaisseur, essence, gamme…" />
          </label>
          <label>
            Unité
            <select value={unit} onChange={(event) => setUnit(event.target.value)}>
              {units.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
            </select>
          </label>
          <label>
            Prix constaté (FCFA)
            <input required type="number" min="1" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} />
          </label>
          <label>
            Source vérifiable
            <input required maxLength={160} value={source} onChange={(event) => setSource(event.target.value)} placeholder="Fournisseur, facture ou relevé" />
          </label>
          <label>
            Date du relevé
            <input required type="date" max={today} value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <button type="submit" className="os-primary" style={{ width: "auto", padding: "0 15px" }}>
            <Plus size={14} /> Ajouter l’observation
          </button>
        </form>
      </section>

      <section>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
          <h2 style={{ margin: 0, fontFamily: "var(--display)", fontSize: 16, fontWeight: 800 }}>Historique des relevés</h2>
          <div className="os-tabs" style={{ marginLeft: "auto" }}>
            <button type="button" className="os-tab" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>Tout</button>
            {categories.map((entry) => (
              <button key={entry} type="button" className="os-tab" aria-pressed={filter === entry} onClick={() => setFilter(entry)}>
                {entry.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="os-empty">
            <TreePine size={24} />
            <b>Aucun prix enregistré</b>
            <p>Ajoutez un prix réellement constaté. Aucune valeur nationale n’est préchargée.</p>
          </div>
        ) : (
          <div className="os-list">
            {visible.map((entry) => (
              <article className="os-row-item" key={entry.id}>
                <span className="os-stat-icon sage" aria-hidden="true"><Tag size={15} /></span>
                <div className="grow">
                  <h4>{entry.item} — {money(entry.price)} / {entry.unit}</h4>
                  <p>{entry.category} · {entry.region} · {entry.quality}</p>
                  <p>Source : {entry.source} · Relevé du {entry.observedAt}</p>
                  <span className={entry.status === "validated" ? "os-chip local" : "os-chip warn"}>
                    {entry.status === "validated" ? <><Check size={11} /> Vérifié sur cet appareil</> : "En attente de vérification"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  {entry.status === "pending" ? (
                    <button
                      type="button"
                      className="os-mini"
                      onClick={() => os.setWorkspace((current) => ({
                        ...current,
                        prices: current.prices.map((row) => row.id === entry.id ? { ...row, status: "validated" as const } : row),
                      }))}
                    >
                      Marquer vérifié
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="os-icon-btn danger"
                    aria-label={`Supprimer l’observation ${entry.item}`}
                    onClick={() => os.setWorkspace((current) => ({
                      ...current,
                      prices: current.prices.filter((row) => row.id !== entry.id),
                    }))}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="os-alert">
        <CircleAlert size={15} />
        <div>
          <b>Pas encore une base nationale publique.</b> Les relevés restent dans ce navigateur.
          « Vérifié » signifie seulement que vous avez contrôlé la source sur cet appareil. La publication
          nationale exigera une modération serveur et une comparaison régionale, et permettra de
          distinguer une variation de marché d’une donnée ancienne.
        </div>
      </div>
    </div>
  );
}
