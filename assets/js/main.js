(function () {
  "use strict";

  var root = document.documentElement;
  var hasIO = "IntersectionObserver" in window;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var saveData = navigator.connection && navigator.connection.saveData;
  var lowEnd = (navigator.hardwareConcurrency || 8) <= 4 && (navigator.deviceMemory || 8) <= 4;
  var fx = !reduce && !saveData && !lowEnd;
  var canHover = window.matchMedia("(hover: hover)").matches;
  var wideQuery = window.matchMedia("(min-width: 1000px)");

  if (!reduce) root.classList.add("motion");

  function clamp(n) { return n < 0 ? 0 : n > 1 ? 1 : n; }

  var year = document.getElementById("y");
  if (year) year.textContent = String(new Date().getFullYear());

  var header = document.querySelector("header");
  var toggle = document.querySelector(".menu-toggle");
  var menu = document.getElementById("menu");

  function setMenu(open) {
    if (!menu || !toggle) return;
    menu.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    document.body.classList.toggle("menu-open", open);
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      setMenu(!menu.classList.contains("is-open"));
    });
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menu.classList.contains("is-open")) {
        setMenu(false);
        toggle.focus();
      }
    });
    document.addEventListener("click", function (event) {
      if (!menu.classList.contains("is-open")) return;
      if (menu.contains(event.target) || toggle.contains(event.target)) return;
      setMenu(false);
    });
  }

  function syncScene() {
    var on = fx && wideQuery.matches && document.querySelector(".stage");
    root.classList.toggle("scene-on", Boolean(on));
  }

  syncScene();
  if (wideQuery.addEventListener) wideQuery.addEventListener("change", syncScene);

  // Apariciones escalonadas: cada elemento espera según su posición entre hermanos.
  var reveals = document.querySelectorAll(".reveal");
  reveals.forEach(function (el) {
    var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains("reveal"); });
    var index = siblings.indexOf(el);
    if (index > 0) el.style.setProperty("--d", Math.min(index, 6) * 90 + "ms");
  });
  if (!reduce && reveals.length && hasIO) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  var navLinks = Array.prototype.slice.call(document.querySelectorAll('#menu a[href^="#"]'));
  var sections = navLinks.map(function (link) {
    return document.querySelector(link.getAttribute("href"));
  }).filter(Boolean);
  if (sections.length && hasIO) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          if (link.getAttribute("href") === "#" + entry.target.id) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-40% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (section) { spy.observe(section); });
  }

  var floatBtn = document.querySelector(".wa-float");
  var contact = document.getElementById("contacto");
  if (floatBtn && contact && hasIO) {
    var fio = new IntersectionObserver(function (entries) {
      floatBtn.classList.toggle("is-hidden", entries[0].isIntersecting);
    }, { threshold: 0.15 });
    fio.observe(contact);
  }

  // "Así trabajamos": en escritorio la sección se fija y las tarjetas avanzan de lado al bajar.
  var pin = document.querySelector(".pin");
  var track = pin && pin.querySelector(".pin-track");
  var pinning = false;

  function layoutPin() {
    if (!pin || !track) return;
    pinning = fx && wideQuery.matches;
    root.classList.toggle("pinning", pinning);
    if (!pinning) return;
    var last = track.lastElementChild;
    var distance = Math.max(0, last.offsetLeft + last.offsetWidth + parseFloat(getComputedStyle(track).paddingRight) - track.clientWidth);
    pin.style.setProperty("--pin-x", distance);
    pin.style.setProperty("--pin-h", window.innerHeight + distance + "px");
  }

  if (track) {
    track.addEventListener("scroll", function () {
      if (pinning) return;
      var max = track.scrollWidth - track.clientWidth;
      pin.style.setProperty("--pin", max > 0 ? clamp(track.scrollLeft / max) : 0);
    }, { passive: true });
  }

  // Un solo cuadro por scroll actualiza encabezado, barra de progreso, parallax, fijado y línea del proceso.
  var hero = document.querySelector(".hero");
  var timeline = document.querySelector(".timeline");
  var ticking = false;

  function frame() {
    ticking = false;
    var y = window.scrollY;
    var vh = window.innerHeight;
    if (header) {
      var solidAt = header.classList.contains("on-dark") && hero ? hero.offsetHeight - 90 : 6;
      header.classList.toggle("is-scrolled", y > solidAt);
      header.classList.toggle("is-moved", y > 6);
    }
    var max = root.scrollHeight - vh;
    root.style.setProperty("--progress", max > 0 ? clamp(y / max).toFixed(4) : 0);
    if (reduce) return;
    if (hero) hero.style.setProperty("--sy", Math.min(y, hero.offsetHeight));
    if (timeline) {
      var t = timeline.getBoundingClientRect();
      timeline.style.setProperty("--draw", clamp((vh * 0.78 - t.top) / Math.max(t.height, vh * 0.35)).toFixed(3));
    }
    if (pinning) {
      var p = pin.getBoundingClientRect();
      var total = pin.offsetHeight - vh;
      pin.style.setProperty("--pin", total > 0 ? clamp(-p.top / total).toFixed(4) : 0);
    }
  }

  function requestFrame() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(frame);
  }

  var resizeTimer = 0;
  layoutPin();
  frame();
  window.addEventListener("scroll", requestFrame, { passive: true });
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () { layoutPin(); frame(); }, 150);
  });
  window.addEventListener("load", function () { layoutPin(); frame(); });

  // Red de partículas del hero: se pausa cuando no se ve o la pestaña está oculta.
  var canvas = document.querySelector(".net");
  if (canvas && hero && fx && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var width = 0;
    var height = 0;
    var nodes = [];
    var mouse = { x: -9999, y: -9999 };
    var running = false;
    var visible = true;
    var raf = 0;
    var LINK = 130;
    var MOUSE = 180;

    var sizeNet = function () {
      width = hero.clientWidth;
      height = hero.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.min(90, Math.round(width * height / 15000));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: Math.random() * 1.6 + 0.7,
          hot: Math.random() < 0.15
        });
      }
    };

    var draw = function () {
      ctx.clearRect(0, 0, width, height);
      var i, j, a, b, dx, dy, d;
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < 0 || a.x > width) a.vx *= -1;
        if (a.y < 0 || a.y > height) a.vy *= -1;
      }
      ctx.lineWidth = 1;
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        for (j = i + 1; j < nodes.length; j++) {
          b = nodes[j];
          dx = a.x - b.x;
          dy = a.y - b.y;
          d = dx * dx + dy * dy;
          if (d > LINK * LINK) continue;
          ctx.strokeStyle = "rgba(110,168,245," + (0.32 * (1 - Math.sqrt(d) / LINK)).toFixed(3) + ")";
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        dx = a.x - mouse.x;
        dy = a.y - mouse.y;
        d = Math.sqrt(dx * dx + dy * dy);
        if (d < MOUSE) {
          ctx.strokeStyle = "rgba(242,85,29," + (0.65 * (1 - d / MOUSE)).toFixed(3) + ")";
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
          a.x -= dx * 0.004;
          a.y -= dy * 0.004;
        }
      }
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        ctx.fillStyle = a.hot ? "#f2551d" : "rgba(255,255,255,.75)";
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.hot ? a.r + 0.8 : a.r, 0, 6.2832);
        ctx.fill();
      }
      if (running) raf = window.requestAnimationFrame(draw);
    };

    var syncNet = function () {
      var on = visible && !document.hidden;
      if (on === running) return;
      running = on;
      if (on) raf = window.requestAnimationFrame(draw);
      else window.cancelAnimationFrame(raf);
    };

    sizeNet();
    syncNet();
    if (hasIO) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        syncNet();
      }).observe(hero);
    }
    document.addEventListener("visibilitychange", syncNet);
    var netTimer = 0;
    window.addEventListener("resize", function () {
      window.clearTimeout(netTimer);
      netTimer = window.setTimeout(sizeNet, 200);
    });
    hero.addEventListener("pointermove", function (event) {
      var rect = hero.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    });
    hero.addEventListener("pointerleave", function () { mouse.x = mouse.y = -9999; });
  }

  // Antes y después: el rango invisible mueve la línea; al aparecer hace un barrido de muestra.
  document.querySelectorAll(".compare").forEach(function (box) {
    var range = box.querySelector(".cmp-range");
    if (!range) return;
    var touched = false;
    var setPos = function (value) { box.style.setProperty("--pos", value + "%"); };
    range.addEventListener("input", function () {
      touched = true;
      setPos(range.value);
    });
    if (reduce || !hasIO) return;
    var hint = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      hint.disconnect();
      var start = 0;
      var step = function (now) {
        if (touched) return;
        if (!start) start = now;
        var t = Math.min((now - start) / 2200, 1);
        var value = 50 + Math.sin(t * Math.PI * 2) * 28 * (1 - t);
        setPos(value.toFixed(1));
        range.value = Math.round(value);
        if (t < 1) window.requestAnimationFrame(step);
      };
      window.setTimeout(function () { window.requestAnimationFrame(step); }, 500);
    }, { threshold: 0.5 });
    hint.observe(box);
  });

  // Inclinación 3D y brillo que sigue al cursor (solo con mouse).
  if (fx && canHover) {
    document.querySelectorAll(".tilt").forEach(function (el) {
      el.addEventListener("pointermove", function (event) {
        var rect = el.getBoundingClientRect();
        var px = (event.clientX - rect.left) / rect.width;
        var py = (event.clientY - rect.top) / rect.height;
        el.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
        el.style.setProperty("--my", (py * 100).toFixed(1) + "%");
        el.style.setProperty("--ry", ((px - 0.5) * 10).toFixed(2) + "deg");
        el.style.setProperty("--rx", ((0.5 - py) * 10).toFixed(2) + "deg");
      });
      el.addEventListener("pointerleave", function () {
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
      });
    });

    document.querySelectorAll(".magnetic").forEach(function (el) {
      el.addEventListener("pointermove", function (event) {
        var rect = el.getBoundingClientRect();
        var x = (event.clientX - rect.left - rect.width / 2) * 0.25;
        var y = (event.clientY - rect.top - rect.height / 2) * 0.35;
        el.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
  }

  // Aviso de cookies: Analytics arranca denegado en el <head>; aquí se guarda y se aplica la elección.
  var CONSENT_KEY = "aje-consent";

  function readConsent() {
    try { return window.localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }

  function saveConsent(value) {
    try { window.localStorage.setItem(CONSENT_KEY, value); } catch (e) { /* sin almacenamiento: vale solo para esta página */ }
    if (typeof window.gtag === "function") window.gtag("consent", "update", { analytics_storage: value });
  }

  function showConsent() {
    if (document.querySelector(".consent")) return;
    var box = document.createElement("section");
    box.className = "consent";
    box.setAttribute("aria-label", "Aviso de cookies");
    box.innerHTML = '<p><b>Cookies de medición.</b> Usamos Google Analytics para saber cuántas personas visitan el sitio. No vendemos tus datos.</p>' +
      '<div class="consent-actions"><button class="btn btn-line" type="button" data-consent="denied">Rechazar</button>' +
      '<button class="btn btn-primary" type="button" data-consent="granted">Aceptar</button></div>';
    box.addEventListener("click", function (event) {
      var value = event.target.getAttribute("data-consent");
      if (!value) return;
      saveConsent(value);
      box.parentNode.removeChild(box);
    });
    document.body.appendChild(box);
  }

  if (!readConsent()) showConsent();
  var legal = document.querySelector(".legal");
  if (legal) {
    var prefs = document.createElement("button");
    prefs.type = "button";
    prefs.className = "cookie-link";
    prefs.textContent = "Preferencias de cookies";
    prefs.addEventListener("click", showConsent);
    legal.appendChild(prefs);
  }

  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function () {
      if (!form.checkValidity()) return;
      var button = form.querySelector('[type="submit"]');
      if (!button) return;
      button.disabled = true;
      button.textContent = "Enviando…";
      window.setTimeout(function () {
        button.disabled = false;
        button.textContent = "Pedir mapeo";
      }, 8000);
    });
  }
})();
