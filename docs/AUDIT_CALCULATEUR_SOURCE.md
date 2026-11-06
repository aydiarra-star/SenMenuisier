# Audit fonctionnel du calculateur — source HTML

## Fonction réellement écrite dans le fichier fourni

Le calculateur du HTML ne calcule pas un véritable plan de débit. Il applique les opérations suivantes :

1. Calcule le volume de référence du modèle : largeur de base × hauteur de base × profondeur de base.
2. Calcule le volume courant avec les dimensions choisies.
3. Calcule un ratio volume courant / volume de référence.
4. Multiplie le nombre de panneaux de référence du modèle par ce ratio, puis arrondit l'affichage à une décimale.
5. Multiplie ce nombre de panneaux par le prix du matériau sélectionné.
6. Ajoute le coût de finition (par défaut 20 000 FCFA, laque 35 000 FCFA, brut 0 FCFA) et un forfait fixe de 25 000 FCFA présenté comme main-d'œuvre/quincaillerie.
7. Multiplie le coût total par 1,65 pour obtenir le prix recommandé.
8. Calcule la marge affichée en pourcentage du prix recommandé.

## Paramètres de départ dans le HTML

| Modèle | Dimensions L×H×P (cm) | Panneaux de référence | Coût de base transmis à la fonction |
|---|---:|---:|---:|
| Armoire 3 portes | 180×220×60 | 3,2 | 115 000 FCFA |
| Cuisine modulaire en L | 280×85×60 | 6,0 | 240 000 FCFA |
| Lit 2 places luxe | 180×110×200 | 3,8 | 140 000 FCFA |
| Bureau sur-mesure | 160×75×80 | 2,8 | 110 000 FCFA |

Le paramètre `basePrice` est mémorisé dans l'objet du modèle mais n'est pas utilisé par la fonction de calcul du HTML.

## Matériaux listés dans le HTML

- MDF standard 18 mm : 22 500 FCFA/panneau.
- MDF hydrofuge vert : 28 000 FCFA/panneau.
- Fraké massif local : 45 000 FCFA/m².
- Bois rouge massif : 60 000 FCFA/m².
- Chêne massif d'importation : 85 000 FCFA/m².

Le calcul multiplie toutefois le nombre de panneaux par tous les prix, y compris les prix au m² du bois massif. Les unités ne sont donc pas cohérentes pour ces trois matériaux.

## Finitions listées dans le HTML

- Vernis polyuréthane satiné : 20 000 FCFA par défaut.
- Huile naturelle éco-protect : l'interface indique +15 000 FCFA, mais le script ne gère pas ce cas et conserve 20 000 FCFA.
- Laque mat haute densité : 35 000 FCFA.
- Brut poncé : 0 FCFA.

## Écarts et risques identifiés

- Le ratio volumétrique ne représente pas une optimisation de panneaux ni la géométrie réelle des pièces.
- Les panneaux fractionnaires ne sont pas achetables tels quels ; l'arrondi d'achat et les chutes doivent être calculés sur des pièces et formats de panneaux.
- L'interface affiche un taux de chutes fixe de 12 %, mais ce taux n'entre pas dans la formule présentée.
- Le coût de main-d'œuvre/quincaillerie est un forfait fixe non détaillé.
- La marge affichée résulte du coefficient 1,65 ; elle n'est pas une marge calculée à partir d'un relevé comptable réel.
- Les prix des bois au m² sont multipliés par un nombre de panneaux : unité incohérente.
- Le coût de base transmis avec les modèles n'est pas exploité.
- La version React actuelle ne reproduit pas exactement cette formule ni les résultats détaillés du bilan matière du HTML.

## Décision de conception

Conserver les contrôles et la présentation prévus par le HTML, mais ne pas présenter la formule d'origine comme une vérité technique. La première version connectée doit afficher les hypothèses et unités, distinguer estimation et débit validé, permettre de configurer les coûts par atelier et faire valider les nomenclatures par des menuisiers pilotes. La génération d'un plan de coupe fiable sera livrée seulement après cette validation.
