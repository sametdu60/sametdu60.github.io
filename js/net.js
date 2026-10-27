/*
 * Animation du lab : un firewall au centre, des zones autour, des paquets
 * qui circulent entre elles. De temps en temps, un poste compromis sonde les
 * serveurs puis touche le leurre, ce qui lève une alerte dans le journal.
 */
(function () {
  "use strict";

  const canvas = document.getElementById("net");
  const logEl = document.getElementById("net-log");
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Coordonnées normalisées (0..1), recalculées en pixels à chaque rendu.
  const zones = [
    { id: "dmz", label: "DMZ", x: 0.04, y: 0.29, w: 0.27, h: 0.25 },
    { id: "site", label: "BRANCH · VPN", x: 0.69, y: 0.29, w: 0.27, h: 0.25 },
    { id: "lan", label: "LAN", x: 0.04, y: 0.66, w: 0.43, h: 0.28 },
    { id: "srv", label: "SERVERS", x: 0.53, y: 0.66, w: 0.43, h: 0.28 }
  ];

  const nodes = {
    wan:   { x: 0.50, y: 0.09, label: "internet", ip: "203.0.113.24", kind: "cloud" },
    fw:    { x: 0.50, y: 0.42, label: "fw-01", ip: "10.0.0.1", kind: "fw" },
    web:   { x: 0.175, y: 0.43, label: "web-01", ip: "172.16.0.10", kind: "srv" },
    agc:   { x: 0.825, y: 0.43, label: "pc-a1", ip: "10.40.0.11", kind: "host", tunnel: true },
    swL:   { x: 0.255, y: 0.70, kind: "sw" },
    swS:   { x: 0.745, y: 0.70, kind: "sw" },
    pc1:   { x: 0.12, y: 0.82, label: "pc-01", ip: "10.20.0.11", kind: "host", sw: "swL" },
    pc2:   { x: 0.255, y: 0.82, label: "pc-02", ip: "10.20.0.12", kind: "host", sw: "swL" },
    pc3:   { x: 0.39, y: 0.82, label: "pc-03", ip: "10.20.0.13", kind: "host", sw: "swL" },
    ad:    { x: 0.61, y: 0.82, label: "ad-01", ip: "10.30.0.5", kind: "srv", sw: "swS" },
    files: { x: 0.745, y: 0.82, label: "fs-01", ip: "10.30.0.8", kind: "srv", sw: "swS" },
    decoy: { x: 0.88, y: 0.82, label: "bak-02", ip: "10.30.0.13", kind: "srv", sw: "swS" }
  };

  // Flux légitimes : source, destination, port, protocole.
  // Le leurre n'apparaît dans aucun d'eux : personne n'a de raison de le contacter.
  const flows = [
    ["pc1", "files", 445, "smb"], ["pc3", "files", 445, "smb"],
    ["pc1", "ad", 88, "kerberos"], ["pc2", "ad", 389, "ldap"], ["pc3", "ad", 88, "kerberos"],
    ["pc1", "wan", 443, "tls"], ["pc2", "wan", 443, "tls"], ["pc3", "wan", 443, "tls"],
    ["wan", "web", 443, "tls"], ["wan", "web", 443, "tls"],
    ["agc", "files", 445, "smb"], ["agc", "ad", 88, "kerberos"]
  ];

  const ja4 = [
    "t13d1516h2_8daaf6152771_02713d6af862",
    "t13d1517h2_8daaf6152771_b0da82dd1658",
    "t12d1209h2_d34a8e72043a_b39be8c56a14"
  ];

  let colors = {};
  let size = { w: 0, h: 0, dpr: 1 };
  let packets = [];
  let pulses = [];
  let running = false;
  let paused = false;
  let visible = true;
  let last = 0;
  let spawnClock = 0;
  let logClock = 0;
  let attackClock = 4;
  let attack = null;
  let compromisedUntil = 0;
  let decoyHotUntil = 0;
  let now = 0;

  function readColors() {
    const s = getComputedStyle(document.documentElement);
    const v = name => s.getPropertyValue(name).trim();
    colors = {
      line: v("--line"), text: v("--text"), muted: v("--muted"), faint: v("--faint"),
      accent: v("--accent"), cool: v("--blue"), surface: v("--card"), ok: v("--green")
    };
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    size.dpr = Math.min(window.devicePixelRatio || 1, 2);
    size.w = rect.width;
    size.h = rect.height;
    canvas.width = Math.round(rect.width * size.dpr);
    canvas.height = Math.round(rect.height * size.dpr);
    ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0);
    draw();
  }

  const px = n => ({ x: n.x * size.w, y: n.y * size.h });

  function route(src, dst) {
    const path = [src];
    if (nodes[src].sw) path.push(nodes[src].sw);
    path.push("fw");
    if (nodes[dst].sw) path.push(nodes[dst].sw);
    path.push(dst);
    return path.map(id => nodes[id]);
  }

  function pathLength(points) {
    let len = 0;
    for (let i = 1; i < points.length; i++) {
      len += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    }
    return len;
  }

  function pointAt(points, t) {
    const total = pathLength(points);
    let target = t * total;
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1], b = points[i];
      const seg = Math.hypot(b.x - a.x, b.y - a.y);
      if (target <= seg) {
        const k = seg === 0 ? 0 : target / seg;
        return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
      }
      target -= seg;
    }
    return points[points.length - 1];
  }

  function send(src, dst, opts) {
    packets.push({
      nodes: route(src, dst),
      t: 0,
      speed: (opts && opts.speed) || 0.45 + Math.random() * 0.25,
      hostile: !!(opts && opts.hostile),
      onArrive: opts && opts.onArrive
    });
  }

  function clock() {
    const d = new Date();
    return d.toTimeString().slice(0, 8);
  }

  function log(text, alert) {
    if (!logEl) return;
    const li = document.createElement("li");
    if (alert) li.className = "alert";
    const t = document.createElement("span");
    t.className = "t";
    t.textContent = clock();
    li.append(t, document.createTextNode(text));
    logEl.append(li);
    while (logEl.children.length > 5) logEl.firstElementChild.remove();
  }

  function logFlow() {
    const f = flows[Math.floor(Math.random() * flows.length)];
    const s = nodes[f[0]], d = nodes[f[1]];
    let line = `flow ${s.ip} → ${d.ip}:${f[2]} ${f[3]}`;
    if (f[3] === "tls") line += ` ja4=${ja4[Math.floor(Math.random() * ja4.length)]}`;
    if (f[0] === "agc") line += " via ipsec";
    log(line);
  }

  function startAttack() {
    // pc-02 sonde lentement les serveurs, le dernier contact tombe sur le leurre.
    attack = { step: 0, clock: 0, targets: [["ad", 135], ["files", 22], ["decoy", 445]] };
  }

  function stepAttack(dt) {
    if (!attack) return;
    attack.clock -= dt;
    if (attack.clock > 0) return;
    const [target, port] = attack.targets[attack.step];
    const isDecoy = target === "decoy";
    send("pc2", target, {
      speed: 0.32,
      hostile: true,
      onArrive: () => {
        if (!isDecoy) {
          log(`flow ${nodes.pc2.ip} → ${nodes[target].ip}:${port} syn`);
          return;
        }
        decoyHotUntil = now + 3.2;
        compromisedUntil = now + 4.5;
        pulses.push({ node: nodes.decoy, t: 0 }, { node: nodes.decoy, t: -0.35 });
        log(`ALERT decoy ${nodes.decoy.label} touched · src ${nodes.pc2.ip} · smb`, true);
        log(`score pc-02 → 87/100 · T1021.002 lateral movement`, true);
      }
    });
    attack.step += 1;
    attack.clock = 1.1;
    if (attack.step >= attack.targets.length) attack = null;
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawLink(a, b, dashed) {
    const p = px(a), q = px(b);
    ctx.beginPath();
    ctx.setLineDash(dashed ? [4, 4] : []);
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(q.x, q.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function draw() {
    const { w, h } = size;
    if (!w || !h) return;
    ctx.clearRect(0, 0, w, h);
    const small = w < 420;
    const fontSize = small ? 9 : 10.5;
    const mono = getComputedStyle(document.body).getPropertyValue("--mono") || "monospace";

    // Zones
    ctx.lineWidth = 1;
    ctx.font = `${fontSize}px ${mono}`;
    ctx.textBaseline = "top";
    for (const z of zones) {
      ctx.strokeStyle = colors.line;
      roundRect(z.x * w, z.y * h, z.w * w, z.h * h, 6);
      ctx.stroke();
      ctx.fillStyle = colors.faint;
      ctx.fillText(z.label, z.x * w + 8, z.y * h + 7);
    }

    // Liens
    ctx.strokeStyle = colors.line;
    ctx.lineWidth = 1.2;
    drawLink(nodes.wan, nodes.fw);
    drawLink(nodes.web, nodes.fw);
    drawLink(nodes.agc, nodes.fw, true);
    drawLink(nodes.swL, nodes.fw);
    drawLink(nodes.swS, nodes.fw);
    for (const id of ["pc1", "pc2", "pc3"]) drawLink(nodes[id], nodes.swL);
    for (const id of ["ad", "files", "decoy"]) drawLink(nodes[id], nodes.swS);

    // Ondes autour du leurre
    for (const p of pulses) {
      if (p.t <= 0) continue;
      const c = px(p.node);
      ctx.beginPath();
      ctx.strokeStyle = colors.accent;
      ctx.globalAlpha = Math.max(0, 1 - p.t);
      ctx.lineWidth = 1.5;
      ctx.arc(c.x, c.y, 6 + p.t * 34, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Paquets
    for (const pk of packets) {
      const pts = pk.nodes.map(px);
      const p = pointAt(pts, pk.t);
      ctx.beginPath();
      ctx.fillStyle = pk.hostile ? colors.accent : colors.cool;
      ctx.arc(p.x, p.y, pk.hostile ? 2.8 : 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Nœuds
    ctx.textAlign = "center";
    for (const id in nodes) {
      const n = nodes[id];
      const c = px(n);
      if (n.kind === "sw") {
        ctx.fillStyle = colors.line;
        ctx.fillRect(c.x - 3, c.y - 3, 6, 6);
        continue;
      }
      let stroke = colors.muted;
      if (id === "decoy" && now < decoyHotUntil) stroke = colors.accent;
      if (id === "pc2" && now < compromisedUntil) stroke = colors.accent;
      if (n.kind === "fw") stroke = colors.text;

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = stroke;
      ctx.fillStyle = colors.surface;
      if (n.kind === "srv" || n.kind === "fw") {
        const s = n.kind === "fw" ? 8 : 6;
        ctx.fillRect(c.x - s, c.y - s, s * 2, s * 2);
        ctx.strokeRect(c.x - s, c.y - s, s * 2, s * 2);
      } else {
        ctx.beginPath();
        ctx.arc(c.x, c.y, n.kind === "cloud" ? 7 : 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = stroke === colors.accent ? colors.accent : colors.muted;
      ctx.fillText(n.label, c.x, c.y + (n.kind === "fw" ? 13 : 11));
    }
    ctx.textAlign = "start";
  }

  function update(dt) {
    now += dt;

    spawnClock -= dt;
    if (spawnClock <= 0) {
      const f = flows[Math.floor(Math.random() * flows.length)];
      send(f[0], f[1]);
      spawnClock = 0.28 + Math.random() * 0.35;
    }

    logClock -= dt;
    if (logClock <= 0) {
      logFlow();
      logClock = 1.3 + Math.random() * 1.2;
    }

    attackClock -= dt;
    if (attackClock <= 0 && !attack) {
      startAttack();
      attackClock = 11 + Math.random() * 4;
    }
    stepAttack(dt);

    for (const pk of packets) {
      const len = pathLength(pk.nodes.map(px)) || 1;
      pk.t += (pk.speed * dt * Math.min(size.w, 560)) / len;
      if (pk.t >= 1 && pk.onArrive) { pk.onArrive(); pk.onArrive = null; }
    }
    packets = packets.filter(pk => pk.t < 1);

    for (const p of pulses) p.t += dt * 0.7;
    pulses = pulses.filter(p => p.t < 1);
  }

  function frame(ts) {
    if (!running) return;
    const dt = Math.max(0, Math.min((ts - last) / 1000 || 0, 0.05));
    last = ts;
    update(dt);
    draw();
    requestAnimationFrame(frame);
  }

  function shouldRun() {
    return !paused && visible && !document.hidden && !reduceMotion.matches;
  }

  function sync() {
    const run = shouldRun();
    if (run && !running) {
      running = true;
      last = performance.now();
      requestAnimationFrame(frame);
    } else if (!run) {
      running = false;
    }
    document.dispatchEvent(new CustomEvent("lab:state", { detail: { running: run } }));
  }

  function staticScene() {
    // Image fixe pour les visiteurs qui ont demandé moins d'animations.
    now = 1;
    decoyHotUntil = 2;
    compromisedUntil = 2;
    pulses = [{ node: nodes.decoy, t: 0.35 }];
    packets = [];
    if (logEl) logEl.textContent = "";
    log(`flow ${nodes.pc1.ip} → ${nodes.files.ip}:445 smb`);
    log(`flow ${nodes.agc.ip} → ${nodes.ad.ip}:88 kerberos via ipsec`);
    log(`ALERT decoy ${nodes.decoy.label} touched · src ${nodes.pc2.ip} · smb`, true);
    draw();
  }

  window.labAnimation = {
    setPaused(value) { paused = value; sync(); },
    refreshColors() { readColors(); draw(); }
  };

  readColors();
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    sync();
  }).observe(canvas);
  document.addEventListener("visibilitychange", sync);
  reduceMotion.addEventListener("change", () => { if (reduceMotion.matches) staticScene(); sync(); });

  if (reduceMotion.matches) staticScene();
  else for (let i = 0; i < 4; i++) logFlow();
  sync();
})();
