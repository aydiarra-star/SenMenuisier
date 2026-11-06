# Écran d’entrée — interface « OS de la menuiserie »

## Règle
La racine `/` affiche l’interface demandée : rail de navigation, entête collante et
accueil complet. Aucun écran intermédiaire, aucun changement de contenu métier.
L’ancienne page de conception est conservée **à l’identique** sur `/espace-atelier/`.

## Composition (fidèle à la capture fournie)
- Rail forêt : badge SM en bois, « SenMenuisier / Du bois aux belles réalisations »,
  onze entrées (Accueil, Catalogues, Conception, Matériaux, Production, Estimation,
  Clients, Planning, Passeport QR, Apprendre, Paramètres), devise « Le bois construit
  nos rêves », drapeau du Sénégal, version `v1.0.0 • 2026`.
- Entête : recherche (modèles, dossiers, clients), interrupteur clair/sombre réel,
  notifications, profil « Wolf · Mon atelier ».
- Accueil : bandeau « Transformez vos idées en réalité » + « Nouveau projet »,
  six catégories (Meubles, Portes, Fenêtres, Cuisines, Escaliers, Agencement),
  « Modèles populaires » (Armoire 3 Portes, Cuisine Modulaire en L, Lit 2 Places Luxe,
  Bureau Sur-Mesure) avec favoris et « Utiliser ce modèle », « Concevez votre meuble »
  (croquis coté, largeur/hauteur/profondeur, essence, finition, « Visualiser en 3D »),
  « Estimation rapide », « Suivi de production », « Scan & Suivez » (plaque bois + QR
  réel), bannière des essences, encart « Mon atelier » et proverbe.
- Pied de page : SenMenuisier 2026, langue, aide, contact, réseaux (liens non configurés).

## Ce qui est réellement fait
- Le choix d’un modèle met à jour le titre, les cotes et le récapitulatif.
- Le QR est encodé localement (`qrcode-generator`) à partir d’un identifiant de dossier.
  Il n’existe pas encore de page publique : aucun lien n’est inventé.
- Le devis express enregistre un numéro, des lignes, un acompte et reste un brouillon local.
- L’impression utilise une feuille dédiée (`os-print`) rendue visible uniquement en
  `@media print` : devis ou étiquette, jamais les deux.
- Le thème sombre est une vraie bascule d’état, enregistrée avec les autres préférences.

## Liens directs
`/?vue=catalogue|production|sante|prix|crm|roadmap` ouvre l’espace correspondant.

## Limites assumées
Vue 3D, plan de découpe, caméra de scan et page publique de passeport ne sont pas
livrés : les boutons concernés expliquent l’indisponibilité au lieu d’un faux succès.
