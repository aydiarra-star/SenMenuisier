"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight, Calculator, CalendarClock, CircleAlert, MessageCircle, Ruler, Users, Wallet, Hammer,
} from "lucide-react";
import { calculateWorkshopEstimate } from "@/lib/estimate";
import { calculateOperationalHealth } from "@/lib/workshop-workspace";
import { useOs } from "./OsContext";

const money = (value: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(value)) + " FCFA";

const costFields = [
  { key: "labor", label: "Main-d’œuvre (FCFA)" },
  { key: "hardware", label: "Quincaillerie (FCFA)" },
  { key: "finishCost", label: "Finition (FCFA)" },
  { key: "overhead", label: "Charges atelier (FCFA)" },
] as const;

type CostKey = (typeof costFields)[number]["key"];

export default function OsSante() {
  const os = useOs();
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [waste, setWaste] = useState("");
  const [margin, setMargin] = useState("");
  const [costs, setCosts] = useState<Record<CostKey, string>>({
    labor: "", hardware: "", finishCost: "", overhead: "",
  });
  const [materialName, setMaterialName] = useState("");
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [deliveryDates, setDeliveryDates] = useState<Record<string, string>>({});

  const health = useMemo(() => calculateOperationalHealth(os.workspace.production), [os.workspace.production]);
  const today = new Date().toISOString().slice(0, 10);
  const dueFollowUps = os.workspace.contacts.filter(
    (contact) => contact.nextFollowUp && contact.nextFollowUp <= today,
  ).length;

  const estimate = useMemo(() => {
    const values = [quantity, unitPrice, waste, margin].map(Number);
    if (!materialName.trim() || [quantity, unitPrice, waste, margin].some((value) => value.trim() === "")) return null;
    if (values.some((value) => !Number.isFinite(value) || value < 0)) return null;
    if (values[0] <= 0 || values[1] <= 0 || values[2] > 100 || values[3] >= 100) return null;
    try {
      return calculateWorkshopEstimate({
        materials: [{ name: materialName, quantity: values[0], unit: "panel", unitPrice: values[1], priceUnit: "panel" }],
        wasteRate: values[2] / 100,
        laborCost: Number(costs.labor) || 0,
        hardwareCost: Number(costs.hardware) || 0,
        finishCost: Number(costs.finishCost) || 0,
        overheadCost: Number(costs.overhead) || 0,
        targetGrossMarginRate: values[3] / 100,
      });
    } catch {
      return null;
    }
  }, [materialName, quantity, unitPrice, waste, margin, costs]);

  const pendingQuotes = os.quotes.filter((quote) => quote.status !== "rejected" && !quote.depositPaid);
  const securedDeposits = os.quotes.filter((quote) => quote.depositPaid)
    .reduce((sum, quote) => sum + quote.deposit, 0);

  return (
    <div className="os-module">
      <header className="os-module-title">
        <div>
          <span>03 / SCORE SANTÉ DE L’ATELIER</span>
          <h1>Score Santé de l’atelier</h1>
          <p>
            Score de ponctualité calculé uniquement sur vos dossiers livrés. Aucun score, aucune marge et
            aucune dépense ne sont inventés en l’absence de données.
          </p>
        </div>
        <span className="os-chip">{os.workspace.production.length} dossier(s)</span>
      </header>

      <div className="os-grid-2">
        <section className="os-card">
          <div className="os-card-head">
            <span className="os-tile" aria-hidden="true"><CalendarClock size={17} /></span>
            <h2>Respect des délais</h2>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <strong style={{ fontFamily: "var(--display)", fontSize: 40, fontWeight: 800, lineHeight: 1 }}>
              {health.score === null ? "—" : health.score}
            </strong>
            <span style={{ fontSize: 12, color: "#8D8275" }}>/100</span>
          </div>
          <p className="os-note" style={{ marginTop: 8 }}>
            {health.score === null
              ? `Données insuffisantes : il faut au moins 3 ouvrages livrés pour calculer un indicateur fiable. ${health.completedCount}/3 actuellement.`
              : `Calcul basé sur ${health.completedCount} ouvrages livrés et leurs dates promises.`}
          </p>
          <div className="os-meter" style={{ marginTop: 12 }} aria-hidden="true">
            <span style={{ width: `${health.score ?? 0}%` }} />
          </div>
          {health.score !== null ? (
            <p className="os-note" style={{ marginTop: 8 }}>
              {health.onTimeCount} livraison(s) dans les délais sur {health.completedCount}.
            </p>
          ) : (
            <p className="os-note" style={{ marginTop: 8 }}>
              Indicateur : part des ouvrages livrés à la date promise ou avant. Fenêtre : tous les
              dossiers enregistrés. Minimum : 3 dossiers livrés.
            </p>
          )}
        </section>

        <section className="os-card">
          <div className="os-card-head">
            <span className="os-tile" aria-hidden="true"><Calculator size={17} /></span>
            <h2>Recommandations</h2>
          </div>
          <div className="os-table">
            <div className="os-table-row"><span>Retards en cours</span><b>{health.overdueCount}</b></div>
            <div className="os-table-row"><span>Devis en attente d’acompte</span><b>{pendingQuotes.length}</b></div>
            <div className="os-table-row"><span>Acomptes confirmés</span><b>{money(securedDeposits)}</b></div>
            <div className="os-table-row"><span>Relances à faire</span><b>{dueFollowUps}</b></div>
          </div>
          <div className="os-alert" style={{ marginTop: 12 }}>
            <CircleAlert size={14} />
            <div>
              Les recommandations tarifaires et commerciales ne sont pas encore disponibles : elles
              exigeraient des marges, encaissements et dépenses réels. Aucun conseil financier n’est
              généré ici.
            </div>
          </div>
        </section>
      </div>

      <div className="os-grid-4">
        <section className="os-card">
          <span className="os-tile" aria-hidden="true"><Ruler size={15} /></span>
          <h3 style={{ margin: "9px 0 4px", fontFamily: "var(--display)", fontSize: 13 }}>Ouvrages livrés</h3>
          <p className="os-note">{health.completedCount} dossier(s) clôturé(s) sur cet appareil.</p>
        </section>
        <section className="os-card">
          <span className="os-tile" aria-hidden="true"><CalendarClock size={15} /></span>
          <h3 style={{ margin: "9px 0 4px", fontFamily: "var(--display)", fontSize: 13 }}>Retards en cours</h3>
          <p className="os-note">{health.overdueCount} dossier(s) dont la date promise est dépassée.</p>
        </section>
        <section className="os-card">
          <span className="os-tile" aria-hidden="true"><Users size={15} /></span>
          <h3 style={{ margin: "9px 0 4px", fontFamily: "var(--display)", fontSize: 13 }}>Clients suivis</h3>
          <p className="os-note">{os.workspace.contacts.length} contact(s) dans le carnet.</p>
        </section>
        <section className="os-card">
          <span className="os-tile" aria-hidden="true"><MessageCircle size={15} /></span>
          <h3 style={{ margin: "9px 0 4px", fontFamily: "var(--display)", fontSize: 13 }}>Relances à faire</h3>
          <p className="os-note">{dueFollowUps} contact(s) arrivés à échéance de suivi.</p>
        </section>
      </div>

      <section className="os-card">
        <div className="os-card-head">
          <span className="os-tile" aria-hidden="true"><Wallet size={17} /></span>
          <div>
            <h2>Calculateur de coût de fabrication</h2>
          </div>
        </div>
        <p className="os-sub" style={{ marginTop: -4 }}>
          Saisissez une ligne de matière issue de votre nomenclature et les coûts constatés. Aucun
          montant n’est prérempli.
        </p>
        <div className="os-form">
          <label className="wide">
            Matière / panneau
            <input value={materialName} maxLength={80} placeholder="Ex. MDF standard 18 mm"
              onChange={(event) => setMaterialName(event.target.value)} />
          </label>
          <label>
            Nombre de panneaux
            <input type="number" min="0.01" step="0.01" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
          </label>
          <label>
            Prix par panneau (FCFA)
            <input type="number" min="0" value={unitPrice} onChange={(event) => setUnitPrice(event.target.value)} />
          </label>
          <label>
            Pertes matière (%)
            <input type="number" min="0" max="100" value={waste} onChange={(event) => setWaste(event.target.value)} />
          </label>
          <label>
            Marge brute cible (%)
            <input type="number" min="0" max="99.9" step="0.1" value={margin} onChange={(event) => setMargin(event.target.value)} />
          </label>
          {costFields.map((field) => (
            <label key={field.key}>
              {field.label}
              <input
                type="number"
                min="0"
                value={costs[field.key]}
                onChange={(event) => setCosts((current) => ({ ...current, [field.key]: event.target.value }))}
              />
            </label>
          ))}
        </div>

        <div className="os-total">
          <div>
            <span>Coût de fabrication</span>
            <b>{estimate ? money(estimate.totalCost) : "À renseigner"}</b>
          </div>
          <div>
            <span>Prix de vente cible</span>
            <b>{estimate ? money(estimate.targetSellingPrice) : "À renseigner"}</b>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <button type="button" className="os-mini" onClick={() => setShowAssumptions((value) => !value)}>
            <CircleAlert size={13} /> Voir les hypothèses
          </button>
          <button type="button" className="os-mini" onClick={() => os.go("catalogue")}>
            Ouvrir le catalogue <ArrowRight size={13} />
          </button>
        </div>
        {showAssumptions ? (
          <ul className="os-note" style={{ marginTop: 8, paddingLeft: 18, lineHeight: 1.85 }}>
            {(estimate?.assumptions ?? ["Complétez la matière, les quantités et le prix pour obtenir un calcul."]).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="os-card">
        <div className="os-card-head">
          <span className="os-tile" aria-hidden="true"><Wallet size={17} /></span>
          <h2>Devis enregistrés</h2>
        </div>
        {os.quotes.length === 0 ? (
          <div className="os-empty">
            <Wallet size={22} />
            <b>Aucun devis enregistré</b>
            <p>Préparez un devis depuis le catalogue : il apparaîtra ici avec son numéro et son acompte.</p>
          </div>
        ) : (
          <div className="os-list">
            {os.quotes.map((quote) => {
              const converted = Boolean(quote.productionJobId) || quote.status === "accepted";
              const deliveryDate = deliveryDates[quote.id] ?? quote.deliveryTarget ?? "";
              return (
              <article className="os-row-item" key={quote.id}>
                <div className="grow">
                  <h4>{quote.number} · {quote.clientName}</h4>
                  <p>{quote.modelTitle} · {quote.dimensions} · {quote.material}</p>
                  <p>Prix cible : {money(quote.targetPrice)} · Acompte prévu : {money(quote.deposit)}</p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                    <span className={converted ? "os-chip local" : "os-chip"}>{converted ? "Commande créée" : quote.status === "rejected" ? "Devis refusé" : "Devis brouillon"}</span>
                    <span className={quote.depositPaid ? "os-chip local" : "os-chip warn"}>
                      {quote.depositPaid ? <><CheckMark /> Acompte confirmé manuellement</> : "Acompte non confirmé"}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center" }}>
                  {!quote.depositPaid ? (
                    <button type="button" className="os-mini" onClick={() => {
                      os.updateQuote(quote.id, { depositPaid: true });
                      os.notify("Acompte marqué comme reçu manuellement. Aucun paiement n’a été encaissé par l’application.");
                    }}>Marquer l’acompte reçu</button>
                  ) : null}
                  {!converted && quote.status !== "rejected" ? (
                    <>
                      <label style={{ display: "grid", gap: 3, fontSize: 10 }}>
                        Livraison promise
                        <input aria-label={`Date de livraison pour ${quote.number}`} type="date" min={today}
                          value={deliveryDate} onChange={(event) => setDeliveryDates((current) => ({ ...current, [quote.id]: event.target.value }))} />
                      </label>
                      <button type="button" className="os-primary" style={{ width: "auto", padding: "0 12px" }}
                        disabled={!deliveryDate}
                        onClick={() => {
                          const jobId = crypto.randomUUID();
                          os.setWorkspace((current) => ({ ...current, production: [{
                            id: jobId, title: quote.modelTitle, client: quote.clientName,
                            dueDate: deliveryDate, status: "preparation", createdAt: new Date().toISOString(),
                            sourceQuoteId: quote.id,
                          }, ...current.production] }));
                          os.updateQuote(quote.id, { status: "accepted", productionJobId: jobId, deliveryTarget: deliveryDate });
                          os.notify(`Devis ${quote.number} converti en commande et dossier de fabrication. Vérifiez les détails dans Production.`);
                        }}><Hammer size={13} /> Accepter & créer la commande</button>
                    </>
                  ) : converted ? <button type="button" className="os-mini" onClick={() => os.go("production")}>Voir la fabrication <ArrowRight size={13} /></button> : null}
                  {quote.status !== "accepted" && quote.status !== "rejected" ? (
                    <button type="button" className="os-mini" onClick={() => {
                      if (window.confirm(`Refuser le devis ${quote.number} ?`)) {
                        os.updateQuote(quote.id, { status: "rejected" });
                        os.notify("Devis marqué comme refusé.");
                      }
                    }}>Refuser</button>
                  ) : null}
                </div>
              </article>
            );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function CheckMark() {
  return <CheckIcon />;
}

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
      <path d="M4 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
