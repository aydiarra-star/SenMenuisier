# Phase 2 — identité, ateliers et sécurité multi-tenant

Statut : spécification de travail, pas encore déployée. Aucun projet Supabase SenMenuisier n'est provisionné.

## Objectif et périmètre

Construire le socle permettant à plusieurs ateliers indépendants d'utiliser SenMenuisier sans fuite de données. La première livraison couvre uniquement : identité, profil, ateliers, adhésions, invitations, rôles, permissions explicites, journal d'audit minimal et tests d'isolation.

Aucune donnée réelle d'atelier ne doit être saisie avant validation des politiques RLS et des tests inter-ateliers.

## Source d'identité

- Supabase Auth est l'unique source d'identité.
- `profiles.id` référence `auth.users.id`; le profil ne porte aucune permission.
- Ne jamais utiliser `user_metadata` pour décider d'un rôle ou d'un droit.
- Les clients externes ne sont pas des membres d'atelier.
- Une personne peut appartenir à plusieurs ateliers ; le contexte d'atelier actif est toujours revalidé côté serveur.

## Modèle relationnel initial

| Table | Responsabilité | Contraintes essentielles |
|---|---|---|
| `profiles` | Nom d'affichage et coordonnées de compte | PK = auth.users.id ; champs autorisés uniquement |
| `workshops` | Atelier, ville, pays, fuseau | UUID ; créateur/propriétaire initial |
| `workshop_memberships` | Appartenance et rôle | unique(workshop_id,user_id), statut actif/révoqué |
| `workshop_invitations` | Invitation d'un membre | jeton haché, rôle proposé, expiration, usage unique |
| `workshop_permission_grants` | Délégations précises | unique(membership_id,permission), accordeur et date |
| `audit_events` | Historique des actions sensibles | atelier, acteur, action, cible, date ; append-only |

Les tables métier futures porteront toutes `workshop_id NOT NULL`. Les relations entre objets d'un atelier utiliseront des clés étrangères composites incluant `workshop_id` pour empêcher les associations croisées.

## Rôles et droits par défaut

- `owner` : administration complète de son atelier, y compris finances.
- `manager` : gestion opérationnelle ; aucun accès aux coûts, marges, paiements ou dépenses par défaut.
- `carpenter` : production et stock selon affectation ; pas de finances.
- `apprentice` : lecture et tâches explicitement attribuées ; pas de finances.
- Client externe : uniquement ses propres devis, commandes et passeport explicitement partagés ; jamais membre interne.

Les permissions de coût restent séparées des permissions métier : `quotes.costs.*`, `inventory.costs.*`, `suppliers.costs.*` et `finance.*`. Toute délégation est enregistrée en base, attribuée par le propriétaire et vérifiée côté serveur et en base.

## Règles RLS obligatoires

1. RLS activé sur chaque table exposée, sans exception.
2. Toute lecture/écriture privée exige une appartenance active à l'atelier concerné et la permission correspondant à l'action.
3. Les politiques UPDATE utilisent à la fois `USING` et `WITH CHECK`.
4. Aucun contrôle ne repose sur le seul fait d'être connecté.
5. Les vues exposées utilisent `security_invoker = true` sur PostgreSQL 15+, sinon elles restent non exposées et leurs droits sont révoqués.
6. Les fonctions privilégiées ne sont pas un raccourci pour contourner RLS. Si une fonction `SECURITY DEFINER` est démontrée nécessaire pour éviter une récursion RLS, elle doit être isolée dans un schéma non exposé, vérifier explicitement `auth.uid()`, fixer son `search_path`, limiter EXECUTE et passer les advisors de sécurité.
7. Aucune clé secrète/service-role dans le navigateur ou une variable `NEXT_PUBLIC_*`.
8. Les fichiers sont privés par défaut ; le chemin et les politiques Storage doivent contrôler l'atelier et l'autorisation, pas seulement le préfixe fourni par le navigateur.

## Invitations — cible, non opérationnelle à ce stade

Les règles ci-dessous décrivent le futur flux ; elles ne constituent pas une fonctionnalité disponible dans cette livraison.

- Aucun endpoint/RPC de création, d'envoi, d'acceptation ou de révocation d'invitation n'est encore livré.
- Aucune invitation ne doit être créée directement depuis le navigateur ou par écriture dans la table.
- Lors de la livraison du flux, la création sera réservée au propriétaire ; un gestionnaire ne pourra inviter que si une délégation explicite et administrable existe.
- Le serveur générera un jeton aléatoire à haute entropie ; seule son empreinte sera stockée.
- Expiration courte, usage unique, révocation possible et rôle borné à la matrice autorisée.
- L'acceptation exigera une session authentifiée correspondant à l'adresse invitée.
- Le navigateur ne pourra ni choisir son atelier, ni s'attribuer un rôle, ni modifier une délégation.
- Chaque création, acceptation, révocation et changement de rôle sera journalisé.

De même, l'administration des délégations de permissions n'est pas encore livrée : les écritures directes restent fermées et aucun gestionnaire ne peut s'accorder le droit members.manage ou un droit financier.

## Parcours de validation obligatoires

Avec deux ateliers de test A et B et au moins deux comptes :

- un membre de A ne peut ni lire, ni modifier, ni supprimer une ligne de B ;
- changer `workshop_id` lors d'un INSERT/UPDATE est refusé ;
- un gestionnaire ne reçoit aucun champ de coût par défaut ;
- un menuisier et un apprenti ne voient aucun paiement, dépense, marge ou prix d'achat ;
- un client ne voit que les objets explicitement partagés qui lui appartiennent ;
- un membre révoqué perd l'accès aux opérations suivantes ;
- un jeton d'invitation expiré, réutilisé ou adressé à un autre compte est refusé ;
- les tentatives interdites ne modifient aucune donnée.

Ces tests seront exécutés au niveau PostgreSQL/RLS, puis dans les parcours HTTP/Playwright. Les tests unitaires TypeScript seuls ne prouvent pas l'isolation.

## Séquence d'implémentation

1. Provisionner un projet Supabase dédié SenMenuisier après accord explicite ; ne réutiliser aucun projet d'une autre application.
2. Initialiser localement le CLI et générer les fichiers de migration avec `supabase migration new`.
3. Implémenter les tables d'identité et d'atelier, contraintes, index et RLS.
4. Ajouter les clients Next.js SSR avec `@supabase/ssr`, cookies sécurisés et validation serveur par `getClaims()`.
5. Implémenter création d'atelier, invitation et acceptation.
6. Ajouter tests d'intégration RLS à deux ateliers et tests des rôles.
7. Configurer les secrets de prévisualisation uniquement après validation des migrations et sans exposer de secret.

## État et limites

Ce document ne constitue ni une migration SQL, ni une configuration Supabase active, ni une preuve de sécurité. Aucun compte, atelier, membre ou donnée métier n'est actuellement créé dans une base SenMenuisier.
