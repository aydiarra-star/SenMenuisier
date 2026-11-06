# Cahier de recette — interface HTML de référence

## Source et règle
Source visuelle et fonctionnelle : fichier fourni « SenMenuisier – OS de la Menuiserie » (HTML, 977 lignes). Cette liste décrit ce qui doit être conservé et rendu fonctionnel. Toute différence avec l'implémentation React actuelle doit être traitée comme un écart à corriger, pas comme une nouvelle direction de design.

## Enveloppe globale
- En-tête collant avec badge SM, nom et version, sélecteur d'atelier, accès direct au Score Santé, action Nouveau Devis Express et profil.
- Barre de navigation horizontale défilante, six onglets dans cet ordre et avec ces libellés :
  1. Catalogue Intelligent
  2. Production & Passeport QR
  3. Score Santé (82/100)
  4. Base de Prix Nationale
  5. CRM Artisan & Relances
  6. Feuille de Route
- Fond sable à motif discret, palette bois/vert forêt/laiton/graphite, typographies Plus Jakarta Sans et Cabinet Grotesk, cartes arrondies et ombres douces.
- Comportement responsive ; navigation utilisable sur écran étroit.

## Module 1 — Catalogue Intelligent & calculateur paramétrique
- Présente le titre « Catalogue Intelligent de Meubles » et le bloc « Cours Moyen MDF 18mm ».
- Quatre modèles sélectionnables : Armoire 3 Portes, Cuisine Modulaire en L, Lit 2 Places Luxe, Bureau Sur-Mesure.
- Le choix du modèle met à jour titre et dimensions de référence.
- Contrôles de largeur, hauteur et profondeur ; choix de matériau et finition ; panneau d'estimation et actions devis / plan de découpe.
- Les paramètres et prix d'exemple du HTML ne sont pas réputés être des données tarifaires fiables. Le moteur final doit versionner ses formules et expliquer ses hypothèses.
- L'action « Imprimer Plan de Découpe » ne peut afficher un succès que si un vrai plan a été calculé et imprimable.

## Module 2 — Production & Passeport QR
- Conserve les cartes de suivi de fabrication de la maquette et l'accès au Passeport Numérique de chaque dossier.
- Le dossier réel doit contenir client, modèle, matériaux, statut, avancement, dates et événements de fabrication.
- Le QR doit ouvrir une page publique sécurisée, révocable, avec champs publiés explicitement. Aucun nom ou contact client privé ne doit être exposé par défaut.
- L'action imprimer étiquette doit ouvrir une vraie mise en page d'impression.

## Module 3 — Score Santé de l'atelier
- Conserve la présentation du score et le panneau de recommandations.
- Le score 82/100 du prototype est une donnée de démonstration, non une mesure réelle.
- Avant activation, définir les indicateurs, pondérations, fenêtre temporelle, minimum de données et formule. Montrer « données insuffisantes » si nécessaire.
- Les recommandations tarifaires et CRM doivent être calculées ou clairement indiquées comme indisponibles ; aucune recommandation financière inventée.

## Module 4 — Base de Prix Nationale
- Conserve les cartes de référence des matériaux et ouvrages.
- Chaque entrée réelle comprend unité, zone, prix min/médian/max si disponibles, date de collecte, provenance, contributeur vérifié et statut de modération.
- L'historique permet de distinguer variation de marché et donnée ancienne.
- Les valeurs visibles dans la maquette sont des exemples et ne doivent pas être publiées comme tarifs actuels.

## Module 5 — CRM Artisan & Relances
- Conserve le carnet client, les fiches et les actions de relance.
- Contacts, historique et relances sont privés à l'atelier et soumis aux consentements.
- Un clic « Relancer » doit préparer un message et ouvrir WhatsApp via un lien réel, après vérification du numéro et du consentement ; ne pas prétendre qu'un message a été envoyé automatiquement.
- Une fiche client ouvre les données autorisées de ce client.

## Module 6 — Feuille de Route
- Conserve les sept cartes présentes dans la source : Atelier Digital ; Production & Stocks ; Calculateur Bois ; Passeport Numérique ; SenMenuisier Intelligence ; Réseau Professionnel ; Marketplace Artisans.
- Les états d'avancement doivent provenir d'une feuille de route versionnée et administrable. Ne pas afficher un statut achevé sans livraison vérifiée.

## Modales et interactions globales
- Modal « Devis Express SenMenuisier » : nom client, téléphone, meuble, montant et acompte tels que prévus dans la source. Le devis final est enregistré avec un numéro, une version, les lignes, les conditions et un PDF partageable.
- Modal « Passeport Numérique QR » : détails publics limités, QR réel, lien public révocable et impression réelle.
- Toutes les actions doivent avoir un résultat réel ou afficher clairement « non disponible / à venir ». Les alertes de démonstration et faux succès sont interdits.

## Critères transverses de validation
- Les six onglets et les principaux composants correspondent à la source, desktop et mobile.
- Aucune donnée de démonstration n'est présentée comme donnée réelle.
- Un atelier A ne peut lire ni modifier aucune donnée de l'atelier B.
- Un employé ne voit pas les coûts/marges sans permission dédiée ; un client ne les voit jamais.
- Les changements de devis, fabrication, paiements et QR sont horodatés et attribués.
- Les parcours devis, production, passeport, CRM et impression sont testés avant production.
