/*
 * Tuile « rayons X » : un faisceau balaie la valise et révèle son contenu.
 * Au survol, le faisceau suit la souris. Quand il passe sur l'objet
 * suspect, le cadre rouge apparaît, comme sur un vrai poste d'inspection.
 */
(function () {
  "use strict";

  const svg = document.getElementById("xray");
  if (!svg) return;

  const windowRect = svg.getElementById("xr-window");
  const beam = svg.getElementById("xr-beam");
  const flag = svg.getElementById("xr-flag");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const WIDTH = 360;
  const FLAG_AT = 312;      // le faisceau a dépassé l'objet suspect
  const SWEEP = 3.4;        // secondes pour traverser la valise
  const HOLD = 2.2;         // secondes d'image complète avant de recommencer

  let pos = 0;
  let clock = 0;
  let manual = false;
  let running = false;
  let last = 0;

  function render() {
    windowRect.setAttribute("width", pos.toFixed(1));
    beam.setAttribute("x", (pos - 1.5).toFixed(1));
    beam.setAttribute("opacity", pos > 0 && pos < WIDTH ? "0.9" : "0");
    flag.setAttribute("opacity", pos >= FLAG_AT ? "1" : "0");
  }

  const ease = x => 1 - Math.pow(1 - x, 2);

  function frame(ts) {
    if (!running) return;
    const dt = Math.max(0, Math.min((ts - last) / 1000 || 0, 0.05));
    last = ts;
    if (!manual) {
      clock = (clock + dt) % (SWEEP + HOLD);
      pos = clock < SWEEP ? WIDTH * ease(clock / SWEEP) : WIDTH;
    }
    render();
    requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduceMotion.matches) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }
  function stop() { running = false; }

  svg.addEventListener("pointermove", e => {
    const box = svg.getBoundingClientRect();
    manual = true;
    pos = Math.max(0, Math.min(WIDTH, ((e.clientX - box.left) / box.width) * WIDTH));
    if (!running) render();
  });
  svg.addEventListener("pointerleave", () => {
    manual = false;
    clock = pos >= WIDTH ? SWEEP : SWEEP * (pos / WIDTH);
  });

  let inView = false;
  new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;
    if (inView) start(); else stop();
  }).observe(svg);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop(); else if (inView) start();
  });

  function still() { pos = WIDTH; render(); }
  reduceMotion.addEventListener("change", () => { if (reduceMotion.matches) { stop(); still(); } else start(); });

  if (reduceMotion.matches) still(); else { pos = 0; render(); }
})();
