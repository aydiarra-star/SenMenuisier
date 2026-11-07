"use client";
import { CalendarDays, Clock3, Hammer, PackageCheck } from "lucide-react";
import { productionStages } from "@/lib/workshop-workspace";
import { useOs } from "./OsContext";
const today = () => new Date().toISOString().slice(0, 10);
export default function OsPlanning() {
  const os = useOs();
  const jobs = [...os.workspace.production].sort((a,b)=>a.dueDate.localeCompare(b.dueDate));
  const active = jobs.filter(job=>job.status!=="livre");
  const overdue = active.filter(job=>job.dueDate && job.dueDate<today());
  function updateDate(id:string,dueDate:string) {
    os.setWorkspace(current=>({...current,production:current.production.map(job=>job.id===id?{...job,dueDate}:job)}));
    os.notify("Échéance mise à jour sur cet appareil. Elle n’est pas encore synchronisée avec un serveur.");
  }
  return <div className="os-module">
    <header className="os-module-title"><div><span>PLANNING ATELIER</span><h1>Planning de production</h1><p>Organisez les échéances de vos ouvrages et repérez les retards. Les changements restent locaux à cet appareil.</p></div><button type="button" className="os-primary" style={{width:"auto",padding:"0 14px"}} onClick={()=>os.go("production")}><Hammer size={14}/> Gérer les dossiers</button></header>
    <div className="os-grid-2">
      <section className="os-card"><div className="os-card-head"><span className="os-tile"><Clock3 size={17}/></span><h2>À traiter</h2></div><b style={{fontSize:28}}>{active.length}</b><p className="os-sub">Dossiers non livrés</p></section>
      <section className="os-card"><div className="os-card-head"><span className="os-tile"><CalendarDays size={17}/></span><h2>En retard</h2></div><b style={{fontSize:28}}>{overdue.length}</b><p className="os-sub">Échéances dépassées</p></section>
    </div>
    <section className="os-card"><div className="os-card-head"><span className="os-tile"><PackageCheck size={17}/></span><h2>Calendrier des ouvrages</h2></div>
      {jobs.length===0?<div className="os-empty"><CalendarDays size={24}/><b>Aucun ouvrage planifié</b><p>Créez un dossier de fabrication pour commencer à organiser le planning de l’atelier.</p><button type="button" className="os-primary" style={{width:"auto",padding:"0 14px"}} onClick={()=>os.go("production")}>Créer un dossier</button></div>:
      <div className="os-list">{jobs.map(job=>{const stage=productionStages.find(item=>item.id===job.status);const late=job.status!=="livre"&&Boolean(job.dueDate)&&job.dueDate<today();return <article className="os-row-item" key={job.id}><div className="grow"><h4>{job.title}</h4><p>{job.client} · {stage?.label??job.status}</p><span className={late?"os-chip warn":job.status==="livre"?"os-chip local":"os-chip"}>{late?"En retard":job.status==="livre"?"Livré":"Échéance"}</span></div><label style={{display:"grid",gap:4,minWidth:135,fontSize:11}}>Date prévue<input aria-label={`Échéance de ${job.title}`} type="date" value={job.dueDate} onChange={event=>updateDate(job.id,event.target.value)}/></label></article>})}</div>}
    </section>
    <div className="os-alert"><CalendarDays size={15}/><div><b>Planning local.</b> Les dates sont modifiables et conservées dans ce navigateur. Les affectations d’équipe, notifications et calendriers partagés attendent la connexion backend.</div></div>
  </div>;
}