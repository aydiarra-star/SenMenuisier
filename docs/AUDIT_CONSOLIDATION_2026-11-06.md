# Audit de consolidation — SenMenuisier
Date : 6 novembre 2026
Branche d'audit : `feature/consolidation-roles-fonctionnalites-v1`
Base examinée : `main` — `09cf49ed4d0513b1c9deccb3af728a3e2b3dc303`

## Décision d'interface

La nouvelle interface restaurée sur `main` est conservée comme base de référence. Aucun changement de direction graphique ni suppression des six espaces n'est autorisé sans décision explicite. Le fichier HTML de référence et `docs/RECETTE_INTERFACE_REFERENCE.md` restent le contrat visuel et fonctionnel.

Ordre obligatoire :
1. Catalogue Intelligent & calculateur paramétrique
2. Production & Passeport QR
3. Score Santé de l'atelier
4. Base de Prix Nationale
5. CRM Artisan & Relances
6. Feuille de Route

Palette et identité existantes à préserver : bois, vert forêt, sable, graphite et laiton. Priorité mobile, lisibilité atelier, zones tactiles suffisantes, navigation clavier et états de chargement/erreur/absence de données.

## État constaté dans le dépôt

| Domaine | État observé | Décision |
|---|---|---|
| Navigation des six espaces | Présente, boutons React pilotent l'onglet actif | À tester mobile, clavier et focus |
| Sélection des modèles | Présente, met à jour les dimensions de départ | Conserver et ajouter validation/édition explicite |
| Calculateur | Calcul local à partir d'une ligne matière et de coûts saisis | Conserver ; afficher hypothèses et unités ; ne pas présenter comme devis enregistré |
| Production | Étapes illustratives et état vide, sans dossier persistant | À construire |
| Passeport QR | Pas de QR réel ni de route publique connectée | À construire après dossiers persistants |
| Score Santé | Indicateurs expliqués, score non calculé | Définir formule et seuil de données avant activation |
| Base de Prix | Catégories et état vide, aucune cotation vérifiée | À construire avec source, date, région, unité et modération |
| CRM | Présentation et état vide, aucun client persistant | À construire |
| Feuille de route | Liste statique de chantiers | Relier à des statuts livrés et vérifiables |
| Authentification / ateliers | Non provisionnés | Bloquant avant données réelles |
| RLS / isolation multi-ateliers | Contrat SQL et brouillon de PR, pas de base appliquée | Bloquant avant données réelles |
| Invitations / délégations | Non livrées | À construire |
| Tests navigateur E2E | Non présents dans le socle actuel | À ajouter avant recette |
| Paiement / WhatsApp / impression | Aucune intégration réelle configurée | Ne pas simuler une réussite |

## Matrice d'accès à implémenter et à tester côté serveur

| Fonction | Propriétaire | Gestionnaire | Menuisier | Apprenti | Client |
|---|---|---|---|---|---|
| Profil et paramètres de l'atelier | gérer | lire | lire | lire | aucun |
| Membres, rôles, invitations | gérer | aucun par défaut | aucun | aucun | aucun |
| Clients et contacts | gérer | gérer | lecture minimale liée à une tâche | lecture minimale assignée | ses propres données uniquement |
| Devis : création et suivi | gérer | gérer | lecture des instructions utiles | aucun par défaut | consulter / accepter ses devis |
| Coûts, prix d'achat, marges | propriétaire uniquement par défaut | aucun | aucun | aucun | jamais |
| Commandes et dossiers de fabrication | gérer | gérer | exécuter les tâches assignées | exécuter les tâches assignées | consulter ses commandes autorisées |
| Tâches et étapes de production | gérer | gérer | mettre à jour ses tâches | mettre à jour les tâches assignées | aucun |
| Stocks : quantités et mouvements | gérer | gérer | lecture et mouvements autorisés | lecture limitée | aucun |
| Coûts de stock et d'approvisionnement | propriétaire uniquement par défaut | aucun | aucun | aucun | jamais |
| Fournisseurs | gérer | gérer | aucun par défaut | aucun | aucun |
| Base de prix publique validée | gérer | lire | lire | lire | lire les éléments publics |
| Finance, paiements, dépenses | propriétaire uniquement par défaut | aucun | aucun | aucun | consulter uniquement ses reçus/états autorisés |
| Journal d'audit | gérer | aucun par défaut | aucun | aucun | aucun |
| Vitrine / portfolio public | gérer | gérer si délégué | proposer un contenu | aucun | consulter |
| Passeport QR public | créer / révoquer | créer si délégué | consulter le dossier interne autorisé | aucun | consulter uniquement les champs publics |

Règles impératives :
- Un gestionnaire n'obtient jamais de droits financiers du seul fait de son rôle.
- Une délégation doit être explicite, granulaire, accordée par le propriétaire, stockée côté serveur, révocable et auditée.
- Les permissions ne viennent jamais du navigateur ni des métadonnées utilisateur modifiables.
- Chaque requête vérifie l'appartenance active à l'atelier demandé et l'accès à la ligne concernée.
- Les réponses publiques, exports, PDF, QR et vues client utilisent une liste blanche de champs.
- Les clients ne sont pas des membres internes d'un atelier.
- Tester systématiquement deux ateliers A/B pour les lectures, créations, mises à jour, suppressions, fichiers et exports.

## Plan de consolidation par lots

### Lot 0 — Préserver et rendre la préversion réellement servable
- Garder le rendu et la structure actuels.
- Vérifier la chaîne Render : le service actuellement suivi est de type statique, avec commande de build sans compilation et publication du répertoire racine, alors que le dépôt contient une application Next.js App Router. Corriger le mode de publication avant d'utiliser l'URL comme preuve de recette.
- Contrôler le rendu réel à l'écran sur mobile et desktop ; vérifier l'image `/interface-premium.png`, les liens et les routes.
- Ne pas créer de service payant ni provisionner de base sans autorisation.

### Lot 1 — Interactions visibles
- Chaque bouton doit avoir une action définie et testée.
- Navigation : onglet actif, focus clavier, retour cohérent et navigation mobile.
- Modèles : sélection, dimensions, validation des bornes.
- Estimation : champs requis, unités, valeurs négatives, erreurs, hypothèses et résultat reproductible.
- Actions non connectées : afficher explicitement « indisponible » ou « à venir », jamais de faux succès.
- Ajouter des tests de composants et des tests navigateur pour les parcours critiques.

### Lot 2 — Identité, ateliers et permissions
- Authentification, création d'atelier, invitation, acceptation, révocation et changement d'atelier.
- RLS appliquée et testée sur un vrai PostgreSQL/Supabase de préproduction, après autorisation.
- Matrice d'accès ci-dessus codée côté serveur et vérifiée par tests positifs et négatifs.
- Interdire l'accès aux coûts, marges, paiements, dépenses et prix fournisseurs à tous les rôles non propriétaires, sauf délégation explicite et spécifique.

### Lot 3 — CRM et devis
- CRUD clients, consentements, historique et rappels.
- Devis versionnés, lignes, conditions, validité, acceptation/refus, PDF et partage.
- Un devis accepté crée une commande/dossier de manière atomique ; aucune conversion fictive.
- WhatsApp ouvre un lien prérempli après validation du numéro et du consentement ; ne jamais annoncer qu'un message est envoyé.

### Lot 4 — Commandes, stock et production
- Dossier de fabrication, nomenclature, tâches, affectations, échéances, photos, incidents et transitions horodatées.
- Mouvements de stock traçables et contrôles de quantités.
- Séparer les champs de coût des champs opérationnels dans les API.
- Contrôle qualité, livraison et garantie.

### Lot 5 — Prix, indicateurs et passeport
- Observations de prix avec unité, région, source, date, qualité, confiance et modération.
- Score Santé calculé uniquement avec données suffisantes, formule documentée et période affichée.
- QR non séquentiel, révocable, route publique et champs explicitement autorisés.
- Impression réelle via une page imprimable ; pas de succès fictif.

### Lot 6 — Marketplace et préproduction
- Vitrines, portfolios, recherche et demandes de devis publiques.
- Pas de paiement en ligne ni de panier transactionnel avant validation des partenaires et obligations.
- E2E, sécurité, isolation A/B, sauvegarde/restauration, monitoring et recette finale.

## Critères de sortie

Un lot n'est terminé que si :
1. les actions annoncées aboutissent réellement ;
2. tests unitaires, TypeScript, lint et build réussissent ;
3. les tests d'accès refusent les opérations interdites ;
4. aucun atelier ne lit ou modifie les données d'un autre ;
5. les coûts et données internes ne fuitent ni vers les employés non autorisés ni vers les clients ;
6. la comparaison visuelle mobile/desktop confirme la conservation de l'interface ;
7. le rapport indique précisément les fonctionnalités RÉELLES, PARTIELLES, DÉMO et NON DISPONIBLES.

## Limites de cet audit

Cet audit est fondé sur le code et la documentation accessibles dans le dépôt au commit indiqué. Il ne constitue pas une recette visuelle navigateur, un test de production, une validation Supabase/RLS en environnement réel ni une validation de paiement. Aucun PR n'est fusionné et aucun service externe n'est provisionné par ce document.
