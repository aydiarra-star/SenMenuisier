# État de l'implémentation — phase de conception V1

## Dépôt et environnement
- Dépôt : https://github.com/aydiarra-star/SenMenuisier
- Branche : `design/foundation-v1`
- PR de suivi : https://github.com/aydiarra-star/SenMenuisier/pull/1
- Aperçu Render : https://senmenuisier-preview.onrender.com
- Service Render : `senmenuisier-preview`, plan gratuit, Francfort, auto-déploiement depuis la branche.
- Aucun projet Supabase, aucune base de données et aucun service payant provisionnés.

## Socle technique
- Next.js App Router, React, TypeScript, Tailwind/CSS et Lucide.
- Workflow GitHub Actions pour typecheck, lint et build.
- Next.js et eslint-config-next alignés sur 15.5.28.
- Première adaptation React des six espaces, quatre modèles de meubles, dimensions et estimation indicative.
- Aperçu en ligne issu du commit 868d491 ; les commits de conception plus récents ne sont pas encore confirmés comme déployés.

## Conception ajoutée dans cette phase
- `docs/MODELE_METIER_V1.md` : entités, rôles, matrice d'accès, règles de sécurité, architecture et phasage.
- `docs/RECETTE_INTERFACE_REFERENCE.md` : critères de recette alignés sur les six modules et interactions du HTML fourni.
- `docs/AUDIT_CALCULATEUR_SOURCE.md` : formule réellement écrite dans le HTML, paramètres, incohérences d'unités et risques.
- `docs/CONCEPTION_V1.md` : vision produit initiale.
- `docs/PROJECT_RULES.md` : règles de contribution et livraison.

## Constats techniques importants
- L'interface React en ligne est une première adaptation, pas une reproduction exacte du HTML de référence.
- La formule du HTML est volumétrique et ne constitue pas un véritable plan de débit. Les valeurs de matériaux, pertes, main-d'œuvre et marge nécessitent validation métier ; l'audit détaillé est dans `docs/AUDIT_CALCULATEUR_SOURCE.md`.
- Les commandes, clients, prix, scores et dossiers visibles restent des données de démonstration.
- Les devis ne sont pas enregistrés, les QR ne sont pas émis/vérifiés et l'impression métier n'est pas opérationnelle.
- Auth, PostgreSQL, RLS, isolation multi-ateliers, stockage privé et audit applicatif restent à construire.
- La nouvelle mise à jour de dépendances doit encore être vérifiée par CI et par un nouveau déploiement Render.

## Ordre de travail restant
1. Vérifier CI et le déploiement des commits récents.
2. Comparer et corriger la fidélité visuelle/fonctionnelle à partir du HTML fourni, sans changer la structure ni inventer d'écrans.
3. Valider les décisions métier ouvertes dans `docs/MODELE_METIER_V1.md`.
4. Construire le schéma, Auth, adhésions, rôles, RLS et stockage privé ; tester les accès croisés entre deux ateliers.
5. Implémenter le cycle devis → acceptation → dossier de fabrication → étapes → passeport QR.
6. Connecter les six espaces à des données réelles et supprimer les faux succès.
7. Valider le calculateur avec des menuisiers pilotes et des nomenclatures réelles.
8. Recette sécurité, sauvegarde, supervision et validation explicite avant fusion dans `main` et production.

## Statut de livraison
Branche en conception et développement. Pas prête pour production. Aucun merge vers `main` ne doit être fait avant tests, revue de sécurité, recette de l'interface et accord explicite de l'utilisateur.

## Travail ajouté ensuite — moteur d'estimation métier

- `src/lib/estimate.ts` : fonction pure d'estimation à partir de quantités matière fournies par une nomenclature, de prix dont les unités doivent correspondre, de pertes explicites, de main-d'œuvre, quincaillerie, finition, charges et marge brute cible.
- `src/lib/estimate.test.ts` : tests des calculs, des unités incompatibles et des valeurs invalides.
- Cette fonction ne déduit pas les quantités à partir des dimensions et ne produit pas de plan de débit.
- Commits : `0cf815b` et `9c60753` sur `design/foundation-v1`.
- À la vérification, aucun workflow CI ni statut de contrôle n'était retourné pour le commit de tests. La validation automatisée de ces nouveaux fichiers reste donc à confirmer.
- Le service Render est bien configuré pour suivre `design/foundation-v1`, mais le seul déploiement listé reste celui du commit `868d491`. Le nouveau moteur n'est pas confirmé en ligne.

## Prochaine séquence technique

1. Rendre l'interface conforme au HTML de référence sans modifier ses six onglets ni son organisation.
2. Installer et vérifier l'exécution réelle des tests et du build sur la branche.
3. Connecter le moteur d'estimation à une nomenclature validée, sans afficher de débit exact avant recette métier.
4. Préparer les migrations et politiques RLS après validation des décisions métier et sans provisionner de service payant.

## Ajustement de fidélité visuelle — profil d'en-tête

- Restauration dans l'en-tête React du badge de profil illustré, présent dans le HTML de référence, avec repli visuel « SM » si l'image ne charge pas.
- Fichiers modifiés : `src/app/page.tsx` et `src/app/globals.css`.
- Commits : `6a8c933` et `9b7f49d`.
- Cet ajustement isolé ne signifie pas que l'interface complète est désormais identique au HTML : les modules Production, Score Santé, Base de Prix, CRM et Feuille de Route restent à comparer et à connecter selon la recette.
- Aucun workflow ni statut CI n'a été retourné pour le dernier commit contrôlé. Aucun nouveau déploiement Render n'est listé ; l'aperçu reste sur le commit antérieur confirmé.
