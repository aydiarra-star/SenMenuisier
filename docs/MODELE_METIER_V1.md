# Modèle métier et architecture fonctionnelle — SenMenuisier V1

## Principe directeur
Le HTML « SenMenuisier – OS de la Menuiserie » est la référence de l'interface. Ce document décrit le modèle de données et les règles nécessaires pour rendre ses six espaces opérationnels, sans redessiner la navigation. V1 reste limitée à la menuiserie.

## Entités principales
Toutes les données privées d'un atelier sont rattachées à `workshop_id`.

| Domaine | Entités V1 |
|---|---|
| Identité et ateliers | profiles, workshops, workshop_memberships |
| Catalogue | furniture_models, model_versions, materials, finishes |
| Clients | customers, customer_contacts, consent_records |
| Devis | quotes, quote_items, quote_revisions, quote_events |
| Fabrication | production_dossiers, measurements, dossier_files, cut_lists, cut_list_items |
| Production | production_steps, production_step_events, assignments |
| Matières et stock | material_catalog, workshop_materials, stock_movements |
| Finances | payments, expenses, cost_entries |
| Traçabilité | passports, passport_events, warranty_records |
| CRM | reminders, follow_up_events |
| Sécurité | audit_events, roles, permissions |

## Rôles
Les rôles sont attribués au niveau de l'adhésion à un atelier :
- Propriétaire : administration de l'atelier, membres, paramètres, données et finances.
- Gérant : gestion opérationnelle ; accès aux finances seulement si permission explicite.
- Menuisier/employé : dossiers et tâches assignés, étapes et fichiers autorisés ; pas de marge par défaut.
- Apprenti : tâches et contenus explicitement attribués.
- Client : ses devis, commandes et passeports partagés uniquement.
- Administrateur plateforme : support encadré et journalisé ; pas d'accès libre aux contenus clients.

Fournisseurs et transporteurs restent hors périmètre opérationnel V1. Un client ne peut jamais accéder à l'espace privé d'un atelier.

## Matrice d'accès de départ

| Ressource | Propriétaire | Gérant | Menuisier | Apprenti | Client |
|---|---|---|---|---|---|
| Atelier/membres | gérer | délégation | non | non | non |
| Clients | gérer | gérer | assignés | non | ses données |
| Devis/prix de vente | gérer | gérer | lecture assignée | non | ses devis |
| Coûts/marges | gérer | permission explicite | non | non | jamais |
| Dossiers | gérer | gérer | assignés | tâches attribuées | résumé partagé |
| Plans/fichiers | gérer | gérer | assignés | selon tâche | partagés seulement |
| Stock | gérer | gérer | selon permission | non par défaut | jamais |
| Paiements/dépenses | gérer | permission explicite | non | non | ses paiements |
| Passeport QR | créer/révoquer | créer/révoquer | lecture assignée | non | champs publics |
| Audit | consulter | événements autorisés | non | non | événements publiés |

Toute action non explicitement autorisée est refusée.

## Règles de sécurité et de cohérence
1. Toute ligne métier d'atelier porte `workshop_id`; les relations doivent empêcher de rattacher une ligne à un autre atelier.
2. RLS contrôle à la fois l'identité, l'adhésion à l'atelier et la permission. « Utilisateur connecté » n'est jamais une autorisation suffisante.
3. Les politiques d'écriture vérifient aussi le nouvel état (`WITH CHECK`) afin d'empêcher le transfert d'une ligne vers un autre atelier.
4. Les composants navigateur n'accèdent pas directement aux données financières sensibles. Les opérations sensibles passent par des fonctions serveur validées.
5. Coûts matières, main-d'œuvre, charges et marges sont séparés des prix de vente. Aucun endpoint client ou public ne renvoie ces champs.
6. Les devis sont révisables sans écraser l'historique. Un devis accepté fige les lignes, prix et versions de modèles acceptés.
7. Les événements de production, changements de statut et paiements sont horodatés et attribués à un acteur.
8. Fichiers privés par défaut ; liens de partage limités dans le temps et au contenu autorisé.
9. Archivage privilégié pour les suppressions métier sensibles.
10. Score Santé calculé à partir de données réelles et d'une formule documentée ; données insuffisantes = « données insuffisantes », jamais score inventé.

## Catalogue et calcul paramétrique
Les montants de la maquette HTML sont des exemples, pas une base de prix vérifiée. Les références de matériaux et tarifs doivent être configurables, datés et sourcés. Un modèle versionné devra préciser dimensions, pièces, épaisseurs, jeux, chants, fonds, renforts, quincaillerie, matériaux compatibles, formats de panneaux, pertes, opérations et temps de main-d'œuvre. Aucun débit exact ne sera annoncé avant validation de ces règles par des menuisiers. L'écran doit distinguer « estimation » de « débit vérifié » et afficher les hypothèses.

## Passeport QR
Le QR utilise un jeton aléatoire à haute entropie, révocable, non séquentiel. La page publique expose uniquement les champs autorisés : référence publique, meuble, atelier, date de fin, garantie et conseils d'entretien validés. Elle exclut identité et coordonnées client, adresse, montant, coûts, marges, plans et fichiers internes. Révocation, réémission et consultation sont journalisées.

## Architecture technique proposée
- Next.js App Router pour interface et routes serveur.
- Supabase Auth pour identité et sessions.
- PostgreSQL pour données, contraintes, migrations et RLS.
- Supabase Storage pour fichiers privés et politiques par atelier.
- Couche métier TypeScript/Zod pour valider les commandes côté serveur.
- Vitest pour règles métier, tests PostgreSQL/RLS pour l'isolation inter-ateliers et Playwright pour parcours critiques.
- i18n centralisée : français par défaut et wolof ; traduction des textes techniques, juridiques et financiers revue par des locuteurs compétents.

Les clés secrètes restent côté serveur. Ne jamais exposer la clé service-role. RLS doit être activé sur toutes les tables exposées. Les vues doivent préserver les contrôles RLS (PostgreSQL 15+ : `security_invoker=true`). Ne jamais utiliser `user_metadata` comme source d'autorisation.

## Phasage
A. Fondations : schéma, Auth, profils, ateliers, adhésions, rôles, RLS, stockage privé, audit minimal, tests inter-ateliers.
B. Cœur métier : clients, catalogue versionné, devis/révisions/acceptation, dossiers, étapes et fichiers.
C. Atelier : matériaux, stock, paiements/dépenses, QR, garantie, impression et historique.
D. Six espaces : données réelles dans chaque onglet ; calculateur fiable ; Score Santé calculé ; Base de Prix sourcée ; CRM avec consentement ; feuille de route administrable.
E. Ouverture : vitrines publiques et demandes de devis ; sécurité, sauvegardes, supervision et recette avant production.

## Décisions métier à confirmer
- Un propriétaire peut-il gérer plusieurs ateliers et inviter des membres ?
- Le client aura-t-il un compte dès V1 ou un lien sécurisé de suivi ?
- Quels statuts exacts pour devis et production ?
- Quels champs sont publiés sur le passeport et l'étiquette imprimée ?
- Quelles règles de débit sont validées par les menuisiers pilotes ?
- Quelles sources, fréquence, zone et méthode de modération pour la Base de Prix Nationale ?
- Quels canaux et consentements pour les relances CRM ?

Ces décisions restent ouvertes tant qu'elles ne sont pas validées explicitement.
