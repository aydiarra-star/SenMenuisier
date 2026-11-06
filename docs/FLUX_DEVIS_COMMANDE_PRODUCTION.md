# Parcours métier — devis accepté, commande et fabrication

Statut : conception fonctionnelle, non implémentée et non connectée à une base.
Branche de référence pour ce document : `design/measure-assistant-v1`.

Ce document prépare la prochaine étape de SenMenuisier. Il ne signifie pas que les devis sont envoyés, que les commandes sont enregistrées ou que la production est suivie aujourd'hui.

## 1. Règle de départ

Une commande ne naît jamais d'un simple aperçu de devis. Elle est créée uniquement après une acceptation explicite, vérifiée et enregistrée par l'atelier. Le devis accepté devient un instantané de référence : ses prix, dimensions, matériaux et conditions ne changent plus silencieusement.

Le brouillon actuel dans l'interface reste local à la session. Il ne doit pas être présenté comme un document sauvegardé, envoyé, signé ou accepté.

## 2. Cycle de vie du devis

États autorisés :

1. `draft` — préparation interne, modifiable.
2. `prepared` — contrôles métier passés, prêt à être transmis.
3. `sent` — transmis au client ; date, canal et auteur consignés.
4. `accepted` — accord du client reçu et confirmé par un membre autorisé.
5. `rejected` — refus explicite du client.
6. `expired` — date de validité dépassée sans acceptation.
7. `cancelled` — annulé par l'atelier avec motif.

Transitions interdites : brouillon directement accepté ; devis refusé ou expiré réactivé sans nouvelle version ; modification d'un devis déjà accepté. Une modification commerciale après acceptation produit un avenant ou une nouvelle version et demande une nouvelle validation.

### Contrôles avant transmission

- identité du client et moyen de contact vérifiés ;
- dimensions contrôlées sur place et confirmation attribuée à un membre ;
- matériau, épaisseur, finition, chants et contraintes renseignés ou explicitement marqués « à confirmer » ;
- quantités, coûts, marge, prix et devise calculés côté serveur à terme ;
- date de validité, délai annoncé, acompte éventuel, modalités de paiement et exclusions visibles ;
- aucune liste de débit présentée comme calculée tant qu'elle n'a pas été établie et validée par le menuisier.

### Preuve d'acceptation

L'atelier enregistre au minimum : devis/version, date et heure, membre qui a recueilli l'accord, canal (atelier, téléphone, WhatsApp, document papier), identité déclarée de l'interlocuteur et note/preuve facultative. Un clic du menuisier n'est pas présenté comme une signature électronique du client. La preuve et les exigences légales de signature seront définies avant toute signature électronique.

## 3. Création atomique de la commande

L'acceptation confirmée déclenche une transaction serveur unique qui :

- vérifie que le devis appartient à l'atelier actif ;
- vérifie l'autorisation du membre et l'état courant du devis ;
- vérifie qu'aucune commande n'existe déjà pour cette version ;
- fige l'instantané accepté (client, ouvrage, cotes, spécifications, prix, délai et conditions) ;
- crée une commande avec un identifiant lisible et unique dans l'atelier ;
- crée les premières étapes de fabrication ;
- écrit les événements d'audit ;
- passe le devis à `accepted`.

Si une étape échoue, aucune commande partielle ni acceptation incohérente ne doit subsister. Une contrainte unique protège contre les doubles clics et les reprises réseau.

## 4. Cycle de vie de la commande

États principaux :

- `confirmed` — commande créée après acceptation ;
- `preparation` — dossier technique et matière à vérifier ;
- `cutting` — débit en cours, après nomenclature validée ;
- `assembly` — assemblage ;
- `finishing` — ponçage et finition ;
- `quality_control` — contrôle documenté ;
- `ready` — prête à remettre ;
- `delivered` — remise au client confirmée ;
- `closed` — dossier clôturé ;
- `on_hold` — suspendue avec motif ;
- `cancelled` — annulée avec motif et historique.

Une commande peut être suspendue depuis une étape active puis reprise à l'étape précédente. Elle ne saute pas directement à « livrée ». Le passage à `delivered` exige date, auteur et mode de remise ; un reçu ou une confirmation peut être joint. La clôture vérifie les éléments administratifs nécessaires, sans imposer que les paiements soient visibles aux employés.

## 5. Étapes de fabrication et preuves

Chaque étape possède : statut, ordre, responsable facultatif, date prévue, début/fin réels, note, pièces jointes privées et événements d'historique.

- Préparation : dimensions et spécifications revues ; nomenclature et plan de débit validés par le menuisier.
- Débit : pièces réellement débitées, quantité, matière, chutes si mesurées.
- Assemblage : contrôle des assemblages et ajustements.
- Finition : type de finition et observations.
- Contrôle qualité : liste de points contrôlés, anomalies, correction et validation.
- Livraison : remise, date, personne ayant remis et confirmation.

Les photos sont privées par défaut. Les données du passeport QR sont une sélection publique distincte, validée par l'atelier ; elles ne doivent jamais exposer coordonnées client, prix d'achat, marge, notes internes ou paiements.

## 6. Modèle de données cible

Toutes les tables métier portent `workshop_id NOT NULL`. Les relations entre elles utilisent des clés étrangères composites contenant `workshop_id`.

| Table | Champs essentiels |
|---|---|
| `clients` | id, workshop_id, nom, téléphone, consentement/contact, notes privées |
| `quotes` | id, workshop_id, client_id, numéro, état, version, valid_until, created_by |
| `quote_versions` | quote_id, workshop_id, instantané JSON validé, devise, total, conditions |
| `quote_acceptances` | quote_version_id, workshop_id, canal, recueilli_par, date, référence de preuve |
| `orders` | id, workshop_id, quote_version_id unique, numéro, état, dates promises/réelles |
| `order_items` | id, workshop_id, order_id, description, quantité, spécifications figées |
| `production_steps` | id, workshop_id, order_id, étape, statut, responsable, dates |
| `production_events` | id, workshop_id, order_id, acteur, action, note, date |
| `order_attachments` | id, workshop_id, order_id, chemin privé, type, visibilité |

Les montants et coûts ne doivent pas être renvoyés aux rôles non autorisés par simple masquage visuel. Les colonnes financières, vues et fonctions de lecture seront séparées et protégées par RLS et permissions serveur. Les pièces jointes utiliseront un stockage privé avec contrôle d'accès par atelier.

## 7. Permissions par défaut

| Action | Propriétaire | Gestionnaire | Menuisier | Apprenti |
|---|---:|---:|---:|---:|
| Voir/éditer les clients | Oui | Oui | Selon affectation | Non |
| Préparer un devis sans coûts internes | Oui | Oui | Selon délégation | Non |
| Voir coûts, marge et prix d'achat | Oui | Non | Non | Non |
| Transmettre un devis | Oui | Oui | Selon délégation | Non |
| Confirmer l'acceptation et créer la commande | Oui | Oui | Selon délégation | Non |
| Mettre à jour les étapes de production | Oui | Oui | Oui, selon affectation | Tâches attribuées |
| Voir paiements, dépenses et soldes | Oui | Non par défaut | Non | Non |
| Publier les données du passeport QR | Oui | Selon délégation | Non par défaut | Non |

Toute délégation est vérifiée côté serveur et enregistrée dans l'audit. Aucun rôle ne peut s'accorder lui-même un droit.

## 8. Parcours écran attendu

1. Le menuisier prépare le devis et vérifie les cotes.
2. Il relit un aperçu imprimable/partageable, avec conditions et validité.
3. Il transmet le devis et choisit le canal ; l'envoi réel n'est annoncé que si un fournisseur de messagerie est effectivement connecté.
4. À réception de l'accord, il consigne la manière dont l'accord a été donné.
5. L'application affiche un écran de confirmation récapitulant le devis figé et avertit qu'une commande sera créée.
6. Après confirmation serveur, le dossier commande apparaît dans Production.
7. L'équipe met à jour les étapes qui lui sont attribuées ; l'historique est conservé.
8. Le propriétaire suit les coûts et paiements dans son espace privé.
9. À la livraison, le dossier est clôturé ; le passeport QR n'est activé qu'après choix explicite des informations publiques.

Sur mobile, chaque écran doit rester lisible sans défilement horizontal, avec une action principale claire, des libellés simples et une confirmation avant les opérations irréversibles.

## 9. Tests d'acceptation obligatoires

- Impossible de créer une commande depuis un devis `draft`, `prepared`, `rejected` ou `expired`.
- Deux appels simultanés d'acceptation ne créent qu'une seule commande.
- Un membre d'un atelier ne peut lire ni modifier les devis, commandes, étapes ou fichiers d'un autre atelier.
- Un gestionnaire ne reçoit aucune donnée de coût ou de paiement par défaut.
- Un apprenti ne peut pas confirmer un devis, créer une commande, modifier les dates promises ou clôturer une livraison.
- Un changement de cote après préparation invalide la confirmation des mesures et impose une nouvelle validation du devis.
- Toute modification d'un devis envoyé crée une nouvelle version ; aucune version acceptée n'est écrasée.
- Une étape de production conserve l'auteur, l'heure et la valeur précédente dans l'historique.
- Le QR public ne retourne que les champs explicitement publiés.
- Les parcours sont testés avec deux ateliers et plusieurs rôles au niveau PostgreSQL/RLS et API, pas uniquement dans React.

## 10. Ordre de réalisation

1. Finaliser le socle Auth, ateliers, adhésions et RLS sur un projet Supabase dédié.
2. Créer clients et devis avec contrôle de coûts séparé.
3. Construire les versions immuables et le flux d'acceptation.
4. Créer la commande atomiquement et tester les doubles soumissions.
5. Ajouter les étapes de production, affectations et historique.
6. Ajouter livraison, pièces jointes privées et tests d'accès.
7. Concevoir le passeport QR public après validation des règles de publication.

Aucun déploiement, migration sur une base existante ou réutilisation d'un projet Supabase d'une autre application n'est autorisé par ce document.
