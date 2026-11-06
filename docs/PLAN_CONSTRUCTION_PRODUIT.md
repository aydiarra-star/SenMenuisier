# SenMenuisier — plan de construction du produit

Version de travail : 6 novembre 2026  
Branche de travail : `design/foundation-v1`

## Objectif

Construire un outil opérationnel pour les ateliers de menuiserie au Sénégal : du premier contact client à la livraison, en reliant conception, devis, matières, fabrication, qualité, garantie et visibilité commerciale.

Le produit doit rester simple à prendre en main sur téléphone, même dans un atelier où le temps, la connexion et le niveau de familiarité numérique sont limités.

## Règles non négociables

1. Une donnée métier n'est réelle que si elle est enregistrée côté serveur et relue depuis ce serveur.
2. Aucune donnée d'exemple ne doit être présentée comme un client, une commande, un prix national, un stock ou un indicateur réel.
3. Aucun devis fiable ne doit être calculé à partir des seules dimensions. Il faut une nomenclature validée, des quantités, unités, tarifs datés et hypothèses explicites.
4. Aucun plan de débit optimisé ne doit être annoncé sans formats de panneaux, sens du fil, trait de scie, marges, défauts et contraintes de coupe.
5. Les coûts d'achat, marges, dépenses et notes internes sont privés à l'atelier et soumis à des permissions serveur.
6. Les ateliers sont isolés entre eux en base de données avec PostgreSQL RLS et vérification des rôles côté serveur.
7. Les QR publics n'exposent que les informations explicitement autorisées, jamais les données client ou financières.
8. Pas de faux succès : paiement, WhatsApp, sauvegarde, impression, devis, QR et synchronisation ne sont confirmés qu'après preuve technique.
9. Français par défaut ; wolof préparé dès la V1, avec validation humaine des traductions métier.
10. Aucun service payant, domaine, compte ou fournisseur externe n'est créé sans accord explicite.

## Parcours métier cible

Prospect → client et consentement → besoin / inspiration → dimensions et contraintes → nomenclature → estimation détaillée → devis versionné → acceptation → commande → dossier de fabrication → réservation matières → opérations et tâches → contrôles qualité → livraison → garantie → passeport QR.

Chaque étape doit conserver son historique et permettre de savoir qui a fait quoi, quand, et sur quelle version du dossier.

## Modules fonctionnels

### A. Identité et ateliers
- Inscription, connexion, récupération de compte et profil.
- Création d'un atelier, invitations et adhésions multiples.
- Rôles : propriétaire, responsable, menuisier, apprenti et client.
- Matrice de permissions lisible et testée ; accès financier réservé aux rôles explicitement autorisés par le propriétaire.
- Changement d'atelier contrôlé côté serveur.

### B. Catalogue et configurateur
- Bibliothèque de modèles d'ouvrages, versions et paramètres.
- Dimensions, tolérances, contraintes, matériaux, épaisseurs, finitions et accessoires.
- Fiche technique et photos propres à chaque atelier.
- Nomenclature (BOM) modifiable et validée par le menuisier.
- Historique des variantes et des modifications.

### C. Devis et calcul de prix
- Matières, pertes, quincaillerie, consommables, finition, main-d'œuvre, transport et charges.
- Unités compatibles, prix d'achat datés et provenance.
- Marge brute calculée sur le prix de vente, pas ajoutée arbitrairement au coût.
- Arrondis FCFA explicites, version de devis, durée de validité et conditions.
- Export PDF et partage seulement après intégration testée.
- Vue client sans coûts internes ni marge.

### D. Dossier de fabrication
- Commande liée à une version acceptée du devis.
- Liste de pièces et nomenclature versionnées.
- Opérations, tâches, responsables, dates, priorité et dépendances.
- Photos, notes, incidents et avancement horodaté.
- Réservation, consommation et retour de matières.
- Historique d'audit.

### E. Stocks et fournisseurs
- Matières premières, panneaux, essences, quincaillerie, consommables et unités.
- Entrées, sorties, ajustements, réservations et inventaires.
- Seuils d'alerte et coût moyen avec méthode documentée.
- Fiches fournisseurs, coordonnées et historique d'achats.
- Import/export contrôlé ; aucun stock fictif préchargé.

### F. Qualité, livraison et garantie
- Contrôles dimensionnels, assemblage, finition, conformité et photos.
- Défauts, reprises, validation et responsable.
- Bon de livraison, date et preuve de remise.
- Conditions et durée de garantie configurables.
- Passeport produit avec identifiant aléatoire, révocation et route publique filtrée.

### G. CRM et relances
- Contacts, préférences et consentements.
- Historique des échanges, besoins, devis, commandes et rappels.
- Relances manuelles au départ.
- WhatsApp : ouvrir une conversation préremplie n'est pas envoyer un message. L'envoi automatique nécessite un fournisseur et une autorisation explicites.

### H. Base de prix
- Produit, essence, qualité, épaisseur, dimensions, unité et région.
- Prix, devise, date d'observation, source et contributeur.
- Statut : fournisseur confirmé, relevé artisan, estimation ou historique.
- Contrôle des doublons, fraîcheur et confiance.
- Aucune observation isolée ne devient un « prix national officiel ».

### I. Tableau de bord et score atelier
- Retards, charge, commandes, devis, recouvrement et qualité.
- Score expliqué par formule, période, seuils et données disponibles.
- Si les données sont insuffisantes, afficher « score non calculé ».

### J. Vitrine et marketplace
- Profil public d'atelier, portfolio, zone de service et spécialités.
- Catalogue public avec champs autorisés.
- Recherche et demande de devis.
- Modération, signalement et protection contre le spam.
- Paiement en ligne et logistique transactionnelle hors V1 tant que partenaires, conformité et remboursements ne sont pas validés.

## Architecture technique cible

- Next.js App Router et TypeScript strict.
- Monolithe modulaire au départ : modules métier séparés, services serveur et frontières de validation.
- Supabase Auth, PostgreSQL et Storage privé, après création et configuration autorisées du projet.
- PostgreSQL comme source de vérité ; aucune réinjection automatique de données navigateur obsolètes.
- RLS sur chaque table d'atelier ; politiques SELECT / INSERT / UPDATE / DELETE testées.
- Secrets exclusivement côté serveur ; aucune clé service-role dans le navigateur.
- Montants comptables en entiers FCFA ou décimaux contrôlés.
- Migrations SQL versionnées, rollback documenté et sauvegardes restaurables.
- Vitest pour règles métier ; tests PostgreSQL/RLS ; Playwright pour parcours critiques.
- Render pour hébergement après validation du service, des variables et des environnements.

Aucune de ces briques externes n'est considérée comme opérationnelle avant provisionnement et tests réels.

## Modèle de données à spécifier

Identité : profiles, workshops, workshop_members, invitations, role_permissions.  
Catalogue : furniture_models, model_versions, model_parameters, materials, finishes, accessories.  
CRM : clients, client_contacts, client_consents, interactions, reminders.  
Devis : quotes, quote_versions, quote_items, quote_acceptances.  
Commandes : orders, manufacturing_dossiers, dossier_documents.  
Fabrication : production_steps, tasks, task_assignments, piece_lists, material_reservations, quality_checks.  
Stocks : stock_items, stock_locations, stock_movements, suppliers, supplier_orders.  
Finances : payment_records, expenses, cost_snapshots.  
QR : product_passports, passport_events, warranty_records.  
Prix : price_observations, price_sources, price_validations.  
Marketplace : workshop_storefronts, portfolio_items, public_catalog_items, quote_requests.  
Sécurité : audit_events, export_jobs, access_grants.

Avant toute migration : clés étrangères, contraintes, index, stratégie de suppression, règles de conservation, RLS et tests inter-ateliers doivent être définis.

## Les six espaces de l'interface (ordre obligatoire)\n\n1. Catalogue Intelligent\n2. Production & Passeport QR\n3. Score Santé de l’atelier\n4. Base de Prix Nationale\n5. CRM Artisan & Relances\n6. Feuille de Route\n\nLe site public de présentation est séparé de l’application atelier : route `/vitrine` pour la présentation, racine `/` pour l’aperçu atelier. Ces routes n'impliquent pas que les fonctions métier soient déjà connectées.\n\n## Phasage de livraison

- P0 — Contrat produit, règles métier, identité visuelle et critères d'acceptation.
- P1 — Interface responsive, navigation, composants, états vides et calculateur transparent.
- P2 — Authentification, ateliers, invitations, rôles, RLS et stockage privé.
- P3 — Catalogue, clients, nomenclature et devis versionnés.
- P4 — Commandes, fabrication, tâches, stocks et fournisseurs.
- P5 — Qualité, livraison, garanties, QR et indicateurs explicables.
- P6 — Vitrines, marketplace, recherche et demandes de devis.
- P7 — Tests E2E, sécurité, sauvegarde/restauration, monitoring et décision de mise en production.

## Définition de « terminé »

Un module n'est terminé que si :
- son parcours mobile et desktop est vérifié ;
- ses données sont validées et persistées côté serveur ;
- les rôles et l'isolation entre ateliers sont testés ;
- les erreurs, états vides, chargements et reprises sont traités ;
- les tests unitaires, intégration et E2E pertinents passent ;
- l'accessibilité clavier, les libellés et contrastes sont vérifiés ;
- aucune action ne prétend réussir sans confirmation du serveur ;
- la documentation et les procédures de sauvegarde sont à jour.

## État au 6 novembre 2026

- Interface d'aperçu : déployée sur la branche de conception.
- Nouveau tableau de bord menuisier : en cours de construction.
- Calculateur métier : fonction locale transparente existante ; pas encore reliée à des tarifs persistés ni à une nomenclature complète.
- Authentification, base de données, RLS, stockage, CRM, production et marketplace : non disponibles tant que les services et parcours ne sont pas implémentés et testés.
