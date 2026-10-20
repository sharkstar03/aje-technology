(function () {
  "use strict";

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
      if (event.key === "Escape") {
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

  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length && "IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  var navLinks = Array.prototype.slice.call(document.querySelectorAll('#menu a[href^="#"]'));
  var sections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute("href")); })
    .filter(Boolean);
  if (sections.length && "IntersectionObserver" in window) {
    var currentObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          var on = link.getAttribute("href") === "#" + entry.target.id;
          if (on) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (section) { currentObserver.observe(section); });
  }

  var floatBtn = document.querySelector(".wa-float");
  var contact = document.getElementById("contacto");
  if (floatBtn && contact && "IntersectionObserver" in window) {
    var floatObserver = new IntersectionObserver(function (entries) {
      floatBtn.classList.toggle("is-hidden", entries[0].isIntersecting);
    }, { threshold: 0, rootMargin: "-72px 0px -20px 0px" });
    floatObserver.observe(contact);
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
        button.textContent = "Enviar mensaje";
      }, 8000);
    });
  }
})();
