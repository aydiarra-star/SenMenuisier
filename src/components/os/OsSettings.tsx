"use client";
import { Heart, Moon, SlidersHorizontal, Sun } from "lucide-react";
import { osModels } from "@/lib/os-models";
import { useOs } from "./OsContext";
export default function OsSettings() {
  const os=useOs();
  const favoriteModels=osModels.filter(model=>os.favorites.includes(model.id));
  return <div className="os-module">
    <header className="os-module-title"><div><span>PRÉFÉRENCES DE L’APPLICATION</span><h1>Paramètres</h1><p>Personnalisez l’affichage et retrouvez vos modèles favoris. Les préférences sont enregistrées sur cet appareil.</p></div></header>
    <section className="os-card"><div className="os-card-head"><span className="os-tile"><SlidersHorizontal size={17}/></span><h2>Apparence</h2></div><div className="os-row-item"><div className="grow"><h4>Thème de l’application</h4><p>Choisissez un affichage clair ou sombre pour votre atelier.</p></div><button type="button" className="os-mini" onClick={os.toggleTheme} aria-pressed={os.theme==="dark"}>{os.theme==="dark"?<Sun size={14}/>:<Moon size={14}/>} {os.theme==="dark"?"Passer au clair":"Passer au sombre"}</button></div></section>
    <section className="os-card"><div className="os-card-head"><span className="os-tile"><Heart size={17}/></span><h2>Mes modèles favoris</h2><span className="os-chip">{favoriteModels.length}</span></div>
      {favoriteModels.length===0?<div className="os-empty"><Heart size={22}/><b>Aucun favori pour le moment</b><p>Ajoutez des modèles aux favoris depuis le catalogue ou l’accueil.</p></div>:<div className="os-list">{favoriteModels.map(model=><article className="os-row-item" key={model.id}><div className="grow"><h4>{model.title}</h4><p>{model.short}</p></div><button type="button" className="os-mini" onClick={()=>{os.selectModel(model.id);os.go("catalogue");}}>Ouvrir le modèle</button><button type="button" className="os-icon-btn danger" aria-label={`Retirer ${model.title} des favoris`} onClick={()=>os.toggleFavorite(model.id)}><Heart size={14} fill="currentColor"/></button></article>)}</div>}
    </section>
    <div className="os-alert"><SlidersHorizontal size={15}/><div><b>Compte et sécurité non activés.</b> La gestion des membres, des rôles, des invitations et des données de l’atelier sera disponible après mise en service de l’authentification et du backend. Aucune modification de compte n’est simulée ici.</div></div>
  </div>;
}