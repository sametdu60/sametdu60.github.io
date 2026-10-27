// Interface 4 : met en évidence le chapitre en cours dans la navigation latérale.
(function () {
  "use strict";
  const nav = document.querySelector(".progress");
  if (!nav || !("IntersectionObserver" in window)) return;
  const links = new Map(Array.from(nav.querySelectorAll("a")).map(a => [a.dataset.ch, a]));
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(a => a.classList.remove("is-active"));
      const link = links.get(entry.target.id);
      if (link) {
        link.classList.add("is-active");
        link.setAttribute("aria-current", "step");
      }
      links.forEach(a => { if (a !== link) a.removeAttribute("aria-current"); });
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  links.forEach((_, id) => { const el = document.getElementById(id); if (el) io.observe(el); });
})();
