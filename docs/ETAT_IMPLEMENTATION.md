# État de l'implémentation — phase 1

## Dépôt et environnement

- Dépôt : https://github.com/aydiarra-star/SenMenuisier
- Branche de travail : `design/foundation-v1`
- Pull request de suivi : https://github.com/aydiarra-star/SenMenuisier/pull/1
- Prévisualisation Render : https://senmenuisier-preview.onrender.com
- Service Render : `senmenuisier-preview`, plan gratuit, région Francfort, déploiement automatique depuis la branche de travail.
- Aucun projet Supabase, aucune base de données et aucun service payant n'ont été provisionnés.

## Ce qui est présent sur la branche

- Socle Next.js App Router avec TypeScript strict.
- Métadonnées de l'application et variables d'environnement documentées.
- Première intégration React de l'interface SenMenuisier :
  - navigation des six espaces dans l'ordre de la fiche ;
  - catalogue et quatre modèles de meubles ;
  - contrôles de dimensions et estimation paramétrique indicative ;
  - écrans Production & Passeport QR, Score Santé, Base de Prix, CRM et Feuille de Route ;
  - adaptation mobile et palette de référence bois, vert forêt, sable, graphite et laiton.
- Styles dans `src/app/globals.css`.
- Workflow GitHub Actions : typecheck, lint et build.
- Next.js et `eslint-config-next` alignés sur la version corrigée `15.5.28`.

## Limites explicites

- L'écran actuellement déployé est une première adaptation React de la fiche, pas encore une reproduction exacte du HTML source. La comparaison visuelle et fonctionnelle détaillée reste à faire.
- Les commandes, prix, scores et dossiers affichés sont des exemples de démonstration.
- Le calculateur utilise une formule volumétrique simplifiée ; il ne produit pas encore un plan de débit ou une liste de coupe fiable.
- Les formulaires de devis ne sauvegardent aucune donnée.
- Les passeports QR ne sont pas émis ni vérifiés.
- Les boutons de démonstration ne doivent pas être interprétés comme des opérations métier réelles.
- Authentification, base de données, isolation multi-ateliers, permissions, stockage sécurisé et journal d'audit restent à construire.
- La validation GitHub du commit précédent a réussi ; la mise à jour de dépendances déclenche une nouvelle validation. Le nouveau build Render doit également être vérifié.

## Prochaines étapes obligatoires

1. Comparer la page déployée au fichier HTML de référence, section par section, puis corriger les écarts sans inventer de nouvelle interface.
2. Mettre en place le socle Supabase : schéma, migrations, Auth, Storage, RLS et rôles, après validation du choix d'environnement.
3. Implémenter l'isolation stricte des ateliers et la confidentialité des coûts/marges.
4. Connecter les six espaces à des données réelles et remplacer les démonstrations par des états vides tant qu'un atelier n'a pas de données.
5. Implémenter devis, dossiers de fabrication, QR publics à données limitées, impression et journal d'audit.
6. Ajouter les tests métier et tests d'accès multi-ateliers.
7. Effectuer une recette complète avant toute fusion dans `main` ou mise en production.

## Règle de livraison

La branche n'est pas prête pour la production. Ne pas fusionner dans `main` avant la comparaison de l'interface, l'achèvement des contrôles de sécurité, les tests métier et la validation explicite de l'utilisateur.
