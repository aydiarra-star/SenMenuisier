# SenMenuisier — Conception produit et technique V1

Version 0.1 — 30 octobre 2026. Slogan : **Le savoir-faire sénégalais, connecté au monde.**

## 1. Vision
SenMenuisier est un OS métier pour les ateliers de menuiserie sénégalais. Sa valeur centrale est le **Dossier de Fabrication** : dossier traçable reliant client, inspirations, dimensions, dessins, versions de devis, matériaux, listes de pièces/débit, coûts internes, étapes, responsables, photos, paiements enregistrés, contrôle qualité, livraison, garantie, passeport QR et audit. Coûts, marges et notes internes restent invisibles au client.

## 2. Périmètre
### V1
Ateliers/équipes/rôles ; vitrines et portfolios ; catalogue et configurateur paramétrique ; CRM ; devis versionnés, PDF, partage et acceptation ; commandes et dossiers ; matériaux, composants, inventaire et mouvements ; calculs transparents ; étapes, tâches, échéances et photos ; paiements/dépenses enregistrés ; contrôle qualité, livraison, garantie et QR ; dashboard réel ; base de prix sourcée ; assistant métier borné aux données ; français et wolof.
### Marketplace V1
Découverte publique des ateliers, portfolios, recherche, catalogue et demandes de devis. Panier transactionnel et paiements en ligne ultérieurs, après validation partenaires et obligations.
### Hors V1
Aluminium, métal, PVC et autres métiers ; paiement en ligne ; logistique avancée ; portail fournisseur complet ; optimisation industrielle certifiée. Ne pas les afficher comme opérationnels.

## 3. Rôles
Propriétaire d'atelier ; responsable/gérant ; menuisier/employé ; apprenti ; client particulier/professionnel ; administrateur plateforme. Un utilisateur peut appartenir à plusieurs ateliers. Toute donnée privée est rattachée à un atelier et à une appartenance active. Les permissions sont vérifiées côté serveur.

## 4. Interface obligatoire
Le fichier HTML « SenMenuisier – OS de la Menuiserie » est la référence visuelle et structurelle. Conserver les six zones dans cet ordre :
1. Catalogue Intelligent & calculateur paramétrique.
2. Production & Passeport QR.
3. Score Santé de l'atelier.
4. Base de Prix Nationale.
5. CRM Artisan & relances.
6. Feuille de Route.
Palette : #8B5E3C bois, #295F4E vert forêt, #F4EFE7 sable, #222222 graphite, #D4A373 laiton. Polices Plus Jakarta Sans et Cabinet Grotesk. Cartes arrondies, ombres douces, icônes Lucide sobres. Les contenus d'exemple du HTML ne sont pas des données métier : remplacer par des données réelles ou états vides, sans changer le rendu de référence.

## 5. Parcours central
Prospect → fiche CRM → choix/création modèle → dimensions/matériaux/contraintes → estimation explicable → devis versionné → acceptation → commande et Dossier de Fabrication → planification/affectation → production horodatée → saisie des paiements reçus → contrôle qualité → livraison/garantie → passeport QR public filtré.

## 6. Modules
- **Catalogue/calculateur :** modèles versionnés, paramètres dimensionnels, unités, bornes, compatibilités, matériaux, épaisseurs, finitions, accessoires, formules explicables. Décomposer matière, main-d'œuvre, consommables, transport et frais configurables. Prix/marge réservés aux rôles autorisés. Résultat avec hypothèses, tarifs et date.
- **Débit :** un plan optimisé nécessite dimensions de panneaux, sens du fil, trait de scie, marges, défauts, rotations et contraintes atelier. Sans ces données, ne pas prétendre à une optimisation réelle.
- **Production :** plans versionnés, nomenclature, pièces, matériaux, tâches, responsables, échéances, incidents, photos, qualité, livraison, garantie et audit. Transitions validées serveur.
- **Passeport QR :** identifiant public aléatoire non séquentiel, route publique dédiée, champs filtrés, URL construite depuis le domaine configuré, révocation et journal. Impression réelle via vue imprimable/API navigateur ; pas de domaine fictif codé en dur.
- **Score Santé :** délais, marge des dossiers clôturés suffisamment renseignés, recouvrement, retards, stocks, charge, qualité/reprises. Formule, période, seuil et explication. Si données insuffisantes, le dire au lieu d'inventer un score.
- **Base Prix :** matériau/référence, qualité, essence/marque, épaisseur, dimensions, unité, prix/devise, région, date, source, type de source, contributeur, confiance et validation. Distinguer fournisseur confirmé, relevé artisan, estimation, historique. Une observation isolée n'est pas un prix national officiel.
- **CRM :** fiches, contacts, consentements, historique, devis, commandes, rappels et tâches. Relance manuelle initiale ; WhatsApp ouvre une conversation préremplie, mais aucun message n'est dit envoyé sans API autorisée et confirmation.
- **Roadmap :** statuts alignés sur les fonctions réellement livrées.

## 7. Architecture cible
Frontend Next.js App Router, TypeScript strict, Tailwind ; i18n centralisée FR/Wolof ; Supabase Auth ; PostgreSQL avec RLS ; Supabase Storage privé par défaut ; services métier côté serveur dans un monolithe modulaire ; Render pour l'application après configuration ; environnements développement/préproduction/production ; Vitest, intégration PostgreSQL/RLS, Playwright E2E. Secrets serveur uniquement. Cette architecture est une cible, pas la preuve de services déjà créés.

## 8. Modèle conceptuel
- Identité : profiles, workshops, workshop_members, invitations, role_permissions.
- Catalogue : furniture_models, model_versions, model_parameters, materials, finishes, accessories.
- CRM : clients, client_contacts, client_consents, interactions, reminders.
- Devis : quotes, quote_versions, quote_items, quote_acceptances.
- Commandes : orders, manufacturing_dossiers, dossier_documents.
- Fabrication : production_steps, tasks, task_assignments, piece_lists, material_reservations, quality_checks.
- Stocks : stock_items, stock_locations, stock_movements, suppliers.
- Finances : payment_records, expenses, cost_snapshots.
- Passeport : product_passports, passport_events, warranty_records.
- Prix : price_observations, price_sources, price_validations.
- Marketplace : workshop_storefronts, portfolio_items, public_catalog_items.
- Sécurité : audit_events, access_grants, export_jobs.
Ce modèle est conceptuel ; relations, contraintes, index et policies RLS seront spécifiés avant migrations.

## 9. Sécurité multi-ateliers
Chaque requête est limitée à l'atelier courant et aux appartenances actives. Changement d'atelier après vérification. Policies RLS combinant rôle authentifié et appartenance/permission sur la ligne. UPDATE avec USING et WITH CHECK. Vues en security invoker si possible ; sinon accès révoqué et exposition contrôlée. Éviter fonctions privilégiées. Tests de lecture/modification/suppression inter-ateliers. Ne pas utiliser user_metadata comme autorisation. Ne jamais exposer service-role/secret dans le navigateur.

## 10. Phasage
**P0 Conception :** valider périmètre, rôles, workflows, calculs ; extraire tokens/composants du HTML sans altérer rendu ; critères visuels/métier.
**P1 Socle/interface :** Next.js/TypeScript, qualité, structure, i18n, reproduction fidèle des six espaces, navigation responsive, états vides, CI et tests visuels.
**P2 Identité/ateliers :** Auth, profils, adhésion/invitations, rôles, RLS, tests d'isolation, stockage.
**P3 Catalogue/CRM/devis :** clients, modèles, matériaux, calculateur, tarifs, devis versionnés, PDF, acceptation.
**P4 Commandes/production :** dossier, étapes, affectations, pièces, stock, qualité, documents et audit.
**P5 QR/prix/indicateurs :** passeport filtré/révocable, impression, prix sourcés, score explicable.
**P6 Marketplace/préproduction :** vitrines, portfolios, recherche, demandes de devis, E2E, sauvegarde/restauration, monitoring et GO/NO-GO.

## 11. Critères d'acceptation
Rendu fidèle au HTML sur mobile/desktop ; six espaces présents ; aucune donnée démo présentée réelle ; isolation inter-ateliers vérifiée ; coûts/marges invisibles aux clients ; calculs avec hypothèses/unités/sources/dates ; écritures confirmées serveur ; QR filtré ; indisponibilités explicites ; tests critiques, build, migrations et sécurité validés avant fusion.

## 12. Décisions métier à instruire
Catalogue initial ; unités/tolérances ; formules main-d'œuvre/frais/marge/taxes/arrondis ; statuts devis/commande/production/garantie ; modération des prix nationaux ; champs publics QR/vitrines ; permissions fines employés/apprentis ; conditions marketplace/paiement. Aucune valeur arbitraire ne sera codée pour masquer une décision non confirmée.