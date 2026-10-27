/*
 * Phase de test auprès de recruteurs : le même contenu existe en cinq interfaces.
 * Ce script ajoute le sélecteur de version, une bulle d'explication au premier
 * passage et un formulaire de retour qui prépare un e-mail. Rien n'est stocké
 * ailleurs que dans le navigateur du visiteur.
 */
(function () {
  "use strict";

  const site = window.SITE || {};
  if (!site.review) return;

  const root = document.documentElement;
  const homes = site.homes;
  const EMAIL = "samet.bucak60@gmail.com";
  const NAMES = {
    "1": ["Ludique", "Playful"],
    "2": ["Classique", "Classic"],
    "3": ["Console SOC", "SOC console"],
    "4": ["Récit", "Story"],
    "5": ["Fiche express", "One-pager"]
  };
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* stockage indisponible */ } }
  };
  const lang = () => root.dataset.lang === "en" ? "en" : "fr";
  const isHome = root.dataset.page === "home";
  const both = (fr, en) => `<span lang="fr">${fr}</span><span lang="en">${en}</span>`;

  let ui = root.dataset.ui;

  /* Versions déjà vues -------------------------------------------------- */
  const seen = new Set((store.get("uiSeen") || "").split(",").filter(Boolean));
  if (isHome) {
    seen.add(ui);
    store.set("uiSeen", Array.from(seen).sort().join(","));
  }

  /* Les liens « Accueil » des pages de détail suivent la version choisie */
  const homeLinks = Array.from(document.querySelectorAll('a[href^="index.html"]'));
  homeLinks.forEach(a => { a.dataset.href = a.getAttribute("href"); });
  function rewriteHomeLinks() {
    if (isHome) return;
    homeLinks.forEach(a => a.setAttribute("href", a.dataset.href.replace("index.html", homes[ui])));
  }
  rewriteHomeLinks();

  /* Sélecteur ------------------------------------------------------------ */
  const bar = document.createElement("div");
  bar.className = "sw";
  bar.setAttribute("role", "group");
  bar.innerHTML =
    `<span class="sw__label">Version <b data-sw-name></b></span>` +
    Object.keys(NAMES).map(n => `<button class="sw__btn" type="button" data-target="${n}">${n}</button>`).join("") +
    `<span class="sw__sep" aria-hidden="true"></span>` +
    `<button class="sw__fb" type="button" data-feedback>${both("Donner mon avis", "Give feedback")}</button>`;
  document.body.append(bar);

  function renderBar() {
    const l = lang() === "en" ? 1 : 0;
    bar.setAttribute("aria-label", l ? "Choose an interface" : "Choisir une interface");
    bar.querySelector("[data-sw-name]").textContent = `${ui} · ${NAMES[ui][l]}`;
    bar.querySelectorAll(".sw__btn").forEach(btn => {
      const n = btn.dataset.target;
      btn.setAttribute("aria-current", String(n === ui));
      btn.classList.toggle("is-seen", seen.has(n));
      btn.title = `${l ? "Version" : "Version"} ${n} · ${NAMES[n][l]}`;
      btn.setAttribute("aria-label", btn.title);
    });
  }

  bar.addEventListener("click", e => {
    const btn = e.target.closest(".sw__btn");
    if (!btn || btn.dataset.target === ui) return;
    const next = btn.dataset.target;
    store.set("ui", next);
    if (isHome) {
      window.location.href = homes[next];
      return;
    }
    // Page de détail : on change l'habillage sur place.
    ui = next;
    root.dataset.ui = next;
    rewriteHomeLinks();
    renderBar();
    document.dispatchEvent(new CustomEvent("themechange"));
  });

  /* Bulle d'explication au premier passage ------------------------------ */
  let intro = null;
  if (!store.get("reviewIntro") && !sessionStorageGet("reviewIntroLater")) {
    intro = document.createElement("div");
    intro.className = "sw-intro";
    intro.setAttribute("role", "dialog");
    intro.setAttribute("aria-live", "polite");
    intro.innerHTML =
      `<strong>${both("Ce CV existe en 5 versions.", "This résumé comes in 5 versions.")}</strong>` +
      `<p>${both(
        "Même contenu, cinq mises en forme. Passez de l'une à l'autre avec les boutons 1 à 5, puis dites-moi laquelle vous donne le plus envie de me contacter. Trois minutes suffisent.",
        "Same content, five designs. Switch between them with buttons 1 to 5, then tell me which one makes you most want to get in touch. Three minutes is enough."
      )}</p>` +
      `<div class="sw-intro__actions"><button type="button" data-ok>${both("C'est parti", "Let's go")}</button><button type="button" data-later>${both("Plus tard", "Later")}</button></div>`;
    document.body.append(intro);
    intro.querySelector("[data-ok]").addEventListener("click", () => { store.set("reviewIntro", "1"); intro.remove(); });
    intro.querySelector("[data-later]").addEventListener("click", () => { sessionStorageSet("reviewIntroLater", "1"); intro.remove(); });
  }

  function sessionStorageGet(key) { try { return sessionStorage.getItem(key); } catch (e) { return null; } }
  function sessionStorageSet(key, value) { try { sessionStorage.setItem(key, value); } catch (e) { /* stockage indisponible */ } }

  /* Formulaire de retour -------------------------------------------------- */
  const choice = (name, value, fr, en) =>
    `<label class="choice"><input type="radio" name="${name}" value="${value}"><span>${both(fr, en)}</span></label>`;
  const versions = name => Object.keys(NAMES).map(n => choice(name, n, `${n} · ${NAMES[n][0]}`, `${n} · ${NAMES[n][1]}`)).join("");

  const ANSWERS = {
    role: { hr: "RH / recrutement interne", tech: "Manager ou expert technique", agency: "Cabinet de recrutement", other: "Autre" },
    clear: { yes: "Oui", partly: "En partie", no: "Non" },
    credible: { yes: "Convaincant", almost: "À renforcer", no: "Pas encore prêt" }
  };

  const fb = document.createElement("dialog");
  fb.className = "fb";
  fb.setAttribute("aria-labelledby", "fb-title");
  fb.innerHTML = `
    <div class="fb__inner">
      <button class="fb__close" type="button" data-close aria-label="Fermer">×</button>
      <h2 id="fb-title">${both("Votre avis m'aide vraiment", "Your feedback really helps")}</h2>
      <p class="fb__intro">${both(
        "Quelques questions courtes. Vos réponses partent dans un e-mail que vous relisez avant l'envoi : rien n'est enregistré sur ce site.",
        "A few short questions. Your answers go into an email you review before sending: nothing is stored on this site."
      )}</p>
      <fieldset><legend>${both("Vous êtes…", "You are…")}</legend><div class="choices">
        ${choice("role", "hr", "RH / recrutement interne", "HR / in-house recruiter")}
        ${choice("role", "tech", "Manager ou expert technique", "Manager or technical expert")}
        ${choice("role", "agency", "Cabinet de recrutement", "Recruitment agency")}
        ${choice("role", "other", "Autre", "Other")}
      </div></fieldset>
      <fieldset><legend>${both("Quelle version vous donne le plus envie de me contacter ?", "Which version makes you most want to contact me?")}</legend><div class="choices">${versions("best")}</div></fieldset>
      <fieldset><legend>${both("Et celle qui vous convainc le moins ?", "And the one that convinces you least?")}</legend><div class="choices">${versions("worst")}</div></fieldset>
      <fieldset><legend>${both("En quelques secondes, avez-vous compris qui je suis et ce que je cherche ?", "Within a few seconds, did you get who I am and what I'm looking for?")}</legend><div class="choices">
        ${choice("clear", "yes", "Oui", "Yes")}${choice("clear", "partly", "En partie", "Partly")}${choice("clear", "no", "Non", "No")}
      </div></fieldset>
      <fieldset><legend>${both("Pour un premier poste en cybersécurité, ce profil vous paraît…", "For a first cybersecurity role, this profile seems…")}</legend><div class="choices">
        ${choice("credible", "yes", "Convaincant", "Convincing")}${choice("credible", "almost", "À renforcer", "Needs work")}${choice("credible", "no", "Pas encore prêt", "Not ready yet")}
      </div></fieldset>
      <fieldset><label class="q" for="fb-hook">${both("Ce qui vous a accroché", "What caught your attention")}</label><textarea id="fb-hook" name="hook"></textarea></fieldset>
      <fieldset><label class="q" for="fb-brake">${both("Ce qui vous a freiné, ou ce qui manque", "What held you back, or what's missing")}</label><textarea id="fb-brake" name="brake"></textarea></fieldset>
      <fieldset><label class="q" for="fb-name">${both("Votre nom et votre entreprise (facultatif)", "Your name and company (optional)")}</label><input type="text" id="fb-name" name="who" autocomplete="name"></fieldset>
      <div class="fb__actions">
        <button class="btn btn--accent" type="button" data-send>${both("Préparer l'e-mail", "Prepare the email")}</button>
        <button class="btn" type="button" data-copy-answers>${both("Copier mes réponses", "Copy my answers")}</button>
      </div>
      <p class="fb__note">${both(
        `Si votre messagerie ne s'ouvre pas, copiez vos réponses et collez-les dans un e-mail à ${EMAIL}.`,
        `If your mail app doesn't open, copy your answers and paste them into an email to ${EMAIL}.`
      )}</p>
      <p class="fb__done" data-done hidden></p>
    </div>`;
  document.body.append(fb);

  const field = name => {
    const el = fb.querySelector(`[name="${name}"]:checked`) || fb.querySelector(`[name="${name}"]:not([type="radio"])`);
    return el ? el.value.trim() : "";
  };
  const versionLabel = n => n ? `${n} (${NAMES[n][0]})` : "non précisé";

  function summary() {
    const lines = [
      "Retour sur le CV en ligne",
      "",
      `Profil : ${ANSWERS.role[field("role")] || "non précisé"}`,
      `Version préférée : ${versionLabel(field("best"))}`,
      `Version la moins convaincante : ${versionLabel(field("worst"))}`,
      `Profil compris en quelques secondes : ${ANSWERS.clear[field("clear")] || "non précisé"}`,
      `Pour un premier poste cyber : ${ANSWERS.credible[field("credible")] || "non précisé"}`,
      "",
      "Ce qui a accroché :",
      field("hook") || "-",
      "",
      "Ce qui a freiné ou manque :",
      field("brake") || "-",
      "",
      `Versions parcourues : ${Array.from(seen).sort().join(", ") || ui}`,
      `Langue du site : ${lang() === "en" ? "anglais" : "français"}`,
      `Nom : ${field("who") || "non précisé"}`
    ];
    return lines.join("\n");
  }

  function done(fr, en) {
    const box = fb.querySelector("[data-done]");
    box.innerHTML = both(fr, en);
    box.hidden = false;
  }

  function openFeedback() {
    if (intro) { store.set("reviewIntro", "1"); intro.remove(); intro = null; }
    const best = fb.querySelector(`[name="best"][value="${ui}"]`);
    if (!fb.querySelector('[name="best"]:checked') && best) best.checked = true;
    fb.querySelector("[data-done]").hidden = true;
    fb.showModal();
  }

  bar.querySelector("[data-feedback]").addEventListener("click", openFeedback);
  document.querySelectorAll("[data-open-feedback]").forEach(el => el.addEventListener("click", openFeedback));
  fb.querySelector("[data-close]").addEventListener("click", () => fb.close());
  fb.addEventListener("click", e => { if (e.target === fb) fb.close(); });

  fb.querySelector("[data-send]").addEventListener("click", () => {
    const who = field("who");
    const subject = "Retour sur ton CV en ligne" + (who ? ` · ${who}` : "");
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary())}`;
    done("Votre messagerie devrait s'ouvrir avec vos réponses. Merci beaucoup !", "Your mail app should open with your answers. Thank you so much!");
  });

  fb.querySelector("[data-copy-answers]").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(summary());
      done(`Copié. Collez-le dans un e-mail à ${EMAIL}. Merci !`, `Copied. Paste it into an email to ${EMAIL}. Thank you!`);
    } catch (e) {
      done(`La copie a échoué. Vous pouvez m'écrire directement à ${EMAIL}.`, `Copy failed. You can email me directly at ${EMAIL}.`);
    }
  });

  document.addEventListener("langchange", () => {
    renderBar();
    fb.querySelector("[data-close]").setAttribute("aria-label", lang() === "en" ? "Close" : "Fermer");
  });
  renderBar();
})();
