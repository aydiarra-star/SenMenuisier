# SenMenuisier

**Le savoir-faire sénégalais, connecté au monde.**

SenMenuisier est le système opérationnel des ateliers de menuiserie au Sénégal. L'ambition : relier la demande client, la conception, les devis, les matières, la fabrication, le contrôle qualité, la livraison et le suivi du meuble dans un outil simple à utiliser sur téléphone.

## Les deux expériences

- **Application atelier** : interface « OS de la menuiserie » à la racine du site
  (rail de navigation, entête, accueil : bandeau, catégories, modèles populaires,
  conception paramétrique, estimation rapide, suivi de production, passeport QR).
  Détail : `docs/ECRAN_ENTREE_OS.md`.
- **Site public** : présentation du produit sur `/vitrine`.
- **Ancienne page de conception** : conservée à l'identique sur `/espace-atelier/`.

## Les six espaces de l'application

L'ordre est obligatoire et reprend le document de référence « SenMenuisier – OS de la Menuiserie » :

1. Catalogue Intelligent
2. Production & Passeport QR
3. Score Santé de l'atelier
4. Base de Prix Nationale
5. CRM Artisan & Relances
6. Feuille de Route

Les pictogrammes visibles doivent représenter uniquement des outils, matières ou gestes de menuiserie : bois, panneaux, règle, marteau, scie, perceuse, finition et outillage d'atelier.

## Principes non négociables

- Menuiserie uniquement en V1 ; français par défaut, wolof à intégrer avec validation humaine.
- Mobile-first, responsive, accessible et lisible dans un atelier.
- PostgreSQL / serveur comme source de vérité dès l'activation du backend.
- Isolation stricte des ateliers, permissions côté serveur et RLS.
- Coûts, marges, paiements et notes internes protégés.
- Aucun faux client, commande, stock, prix national, score, paiement, message WhatsApp ou QR.
- Les dimensions seules ne produisent ni nomenclature ni plan de débit.
- Aucune mise en production, dépense ou création de service externe sans validation explicite.

## État technique au 6 novembre 2026

- Branche canonique : `main` uniquement.
- Prévisualisation Render de référence : https://senmenuisier-main-preview.onrender.com/#selection
- Déploiement : Next.js en export statique vers `out/` ; le service Render existant doit publier ce dossier.
- Node.js fixé à `24.22.1` sur Render et dans GitHub Actions.
- `package-lock.json` versionné pour rendre les installations reproductibles.
- Contrôles automatisés : tests métier, TypeScript, lint et build.
- Dernier audit npm : **0 vulnérabilité connue** dans l'arbre de dépendances audité.
- Le tableau de bord et le site public sont des interfaces de prévisualisation, pas encore un logiciel métier connecté.

## Ce qui n'est pas encore opérationnel

Aucun backend atelier n'est encore provisionné pour SenMenuisier : authentification, base de données, RLS, stockage, invitations, CRM, stock, commandes, fabrication, QR et marketplace restent à construire et à tester. Le calculateur actuel est local et transparent ; il n'enregistre pas de devis et ne génère pas de plan de débit.

## Documentation

- `docs/PLAN_CONSTRUCTION_PRODUIT.md` — périmètre, architecture, données et critères de livraison.
- `docs/ICONOGRAPHIE_MENUISERIE.md` — règles strictes pour les icônes.
- `PROJECT_RULES.md` — règles du dépôt et de contribution.

Le dépôt est consolidé sur `main`. La prévisualisation Render principale est la seule destination prévue. L'Auto-Deploy a été désactivé temporairement pendant la consolidation ; aucune publication n'est déclenchée tant que la compilation et la configuration Render ne sont pas validées.
