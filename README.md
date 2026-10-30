# SenMenuisier

**Le savoir-faire sénégalais, connecté au monde.**

SenMenuisier est le système opérationnel des ateliers de menuiserie au Sénégal. Il relie demande client, conception, devis, matériaux, fabrication, contrôle qualité, livraison et suivi du meuble.

Mission : faire passer la menuiserie sénégalaise du cahier papier à l'atelier intelligent.

## Sources de vérité
- Le cahier des charges SenMenuisier validé est la référence fonctionnelle.
- Le fichier HTML fourni « SenMenuisier – OS de la Menuiserie » est la référence obligatoire de l'interface ; il ne doit pas être redessiné ni remplacé.
- Les six espaces à conserver dans cet ordre : Catalogue Intelligent & calculateur paramétrique ; Production & Passeport QR ; Score Santé de l'atelier ; Base de Prix Nationale ; CRM Artisan & relances ; Feuille de Route.
- Les exemples du prototype ne sont pas des données réelles : les remplacer par des données persistées et des états vides explicites.

## Principes
- Menuiserie uniquement en V1 ; français et wolof dès V1.
- Application responsive mobile-first.
- Architecture modulaire, monolithe modulaire au départ.
- PostgreSQL/serveur comme source de vérité.
- Isolation stricte des ateliers, permissions serveur et RLS.
- Coûts, marges et notes internes invisibles aux clients.
- Aucun faux paiement, faux message WhatsApp, fausse impression, faux QR vérifié, faux score ou faux succès.

## Architecture cible proposée
Next.js, TypeScript, Tailwind CSS ; Supabase Auth, PostgreSQL et Storage ; Render pour l'hébergement applicatif après configuration ; Vitest et Playwright. C'est une cible de conception, pas la preuve que les services sont provisionnés.

## État initial vérifié le 30 octobre 2026
Dépôt initial : branche main, un commit, README minimal, aucun frontend, backend, test, migration, configuration Supabase ou Render. La conception est préparée sur design/foundation-v1. Aucune application n'est déployée.

Voir PROJECT_RULES.md et docs/CONCEPTION_V1.md. Chaque capacité sera qualifiée RÉELLE, PARTIELLE, DÉMO ou NON DISPONIBLE.