/*
 * Construit les parties du site qui dépendent de js/data.js : le haut de
 * l'accueil, les tuiles projets, les compétences, le CV classique, les projets
 * du portfolio et les liens « projet suivant ». Chargé sans defer en fin de
 * page, pour que le contenu soit là dès le premier affichage.
 */
(function () {
  "use strict";

  const cv = window.CV;
  if (!cv) return;

  // Texte bilingue : le CSS affiche la langue active.
  const tr = v => {
    if (v == null) return "";
    if (typeof v === "string") return v;
    return `<span lang="fr">${v.fr}</span><span lang="en">${v.en}</span>`;
  };
  const both = (fr, en) => tr({ fr, en });
  const fill = (key, html) => document.querySelectorAll(`[data-cv="${key}"]`).forEach(el => { el.innerHTML = html; });

  const shown = cv.projects.filter(p => p.show);
  const featured = shown.filter(p => p.question && p.link);

  /* Accueil ------------------------------------------------------------- */
  fill("tagline", tr(cv.tagline));
  fill("pitch", tr(cv.pitch));
  fill("seeking-sentence", tr(cv.seeking.sentence));
  fill("seeking-summary", tr(cv.seeking.summary));
  fill("seeking-roles", cv.seeking.roles.map(r => `<li>${tr(r)}</li>`).join(""));
  fill("seeking-meta",
    `<div><dt>${both("Contrat", "Contract")}</dt><dd>${tr(cv.seeking.contract)}</dd></div>` +
    `<div><dt>${both("Début", "Start")}</dt><dd>${tr(cv.seeking.start)}</dd></div>` +
    `<div><dt>${both("Lieu", "Location")}</dt><dd>${tr(cv.seeking.location)}</dd></div>`);
  fill("facts", cv.facts.map(f =>
    `<div><dt>${tr(f.label)}</dt><dd>${tr(f.value)} <span class="sub">· ${tr(f.sub)}</span></dd></div>`).join(""));

  const meter = (s, top) =>
    `<div class="meter${top ? " meter--top" : ""}">` +
    `<span class="meter__name"><span>${tr(s.name)}</span><span>${tr(s.label)}</span></span>` +
    `<span class="meter__bar" aria-hidden="true">${[1, 2, 3, 4, 5].map(n => `<i${n <= s.level ? ' class="on"' : ""}></i>`).join("")}</span>` +
    `</div>`;
  fill("meters", cv.skills.map((s, i) => meter(s, i === 0)).join(""));

  fill("sites", cv.freelance.sites.map(s =>
    `<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.label} <span aria-hidden="true">↗</span></a>`).join(""));

  fill("project-tiles", featured.map(p =>
    `<a class="tile t-proj t-proj--${p.tone}" href="${p.link}">` +
      `<span class="label">${tr(p.context)}</span>` +
      `<span class="question">${tr(p.question)}</span>` +
      `<span class="tile__foot"><span class="chip-status">${tr(p.status)}</span><span class="go">${both("La réponse", "The answer")}</span></span>` +
    `</a>`).join(""));

  /* Portfolio ----------------------------------------------------------- */
  fill("portfolio-projects", shown.filter(p => p.link).map(p =>
    `<a class="card4 card4--${p.tone}" href="${p.link}">` +
      `<span class="card4__top"><span class="card4__tag">${tr(p.context)}</span><span class="card4__status">${tr(p.status)} · ${p.period}</span></span>` +
      `<span class="card4__title">${tr(p.title)}</span>` +
      (p.question ? `<span class="card4__q">${tr(p.question)}</span>` : "") +
      `<span class="card4__sum">${tr(p.summary)}</span>` +
      `<span class="card4__tags">${p.tags.map(t => `<span>${t}</span>`).join("")}</span>` +
      `<span class="go">${both("Lire l'étude de cas", "Read the case study")}</span>` +
    `</a>`).join(""));

  /* Parcours : les projets menés à côté -------------------------------- */
  fill("side-projects",
    featured.map(p =>
      `<a class="card tile--hover" href="${p.link}"><h3>${tr(p.title)}</h3><p>${tr(p.summary)}</p><p class="go">${both("Voir", "See")}</p></a>`).join("") +
    `<div class="card"><h3>Freelance</h3><p>${tr(cv.freelance.summary)} ` +
      cv.freelance.sites.map(s => `<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.label}</a>`).join(", ") +
    `</p></div>`);

  /* Pages projet : le lien « projet suivant » suit l'ordre de data.js ---- */
  document.querySelectorAll("[data-next]").forEach(link => {
    if (!featured.length) { link.hidden = true; return; }
    const here = featured.findIndex(p => p.id === link.dataset.next);
    const next = featured[(here + 1) % featured.length];
    if (next.id === link.dataset.next) { link.hidden = true; return; }
    link.setAttribute("href", next.link);
    const title = link.querySelector("strong");
    if (title) title.innerHTML = tr(next.question);
  });

  /* CV classique -------------------------------------------------------- */
  const doc = document.querySelector('[data-cv="document"]');
  if (doc) doc.innerHTML = classic();

  function classic() {
    // Format papier : deux puces par poste au plus, pour tenir sur une page A4.
    const entry = (title, right, sub, body) =>
      `<div class="doc__entry">` +
        `<div class="doc__row"><h3>${title}</h3><span>${right}</span></div>` +
        (sub ? `<p class="doc__sub">${sub}</p>` : "") +
        (body || "") +
      `</div>`;
    const list = items => items.length ? `<ul>${items.map(i => `<li>${tr(i)}</li>`).join("")}</ul>` : "";
    const dots = n => `<span class="doc__dots" aria-label="${n}/5">${[1, 2, 3, 4, 5].map(i => `<i${i <= n ? ' class="on"' : ""}></i>`).join("")}</span>`;

    return `
      <header class="doc__head">
        <img class="doc__photo" src="${cv.photo}" width="84" height="84" alt="${cv.name}">
        <div class="doc__id">
          <h1>${cv.name}</h1>
          <p class="doc__title">${tr(cv.title)} · ${both("réseau, systèmes et détection", "networks, systems and detection")}</p>
        </div>
        <ul class="doc__contact">
          <li><a href="mailto:${cv.email}">${cv.email}</a></li>
          <li><a href="${cv.linkedin}" target="_blank" rel="noopener noreferrer">linkedin.com/in/samet-bucak</a></li>
          <li><a href="${cv.github}" target="_blank" rel="noopener noreferrer">github.com/sametdu60</a></li>
          <li>${tr(cv.seeking.location)}</li>
        </ul>
      </header>

      <p class="doc__seek">${tr(cv.seeking.sentence)}</p>

      <div class="doc__cols">
        <div class="doc__main">
          <section>
            <h2>${both("Profil", "Profile")}</h2>
            <p class="doc__pitch">${tr(cv.pitch)}</p>
          </section>
          <section>
            <h2>${both("Expérience", "Experience")}</h2>
            ${cv.experience.map(e => entry(tr(e.role), tr(e.period), tr(e.org), list(e.bullets.slice(0, 2)))).join("")}
          </section>
          <section>
            <h2>${both("Projets", "Projects")}</h2>
            ${shown.map(p => entry(
              p.link ? `<a href="${p.link}">${tr(p.title)}</a>` : tr(p.title),
              p.period,
              "",
              `<p><em class="doc__status">${tr(p.status)}.</em> ${tr(p.summary)}</p>`
            )).join("")}
            ${entry("Freelance", both("en parallèle", "alongside"), "",
              `<p>${tr(cv.freelance.summary)} ${cv.freelance.sites.map(s => `<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.label}</a>`).join(", ")}</p>`)}
          </section>
        </div>

        <aside class="doc__side">
          <section>
            <h2>${both("Formation", "Education")}</h2>
            ${cv.education.map(e => `<div class="doc__edu"><h3>${tr(e.title)}</h3><p>${tr(e.org)}</p><p class="doc__when">${e.period}</p></div>`).join("")}
          </section>
          <section>
            <h2>${both("Compétences", "Skills")}</h2>
            ${cv.skills.map(s => `<div class="doc__skill"><div class="doc__row"><h3>${tr(s.name)}</h3>${dots(s.level)}</div><p>${tr(s.keywords)}</p></div>`).join("")}
          </section>
          <section>
            <h2>${both("Langues", "Languages")}</h2>
            <p>${tr(cv.languages)}</p>
          </section>
          <section>
            <h2>${both("Certificats", "Certificates")}</h2>
            <p>${tr(cv.certificates)}</p>
          </section>
        </aside>
      </div>

      <footer class="doc__foot">${both("Version en ligne, toujours à jour :", "Always up-to-date online version:")} <a href="https://${cv.site}/">${cv.site}</a></footer>`;
  }
})();
