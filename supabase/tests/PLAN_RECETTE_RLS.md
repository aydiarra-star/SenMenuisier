# Recette de sécurité Supabase — phase 2

Ce document définit les tests d'acceptation à exécuter sur un projet Supabase de test dédié. Il ne remplace pas les tests automatisés et ne certifie pas les migrations.

## Préconditions

- Appliquer toutes les migrations dans l'ordre sur un projet SenMenuisier non productif.
- Créer deux ateliers A et B et au minimum cinq utilisateurs de test : propriétaire A, gestionnaire A, menuisier A, apprenti A et propriétaire B.
- Ajouter ensuite un compte client externe uniquement lorsque le modèle de partage client sera livré.
- Utiliser les JWT de chaque compte réel dans les tests API ; ne pas simuler l'identité avec un paramètre envoyé par le navigateur.
- Vérifier les politiques avec le rôle PostgreSQL `authenticated`, pas uniquement avec la clé `service_role`.

## Matrice d'accès attendue

| Ressource / action | Propriétaire A | Gestionnaire A | Menuisier A | Apprenti A | Propriétaire B |
|---|---:|---:|---:|---:|---:|
| Lire atelier A | Oui | Oui | Oui | Oui | Non |
| Modifier atelier A | Oui | Non | Non | Non | Non |
| Lire membres A | Oui | Oui si autorisé | Non | Non | Non |
| Créer atelier via RPC | Oui | Oui | Oui | Oui | Oui |
| Créer / révoquer des membres directement | Non | Non | Non | Non | Non |
| Lire journal d'audit A | Oui | Non par défaut | Non | Non | Non |
| Lire les coûts / marges / finances | Oui | Non par défaut | Non | Non | Non |
| Lire les invitations ou empreintes de jetons | Non via API client | Non | Non | Non | Non |

Le RPC de création d'atelier autorise tout compte authentifié à créer son propre atelier ; il crée simultanément son adhésion propriétaire. Cela ne lui donne aucun droit sur les ateliers existants.

## Tests d'isolation inter-ateliers

1. Le propriétaire B tente de lire l'atelier A par son UUID : aucune ligne ne doit être renvoyée.
2. Le propriétaire B tente de lire les adhésions A : aucune ligne ne doit être renvoyée.
3. Un utilisateur A tente de mettre à jour un atelier B : zéro ligne affectée.
4. Une insertion ou mise à jour métier future qui référence un client, devis, stock ou fournisseur d'un autre atelier doit échouer via une clé étrangère composite.
5. Un utilisateur révoqué doit perdre immédiatement l'accès aux requêtes suivantes.
6. Les UUID devinés, IDs modifiés et filtres omis ne doivent pas contourner les politiques.

## Tests d'intégrité et d'escalade

1. Un utilisateur ne peut pas insérer une adhésion directement, même en se déclarant propriétaire.
2. Un gestionnaire ne peut pas modifier son rôle, réactiver son adhésion ou s'octroyer un droit financier.
3. Un utilisateur ne peut pas lire les tables d'invitations ou de délégations via l'API cliente.
4. Les empreintes de jetons ne sont jamais retournées au navigateur.
5. Un événement d'audit ne peut pas être créé, modifié ou supprimé directement par un client.
6. Le propriétaire A peut créer son atelier via `create_workshop`; l'atelier et l'adhésion propriétaire existent ensemble ou aucun des deux n'existe.
7. Les fonctions RPC refusent les appels anonymes et les entrées invalides.
8. Les politiques UPDATE sont testées avec les deux clauses `USING` et `WITH CHECK`.

## Limites connues avant activation

- Le flux d'invitation (création, envoi, acceptation, révocation) n'est pas encore implémenté.
- Les permissions déléguées n'ont pas encore de RPC d'administration ; les écritures directes restent volontairement fermées.
- Les tables métier (clients, devis, production, stock, fournisseurs, paiements) ne sont pas encore créées dans cette migration d'identité.
- Le contrôle des coûts par colonne et les vues de devis client seront réalisés avec les tables métier, pas par masquage de composants React.
- Le stockage privé et ses politiques par atelier restent à configurer.
- Les tests Playwright et tests PostgreSQL/RLS ne sont pas encore exécutés.

**Critère de sortie :** aucun lancement avec des données réelles avant que tous les tests ci-dessus et les tests spécifiques aux tables métier soient automatisés et réussis.
