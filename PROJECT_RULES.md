# Règles maîtresses — SenMenuisier

## Sources de vérité
1. Décisions explicites du propriétaire.
2. Cahier des charges SenMenuisier validé.
3. Fichier « SenMenuisier – OS de la Menuiserie » pour l'interface.
4. Conception technique approuvée.
5. Documentation officielle des technologies.
En cas de contradiction, documenter et demander une décision ciblée.

## Audit et Git
- Lire dépôt, branches, commits, scripts, tests, workflows et configurations avant toute modification.
- Établir un état initial vérifiable ; ne pas remplacer une architecture existante sans problème concret.
- Ne jamais supprimer de test pour faire passer la CI.
- Pas de force-push ni de réécriture d'historique.
- Branche dédiée, commits atomiques, revue avant fusion dans main.
- Ne pas créer de ressource payante ni provisionner de service externe sans autorisation.

## Fidélité à l'interface
Le HTML fourni est le contrat d'interface. Conserver navigation, ordre des six espaces, hiérarchie, proportions, cartes, modales et interactions. Palette : bois #8B5E3C, vert forêt #295F4E, sable #F4EFE7, graphite #222222, laiton #D4A373. Polices : Plus Jakarta Sans et Cabinet Grotesk. Conserver le style premium, les coins arrondis, ombres douces et icônes sobres. Comparaison visuelle obligatoire sur mobile et desktop.

## Données et actions honnêtes
Les clients, commandes, prix, stocks, marges, scores, dates et statistiques du prototype sont des exemples. Sans données, afficher un état vide. Une action doit aboutir réellement ou être indiquée comme indisponible. Ne jamais simuler confirmation WhatsApp, paiement, impression, création de devis, enregistrement ou vérification QR. Tout calcul expose hypothèses, unités, tarifs, date et source. Une estimation n'est pas un plan de débit optimisé.

## Sécurité
- Isolation multi-ateliers à chaque requête et au niveau PostgreSQL avec RLS.
- Permissions vérifiées côté serveur ; masquer un bouton ne constitue pas une autorisation.
- Ne pas utiliser les métadonnées utilisateur modifiables pour autoriser un accès.
- Ne jamais exposer une clé Supabase service-role/secret dans le navigateur.
- Stockage privé par défaut et politiques d'accès contrôlées.
- Coûts, marges, prix d'achat, fournisseurs confidentiels et notes internes restent privés.
- Journaliser les opérations sensibles.
- Valider les entrées côté serveur ; QR public séparé des données internes.

## Architecture et qualité
TypeScript strict, modules métier séparés, validation aux frontières API, erreurs contrôlées et migrations versionnées. Le serveur est la source de vérité. Montants comptables en unités entières FCFA ou décimaux contrôlés, jamais en flottants binaires. Dates avec instant/fuseau explicite. Tests unitaires, intégration PostgreSQL/RLS et E2E critiques.

## Langues
Français par défaut, wolof sélectionnable dès V1. Chaînes centralisées. Traductions techniques, contractuelles et financières en wolof relues par des locuteurs compétents.

## Livraison
Pour chaque phase : critères d'acceptation, branche dédiée, implémentation, lint, TypeScript, tests, build, contrôles sécurité, régression, rapport et commit vérifié. Validation avant changement du périmètre, modèle de sécurité ou interface approuvée.

## Rapport
Distinguer RÉEL, PARTIEL, DÉMO et NON DISPONIBLE. Donner fichiers changés, tests réellement exécutés, résultats exacts, dépendances/secrets manquants et branche/commit/PR. Aucune déclaration « prêt production », « sécurisé », « synchronisé », « envoyé », « payé » ou « vérifié » sans preuve.