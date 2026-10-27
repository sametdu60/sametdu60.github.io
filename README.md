# sametdu60.github.io

Mon CV en ligne : https://sametdu60.github.io

Élève ingénieur en cybersécurité à l'ESIEA, diplômé en septembre 2027. Je cherche un premier poste en CDI à Paris : SOC, sécurité des infrastructures et du cloud, détection de menaces.

## Trois points d'entrée

| Page | Rôle |
|---|---|
| `index.html` | Le CV en ligne : qui je suis, ce que je cherche, mes projets, un mini-défi de détection |
| `cv.html` | Le CV classique, une page A4 affichée dans le navigateur et imprimable |
| `portfolio.html` | La reconversion en six chapitres, puis les projets en détail |

Pages communes : `parcours.html`, `competences.html` et les études de cas `projet-*.html`. Elles reprennent l'habillage de la page d'où l'on vient.

## Une seule source pour le contenu

`js/data.js` contient le profil, ce que je cherche, les expériences, les projets, la formation et les compétences. `js/render.js` s'en sert pour construire le haut de l'accueil, les tuiles projets, le CV classique, les projets du portfolio et les liens « projet suivant ».

- Retirer un projet partout : passer son `show` à `false`.
- Ajouter un projet : copier un bloc existant dans `projects` (l'ordre de la liste est l'ordre d'affichage).
- Un projet sans `question` n'a pas de tuile sur l'accueil, mais apparaît dans le CV classique.

Le CV classique tient sur une page A4 avec le contenu actuel. Au-delà, l'impression passe sur deux pages.

## Les scripts

- `js/boot.js` : langue, thème et habillage appliqués avant l'affichage
- `js/data.js`, `js/render.js` : le contenu et sa mise en page
- `js/site.js` : bascules, apparitions, copie de l'e-mail, vidéo, impression
- `js/game.js` : le défi « trouvez la machine piratée »
- `js/xray.js` : la valise passée aux rayons X
- `js/net.js` : la simulation du lab sur la page détection
- `js/story.js` : la navigation par chapitres du portfolio

## Choix techniques

Site statique en HTML, CSS et JavaScript, sans framework ni dépendance. Chaque page existe en français et en anglais.

Aucune ressource externe : pas de police Google, pas de CDN, pas de traceur, pas de cookie. La politique CSP de chaque page n'autorise que le domaine du site.

Les anciennes adresses `v2.html` à `v5.html` redirigent vers la page correspondante.

## En local

```
python -m http.server 8000
```

puis http://localhost:8000
