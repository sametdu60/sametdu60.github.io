/*
 * Mini-défi de la page d'accueil : six machines, une seule compromise.
 * Chaque graphe montre les connexions sortantes. Les machines saines ont une
 * activité humaine, irrégulière. La machine compromise contacte son serveur
 * à intervalle fixe (beaconing) : c'est ce rythme qui la trahit.
 */
(function () {
  "use strict";

  const game = document.getElementById("game");
  if (!game) return;

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const lang = () => root.dataset.lang === "en" ? "en" : "fr";

  const hosts = Array.from(game.querySelectorAll(".host"));
  const result = game.querySelector(".game__result");
  const resultTitle = result.querySelector("[data-result-title]");
  const resultText = result.querySelector("[data-result-text]");
  const resultScore = result.querySelector("[data-result-score]");
  const hintBox = game.querySelector(".hint");
  const hintBtn = game.querySelector("[data-hint]");
  const revealBtn = game.querySelector("[data-reveal]");
  const replayBtn = result.querySelector("[data-replay]");

  const BARS = 34;
  const TICK = 280;          // ms entre deux mesures
  const PERIOD = 7;          // la balise part toutes les 7 mesures, soit environ 2 s

  let infected = 0;
  let attempts = 0;
  let solved = false;
  let gaveUp = false;
  let timer = null;
  let colors = {};
  let states = [];

  function readColors() {
    const s = getComputedStyle(root);
    colors = { bar: s.getPropertyValue("--faint").trim(), line: s.getPropertyValue("--line").trim(), hot: s.getPropertyValue("--accent").trim() };
  }

  // Activité humaine : des silences, des rafales, jamais deux fois la même chose.
  function humanSample(st) {
    if (st.burst > 0) {
      st.burst -= 1;
      return 2 + Math.floor(Math.random() * 6);
    }
    if (Math.random() < 0.13) st.burst = 1 + Math.floor(Math.random() * 5);
    return Math.random() < 0.22 ? 1 : 0;
  }

  // Machine compromise : un peu d'activité normale, et une balise réglée comme une horloge.
  function beaconSample(st) {
    st.phase = (st.phase + 1) % PERIOD;
    if (st.phase === 0) return 4;
    if (st.burst > 0) { st.burst -= 1; return 1 + Math.floor(Math.random() * 2); }
    if (Math.random() < 0.05) st.burst = 1 + Math.floor(Math.random() * 2);
    return Math.random() < 0.12 ? 1 : 0;
  }

  function sample(i) {
    return i === infected ? beaconSample(states[i]) : humanSample(states[i]);
  }

  function setup() {
    infected = Math.floor(Math.random() * hosts.length);
    attempts = 0;
    solved = false;
    gaveUp = false;
    states = hosts.map(() => ({ burst: 0, phase: Math.floor(Math.random() * PERIOD), data: [] }));
    states.forEach((st, i) => { for (let k = 0; k < BARS; k++) st.data.push(sample(i)); });
    hosts.forEach(h => { h.classList.remove("is-clean", "is-found", "shake"); h.disabled = false; });
    hintBox.hidden = true;
    revealBtn.hidden = true;
    result.classList.remove("is-shown");
    result.setAttribute("aria-hidden", "true");
    drawAll();
  }

  function draw(i) {
    const canvas = hosts[i].querySelector("canvas");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const data = states[i].data;
    const gap = 2;
    const bw = (w - gap * (BARS - 1)) / BARS;
    const found = hosts[i].classList.contains("is-found");
    ctx.fillStyle = colors.line;
    ctx.fillRect(0, h - 1, w, 1);
    for (let k = 0; k < data.length; k++) {
      const v = data[k];
      if (!v) continue;
      const bh = Math.max(2, (v / 8) * (h - 2));
      ctx.fillStyle = found && v === 4 ? colors.hot : colors.bar;
      ctx.fillRect(k * (bw + gap), h - 1 - bh, bw, bh);
    }
  }

  function drawAll() { hosts.forEach((_, i) => draw(i)); }

  function tick() {
    states.forEach((st, i) => {
      const v = sample(i);
      st.data.push(v);
      st.data.shift();
      const led = hosts[i].querySelector(".host__led");
      led.classList.toggle("on", v > 0);
    });
    drawAll();
  }

  function running() { return timer !== null; }
  function start() { if (!running() && !reduceMotion.matches) timer = setInterval(tick, TICK); }
  function stop() { clearInterval(timer); timer = null; }

  const words = {
    fr: {
      clean: "Saine",
      found: "Trouvée",
      wellDone: "Bien vu.",
      answer: "La réponse :",
      score: n => n === 1 ? "Trouvée du premier coup" : `Trouvée en ${n} essais`,
      scoreGiveUp: "Pas évident au premier coup d'œil",
      text: name => `La machine « ${name} » contactait le même serveur toutes les deux secondes, réglé comme une horloge. Aucun humain ne travaille à ce rythme : c'est du beaconing, la façon dont un logiciel malveillant garde le contact avec son attaquant. Le repérer sans signature, à partir du seul comportement : c'est le cœur du projet sur lequel je travaille cette année.`
    },
    en: {
      clean: "Clean",
      found: "Found it",
      wellDone: "Nice catch.",
      answer: "The answer:",
      score: n => n === 1 ? "Found on the first try" : `Found in ${n} attempts`,
      scoreGiveUp: "Not obvious at first glance",
      text: name => `The "${name}" machine was calling the same server every two seconds, like clockwork. No human works at that pace: this is beaconing, how malware keeps in touch with its operator. Spotting it without signatures, from behaviour alone, is the core of the project I'm working on this year.`
    }
  };

  function hostName(i) {
    const el = hosts[i].querySelector(`.host__name [lang="${lang()}"]`);
    return el ? el.textContent.trim() : "";
  }

  function renderResult() {
    const w = words[lang()];
    resultTitle.textContent = gaveUp ? `${w.answer} ${hostName(infected)}.` : w.wellDone;
    resultScore.textContent = gaveUp ? w.scoreGiveUp : w.score(attempts);
    resultText.textContent = w.text(hostName(infected));
    hosts.forEach(h => {
      h.querySelector(".host__badge").textContent = h.classList.contains("is-found") ? w.found : w.clean;
    });
  }

  function showResult() {
    solved = true;
    hosts[infected].classList.add("is-found");
    draw(infected);
    renderResult();
    setTimeout(() => {
      result.classList.add("is-shown");
      result.setAttribute("aria-hidden", "false");
      result.querySelector("a, button").focus({ preventScroll: true });
    }, 900);
  }

  hosts.forEach((host, i) => {
    host.addEventListener("click", () => {
      if (solved) return;
      attempts += 1;
      if (i === infected) {
        showResult();
        return;
      }
      host.classList.add("is-clean");
      host.querySelector(".host__badge").textContent = words[lang()].clean;
      host.classList.remove("shake");
      void host.offsetWidth;
      host.classList.add("shake");
      if (attempts >= 2) hintBox.hidden = false;
      if (attempts >= 3) revealBtn.hidden = false;
    });
  });

  hintBtn.addEventListener("click", () => { hintBox.hidden = !hintBox.hidden; });
  revealBtn.addEventListener("click", () => { gaveUp = true; showResult(); });
  replayBtn.addEventListener("click", () => {
    setup();
    hosts[0].focus({ preventScroll: true });
  });

  document.addEventListener("langchange", () => { if (solved) renderResult(); });
  document.addEventListener("themechange", () => { readColors(); drawAll(); });
  window.addEventListener("resize", drawAll);

  // On ne fait tourner les graphes que lorsque le défi est visible.
  new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !document.hidden) start(); else stop();
  }).observe(game);
  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); else start(); });
  reduceMotion.addEventListener("change", () => { if (reduceMotion.matches) stop(); else start(); });

  readColors();
  setup();
})();
