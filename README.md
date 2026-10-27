# sametdu60.github.io

Mon CV en ligne : https://sametdu60.github.io

Élève ingénieur en cybersécurité à l'ESIEA, diplômé en septembre 2027. Je viens du réseau, je vais vers la détection.

## Cinq interfaces, un seul contenu

Le site existe en cinq versions, le temps de recueillir l'avis de recruteurs :

| Version | Page | Parti pris |
|---|---|---|
| 1 · Ludique | `index.html` | Tuiles, mini-défi de détection, valise aux rayons X |
| 2 · Classique | `v2.html` | CV typographié comme un document, imprimable |
| 3 · Console SOC | `v3.html` | Tableau de bord d'analyste, lab en direct |
| 4 · Récit | `v4.html` | La reconversion en six chapitres plein écran |
| 5 · Fiche express | `v5.html` | Tout le profil sur un écran, grille suisse |

Un sélecteur en bas de page permet de passer de l'une à l'autre, et un formulaire prépare un e-mail de retour structuré. Rien n'est stocké en dehors du navigateur du visiteur.

Pour envoyer directement une version : `https://sametdu60.github.io/?ui=3`.

Les pages de détail (`parcours.html`, `competences.html`, `projet-*.html`) sont communes et prennent l'habillage de la version choisie.

Une fois la version définitive choisie : dans `js/boot.js`, passer `REVIEW` à `false` et mettre son numéro dans `DEFAULT_UI`.

## Les scripts

- `js/boot.js` : langue, thème et interface appliqués avant l'affichage
- `js/site.js` : bascules, apparitions, copie de l'e-mail, vidéo, impression
- `js/review.js` : sélecteur d'interface et formulaire de retour
- `js/game.js` : le défi « trouvez la machine piratée » (version 1)
- `js/xray.js` : la valise passée aux rayons X (versions 1 et 4)
- `js/net.js` : la simulation du lab (page détection et version 3)
- `js/console.js`, `js/story.js` : horloge de la version 3, chapitres de la version 4

## Choix techniques

Site statique en HTML, CSS et JavaScript, sans framework ni dépendance. Chaque page existe en français et en anglais, le contenu des deux langues est dans le HTML.

Aucune ressource externe : pas de police Google, pas de CDN, pas de traceur, pas de cookie. La politique CSP de chaque page n'autorise que le domaine du site.

Les animations se mettent en pause hors de l'écran, et laissent place à une image fixe pour les visiteurs qui ont réduit les animations dans leur système.

## Médias

- Photo : `assets/photos/img-profil.jpg`
- Vidéo : `assets/video/video.mp4` (pour la masquer, ajouter la classe `is-soon` à l'élément `#video-tile` de la version 1)

## En local

```
python -m http.server 8000
```

puis http://localhost:8000
