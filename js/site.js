(function () {
  "use strict";

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* stockage indisponible */ } }
  };
  const lang = () => root.dataset.lang === "en" ? "en" : "fr";
  const t = (fr, en) => lang() === "en" ? en : fr;

  /* Langue ------------------------------------------------------------- */
  function applyLang(next) {
    root.dataset.lang = next;
    root.lang = next;
    const title = root.dataset[next === "en" ? "titleEn" : "titleFr"];
    if (title) document.title = title;
    document.querySelectorAll("[data-label-fr]").forEach(el => {
      el.setAttribute("aria-label", next === "en" ? el.dataset.labelEn : el.dataset.labelFr);
    });
    store.set("lang", next);
    document.dispatchEvent(new CustomEvent("langchange", { detail: next }));
  }
  document.querySelectorAll("[data-toggle-lang]").forEach(btn => {
    btn.addEventListener("click", () => applyLang(lang() === "fr" ? "en" : "fr"));
  });
  applyLang(lang());

  /* Thème -------------------------------------------------------------- */
  const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const currentTheme = () => root.dataset.theme || (darkQuery.matches ? "dark" : "light");
  function themeChanged() {
    document.dispatchEvent(new CustomEvent("themechange", { detail: currentTheme() }));
  }
  document.querySelectorAll("[data-toggle-theme]").forEach(btn => {
    btn.addEventListener("click", () => {
      const next = currentTheme() === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      store.set("theme", next);
      themeChanged();
    });
  });
  darkQuery.addEventListener("change", () => { if (!root.dataset.theme) themeChanged(); });
  document.addEventListener("themechange", () => {
    if (window.labAnimation) window.labAnimation.refreshColors();
  });

  /* Apparition au défilement ------------------------------------------- */
  const revealables = document.querySelectorAll(".reveal, .meters, .bars, .chapter");
  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    revealables.forEach(el => io.observe(el));
  } else {
    revealables.forEach(el => el.classList.add("is-in"));
  }

  /* Copier l'adresse e-mail -------------------------------------------- */
  document.querySelectorAll("[data-copy]").forEach(btn => {
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.dataset.copied = t("Copié !", "Copied!");
        btn.classList.add("copied");
        setTimeout(() => btn.classList.remove("copied"), 1800);
      } catch (e) {
        window.location.href = "mailto:" + btn.dataset.copy;
      }
    });
  });

  /* Vidéo : la tuile porte la classe is-soon tant que le fichier n'est pas en ligne */
  const videoTile = document.getElementById("video-tile");
  const modal = document.getElementById("video-modal");
  if (videoTile && modal) {
    const video = modal.querySelector("video");
    if (videoTile.classList.contains("is-soon")) {
      videoTile.setAttribute("aria-disabled", "true");
    } else {
      videoTile.addEventListener("click", () => {
        if (!video.src) video.src = video.dataset.src;
        modal.showModal();
        video.play().catch(() => {});
      });
    }
    const close = () => { video.pause(); modal.close(); };
    modal.querySelector(".modal__close").addEventListener("click", close);
    modal.addEventListener("click", e => { if (e.target === modal) close(); });
    modal.addEventListener("close", () => video.pause());
  }

  /* Animation du lab (page détection) ---------------------------------- */
  const pauseBtn = document.getElementById("anim-toggle");
  const labState = document.getElementById("lab-state");
  if (pauseBtn && window.labAnimation) {
    let paused = store.get("paused") === "1";
    const render = () => {
      pauseBtn.innerHTML = paused
        ? '<span lang="fr">Lecture</span><span lang="en">Play</span>'
        : '<span lang="fr">Pause</span><span lang="en">Pause</span>';
      pauseBtn.setAttribute("aria-pressed", String(paused));
    };
    pauseBtn.addEventListener("click", () => {
      paused = !paused;
      store.set("paused", paused ? "1" : "0");
      window.labAnimation.setPaused(paused);
      render();
    });
    document.addEventListener("lab:state", e => {
      const live = e.detail.running || (!paused && !reduceMotion.matches);
      labState.classList.toggle("is-paused", !live);
      labState.textContent = live ? "live" : "paused";
    });
    window.labAnimation.setPaused(paused);
    pauseBtn.hidden = reduceMotion.matches;
    render();
  }

  /* Un mot pour ceux qui ouvrent la console ---------------------------- */
  const big = "font: 700 15px system-ui, sans-serif; color: #ea5a12;";
  const small = "font: 13px system-ui, sans-serif; color: inherit;";
  console.log(
    "%c" + t("Vous ouvrez la console. Bon réflexe.", "You opened the console. Good instinct.") +
    "\n%c" + t(
      "Ce site n'a ni cookie, ni traceur, ni dépendance externe : vous pouvez vérifier dans l'onglet Réseau.\nUn flag est caché quelque part dans le code source. Envoyez-le-moi, le café est pour moi.\n→ samet.bucak60@gmail.com",
      "This site has no cookies, no trackers and no external dependencies: check the Network tab.\nA flag is hidden somewhere in the source code. Send it to me and the coffee is on me.\n→ samet.bucak60@gmail.com"
    ),
    big, small
  );

  document.querySelectorAll("[data-print]").forEach(btn => {
    btn.addEventListener("click", () => {
      revealables.forEach(el => el.classList.add("is-in"));
      window.print();
    });
  });

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
