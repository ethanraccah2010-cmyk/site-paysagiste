# 🌿 Guide de personnalisation — Template Paysagiste premium

Ce site est un **template réutilisable**. Toutes les informations propres à un client
sont regroupées à deux endroits seulement :

1. **Les _tokens_ `[[...]]`** dans les fichiers HTML → un simple **rechercher / remplacer**.
2. **Le fichier `config.js`** → les données utilisées par le JavaScript (prix du
   simulateur, communes, réglages d'animation).

> ⏱️ Adapter le site à un nouveau client prend **~10 minutes**.

---

## 1. Liste exhaustive des tokens

Remplacez chaque token (y compris les doubles crochets) par la vraie valeur, **dans tous les fichiers `.html`**.

| Token | Signification | Exemple |
|---|---|---|
| `[[NOM_ENTREPRISE]]` | Nom commercial affiché partout | `Jardins d'Émile` |
| `[[SLOGAN]]` | Phrase d'accroche courte | `L'art du jardin sur-mesure.` |
| `[[TELEPHONE]]` | Téléphone **affiché** | `06 12 34 56 78` |
| `[[TELEPHONE_INTL]]` | Téléphone pour les liens `tel:` (format international, sans espaces) | `+33612345678` |
| `[[EMAIL]]` | Adresse email de contact | `contact@jardins-emile.fr` |
| `[[ADRESSE]]` | Adresse (numéro + rue) | `12 rue des Tilleuls` |
| `[[CODE_POSTAL]]` | Code postal | `91000` |
| `[[VILLE]]` | Ville principale | `Évry-Courcouronnes` |
| `[[DEPARTEMENT]]` | Département | `Essonne` |
| `[[ZONE_INTERVENTION]]` | Zone desservie (texte libre) | `l'Essonne et le sud de Paris` |
| `[[NOTE_GOOGLE]]` | Note Google (virgule française) | `4,9` |
| `[[NB_AVIS]]` | Nombre d'avis Google | `87` |
| `[[NB_PROJETS]]` | Nombre de projets réalisés | `250` |
| `[[ANNEES_EXP]]` | Années d'expérience | `15` |
| `[[URL_FACEBOOK]]` | URL de la page Facebook | `https://facebook.com/...` |
| `[[URL_INSTAGRAM]]` | URL du compte Instagram | `https://instagram.com/...` |
| `[[URL_SITE]]` | URL finale du site (sans `/` final) | `https://jardins-emile.fr` |
| `[[FORMSPREE_ENDPOINT]]` | URL du formulaire Formspree | `https://formspree.io/f/xxxxxxx` |

### Où apparaissent-ils ?
- `index.html` : tous les tokens.
- `realisations.html` : tous sauf `[[FORMSPREE_ENDPOINT]]`, `[[ANNEES_EXP]]`, `[[NB_AVIS]]`.
- `contact.html` : tous (la carte Google Maps utilise `[[ADRESSE]]`, `[[CODE_POSTAL]]`, `[[VILLE]]`).

Chaque fichier HTML commence par un bloc `<!-- VARIABLES À PERSONNALISER -->` qui rappelle les tokens présents.

---

## 2. Méthode rapide (rechercher / remplacer)

### Dans un éditeur de code (VS Code, Sublime…)
1. Ouvrez le dossier du projet.
2. `Ctrl/Cmd + Shift + F` (rechercher dans les fichiers).
3. Activez le remplacement, puis pour **chaque** token : collez `[[NOM_ENTREPRISE]]`, mettez la vraie valeur, **Remplacer tout**.
4. Répétez pour les 18 tokens.

### En ligne de commande (macOS / Linux)
```bash
# Exemple pour un token. À répéter pour chacun.
LC_ALL=C find . -name "*.html" -exec sed -i '' 's/\[\[NOM_ENTREPRISE\]\]/Jardins d’Émile/g' {} +
```
> Astuce : préparez un petit script avec une ligne `sed` par token.

---

## 3. Réglages JavaScript (`config.js`)

Ouvrez `config.js` (tout est commenté en français) :

- **`simulateur.surface.prixM2`** : fourchette du prix de base **au m²**.
- **`simulateur.surface`** : `min`, `max`, `defaut`, `pas` du curseur de surface.
- **`simulateur.options`** : pour chaque option (terrasse, gazon, éclairage…),
  ajustez `min` / `max` (montant ajouté au devis), le `label`, la `question`, l'`icone`.
  Vous pouvez **ajouter ou supprimer** une option : le simulateur s'adapte automatiquement.
- **`zones`** : la liste des communes affichées sur la page contact.
- **`animation`** : intensité des effets (tilt, parallax, compteurs, feuilles).
  Mettez `feuilles: false` pour désactiver les particules du hero.

> 💡 Le calcul du devis = `surface × prixM2` + somme des options cochées.
> L'estimation est **toujours indicative et non contractuelle** (texte modifiable dans `simulateur.disclaimer`).

---

## 4. Images & vidéo

Tous les visuels sont des **placeholders SVG** (dossier `images/`), élégants mais génériques.
Remplacez-les par les vraies photos du client en **conservant les noms de fichiers**
(ou changez le `src` dans le HTML). Voir `images/README.txt` pour la liste et les dimensions conseillées.

- **Hero vidéo** : déposez votre vidéo drone dans `videos/drone.mp4`
  et une image d'aperçu dans `images/hero-poster.jpg` (puis mettez à jour le `poster` du `<video>` dans `index.html`).
  Tant que la vidéo est absente, le **poster** s'affiche : le site reste présentable.

Conseils performance : photos en **JPG/WebP optimisés** (< 300 Ko), la vidéo en **MP4 H.264** compressée.

---

## 5. Formulaires (Formspree)

Les 3 formulaires (simulateur, CTA accueil, page contact) envoient via **Formspree** en AJAX,
avec un **honeypot anti-spam** et une confirmation **sans rechargement**.

1. Créez un compte gratuit sur [formspree.io](https://formspree.io).
2. Créez un formulaire, copiez son endpoint (`https://formspree.io/f/xxxxxxx`).
3. Remplacez `[[FORMSPREE_ENDPOINT]]` partout par cet endpoint.

> 🧪 **Mode démo** : tant que `[[FORMSPREE_ENDPOINT]]` n'est pas remplacé, les formulaires
> simulent un envoi réussi (pour pouvoir tester le site). Pensez à le configurer avant la mise en ligne.

---

## 6. Déploiement sur Vercel

Le site est **100 % statique** — aucune étape de build.

1. Poussez le dossier sur un dépôt GitHub (ou utilisez `vercel` en CLI).
2. Sur [vercel.com](https://vercel.com) : **New Project** → importez le dépôt.
3. Framework Preset : **Other** / Static. Laissez les champs de build vides.
4. **Deploy**. C'est en ligne. 🎉

> Pensez à mettre à jour `[[URL_SITE]]` avec l'URL finale (canonical + Open Graph + JSON-LD).

---

## 7. Checklist avant mise en ligne

- [ ] Les 18 tokens remplacés dans les 3 pages HTML.
- [ ] `config.js` : prix, options et communes ajustés.
- [ ] Vraies photos dans `images/` + vidéo dans `videos/`.
- [ ] `[[FORMSPREE_ENDPOINT]]` configuré, test d'envoi réussi.
- [ ] `[[URL_SITE]]` correct (canonical, OG, JSON-LD).
- [ ] Test mobile (360 px) → desktop (1440 px).
- [ ] Test avec « réduire les animations » activé (le site reste lisible et fonctionnel).

---

## Arborescence

```
/index.html            Page d'accueil (hero, avant/après, réalisations, processus, simulateur, avis, CTA)
/realisations.html     Galerie filtrable (jardin / terrasse / éclairage / clôture)
/contact.html          Coordonnées + carte Google Maps + formulaire
/style.css             Design system complet (charte, composants, responsive, reduced-motion)
/script.js             Interactions (header, slider avant/après, simulateur, modale, carrousel, formulaires)
/animations.js         Effets « presque 3D » (reveals, parallax, tilt, compteurs, feuilles, curseur)
/config.js             Données JS (prix simulateur, communes, réglages d'animation)
/PERSONNALISATION.md   Ce guide
/images/               Visuels placeholder (SVG) — à remplacer
/videos/               Vidéo hero (à déposer)
```
