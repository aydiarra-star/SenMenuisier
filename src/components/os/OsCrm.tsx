"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { CircleAlert, MessageCircle, Phone, Plus, Trash2, Users } from "lucide-react";
import { useOs } from "./OsContext";

export default function OsCrm() {
  const os = useOs();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [followUp, setFollowUp] = useState("");

  const today = new Date().toISOString().slice(0, 10);
  const contacts = os.workspace.contacts;
  const due = contacts.filter((contact) => contact.nextFollowUp && contact.nextFollowUp <= today);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    os.setWorkspace((current) => ({
      ...current,
      contacts: [{
        id: crypto.randomUUID(),
        name: name.trim(),
        phone: phone.trim(),
        city: city.trim(),
        notes: notes.trim(),
        consentWhatsApp: consent,
        nextFollowUp: followUp,
        createdAt: new Date().toISOString(),
      }, ...current.contacts],
    }));
    setName(""); setPhone(""); setCity(""); setNotes(""); setConsent(false); setFollowUp("");
    os.notify("Contact ajouté et enregistré dans ce navigateur.");
  }

  return (
    <div className="os-module">
      <header className="os-module-title">
        <div>
          <span>05 / CRM ARTISAN &amp; RELANCES</span>
          <h1>CRM Artisan &amp; Relances</h1>
          <p>
            Le carnet, les notes et les relances restent privés à l’atelier. Un clic « Relancer »
            n’envoie rien tout seul : il ouvre WhatsApp avec un message préparé, après vérification du
            numéro et du consentement.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span className="os-chip">{contacts.length} contact(s)</span>
          <span className="os-chip warn">{due.length} relance(s) à faire</span>
        </div>
      </header>

      <section className="os-card">
        <div className="os-card-head">
          <span className="os-tile" aria-hidden="true"><Plus size={17} /></span>
          <h2>Ajouter un client</h2>
        </div>
        <form className="os-form" onSubmit={submit}>
          <label>
            Nom du client
            <input required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder="Nom et prénom" />
          </label>
          <label>
            Téléphone
            <input required type="tel" maxLength={24} value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+221 77 000 00 00" />
          </label>
          <label>
            Ville
            <input maxLength={80} value={city} onChange={(event) => setCity(event.target.value)} placeholder="Ex. Dakar" />
          </label>
          <label>
            Prochaine relance
            <input type="date" value={followUp} onChange={(event) => setFollowUp(event.target.value)} />
          </label>
          <label className="wide">
            Notes
            <textarea rows={3} maxLength={500} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Préférences, demande, historique utile…" />
          </label>
          <label className="wide" style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              style={{ width: 17, height: 17, margin: 0 }}
            />
            Le client accepte les relances WhatsApp.
          </label>
          <button type="submit" className="os-primary" style={{ width: "auto", padding: "0 15px" }}>
            <Plus size={14} /> Enregistrer le contact
          </button>
        </form>
      </section>

      <section>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <h2 style={{ margin: 0, fontFamily: "var(--display)", fontSize: 16, fontWeight: 800 }}>Carnet de clients</h2>
          <span className="os-chip">Données locales</span>
        </div>

        {contacts.length === 0 ? (
          <div className="os-empty">
            <Users size={24} />
            <b>Aucun client enregistré</b>
            <p>Ajoutez un client pour démarrer votre carnet. Les données restent sur cet appareil.</p>
          </div>
        ) : (
          <div className="os-list">
            {contacts.map((contact) => {
              const digits = contact.phone.replace(/[^0-9]/g, "");
              const message = encodeURIComponent(
                `Bonjour ${contact.name}, je vous contacte au sujet de votre projet de menuiserie.`,
              );
              const canWhatsApp = contact.consentWhatsApp && digits.length >= 8;
              const isDue = Boolean(contact.nextFollowUp) && contact.nextFollowUp <= today;
              return (
                <article className="os-row-item" key={contact.id}>
                  <span className="os-stat-icon sand" aria-hidden="true"><Users size={15} /></span>
                  <div className="grow">
                    <h4>{contact.name}</h4>
                    <p>{contact.city || "Ville non renseignée"} · {contact.phone}</p>
                    {contact.notes ? <p>{contact.notes}</p> : null}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                      <span className={contact.consentWhatsApp ? "os-chip local" : "os-chip"}>
                        {contact.consentWhatsApp ? "Consentement WhatsApp" : "Pas de consentement"}
                      </span>
                      {contact.nextFollowUp ? (
                        <span className={isDue ? "os-chip warn" : "os-chip"}>Relance : {contact.nextFollowUp}</span>
                      ) : null}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                    <a className="os-icon-btn" href={`tel:${contact.phone}`} aria-label={`Appeler ${contact.name}`}>
                      <Phone size={15} />
                    </a>
                    {canWhatsApp ? (
                      <a
                        className="os-mini"
                        href={`https://wa.me/${digits}?text=${message}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Ouvrir WhatsApp pour ${contact.name}`}
                      >
                        <MessageCircle size={13} /> Relancer
                      </a>
                    ) : (
                      <button
                        type="button"
                        className="os-mini"
                        disabled
                        title="Consentement WhatsApp ou numéro valide manquant"
                      >
                        <MessageCircle size={13} /> Relancer
                      </button>
                    )}
                    <button
                      type="button"
                      className="os-icon-btn danger"
                      aria-label={`Supprimer ${contact.name}`}
                      onClick={() => os.setWorkspace((current) => ({
                        ...current,
                        contacts: current.contacts.filter((row) => row.id !== contact.id),
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

      <div className="os-alert">
        <CircleAlert size={15} />
        <div>
          <b>Aucun message n’est envoyé par l’application.</b> Le bouton ouvre WhatsApp dans un nouvel
          onglet avec le message préparé ; c’est vous qui l’envoyez. Sans consentement enregistré et
          sans numéro exploitable, le bouton reste inactif.
        </div>
      </div>
    </div>
  );
}
