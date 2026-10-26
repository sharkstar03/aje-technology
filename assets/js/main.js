(function () {
  "use strict";

  var year = document.getElementById("y");
  if (year) year.textContent = String(new Date().getFullYear());

  var header = document.querySelector(".site-header");
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
      link.addEventListener("click", function () {
        setMenu(false);
      });
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
    var desktop = window.matchMedia("(min-width: 1100px)");
    if (desktop.addEventListener) {
      desktop.addEventListener("change", function (event) {
        if (event.matches) setMenu(false);
      });
    }
  }

  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var reveals = document.querySelectorAll(".reveal");
  if (!reduce && reveals.length && "IntersectionObserver" in window) {
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

  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  var sections = navLinks.map(function (link) {
    return document.querySelector(link.getAttribute("href"));
  }).filter(Boolean);
  if (sections.length && "IntersectionObserver" in window) {
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
  var dock = document.querySelector(".dock");
  var contact = document.getElementById("contacto");

  if (floatBtn && "IntersectionObserver" in window) {
    var floatZones = document.querySelectorAll("#contacto, footer");
    var floatHidden = new Set();
    var fio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) floatHidden.add(entry.target);
        else floatHidden.delete(entry.target);
      });
      floatBtn.classList.toggle("is-hidden", floatHidden.size > 0);
    }, { threshold: 0.08 });
    floatZones.forEach(function (el) { fio.observe(el); });
  }

  if (dock && contact && "IntersectionObserver" in window) {
    var dio = new IntersectionObserver(function (entries) {
      dock.classList.toggle("is-hidden", entries[0].isIntersecting);
    }, { threshold: 0.2 });
    dio.observe(contact);
  }

  if (header && contact && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      header.classList.toggle("cta-quiet", entries[0].isIntersecting);
    }, { threshold: 0.2 });
    cio.observe(contact);
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
