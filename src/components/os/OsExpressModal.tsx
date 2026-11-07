"use client";

import { useState } from "react";
import { ArrowRight, Calculator, CircleAlert, Upload } from "lucide-react";
import { findOsModel, osModels } from "@/lib/os-models";
import { useOs } from "./OsContext";
import OsModal from "./OsModal";

export default function OsExpressModal() {
  const os = useOs();
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [modelId, setModelId] = useState(os.selectedModelId);
  const [amount, setAmount] = useState("");
  const [deposit, setDeposit] = useState("");
  const [error, setError] = useState("");

  const model = findOsModel(modelId);

  function reset() {
    setClientName(""); setPhone(""); setAmount(""); setDeposit(""); setError("");
  }

  function submit() {
    const total = Number(amount);
    const advance = Number(deposit);
    if (clientName.trim().length < 2) {
      setError("Indiquez le nom du client.");
      return;
    }
    if (!Number.isFinite(total) || total <= 0) {
      setError("Renseignez un montant de devis supérieur à zéro (montant négocié avec le client).");
      return;
    }
    if (deposit.trim() !== "" && (!Number.isFinite(advance) || advance < 0 || advance > total)) {
      setError("L’acompte doit être compris entre 0 et le montant du devis.");
      return;
    }
    const now = new Date();
    const number = `SM-${now.getFullYear()}-${String(os.quotes.length + 1).padStart(4, "0")}`;
    os.addQuote({
      id: crypto.randomUUID(),
      number,
      clientName: clientName.trim(),
      clientContact: phone.trim(),
      modelTitle: model.title,
      dimensions: `${os.dimensions.width} × ${os.dimensions.height} × ${os.dimensions.depth} cm`,
      material: `${os.material} · ${os.finish}`,
      finish: os.finish,
      targetPrice: Math.round(total),
      deposit: Number.isFinite(advance) ? Math.round(advance) : 0,
      depositPaid: false,
      status: "draft",
      deliveryTarget: "",
      createdAt: now.toISOString(),
      lines: [{ label: `Devis express · ${model.title}`, amount: Math.round(total) }],
    });
    setError("");
    reset();
    os.setExpressOpen(false);
    os.notify(`Devis ${number} créé en brouillon. Il est enregistré sur cet appareil uniquement.`);
  }

  return (
    <OsModal
      open={os.expressOpen}
      onClose={() => os.setExpressOpen(false)}
      title="Devis Express SenMenuisier"
      subtitle="Montant négocié, versionné et enregistré localement. Aucun PDF n’est encore généré côté serveur."
      icon={<Calculator size={17} />}
      footer={(
        <>
          <button type="button" className="os-primary" onClick={submit}>
            Enregistrer le devis <ArrowRight size={13} />
          </button>
          <button type="button" className="os-mini" onClick={() => os.setExpressOpen(false)}>Annuler</button>
          <span className="spacer" />
          <span className="os-chip">Numéro attribué à l’enregistrement</span>
        </>
      )}
    >
      <div className="os-form">
        <label>
          Nom du client
          <input value={clientName} maxLength={100} placeholder="Nom et prénom"
            onChange={(event) => setClientName(event.target.value)} />
        </label>
        <label>
          Téléphone
          <input type="tel" maxLength={24} value={phone} placeholder="+221 77 000 00 00"
            onChange={(event) => setPhone(event.target.value)} />
        </label>
        <label>
          Meuble
          <select value={modelId} onChange={(event) => setModelId(event.target.value)}>
            {osModels.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
        </label>
        <label>
          Dimensions (cm)
          <input
            readOnly
            value={`${os.dimensions.width} × ${os.dimensions.height} × ${os.dimensions.depth}`}
            aria-label="Dimensions reprises du catalogue"
          />
        </label>
        <label>
          Montant du devis (FCFA)
          <input type="number" min="1" step="1" value={amount} placeholder="Montant convenu avec le client"
            onChange={(event) => setAmount(event.target.value)} />
        </label>
        <label>
          Acompte prévu (FCFA)
          <input type="number" min="0" step="1" value={deposit} placeholder="Optionnel"
            onChange={(event) => setDeposit(event.target.value)} />
        </label>
      </div>

      <p className="os-note" style={{ marginTop: 10 }}>
        Le devis conserve le numéro, la version, les lignes et les conditions. Le montant doit être
        saisi : aucun prix n’est déduit automatiquement des dimensions.
      </p>

      {error ? (
        <div className="os-alert bad">
          <CircleAlert size={14} />
          <div>{error}</div>
        </div>
      ) : null}

      <div className="os-alert">
        <Upload size={14} />
        <div>
          Le PDF partageable n’est pas encore généré : utilisez le bouton d’impression du catalogue pour
          obtenir un document imprimable à partir des coûts calculés.
        </div>
      </div>
    </OsModal>
  );
}
