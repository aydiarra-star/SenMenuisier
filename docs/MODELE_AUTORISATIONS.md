# Modèle d’autorisations SenMenuisier

## Rôles internes d’un atelier

- **Propriétaire** : contrôle complet de l’atelier et des membres.
- **Gestionnaire** : gestion opérationnelle des clients, devis, production, stocks et fournisseurs.
- **Menuisier** : consultation et mise à jour des opérations de production, consultation du stock.
- **Apprenti** : accès opérationnel limité, sans gestion des membres ni accès financier.

Un client est un contact externe de l’atelier, pas un membre interne. Son éventuel espace client doit utiliser des accès ponctuels et limités à ses propres devis, commandes et passeports publics.

## Règle financière

Les accès aux coûts internes des devis, prix d’achat des stocks, tarifs fournisseurs, marges, dépenses et paiements sont **réservés au propriétaire par défaut**. Le propriétaire pourra déléguer séparément les permissions précises de lecture ou d’écriture (coûts des devis, coûts de stock, coûts fournisseurs, finance) à un membre précis. Une délégation ne doit jamais être déduite du seul rôle « Gestionnaire ». Les droits opérationnels sur les devis, les quantités de stock et les coordonnées fournisseurs ne donnent pas accès aux champs de coût.

## Règles de sécurité à appliquer côté serveur

1. Charger le membre actif et son rôle depuis la base de données pour l’atelier demandé.
2. Charger les délégations depuis la base de données ; ne jamais accepter des permissions fournies par le navigateur ou des métadonnées utilisateur modifiables.
3. Vérifier l’autorisation dans chaque action serveur et dans les politiques PostgreSQL RLS.
4. Pour les mises à jour, vérifier l’accès à la ligne existante **et** empêcher le transfert de la ligne vers un autre atelier.
5. Séparer les champs opérationnels des champs financiers dans les réponses API : devis, stocks et fournisseurs ne doivent jamais renvoyer leurs coûts internes sans permission dédiée.
6. Protéger les vues, exports, fichiers, QR et routes publiques avec des listes de champs autorisés.
7. Journaliser les changements de rôle, délégations, paiements, coûts et opérations sensibles.

## État actuel

Le fichier `src/lib/domain/permissions.ts` définit les permissions par défaut et les tests associés. Il s’agit d’un **contrat métier testé**, pas encore d’une barrière de sécurité opérationnelle : aucune authentification ni base SenMenuisier n’est provisionnée. Cette règle devra être appliquée par les services serveur et les politiques RLS avant l’utilisation de vraies données.
