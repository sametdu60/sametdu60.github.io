// Horloge de la barre d'état (interface 3).
(function () {
  "use strict";
  const clock = document.getElementById("soc-clock");
  if (!clock) return;
  const tick = () => {
    const now = new Date();
    clock.textContent = now.toTimeString().slice(0, 8);
    clock.dateTime = now.toISOString();
  };
  tick();
  setInterval(tick, 1000);
})();
