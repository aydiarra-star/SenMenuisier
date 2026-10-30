# État de l'implémentation — phase 1

## Ce qui est présent sur cette branche

- Socle Next.js App Router avec TypeScript strict.
- Métadonnées de l'application et styles globaux avec les cinq couleurs de référence.
- Variables d'environnement documentées sans exposer de secret.
- Page de démarrage explicitement provisoire.

## Ce qui n'est pas encore livré

- L'intégration fidèle des six espaces de l'interface HTML de référence.
- Les interactions métier réelles et leur persistance.
- Supabase, authentification, migrations, RLS et stockage.
- Tests, build validé, déploiement et configuration de production.

## Point bloquant identifié

Le fichier de référence « SenMenuisier – OS de la Menuiserie » est bien disponible dans les pièces de travail, mais le connecteur GitHub utilisé pour écrire dans le dépôt n'accepte que le contenu texte transmis dans son appel ; il ne peut pas lire directement le chemin local du fichier. Le fichier source fait 62 248 octets. Pour respecter l'exigence de reproduction à l'identique, il ne faut ni le réécrire de mémoire ni le remplacer par une interface approximative.

La prochaine opération est donc le transfert exact de ce fichier dans le dépôt, puis son intégration sans réinterprétation visuelle. La page provisoire devra être remplacée seulement après cette étape.

## Règle de livraison

Cette branche n'est pas prête pour la production et ne doit pas être fusionnée dans `main` en l'état.
