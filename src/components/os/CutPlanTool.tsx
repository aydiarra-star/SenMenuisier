"use client";

import { useMemo, useState } from "react";
import { Scissors, RotateCw, AlertTriangle } from "lucide-react";
import { calculateShelfCutPlan, type CutPart } from "@/lib/cut-plan";

const money = (value: number) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(value);

export default function CutPlanTool() {
  const [panelWidth, setPanelWidth] = useState("2800");
  const [panelHeight, setPanelHeight] = useState("2070");
  const [kerf, setKerf] = useState("3");
  const [margin, setMargin] = useState("10");
  const [parts, setParts] = useState<CutPart[]>([
    { id: "piece-1", label: "Côtés", widthMm: 600, heightMm: 2000, quantity: 2, rotatable: false },
    { id: "piece-2", label: "Étagères", widthMm: 560, heightMm: 500, quantity: 4, rotatable: true },
  ]);
  const [enabled, setEnabled] = useState(false);
  const plan = useMemo(() => {
    if (!enabled) return null;
    try {
      return calculateShelfCutPlan({
        panelWidthMm: Number(panelWidth), panelHeightMm: Number(panelHeight),
        kerfMm: Number(kerf), marginMm: Number(margin), parts,
      });
    } catch {
      return null;
    }
  }, [enabled, panelWidth, panelHeight, kerf, margin, parts]);

  function updatePart(id: string, patch: Partial<CutPart>) {
    setParts((current) => current.map((part) => part.id === id ? { ...part, ...patch } : part));
    setEnabled(false);
  }

  function addPart() {
    setParts((current) => [...current, {
      id: `piece-${Date.now()}`, label: "", widthMm: 400, heightMm: 300, quantity: 1, rotatable: true,
    }]);
    setEnabled(false);
  }

  return (
    <section className="os-card" aria-labelledby="cut-plan-title">
      <div className="os-card-head">
        <span className="os-tile" aria-hidden="true"><Scissors size={17} /></span>
        <div><h2 id="cut-plan-title">Atelier de débit · panneaux</h2></div>
        <span className="os-chip local">Pré-plan indicatif</span>
      </div>
      <p className="os-sub">Saisissez les pièces de votre ouvrage. Le calcul répartit les rectangles sur des panneaux standards, avec trait de scie et marges configurables.</p>
      <div className="os-form">
        <label>Largeur panneau (mm)<input type="number" min="1" value={panelWidth} onChange={(e) => { setPanelWidth(e.target.value); setEnabled(false); }} /></label>
        <label>Hauteur panneau (mm)<input type="number" min="1" value={panelHeight} onChange={(e) => { setPanelHeight(e.target.value); setEnabled(false); }} /></label>
        <label>Trait de scie (mm)<input type="number" min="0" step="0.5" value={kerf} onChange={(e) => { setKerf(e.target.value); setEnabled(false); }} /></label>
        <label>Marge de rive (mm)<input type="number" min="0" value={margin} onChange={(e) => { setMargin(e.target.value); setEnabled(false); }} /></label>
      </div>
      <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
        {parts.map((part) => (
          <div key={part.id} style={{ display: "grid", gridTemplateColumns: "minmax(90px,1.2fr) repeat(3,minmax(58px,1fr)) 32px", gap: 6, alignItems: "end" }}>
            <label className="os-field"><span>Pièce</span><input aria-label="Nom de la pièce" value={part.label} onChange={(e) => updatePart(part.id, { label: e.target.value })} /></label>
            <label className="os-field"><span>L (mm)</span><input aria-label="Largeur de la pièce" type="number" min="1" value={part.widthMm} onChange={(e) => updatePart(part.id, { widthMm: Number(e.target.value) })} /></label>
            <label className="os-field"><span>H (mm)</span><input aria-label="Hauteur de la pièce" type="number" min="1" value={part.heightMm} onChange={(e) => updatePart(part.id, { heightMm: Number(e.target.value) })} /></label>
            <label className="os-field"><span>Qté</span><input aria-label="Quantité" type="number" min="1" max="500" value={part.quantity} onChange={(e) => updatePart(part.id, { quantity: Number(e.target.value) })} /></label>
            <button type="button" className="os-square" aria-label="Autoriser la rotation" aria-pressed={Boolean(part.rotatable)} onClick={() => updatePart(part.id, { rotatable: !part.rotatable })}><RotateCw size={14} /></button>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        <button type="button" className="os-mini" onClick={addPart}>+ Ajouter une pièce</button>
        <button type="button" className="os-primary" style={{ width: "auto", padding: "0 14px" }} onClick={() => setEnabled(true)}>Calculer le pré-plan</button>
      </div>
      {enabled && !plan ? <p className="os-note" role="alert">Vérifiez les dimensions, les quantités et les marges saisies.</p> : null}
      {plan ? (
        <div style={{ marginTop: 14 }}>
          <div className="os-total">
            <div><span>Panneaux estimés</span><b>{plan.panelCount}</b></div>
            <div><span>Chutes théoriques</span><b>{money(plan.wasteRate * 100)} %</b></div>
          </div>
          {plan.warnings.map((warning) => <p key={warning} className="os-note" role="alert"><AlertTriangle size={13} /> {warning}</p>)}
          {plan.placements.length > 0 ? (
            <div className="os-table" style={{ marginTop: 10 }}>
              {plan.placements.map((item) => (
                <div className="os-table-row" key={item.partId}>
                  <span>{item.label} · panneau {item.panel} · {item.xMm},{item.yMm} mm{item.rotated ? " · tournée" : ""}</span>
                  <b>{item.widthMm} × {item.heightMm}</b>
                </div>
              ))}
            </div>
          ) : null}
          <p className="os-note" style={{ marginTop: 10 }}>Disposition par rangées (heuristique). La surface restante n&apos;est pas garantie réutilisable. Vérifiez le sens du fil, les défauts, les chants, les serre-joints et l&apos;ordre de coupe avant débit.</p>
        </div>
      ) : null}
    </section>
  );
}
