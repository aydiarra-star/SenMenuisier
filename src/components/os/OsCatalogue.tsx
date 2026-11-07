"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight, Check, CircleAlert, Heart, Info, Layers, Lock, Printer, Ruler, Upload,
} from "lucide-react";
import { calculateWorkshopEstimate } from "@/lib/estimate";
import { averageVerifiedMdfPrice, findOsModel, osModels, woodEssences, woodFinishes } from "@/lib/os-models";
import { useOs } from "./OsContext";
import CutPlanTool from "./CutPlanTool";
import Furniture3DPreview from "./Furniture3DPreview";

const money = (value: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(value)) + " FCFA";

const sheetMaterials = [
  "MDF standard 18 mm",
  "MDF hydrofuge 18 mm",
  "Contreplaqué 18 mm",
  "Panneau mélaminé 18 mm",
] as const;

export default function OsCatalogue() {
  const os = useOs();
  const model = findOsModel(os.selectedModelId);

  const [verified, setVerified] = useState(false);
  const [material, setMaterial] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [waste, setWaste] = useState("");
  const [labor, setLabor] = useState("");
  const [hardware, setHardware] = useState("");
  const [finishCost, setFinishCost] = useState("");
  const [overhead, setOverhead] = useState("");
  const [margin, setMargin] = useState("");
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [delivery, setDelivery] = useState("");
  const [prepared, setPrepared] = useState(false);

  const mdf = useMemo(() => averageVerifiedMdfPrice(os.workspace.prices), [os.workspace.prices]);

  const estimate = useMemo(() => {
    const raw = [quantity, unitPrice, waste, labor, hardware, finishCost, overhead, margin];
    if (!material || !os.finish || raw.some((value) => value.trim() === "")) return null;
    const values = raw.map(Number);
    if (values.some((value) => !Number.isFinite(value) || value < 0)) return null;
    if (values[0] <= 0 || values[1] <= 0 || values[2] > 100 || values[7] >= 100) return null;
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
  }, [material, os.finish, quantity, unitPrice, waste, labor, hardware, finishCost, overhead, margin]);

  const dimensions = `${os.dimensions.width} × ${os.dimensions.height} × ${os.dimensions.depth} cm`;
  const canPrepareQuote = Boolean(estimate) && verified && clientName.trim().length > 1;

  function chooseModel(id: string) {
    os.selectModel(id);
    setVerified(false);
    setPrepared(false);
  }

  function prepareQuote() {
    if (!estimate || !canPrepareQuote) return;
    const now = new Date();
    const number = `SM-${now.getFullYear()}-${String(os.quotes.length + 1).padStart(4, "0")}`;
    const deposit = Math.round(estimate.targetSellingPrice * 0.4);
    os.addQuote({
      id: crypto.randomUUID(),
      number,
      clientName: clientName.trim(),
      clientContact: clientContact.trim(),
      modelTitle: model.title,
      dimensions,
      material: `${material} · ${os.finish}`,
      finish: os.finish,
      targetPrice: Math.round(estimate.targetSellingPrice),
      deposit,
      depositPaid: false,
      status: "draft",
      deliveryTarget: delivery,
      createdAt: now.toISOString(),
      lines: [
        { label: "Matières", amount: Math.round(estimate.materialSubtotal) },
        { label: `Pertes matière (${Number(waste) || 0} %)`, amount: Math.round(estimate.wasteCost) },
        { label: "Main-d’œuvre", amount: Math.round(estimate.laborCost) },
        { label: "Quincaillerie", amount: Math.round(estimate.hardwareCost) },
        { label: "Finition", amount: Math.round(estimate.finishCost) },
        { label: "Charges atelier", amount: Math.round(estimate.overheadCost) },
      ],
    });
    setPrepared(true);
    os.notify(`Devis ${number} enregistré dans ce navigateur (brouillon non contractuel).`);
  }

  return (
    <div className="os-module">
      <div className="os-page">
        <div className="os-col-main">
          <header className="os-module-title">
            <div>
              <span>01 / CONCEPTION &amp; ESTIMATION</span>
              <h1>Catalogue Intelligent de Meubles</h1>
              <p>
                Choisissez un modèle, ajustez ses cotes et ses finitions avec l’aperçu 3D, puis préparez une estimation avec les prix
                réellement constatés par votre atelier.
              </p>
            </div>
            <span className="os-chip local">Calcul local · non synchronisé</span>
          </header>

          {/* Cours moyen MDF 18 mm */}
          <section className="os-card" aria-labelledby="mdf-title">
            <div className="os-card-head">
              <span className="os-tile" aria-hidden="true"><Layers size={17} /></span>
              <div>
                <h2 id="mdf-title">Cours Moyen MDF 18mm</h2>
              </div>
              <button type="button" className="os-head-link" onClick={() => os.go("prix")}>
                Base de prix <ArrowRight size={13} />
              </button>
            </div>
            {mdf ? (
              <p className="os-sub" style={{ margin: 0 }}>
                <b style={{ fontSize: 18, color: "#2B241D" }}>{money(mdf.average)}</b>{" "}
                — moyenne de {mdf.count} relevé(s) vérifié(s) pour le MDF 18 mm, arrondie au franc.
              </p>
            ) : (
              <p className="os-sub" style={{ margin: 0 }}>
                <b style={{ color: "#8A6122" }}>Non renseigné</b> — aucune observation vérifiée de MDF 18 mm
                dans la base de prix. Aucun tarif n’est affiché par défaut.
              </p>
            )}
          </section>

          {/* Modèles */}
          <section className="os-card" aria-labelledby="mods-title">
            <div className="os-card-head">
              <span className="os-tile" aria-hidden="true"><Ruler size={17} /></span>
              <h2 id="mods-title">Quatre modèles de référence</h2>
            </div>
            <div className="os-models">
              {osModels.map((item) => (
                <article className="os-model" key={item.id} style={os.selectedModelId === item.id ? { borderColor: "#B98252", boxShadow: "0 12px 26px -20px #7a4f26" } : undefined}>
                  <div className="os-model-media">
                    <img src={item.image} alt={`${item.title} — ${item.short}`} />
                    <button
                      type="button"
                      className="os-fav"
                      aria-pressed={os.favorites.includes(item.id)}
                      aria-label={os.favorites.includes(item.id) ? `Retirer ${item.title}` : `Ajouter ${item.title} aux favoris`}
                      onClick={() => os.toggleFavorite(item.id)}
                    >
                      <Heart size={12} fill={os.favorites.includes(item.id) ? "currentColor" : "none"} />
                    </button>
                  </div>
                  <div className="os-model-body">
                    <b>{item.title}</b>
                    <small>{item.short} · {item.width} × {item.height} × {item.depth} cm</small>
                    <button
                      type="button"
                      className="os-model-use"
                      onClick={() => chooseModel(item.id)}
                      style={os.selectedModelId === item.id ? { background: "#B98252" } : undefined}
                    >
                      {os.selectedModelId === item.id ? <><Check size={13} /> Modèle choisi</> : "Utiliser ce modèle"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Paramétrage */}
          <section className="os-config" aria-labelledby="param-title">
            <div className="os-config-head">
              <span className="os-tile" aria-hidden="true"><Ruler size={18} /></span>
              <div>
                <h2 id="param-title">{model.title}</h2>
                <p>Dimensions de référence et choix techniques de l’ouvrage</p>
              </div>
            </div>
            <div className="os-config-form">
              <div className="os-config-row">
                <label className="os-field">
                  <span>Largeur (cm)</span>
                  <input type="number" min={20} max={600} value={os.dimensions.width}
                    onChange={(event) => { os.setDimension("width", event.target.value); setVerified(false); setPrepared(false); }} />
                </label>
                <label className="os-field">
                  <span>Hauteur (cm)</span>
                  <input type="number" min={20} max={400} value={os.dimensions.height}
                    onChange={(event) => { os.setDimension("height", event.target.value); setVerified(false); setPrepared(false); }} />
                </label>
                <label className="os-field">
                  <span>Profondeur (cm)</span>
                  <input type="number" min={10} max={300} value={os.dimensions.depth}
                    onChange={(event) => { os.setDimension("depth", event.target.value); setVerified(false); setPrepared(false); }} />
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
                    {woodFinishes.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
              </div>
              <div className="os-config-actions">
                <span className="os-chip local">Aperçu 3D modifiable</span>
                <button
                  type="button"
                  className="os-square"
                  aria-label="Plan de découpe"
                  onClick={() => os.notify("Le plan de découpe détaillé sera généré après validation de la nomenclature et des panneaux disponibles.")}
                >
                  <Printer size={15} />
                </button>
              </div>
              <Furniture3DPreview
                width={os.dimensions.width}
                height={os.dimensions.height}
                depth={os.dimensions.depth}
                material={os.material}
                finish={os.finish}
              />
              <p className="os-config-note">
                Relevé {verified ? "confirmé" : "non confirmé"} · {dimensions}. Ces cotes ne produisent
                aucune liste de débit : le débit doit être établi à partir d’une nomenclature validée.
              </p>
            </div>
          </section>

          <CutPlanTool />

          {/* Contrôle sur place */}
          <section className="os-card" aria-labelledby="measure-title">
            <div className="os-card-head">
              <span className="os-tile" aria-hidden="true"><Ruler size={17} /></span>
              <h2 id="measure-title">Contrôle sur place</h2>
            </div>
            <p className="os-sub" style={{ marginTop: -4 }}>
              Relevez largeur, hauteur et profondeur au mètre avant de préparer un devis. L’aide
              caméra/AR du téléphone n’est pas active : aucune mesure automatique n’est simulée.
            </p>
            <button
              type="button"
              className={verified ? "os-gold" : "os-primary"}
              aria-pressed={verified}
              style={{ width: "auto", minHeight: 36, padding: "0 14px", fontSize: 11 }}
              onClick={() => { setVerified((value) => !value); setPrepared(false); }}
            >
              <Ruler size={14} /> {verified ? "Relevé vérifié" : "Confirmer le relevé"}
            </button>
          </section>

          {/* Estimation */}
          <section className="os-card" aria-labelledby="est-title">
            <div className="os-card-head">
              <span className="os-tile" aria-hidden="true"><Layers size={17} /></span>
              <div>
                <h2 id="est-title">Nomenclature et coûts vérifiés</h2>
              </div>
            </div>
            <p className="os-sub" style={{ marginTop: -4 }}>
              Saisissez les montants réellement constatés auprès de vos fournisseurs. Aucun tarif de
              démonstration n’est prérempli.
            </p>
            <div className="os-form">
              <label className="wide">
                Matière de base
                <select value={material} onChange={(event) => { setMaterial(event.target.value); setPrepared(false); }}>
                  <option value="">Choisir un panneau</option>
                  {sheetMaterials.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label>
                Nombre de panneaux
                <input type="number" min="0.01" step="0.01" value={quantity} onChange={(event) => { setQuantity(event.target.value); setPrepared(false); }} />
              </label>
              <label>
                Prix par panneau (FCFA)
                <input type="number" min="0" value={unitPrice} onChange={(event) => { setUnitPrice(event.target.value); setPrepared(false); }} />
              </label>
              <label>
                Pertes matière (%)
                <input type="number" min="0" max="100" value={waste} onChange={(event) => { setWaste(event.target.value); setPrepared(false); }} />
              </label>
              <label>
                Main-d’œuvre (FCFA)
                <input type="number" min="0" value={labor} onChange={(event) => { setLabor(event.target.value); setPrepared(false); }} />
              </label>
              <label>
                Quincaillerie (FCFA)
                <input type="number" min="0" value={hardware} onChange={(event) => { setHardware(event.target.value); setPrepared(false); }} />
              </label>
              <label>
                Coût de finition (FCFA)
                <input type="number" min="0" value={finishCost} onChange={(event) => { setFinishCost(event.target.value); setPrepared(false); }} />
              </label>
              <label>
                Charges atelier (FCFA)
                <input type="number" min="0" value={overhead} onChange={(event) => { setOverhead(event.target.value); setPrepared(false); }} />
              </label>
              <label>
                Marge brute cible (%)
                <input type="number" min="0" max="99.9" step="0.1" value={margin} onChange={(event) => { setMargin(event.target.value); setPrepared(false); }} />
              </label>
            </div>

            <div className="os-total">
              <div>
                <span>Coût de fabrication estimé</span>
                <b>{estimate ? money(estimate.totalCost) : "À renseigner"}</b>
              </div>
              <div>
                <span>Prix de vente cible</span>
                <b>{estimate ? money(estimate.targetSellingPrice) : "À renseigner"}</b>
              </div>
            </div>

            {estimate ? (
              <div className="os-table" style={{ marginTop: 12 }}>
                <div className="os-table-row"><span>Matières</span><b>{money(estimate.materialSubtotal)}</b></div>
                <div className="os-table-row"><span>Pertes matière ({(Number(waste) || 0).toLocaleString("fr-FR")} %)</span><b>{money(estimate.wasteCost)}</b></div>
                <div className="os-table-row"><span>Main-d’œuvre</span><b>{money(estimate.laborCost)}</b></div>
                <div className="os-table-row"><span>Quincaillerie</span><b>{money(estimate.hardwareCost)}</b></div>
                <div className="os-table-row"><span>Finition</span><b>{money(estimate.finishCost)}</b></div>
                <div className="os-table-row"><span>Charges atelier</span><b>{money(estimate.overheadCost)}</b></div>
                <div className="os-table-row"><span><b>Coût total</b></span><b>{money(estimate.totalCost)}</b></div>
                <div className="os-table-row">
                  <span>Marge brute cible ({(Number(margin) || 0).toLocaleString("fr-FR")} %)</span>
                  <b>{money(estimate.targetSellingPrice - estimate.totalCost)}</b>
                </div>
              </div>
            ) : null}

            <p className="os-note" style={{ marginTop: 10 }}>
              Cette estimation calcule une ligne de matière et les coûts complémentaires saisis. Elle ne
              constitue ni un plan de débit, ni une nomenclature multi-pièces complète.
            </p>

            <button
              type="button"
              className="os-mini"
              style={{ marginTop: 10 }}
              onClick={() => setShowAssumptions((value) => !value)}
            >
              <Info size={13} /> Vérifier les hypothèses de calcul
            </button>
            {showAssumptions ? (
              <ul className="os-note" style={{ marginTop: 8, paddingLeft: 18, lineHeight: 1.8 }}>
                {(estimate?.assumptions ?? [
                  "Complétez tous les champs, choisissez une matière et une finition pour obtenir une estimation.",
                ]).map((item) => <li key={item}>{item}</li>)}
              </ul>
            ) : null}
          </section>

          {/* Devis */}
          <section className="os-card" aria-labelledby="quote-title">
            <div className="os-card-head">
              <span className="os-tile" aria-hidden="true"><Upload size={17} /></span>
              <div>
                <h2 id="quote-title">Préparer le devis client</h2>
              </div>
            </div>
            <p className="os-sub" style={{ marginTop: -4 }}>
              Le devis n’est préparé qu’après contrôle des mesures et saisie des coûts. Il reste un
              brouillon tant qu’il n’est pas validé par l’atelier.
            </p>
            <div className="os-form">
              <label>
                Nom du client
                <input value={clientName} maxLength={100} placeholder="Nom et prénom"
                  onChange={(event) => { setClientName(event.target.value); setPrepared(false); }} />
              </label>
              <label>
                Téléphone / WhatsApp
                <input type="tel" value={clientContact} maxLength={24} placeholder="+221 77 000 00 00"
                  onChange={(event) => { setClientContact(event.target.value); setPrepared(false); }} />
              </label>
              <label className="wide">
                Date souhaitée de livraison
                <input type="date" value={delivery} onChange={(event) => { setDelivery(event.target.value); setPrepared(false); }} />
              </label>
              <button type="button" className="os-primary" disabled={!canPrepareQuote}
                style={!canPrepareQuote ? { opacity: 0.45, cursor: "not-allowed", width: "auto", padding: "0 15px" } : { width: "auto", padding: "0 15px" }}
                onClick={prepareQuote}>
                Préparer le devis
              </button>
            </div>
            {!verified ? <p className="os-note" style={{ marginTop: 8 }}>Confirmez d’abord le relevé des mesures.</p> : null}
            {verified && !estimate ? <p className="os-note" style={{ marginTop: 8 }}>Complétez les coûts pour calculer un montant fiable.</p> : null}
            {verified && estimate && !clientName.trim() ? <p className="os-note" style={{ marginTop: 8 }}>Indiquez le nom du client pour ouvrir le devis.</p> : null}

            {prepared && estimate ? (
              <>
                <div className="os-alert ok">
                  <Check size={15} />
                  <div>
                    <b>Devis brouillon enregistré sur cet appareil.</b>
                    <div style={{ marginTop: 4 }}>
                      Client : {clientName}{clientContact ? ` · ${clientContact}` : ""}<br />
                      Ouvrage : {model.title} · {dimensions}<br />
                      Prix cible indicatif : {money(estimate.targetSellingPrice)}<br />
                      Livraison souhaitée : {delivery || "à convenir"}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                  <button type="button" className="os-mini" onClick={() => os.requestPrint("quote")}>
                    <Printer size={13} /> Imprimer / Enregistrer en PDF
                  </button>
                  <button type="button" className="os-mini" onClick={() => os.go("production")}>
                    Voir dans la production <ArrowRight size={13} />
                  </button>
                </div>
                <p className="os-note" style={{ marginTop: 8 }}>
                  L’impression n’est possible que si le document est affiché ; le PDF n’est pas encore
                  stocké ni partagé par un service sécurisé.
                </p>
              </>
            ) : null}
          </section>

          <div className="os-alert" style={{ marginTop: 0 }}>
            <CircleAlert size={15} />
            <div>
              <b>Données honnêtes.</b> Les prix, surfaces et marges proviennent uniquement de vos saisies.
              Aucun tarif national ni mesure automatique ne sont simulés. La vue 3D est un aperçu visuel indicatif, pas un plan technique certifié.
            </div>
          </div>
        </div>

        {/* Colonne latérale */}
        <aside className="os-col-side" aria-label="Repères du catalogue">
          <section className="os-side-card">
            <h3>Ce qui est réellement calculé</h3>
            <div className="os-table" style={{ marginTop: 8 }}>
              <div className="os-table-row"><span>Coût matière + pertes</span><b>{estimate ? "Oui" : "—"}</b></div>
              <div className="os-table-row"><span>Main-d’œuvre, quincaillerie</span><b>{estimate ? "Oui" : "—"}</b></div>
              <div className="os-table-row"><span>Prix de vente cible</span><b>{estimate ? "Oui" : "—"}</b></div>
              <div className="os-table-row"><span>Plan de débit</span><b>Non</b></div>
              <div className="os-table-row"><span>Aperçu 3D manipulable</span><b>Oui</b></div>
            </div>
            <p className="os-stat-note">
              « Non » signifie que la fonction n’existe pas encore : aucun succès n’est affiché à la
              place.
            </p>
          </section>

          <section className="os-side-card">
            <h3>Confidentialité</h3>
            <p className="os-status" style={{ marginTop: 8 }}>
              <Lock size={13} /> Coûts, marges et prix d’achat
            </p>
            <p className="os-note" style={{ marginTop: 8 }}>
              Ces montants restent sur cet appareil. Aucun compte n’étant connecté, aucun contrôle
              d’accès serveur n’est actif : ne partagez pas cet écran en démonstration publique.
            </p>
          </section>
        </aside>
      </div>

      {/* Document imprimable */}
      <article className="os-print" data-active={os.printTarget === "quote"} aria-hidden="true">
        <header className="os-print-head">
          <b>SenMenuisier</b>
          <span>DOCUMENT DE TRAVAIL · BROUILLON</span>
        </header>
        <h1>Devis estimatif</h1>
        <p className="sub">Le savoir-faire sénégalais, connecté au monde.</p>
        <h2>Client</h2>
        <p>{clientName || "—"}{clientContact ? ` · ${clientContact}` : ""}</p>
        <h2>Ouvrage proposé</h2>
        <p><strong>{model.title}</strong> — {dimensions}</p>
        <p>Matière : {material || "à confirmer"} · Finition : {os.finish}</p>
        <p>Livraison souhaitée : {delivery || "à convenir avec le client"}</p>
        <h2>Détail</h2>
        <table>
          <thead>
            <tr><th>Ligne</th><th style={{ textAlign: "right" }}>Montant</th></tr>
          </thead>
          <tbody>
            {(estimate ? [
              ["Matières", estimate.materialSubtotal],
              [`Pertes matière (${Number(waste) || 0} %)`, estimate.wasteCost],
              ["Main-d’œuvre", estimate.laborCost],
              ["Quincaillerie", estimate.hardwareCost],
              ["Finition", estimate.finishCost],
              ["Charges atelier", estimate.overheadCost],
            ] as [string, number][] : []).map(([label, amount]) => (
              <tr key={label}><td>{label}</td><td className="num">{money(amount)}</td></tr>
            ))}
          </tbody>
        </table>
        <div className="total">
          <span>Prix de vente cible indicatif</span>
          <strong>{estimate ? money(estimate.targetSellingPrice) : "—"}</strong>
        </div>
        <p className="legal">
          Document de préparation non contractuel. Montant calculé à partir des informations saisies par
          l’atelier. Les quantités, fournitures, délais, conditions de paiement et taxes éventuelles
          restent à confirmer avec le client. Ce document n’est ni une facture, ni une preuve
          d’acceptation, ni une commande.
        </p>
        <footer className="foot">
          SenMenuisier · Brouillon local non synchronisé · {new Date().toLocaleDateString("fr-FR")}
        </footer>
      </article>
    </div>
  );
}
