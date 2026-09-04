/* Hinnad ja plaanid — filtering over invented stock.
   The DATA below is made up. The behaviour is real: every control filters,
   the count is computed, and the cards are rendered from the result. */

(function () {
  "use strict";

  var grid = document.querySelector("[data-grid]");
  if (!grid) return;

  var countEl   = document.querySelector("[data-count]");
  var form      = document.querySelector("[data-filters]");
  var otsiBtn   = form.querySelector("[data-otsi]");
  var resetBtn  = form.querySelector("[data-reset]");
  var EMPTY_MSG = "Tee valik, et näha vabasid pindasid";

  /* ---- invented stock -------------------------------------- */
  var ARI = { B: "Büroo", K: "Kaubandus/Teenindus" };

  var PINNAD = [
    { maja:"M3", korrus:1, ari:ARI.B, m2:103.0, tk:[15,20], hind:22, lisa:"Kõrged laed" },
    { maja:"M3", korrus:1, ari:ARI.K, m2:248.5, tk:[20,30], hind:26, lisa:"Tänavatasand" },
    { maja:"M3", korrus:2, ari:ARI.B, m2:186.0, tk:[24,32], hind:22, lisa:"Kõrged laed" },
    { maja:"M3", korrus:3, ari:ARI.B, m2:342.0, tk:[45,60], hind:21, lisa:"Avatud plaan" },
    { maja:"M4", korrus:1, ari:ARI.K, m2:164.0, tk:[12,18], hind:25, lisa:"Tänavatasand" },
    { maja:"M4", korrus:2, ari:ARI.B, m2:105.0, tk:[15,20], hind:22, lisa:"Kõrged laed" },
    { maja:"M4", korrus:2, ari:ARI.B, m2:229.0, tk:[28,38], hind:22, lisa:"Rõdu" },
    { maja:"M4", korrus:3, ari:ARI.B, m2:311.5, tk:[40,55], hind:21, lisa:"Avatud plaan" },
    { maja:"M5", korrus:1, ari:ARI.K, m2:132.0, tk:[8,14],  hind:27, lisa:"Tänavatasand" },
    { maja:"M5", korrus:2, ari:ARI.B, m2:106.0, tk:[15,20], hind:22, lisa:"Kõrged laed" },
    { maja:"M5", korrus:3, ari:ARI.B, m2:275.0, tk:[35,45], hind:22, lisa:"Katuseterrass" },
    { maja:"M5", korrus:4, ari:ARI.B, m2:389.0, tk:[50,65], hind:20, lisa:"Avatud plaan" },
    { maja:"M6", korrus:1, ari:ARI.K, m2:198.0, tk:[14,20], hind:26, lisa:"Tänavatasand" },
    { maja:"M6", korrus:2, ari:ARI.B, m2:107.0, tk:[15,20], hind:22, lisa:"Kõrged laed" },
    { maja:"M6", korrus:3, ari:ARI.B, m2:241.0, tk:[30,40], hind:22, lisa:"Rõdu" },
    { maja:"M6", korrus:4, ari:ARI.B, m2:158.5, tk:[20,26], hind:23, lisa:"Kõrged laed" },
    { maja:"M7", korrus:1, ari:ARI.K, m2:118.0, tk:[8,12],  hind:28, lisa:"Tänavatasand" },
    { maja:"M7", korrus:2, ari:ARI.B, m2:264.0, tk:[34,44], hind:22, lisa:"Avatud plaan" },
    { maja:"M7", korrus:3, ari:ARI.B, m2:108.0, tk:[15,20], hind:22, lisa:"Kõrged laed" },
    { maja:"M7", korrus:4, ari:ARI.B, m2:352.0, tk:[46,60], hind:21, lisa:"Katuseterrass" },
    { maja:"M7", korrus:5, ari:ARI.B, m2:295.0, tk:[38,50], hind:21, lisa:"Rõdu" },
    { maja:"M8", korrus:1, ari:ARI.K, m2:176.0, tk:[12,18], hind:26, lisa:"Tänavatasand" },
    { maja:"M8", korrus:2, ari:ARI.B, m2:213.0, tk:[26,36], hind:22, lisa:"Kõrged laed" },
    { maja:"M8", korrus:3, ari:ARI.B, m2:109.0, tk:[15,20], hind:22, lisa:"Kõrged laed" },
    { maja:"M8", korrus:4, ari:ARI.B, m2:328.0, tk:[42,56], hind:21, lisa:"Avatud plaan" },
    { maja:"M8", korrus:5, ari:ARI.B, m2:144.0, tk:[18,24], hind:23, lisa:"Rõdu" },
    { maja:"M8", korrus:6, ari:ARI.B, m2:367.0, tk:[48,62], hind:20, lisa:"Katuseterrass" }
  ];

  /* ---- current selection ----------------------------------- */
  var sel = { ari: [], suurus: null, tookohti: null, maja: null, korrus: null };

  function anySelection() {
    return sel.ari.length > 0 || sel.suurus || sel.tookohti || sel.maja || sel.korrus;
  }

  function matches(p) {
    if (sel.ari.length && sel.ari.indexOf(p.ari) === -1) return false;
    if (sel.suurus) {
      var r = sel.suurus.split("-");
      if (p.m2 < +r[0] || p.m2 >= +r[1]) return false;
    }
    if (sel.tookohti) {
      var t = sel.tookohti.split("-");
      if (p.tk[1] < +t[0] || p.tk[0] > +t[1]) return false;
    }
    if (sel.maja && p.maja !== sel.maja) return false;
    if (sel.korrus && p.korrus !== +sel.korrus) return false;
    return true;
  }

  /* ---- rendering ------------------------------------------- */
  var nf = function (n) { return n.toFixed(1).replace(".", ","); };

  function card(p) {
    return '' +
      '<article class="pind" tabindex="0">' +
        '<div class="pind__body">' +
          '<div class="pind__row"><span>' + p.maja + '</span><span>' + p.korrus + ' korrus</span></div>' +
          '<p class="pind__ari">' + p.ari + '</p>' +
          '<p class="pind__m2"><span class="pind__m2num">' + nf(p.m2) + '</span><span class="pind__unit">m<sup>2</sup></span></p>' +
          '<div class="pind__meta"><span>' + p.tk[0] + '-' + p.tk[1] + ' töökohta</span><span>' + p.lisa + '</span></div>' +
          '<p class="pind__hind">al ' + p.hind + '€/m<sup>2</sup></p>' +
        '</div>' +
        '<button class="nupp nupp--outline pind__btn" type="button">' +
          '<svg class="nupp__arrow" aria-hidden="true"><use href="#ic-nool"/></svg>Vaata plaani' +
        '</button>' +
      '</article>';
  }

  function plural(n) {
    // et: 1 sobiv pind / N sobivat pinda
    return n === 1 ? "1 sobiv pind" : n + " sobivat pinda";
  }

  function render() {
    var active = anySelection();

    /* Figma 1:33150 — once anything is picked, "Otsi" is replaced by
       "Tühjenda filtrid" in the same slot. */
    otsiBtn.hidden  = active;
    resetBtn.hidden = !active;

    countEl.classList.toggle("results__count--empty", !active);

    if (!active) {
      countEl.textContent = EMPTY_MSG;
      grid.innerHTML = "";
      announce(0);
      return;
    }
    var hits = PINNAD.filter(matches);
    countEl.textContent = hits.length
      ? plural(hits.length)
      : "Ühtegi sobivat pinda ei leitud";
    grid.innerHTML = hits.map(card).join("");
    announce(hits.length);
  }

  function announce(n) {
    document.dispatchEvent(new CustomEvent("pinnad:render", { detail: { hits: n } }));
  }

  /* ---- controls -------------------------------------------- */

  // Büroo / Kaubandus chips
  Array.prototype.forEach.call(form.querySelectorAll("[data-chip]"), function (b) {
    b.addEventListener("click", function () {
      var v = b.getAttribute("data-chip");
      var i = sel.ari.indexOf(v);
      if (i === -1) sel.ari.push(v); else sel.ari.splice(i, 1);
      b.classList.toggle("is-on", i === -1);
      b.setAttribute("aria-pressed", String(i === -1));
      render();
    });
  });

  function closeAll(except) {
    Array.prototype.forEach.call(form.querySelectorAll("[data-select]"), function (s) {
      if (s !== except) { s.classList.remove("is-open"); s.querySelector("[data-toggle]").setAttribute("aria-expanded", "false"); }
    });
  }

  Array.prototype.forEach.call(form.querySelectorAll("[data-select]"), function (s) {
    var key    = s.getAttribute("data-select");
    var toggle = s.querySelector("[data-toggle]");
    var label  = s.querySelector("[data-label]");
    var base   = label.innerHTML;
    label.setAttribute("data-base", base);

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = !s.classList.contains("is-open");
      closeAll(s);
      s.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });

    Array.prototype.forEach.call(s.querySelectorAll("[data-opt]"), function (o) {
      o.addEventListener("click", function () {
        var v = o.getAttribute("data-opt");
        if (sel[key] === v) { sel[key] = null; label.innerHTML = base; o.classList.remove("is-on"); }
        else {
          sel[key] = v || null;
          label.innerHTML = v ? o.innerHTML : base;
          Array.prototype.forEach.call(s.querySelectorAll("[data-opt]"), function (x) { x.classList.remove("is-on"); });
          if (v) o.classList.add("is-on");
        }
        s.classList.toggle("is-set", !!sel[key]);
        s.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        render();
      });
    });
  });

  document.addEventListener("click", function () { closeAll(null); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeAll(null); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    closeAll(null);
    render();
    if (anySelection()) {
      document.querySelector(".results").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  /* Tühjenda filtrid — clears every control and returns to the landing state */
  resetBtn.addEventListener("click", function () {
    sel = { ari: [], suurus: null, tookohti: null, maja: null, korrus: null };

    Array.prototype.forEach.call(form.querySelectorAll("[data-chip]"), function (b) {
      b.classList.remove("is-on");
      b.setAttribute("aria-pressed", "false");
    });

    Array.prototype.forEach.call(form.querySelectorAll("[data-select]"), function (s) {
      s.classList.remove("is-set", "is-open");
      var label = s.querySelector("[data-label]");
      label.innerHTML = label.getAttribute("data-base");
      s.querySelector("[data-toggle]").setAttribute("aria-expanded", "false");
      Array.prototype.forEach.call(s.querySelectorAll("[data-opt]"), function (x) { x.classList.remove("is-on"); });
    });

    render();
  });

  render();
})();
