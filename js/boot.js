// Chargé dans le <head> sans defer : fixe la langue, le thème et l'interface avant l'affichage.
(function () {
  // Phase de test auprès des recruteurs : affiche le sélecteur d'interface et le formulaire de retour.
  // Passer à false une fois la version définitive choisie, et mettre son numéro dans DEFAULT_UI.
  var REVIEW = true;
  var DEFAULT_UI = "1";
  var HOMES = { "1": "index.html", "2": "v2.html", "3": "v3.html", "4": "v4.html", "5": "v5.html" };

  var root = document.documentElement;
  var read = function (key) { try { return localStorage.getItem(key); } catch (e) { return null; } };
  var write = function (key, value) { try { localStorage.setItem(key, value); } catch (e) { /* stockage indisponible */ } };

  var lang = read("lang") || ((navigator.language || "fr").toLowerCase().indexOf("fr") === 0 ? "fr" : "en");
  root.setAttribute("data-lang", lang === "en" ? "en" : "fr");
  root.setAttribute("lang", lang === "en" ? "en" : "fr");

  var theme = read("theme");
  if (theme === "dark" || theme === "light") root.setAttribute("data-theme", theme);

  // Interface : celle de la page d'accueil visitée, sinon ?ui=N, sinon la dernière choisie.
  var pageUi = root.getAttribute("data-ui");
  var match = /[?&]ui=([1-5])/.exec(location.search);
  var ui = pageUi || DEFAULT_UI;
  if (REVIEW) {
    if (pageUi === "1" && match && match[1] !== "1") {
      location.replace(HOMES[match[1]]);
      return;
    }
    ui = pageUi || (match && match[1]) || read("ui") || DEFAULT_UI;
    write("ui", ui);
    root.setAttribute("data-review", "on");
  }
  root.setAttribute("data-ui", ui);
  root.classList.add("js");
  window.SITE = { review: REVIEW, homes: HOMES };
})();
