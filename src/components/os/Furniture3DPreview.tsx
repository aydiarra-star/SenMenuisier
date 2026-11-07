"use client";

import { useRef, useState } from "react";

type Props = {
  width: string;
  height: string;
  depth: string;
  material: string;
  finish: string;
};

const woodColors: Record<string, string> = {
  "Chêne": "#B78B59",
  "Iroko": "#9B7040",
  "Khaya": "#8B4E37",
  "Vène": "#6F4A32",
  "Teck": "#B9824A",
  "Fromager": "#C5A77C",
};

export default function Furniture3DPreview({ width, height, depth, material, finish }: Props) {
  const [rotation, setRotation] = useState({ x: -12, y: -28 });
  const [doors, setDoors] = useState(true);
  const [drawers, setDrawers] = useState(0);
  const [shelves, setShelves] = useState(2);
  const [handles, setHandles] = useState(true);
  const drag = useRef<{ x: number; y: number; rx: number; ry: number } | null>(null);
  const color = woodColors[material] ?? "#A77B4D";
  const valid = [width, height, depth].every((value) => Number.isFinite(Number(value)) && Number(value) > 0);
  const dimensionScale = valid
    ? {
        x: Math.max(0.68, Math.min(1.28, Number(width) / 120)),
        y: Math.max(0.72, Math.min(1.3, Number(height) / 90)),
        z: Math.max(0.72, Math.min(1.3, Number(depth) / 50)),
      }
    : { x: 1, y: 1, z: 1 };
  const finishGloss = /brillant|laqu[eé]/i.test(finish) ? 0.24 : /satin/i.test(finish) ? 0.15 : 0.08;

  function startDrag(event: React.PointerEvent<HTMLDivElement>) {
    drag.current = { x: event.clientX, y: event.clientY, rx: rotation.x, ry: rotation.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    setRotation({
      x: Math.max(-65, Math.min(25, drag.current.rx - (event.clientY - drag.current.y) * 0.45)),
      y: drag.current.ry + (event.clientX - drag.current.x) * 0.55,
    });
  }

  function stopDrag() {
    drag.current = null;
  }

  return (
    <div className="sm-3d-wrap">
      <div
        className="sm-3d-stage"
        role="img"
        aria-label={`Aperçu volumétrique interactif du meuble, ${width} par ${height} par ${depth} centimètres, matériau ${material}, finition ${finish}, ${doors ? "avec portes" : "sans portes"}, ${drawers} tiroir(s), ${shelves} étagère(s). Faites glisser pour tourner le meuble.`}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
        onDoubleClick={() => setRotation({ x: -12, y: -28 })}
      >
        <div className="sm-3d-scene">
          <div
            className="sm-3d-cabinet"
            style={{
              transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(${dimensionScale.x}, ${dimensionScale.y}, ${dimensionScale.z})`,
              ["--wood" as string]: color,
              ["--finish-gloss" as string]: finishGloss,
            } as React.CSSProperties}
          >
            <div className="sm-3d-face sm-3d-front">
              <div className="sm-3d-interior">
                {Array.from({ length: shelves }, (_, index) => (
                  <div className="sm-3d-shelf" key={index} style={{ top: `${(index + 1) * 100 / (shelves + 1)}%` }} />
                ))}
                {Array.from({ length: drawers }, (_, index) => (
                  <div className="sm-3d-drawer" key={index} style={{ bottom: `${index * 23 + 5}px` }}>
                    {handles ? <i /> : null}
                  </div>
                ))}
              </div>
              {doors ? (
                <div className="sm-3d-doors">
                  <div className="sm-3d-door">{handles ? <i /> : null}</div>
                  <div className="sm-3d-door">{handles ? <i /> : null}</div>
                  <div className="sm-3d-door">{handles ? <i /> : null}</div>
                </div>
              ) : null}
              <div className="sm-3d-plinth" />
            </div>
            <div className="sm-3d-face sm-3d-side" />
            <div className="sm-3d-face sm-3d-top" />
          </div>
          <div className="sm-3d-shadow" />
        </div>
      </div>
      <div className="sm-3d-meta">
        <span><b>{width} × {height} × {depth} cm</b><small>{material} · {finish}</small></span>
        <span className="sm-3d-hint">Glisser pour tourner · Double-tap pour réinitialiser</span>
      </div>
      <div className="sm-3d-controls" aria-label="Personnaliser les composants du meuble">
        <span className="sm-3d-controls-title">Personnaliser le meuble</span>
        <div className="sm-3d-control-row">
          <button type="button" aria-pressed={doors} onClick={() => setDoors((value) => !value)}>Portes {doors ? "✓" : "+"}</button>
          <button type="button" aria-pressed={handles} onClick={() => setHandles((value) => !value)}>Poignées {handles ? "✓" : "—"}</button>
          <label>Tiroirs
            <select value={drawers} onChange={(event) => setDrawers(Number(event.target.value))}>
              <option value={0}>0</option><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option>
            </select>
          </label>
          <label>Étagères
            <select value={shelves} onChange={(event) => setShelves(Number(event.target.value))}>
              <option value={0}>0</option><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option>
            </select>
          </label>
        </div>
        <small>Modifications visuelles locales à cet aperçu. Elles ne sont pas encore enregistrées dans une fiche technique.</small>
      </div>
      {!valid ? <p className="sm-3d-error">Saisissez trois dimensions positives pour afficher le volume.</p> : null}
      <style jsx>{`
        .sm-3d-wrap{width:100%;min-height:190px;display:flex;flex-direction:column;justify-content:center;gap:8px}
        .sm-3d-stage{height:190px;display:grid;place-items:center;overflow:hidden;touch-action:pan-y;cursor:grab;perspective:850px;user-select:none;background:radial-gradient(ellipse at 50% 48%,#fff 0%,#f5f0e7 72%,#eee6d8 100%);border-radius:12px}
        .sm-3d-stage:active{cursor:grabbing}
        .sm-3d-scene{width:210px;height:145px;position:relative;display:grid;place-items:center;transform-style:preserve-3d}
        .sm-3d-cabinet{width:145px;height:112px;position:relative;transform-style:preserve-3d;transition:transform .08s linear}
        .sm-3d-face{position:absolute;box-sizing:border-box;border:1px solid rgba(67,45,25,.55);background:var(--wood);backface-visibility:visible}
        .sm-3d-front{inset:0;width:145px;height:112px;overflow:hidden;box-shadow:inset 0 0 0 2px rgba(255,255,255,.13);transform:translateZ(18px)}
        .sm-3d-interior{position:absolute;inset:0;background:linear-gradient(110deg,#68482e,var(--wood));}
        .sm-3d-shelf{position:absolute;left:0;right:0;height:4px;background:#d2b58b;border-top:1px solid rgba(65,43,24,.55);box-shadow:0 2px 3px rgba(0,0,0,.18)}
        .sm-3d-doors{position:absolute;inset:0;display:flex;gap:3px;padding:5px 5px 12px}
        .sm-3d-door{flex:1;border:1px solid rgba(75,48,25,.55);border-radius:2px;background:linear-gradient(105deg,rgba(255,255,255,var(--finish-gloss)),transparent 38%,rgba(45,25,10,.1));position:relative}
        .sm-3d-door i,.sm-3d-drawer i{position:absolute;right:5px;top:50%;width:3px;height:15px;border-radius:3px;background:#D7BD8B;box-shadow:0 0 1px #49341e}
        .sm-3d-drawer{position:absolute;left:7px;right:7px;height:20px;border:1px solid rgba(75,48,25,.65);background:linear-gradient(105deg,rgba(255,255,255,var(--finish-gloss)),rgba(45,25,10,.08));z-index:2}
        .sm-3d-drawer i{height:3px;left:50%;right:auto;top:7px;width:18px}
        .sm-3d-plinth{position:absolute;left:0;right:0;bottom:0;height:9px;background:#62452d;border-top:1px solid rgba(255,255,255,.2);z-index:3}
        .sm-3d-side{width:36px;height:112px;left:145px;top:0;transform:rotateY(90deg);transform-origin:left center;background:linear-gradient(90deg,#68482e,var(--wood))}
        .sm-3d-top{width:145px;height:36px;left:0;top:-36px;transform:rotateX(90deg);transform-origin:bottom center;background:linear-gradient(110deg,#d2b58b,var(--wood))}
        .sm-3d-shadow{position:absolute;width:150px;height:18px;bottom:1px;left:30px;background:rgba(53,39,23,.18);filter:blur(9px);border-radius:50%;transform:rotateX(70deg)}
        .sm-3d-meta{display:flex;justify-content:space-between;align-items:center;gap:8px;color:#574633;font-size:11px}
        .sm-3d-meta span:first-child{display:flex;flex-direction:column;gap:2px}.sm-3d-meta small{font-size:10px;color:#806f5c}
        .sm-3d-hint{text-align:right;font-size:9px;color:#8b7a66}
        .sm-3d-controls{padding:10px 11px;border:1px solid #e8dfd2;border-radius:10px;background:#fffdf9;display:grid;gap:8px}
        .sm-3d-controls-title{font-size:11px;font-weight:700;color:#574633}
        .sm-3d-control-row{display:flex;gap:7px;flex-wrap:wrap;align-items:center}
        .sm-3d-control-row button,.sm-3d-control-row label{min-height:32px;border:1px solid #dfd3c2;border-radius:7px;background:#fff;padding:0 9px;color:#574633;font-family:inherit;font-size:10px;font-weight:600;display:inline-flex;align-items:center;gap:5px}
        .sm-3d-control-row button[aria-pressed="true"]{background:#295f4e;color:#fff;border-color:#295f4e}
        .sm-3d-control-row select{border:0;background:transparent;color:inherit;font:inherit;outline-offset:2px}
        .sm-3d-controls>small{font-size:9px;color:#8b7a66;line-height:1.45}
        .sm-3d-error{margin:0;color:#9b3d2c;font-size:11px}
        @media(max-width:520px){.sm-3d-stage{height:170px}.sm-3d-meta{align-items:flex-start;flex-direction:column}.sm-3d-hint{text-align:left}.sm-3d-control-row{gap:6px}.sm-3d-control-row button,.sm-3d-control-row label{flex:1;justify-content:center}}
      `}</style>
    </div>
  );
}
