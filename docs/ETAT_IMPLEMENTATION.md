# État de l'implémentation — phase 1

## Ce qui est présent sur cette branche

- Socle Next.js App Router avec TypeScript strict.
- Métadonnées de l'application et variables d'environnement documentées.
- Première intégration de l'interface SenMenuisier dans `src/app/page.tsx` :
  - navigation des six espaces dans l'ordre de la fiche ;
  - catalogue et quatre modèles de meubles ;
  - contrôles de dimensions et estimation paramétrique indicative ;
  - écrans Production & Passeport QR, Score Santé, Base de Prix, CRM et Feuille de Route ;
  - adaptation mobile et palette de référence bois, vert forêt, sable, graphite et laiton.
- Styles de l'interface dans `src/app/globals.css`.
- Workflow GitHub Actions ajouté pour typecheck, lint et build.

## Limites explicites de cette livraison

- Cette première intégration reprend la structure, les libellés et le système visuel de la fiche ; elle ne constitue pas encore une reproduction ligne à ligne du HTML original.
- Les commandes, prix, scores et dossiers affichés dans la maquette restent des exemples de démonstration.
- Le calculateur utilise une formule volumétrique simplifiée ; il ne produit pas encore un véritable plan de débit ou une liste de coupe fiable.
- Les formulaires devis ne sauvegardent aucune donnée.
- Les passeports QR ne sont pas émis ni vérifiés.
- Aucun envoi WhatsApp, impression métier ou paiement n'est simulé comme réussi.

## Ce qui reste à livrer

- Comparaison visuelle et fonctionnelle complète avec le fichier HTML original, puis ajustements nécessaires pour respecter tous ses détails.
- Supabase, authentification, migrations, RLS, permissions multi-ateliers et stockage.
- Données réelles par atelier, audit et séparation des informations internes/client.
- Tests et build effectivement exécutés et validés.
- Prévisualisation hébergée, puis contrôle utilisateur avant fusion.

## Déploiement

Aucun service Render n'a été créé. Le compte Render expose un espace « My Workspace », mais aucun espace n'a été sélectionné ; il faut obtenir la confirmation de l'utilisateur avant toute opération sur cet espace. Aucun coût ou service payant n'a été engagé.

## Règle de livraison

La branche n'est pas prête pour la production et ne doit pas être fusionnée dans `main` en l'état.
