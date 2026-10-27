// Chargé dans le <head> sans defer : fixe la langue, le thème et l'habillage avant l'affichage.
(function () {
  // Trois points d'entrée : le CV en ligne (1), le CV classique (2) et le portfolio (4).
  // Les pages de détail reprennent l'habillage de celui d'où l'on vient.
  var HOMES = { "1": "index.html", "2": "cv.html", "4": "portfolio.html" };

  var root = document.documentElement;
  var read = function (key) { try { return localStorage.getItem(key); } catch (e) { return null; } };
  var write = function (key, value) { try { localStorage.setItem(key, value); } catch (e) { /* stockage indisponible */ } };

  var lang = read("lang") || ((navigator.language || "fr").toLowerCase().indexOf("fr") === 0 ? "fr" : "en");
  root.setAttribute("data-lang", lang === "en" ? "en" : "fr");
  root.setAttribute("lang", lang === "en" ? "en" : "fr");

  var theme = read("theme");
  if (theme === "dark" || theme === "light") root.setAttribute("data-theme", theme);

  var pageUi = root.getAttribute("data-ui");
  var ui = pageUi || read("ui") || "1";
  if (!HOMES[ui]) ui = "1";
  if (pageUi) write("ui", ui);
  root.setAttribute("data-ui", ui);
  root.classList.add("js");
  window.SITE = { homes: HOMES };
})();
