/* Telliskivi M-hoone — prototype interactions.
   Vanilla, no dependencies. Loaded on every page. */

(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- open menu (dropdown, Figma 1:399) --------------------- */
  var burger = document.querySelector("[data-burger]");
  var nav = document.querySelector("[data-nav]");

  function setNav(open) {
    if (!nav || !burger) return;
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
  }

  if (burger && nav) {
    burger.addEventListener("click", function (e) {
      e.stopPropagation();
      setNav(!nav.classList.contains("is-open"));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") setNav(false);
    });
    document.addEventListener("click", function (e) {
      if (!nav.contains(e.target) && !burger.contains(e.target)) setNav(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setNav(false);
    });
  }

  /* Ticker speed is now fixed in CSS — the strip is an image of known
     width, so it no longer depends on how the font renders. */

  /* --- count-up on the stat numbers -------------------------- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count-to"));
    if (isNaN(target)) return;
    var suffix = el.getAttribute("data-count-suffix") || "";
    var dur = 1100;
    var start = null;

    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = "0" + suffix;
    requestAnimationFrame(step);
  }

  /* --- scroll reveal ----------------------------------------- */
  var reveals = document.querySelectorAll("[data-reveal]");

  function show(el) {
    el.classList.add("is-visible");
    var num = el.querySelector("[data-count-to]");
    if (num && !reduce) countUp(num);
    if (el.hasAttribute("data-count-to") && !reduce) countUp(el);
  }

  if (!("IntersectionObserver" in window) || reduce) {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = parseInt(el.getAttribute("data-reveal-delay") || "0", 10);
        setTimeout(function () { show(el); }, delay);
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });

    Array.prototype.forEach.call(reveals, function (el) { io.observe(el); });
  }

  /* --- hero video: poster first, file only when it's worth it -----
     preload="none" means nothing downloads on page load. The source is
     attached once the element is near the viewport, so a client on a
     phone sees the designed frame instantly and the 17MB only follows
     if they actually stay. */
  Array.prototype.forEach.call(document.querySelectorAll("[data-lazy-video]"), function (v) {
    var start = function () {
      if (v.dataset.started) return;
      v.dataset.started = "1";
      v.src = v.getAttribute("data-src");
      v.load();
      var go = v.play();
      if (go && go.catch) go.catch(function () { /* autoplay refused — poster stands in */ });
      v.addEventListener("playing", function () { v.classList.add("is-playing"); }, { once: true });
    };

    if (reduce) return;                      // reduced motion: poster only

    if (!("IntersectionObserver" in window)) { start(); return; }
    var vo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { start(); vo.unobserve(e.target); } });
    }, { rootMargin: "200px" });
    vo.observe(v);

    // pause once it's well out of view so it isn't decoding for nothing
    var po = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!v.dataset.started) return;
        if (e.isIntersecting) { v.play().catch(function(){}); } else { v.pause(); }
      });
    }, { threshold: 0 });
    po.observe(v);
  });

  /* --- flag images that haven't been exported yet ------------
     Marks the placeholder so it's obvious which file is missing.
     Does nothing once the real image is in assets/img/. */
  Array.prototype.forEach.call(document.querySelectorAll(".asset img"), function (img) {
    var mark = function () { if (img.parentNode) img.parentNode.classList.add("is-missing"); };
    if (img.complete && img.naturalWidth === 0) mark();
    img.addEventListener("error", mark);
  });

  /* --- prototype forms: look real, send nothing --------------- */
  Array.prototype.forEach.call(document.querySelectorAll("form[data-fake-submit]"), function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector("[type=submit]");
      var msg = form.querySelector("[data-form-message]");
      if (btn) btn.disabled = true;
      setTimeout(function () {
        if (msg) msg.hidden = false;
        form.reset();
        if (btn) btn.disabled = false;
      }, 650);
    });
  });

})();
