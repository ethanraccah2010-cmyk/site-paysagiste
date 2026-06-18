# CORRESPONDANCE IMAGES IA → FICHIERS SVG (site paysagiste)

Les 8 images générées ont été converties en SVG (photo JPEG optimisée embarquée).
**Ce sont des remplacements directs** des placeholders du dossier `/images` : même nom de fichier → tu écrases, rien à changer dans le HTML.

| Image générée (Gemini) | Contenu | Emplacement sur le site | Fichier(s) SVG livré(s) |
|---|---|---|---|
| `...mjbaj7...` | Maison moderne + grand jardin paysagé, étang, golden hour | **Hero** (fond) + image de partage | `hero.svg`, `hero-poster.svg`, `og-image.svg` |
| `...sgsgsy...` | **Même maison**, terrain nu / friche, bassin à l'abandon | Slider Avant/Après — projet 1, **AVANT** | `avant-1.svg` |
| `...nn5e6i...` | **Même maison**, jardin fini, bassin carré, allée pierre | Slider Avant/Après — projet 1, **APRÈS** | `apres-1.svg` |
| `...1pthhz...` | Vieille terrasse pavée fissurée, mousse, vieille bâtisse | Slider Avant/Après — projet 2, **AVANT** | `avant-2.svg` |
| `...pzd7mj...` | Terrasse composite premium, salon, brasero, crépuscule | Slider Avant/Après — projet 2, **APRÈS** | `apres-2.svg` |
| `...ynw1jp...` | Jardin contemporain, graminées, acier corten, gravier | Réalisation 1 — *Jardin contemporain* | `realisation-1.svg` |
| `...kc0k0b...` | Terrasse bois exotique, transat, golden hour | Réalisation 2 — *Terrasse bois exotique* | `realisation-2.svg` |
| `...tjs652...` | Jardin de nuit éclairé, allée balisée | Réalisation 3 — *Éclairage d'ambiance* | `realisation-3.svg` |

## À faire côté Claude Code
- **Hero :** le fond du hero utilise aujourd'hui une illustration. Le faire pointer sur `images/hero.svg`. Garder `hero-poster.svg` pour le poster d'une éventuelle vidéo.
- **Open Graph :** vérifier que la balise `og:image` pointe sur `images/og-image.svg`.
- Pour `avant-*/apres-*/realisation-1/2/3`, **rien à faire** : mêmes noms que les placeholders.

## ⚠️ Point à corriger : la paire terrasse Avant/Après ne « matche » pas
`avant-2` (petite cour pavée d'une vieille maison) et `apres-2` (grande terrasse ouverte multi-niveaux) ne sont **pas le même lieu ni le même cadrage** → l'effet curseur avant/après perd son sens (contrairement à la paire jardin, parfaite).
Deux options :
1. Régénérer l'**APRÈS terrasse** au même cadrage que l'avant (prompt fourni dans `prompts-images-restantes-paysagiste.md`).
2. Ou accepter le compromis (moins percutant).

## Note technique (perf)
Chaque SVG pèse 240–450 Ko (photo JPEG embarquée en base64). C'est correct, mais pour un PageSpeed optimal **plus tard**, le mieux serait des vrais `.webp` + mise à jour des chemins par Claude Code. Pour l'instant, le SVG est le remplacement le plus simple.
