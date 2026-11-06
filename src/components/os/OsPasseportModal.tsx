"use client";

import { useEffect, useMemo, useState } from "react";
import { Camera, CircleAlert, Link2, Lock, Printer, QrCode, Search, ShieldCheck } from "lucide-react";
import { useOs } from "./OsContext";
import OsModal from "./OsModal";
import QrCodeView from "./QrCode";

/**
 * Modal « Passeport Numérique QR ».
 * Les champs publics sont explicitement listés et limités : ni nom, ni téléphone,
 * ni montant ne sont publiés. Le lien public n'existe pas encore ; il est donc
 * affiché comme non disponible et révocable par construction.
 */
export default function OsPasseportModal() {
  const os = useOs();
  const job = os.workspace.production.find((item) => item.id === os.passportJob) ?? null;
  const [publicLink, setPublicLink] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");
  const [scanMode, setScanMode] = useState(false);
  const [scanValue, setScanValue] = useState("");
  const scanError = useMemo(() => {
    if (!scanMode || scanValue.trim().length === 0) return "";
    const raw = scanValue.trim().toUpperCase();
    const serial = raw.replace(/^SENMENUISIER:(LOCAL:)?/, "").replace(/[^0-9A-Z]/g, "");
    if (serial.length < 4) return "Ce code ne correspond à aucun dossier de cet appareil.";
    const match = os.workspace.production.find((item) => item.id.toUpperCase().startsWith(serial.slice(0, 8)));
    if (!match) return "Ce code ne correspond à aucun dossier de cet appareil.";
    return "";
  }, [scanMode, scanValue, os.workspace.production]);

  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  /* Un lien n'est proposé que pour un dossier réel : aucune page publique n'est publiée. */
  useEffect(() => {
    setPublicLink(null);
    setScanMode(false);
    setScanValue("");
  }, [os.passportJob, os.passportOpen]);

  const payload = job ? `SENMENUISIER:LOCAL:${job.id.slice(0, 8).toUpperCase()}` : null;

  return (
    <OsModal
      open={os.passportOpen}
      onClose={() => os.setPassportOpen(false)}
      title="Passeport Numérique QR"
      subtitle="Détails publics limités, lien révocable et impression réelle de l’étiquette."
      icon={<QrCode size={17} />}
      wide
      footer={(
        <>
          <button
            type="button"
            className="os-mini"
            disabled={!job}
            onClick={() => os.requestPrint("label")}
          >
            <Printer size={13} /> Imprimer l’étiquette
          </button>
          <button type="button" className="os-mini" onClick={() => os.setPassportOpen(false)}>Fermer</button>
          <span className="spacer" />
          <span className="os-chip"><Lock size={11} /> Champs publics filtrés</span>
        </>
      )}
    >
      {scanMode ? (
        <div>
          <h3 style={{ margin: "0 0 6px", fontFamily: "var(--display)", fontSize: 13 }}>Retrouver un ouvrage</h3>
          <p className="os-note">
            La caméra du navigateur n’est pas encore branchée : aucun scan automatique n’est simulé.
            Saisissez ou collez le code inscrit sous le QR de l’étiquette.
          </p>
          <div className="os-linkbox" style={{ marginTop: 10 }}>
            <Search size={13} />
            <input
              autoFocus
              value={scanValue}
              placeholder="SENMENUISIER:LOCAL:49214B29"
              aria-label="Code de l’étiquette"
              onChange={(event) => setScanValue(event.target.value)}
            />
          </div>
          {scanValue.trim() && !scanError ? (
            <div className="os-alert ok" style={{ marginTop: 10 }}>
              <ShieldCheck size={14} />
              <div>
                Code reconnu : dossier trouvé sur cet appareil.
                <button
                  type="button"
                  className="os-mini"
                  style={{ marginTop: 8 }}
                  onClick={() => {
                    const serial = scanValue.trim().toUpperCase()
                      .replace(/^SENMENUISIER:(LOCAL:)?/, "").replace(/[^0-9A-Z]/g, "").slice(0, 8);
                    const match = os.workspace.production.find((item) => item.id.toUpperCase().startsWith(serial));
                    if (match) os.setPassportJob(match.id);
                  }}
                >
                  Ouvrir le passeport
                </button>
              </div>
            </div>
          ) : null}
          {scanError ? (
            <div className="os-alert bad" style={{ marginTop: 10 }}>
              <CircleAlert size={14} />
              <div>{scanError}</div>
            </div>
          ) : null}
          <button type="button" className="os-mini" style={{ marginTop: 10 }} onClick={() => setScanMode(false)}>
            Revenir au passeport
          </button>
        </div>
      ) : job ? (
        <div className="os-grid-2" style={{ alignItems: "start" }}>
          <div className="os-qr-live">
            <QrCodeView value={payload} size={150} title={`QR du dossier ${job.title}`} />
            <div style={{ textAlign: "center" }}>
              <b style={{ display: "block", fontSize: 12.5 }}>{job.title}</b>
              <small style={{ display: "block", marginTop: 3, fontSize: 10, color: "#8D8275" }}>
                N° {job.id.slice(0, 8).toUpperCase()}
              </small>
            </div>
            <span className="os-chip"><ShieldCheck size={11} /> QR encodé localement</span>
            <button type="button" className="os-mini" onClick={() => setScanMode(true)}>
              <Camera size={13} /> Scanner un autre code
            </button>
          </div>

          <div>
            <h3 style={{ margin: "0 0 6px", fontFamily: "var(--display)", fontSize: 13 }}>Champs publiés</h3>
            <div className="os-table">
              <div className="os-table-row"><span>Modèle</span><b>Publié</b></div>
              <div className="os-table-row"><span>Étape de fabrication</span><b>Publiée</b></div>
              <div className="os-table-row"><span>Date promise de livraison</span><b>Publiée</b></div>
              <div className="os-table-row"><span>Nom du client</span><b>Jamais publié</b></div>
              <div className="os-table-row"><span>Téléphone / WhatsApp</span><b>Jamais publié</b></div>
              <div className="os-table-row"><span>Coûts et marge</span><b>Jamais publiés</b></div>
            </div>

            <h3 style={{ margin: "14px 0 6px", fontFamily: "var(--display)", fontSize: 13 }}>Lien public</h3>
            {publicLink ? (
              <div className="os-linkbox">
                <Link2 size={13} />
                <input readOnly value={publicLink} aria-label="Lien public du passeport" />
              </div>
            ) : (
              <p className="os-note">
                Aucun lien public n’est émis : la page publique sécurisée n’est pas encore construite.
                {" "}
                {origin ? `Le document reste consultable sur cet appareil (${origin}).` : ""}
              </p>
            )}

            <div className="os-alert">
              <CircleAlert size={14} />
              <div>
                Sans hébergement public, la révocation et la vérification à distance ne peuvent pas être
                garanties. Ne diffusez pas ce QR comme preuve d’authenticité.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="os-empty">
          <Camera size={24} />
          <b>Aucun dossier sélectionné</b>
          <p>
            Créez un dossier de fabrication puis ouvrez son passeport depuis le tableau de production.
            Aucun QR n’est généré sans dossier réel.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            <button type="button" className="os-mini" onClick={() => setScanMode(true)}>
              <Camera size={13} /> Scanner un code
            </button>
            <button
              type="button"
              className="os-mini"
              onClick={() => {
                os.setPassportOpen(false);
                os.go("production");
              }}
            >
              Aller à la production
            </button>
          </div>
        </div>
      )}
    </OsModal>
  );
}
