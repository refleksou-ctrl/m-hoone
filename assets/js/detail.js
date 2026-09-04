/* Detailvaade (Figma 1:61366) — the screen behind "Vaata plaani".
   Reads the same invented stock as the card grid, so the two can't
   disagree. The floor-plan image and the locator are still placeholders. */

(function () {
  "use strict";

  var list   = document.querySelector('[data-screen="list"]');
  var detail = document.querySelector('[data-screen="detail"]');
  if (!list || !detail) return;

  var set = function (sel, html) {
    var el = detail.querySelector(sel);
    if (el) el.innerHTML = html;
  };

  /* --- minimap ---------------------------------------------
     Orange = the building. The darker band = the space inside it.
     Real per-unit footprints aren't in the Figma file, so the band
     is drawn schematically: the building rect divided by floor, with
     the open unit's floor filled. Swap for real geometry when it exists. */
  var FLOORS = { M1:4, M2:4, M3:4, M4:2, M5:5, M6:5, M7:6, M8:7 };

  function paintMinimap(maja, korrus) {
    var svg = detail.querySelector(".minimap");
    if (!svg) return;

    var rects = svg.querySelectorAll("[data-mm]");
    var host = null;
    Array.prototype.forEach.call(rects, function (r) {
      var on = r.getAttribute("data-mm").indexOf(maja) === 0;   // M7a / M7b both match M7
      r.classList.toggle("is-on", on);
      if (on && (!host || +r.getAttribute("height") > +host.getAttribute("height"))) host = r;
    });

    var band = svg.querySelector("[data-mm-unit]");
    if (!band) return;
    if (!host) { band.setAttribute("width", 0); band.setAttribute("height", 0); return; }

    var x = parseFloat(host.getAttribute("x") || 0);
    var y = parseFloat(host.getAttribute("y") || 0);
    var w = parseFloat(host.getAttribute("width"));
    var h = parseFloat(host.getAttribute("height"));
    var n = FLOORS[maja] || 4;
    var i = Math.min(Math.max(korrus, 1), n) - 1;
    var bh = h / n;

    band.setAttribute("x", x);
    band.setAttribute("y", y + h - bh * (i + 1));   // floor 1 at the bottom
    band.setAttribute("width", w);
    band.setAttribute("height", bh);
  }

  /* --- floor plans -----------------------------------------
     One drawing per building per floor, keyed "<maja>-<korrus>", with a
     real outline per space on it. That is the shape real plans slot into:
     add a PNG, add its unit paths, done — nothing else changes.

     Right now only M3's 2nd floor has been drawn, so every space borrows
     it. See PLACEHOLDER below. */
  var PLACEHOLDER_IMG = { img: "assets/img/korruseplaan-M3.png" };

  var PLANS = {
    "M3-2": {
      img: "assets/img/korruseplaan-M3.png",
      units: {
        /* Figma 1:61506 "Vector 11" — the only outline that exists. */
        "M3-2.1": "M66 639V177H329V346.104H299.518V465.692H320.577V639H66Z"
      }
    }
  };

  /* --- floor layouts (INVENTED) ------------------------------
     Only M3-2.1 has a real outline. Every other space needs one anyway —
     a plan with nothing lit up reads as broken rather than unfinished.

     So each floor is cut into as many parts as it has spaces, along the
     building's own walls (x = 66 / 299.5 / 329 / 412 / 458.5 / 593,
     y = 177 / 346.1 / 465.7 / 639) and never through the stair core. The
     cut is chosen by comparing each layout's proportions with the floor's
     actual m2 proportions, so the parts sit in the right size order and
     never overlap each other. Areas below are what each part would be if
     the whole floor were 353.9 m2.

     What is NOT true: the building. An M8 space is drawn on M3's 2nd floor.
     Delete this table as real plans arrive. */
  var WHOLE_FLOOR = "M593 177L593 639L66 639L66 177ZM299.5 346.1L299.5 465.7L458.5 465.7L458.5 346.1Z";

  var LAYOUTS = [
    [ { m2: 186.0, d: "M329 177L329 346.1L299.5 346.1L299.5 465.7L329 465.7L329 639L66 639L66 177Z" },
      { m2: 167.9, d: "M593 639L329 639L329 465.7L458.5 465.7L458.5 346.1L329 346.1L329 177L593 177Z" } ],
    [ { m2: 230.8, d: "M412 177L412 346.1L299.5 346.1L299.5 465.7L412 465.7L412 639L66 639L66 177Z" },
      { m2: 123.1, d: "M593 639L412 639L412 465.7L458.5 465.7L458.5 346.1L412 346.1L412 177L593 177Z" } ],
    [ { m2: 255.9, d: "M458.5 177L458.5 346.1L299.5 346.1L299.5 465.7L458.5 465.7L458.5 639L66 639L66 177Z" },
      { m2: 98.0,  d: "M593 639L458.5 639L458.5 177L593 177Z" } ],
    [ { m2: 213.4, d: "M593 639L66 639L66 346.1L299.5 346.1L299.5 465.7L458.5 465.7L458.5 346.1L593 346.1Z" },
      { m2: 140.5, d: "M593 177L593 346.1L66 346.1L66 177Z" } ],
    [ { m2: 209.9, d: "M593 177L593 465.7L458.5 465.7L458.5 346.1L299.5 346.1L299.5 465.7L66 465.7L66 177Z" },
      { m2: 144.0, d: "M593 465.7L593 639L66 639L66 465.7Z" } ],
    [ { m2: 186.0, d: "M329 177L329 346.1L299.5 346.1L299.5 465.7L329 465.7L329 639L66 639L66 177Z" },
      { m2: 97.5,  d: "M458.5 465.7L458.5 346.1L593 346.1L593 639L329 639L329 465.7Z" },
      { m2: 70.4,  d: "M329 177L593 177L593 346.1L329 346.1Z" } ],
    [ { m2: 213.4, d: "M593 639L66 639L66 346.1L299.5 346.1L299.5 465.7L458.5 465.7L458.5 346.1L593 346.1Z" },
      { m2: 70.1,  d: "M329 177L329 346.1L66 346.1L66 177Z" },
      { m2: 70.4,  d: "M329 177L593 177L593 346.1L329 346.1Z" } ],
    [ { m2: 115.9, d: "M66 346.1L299.5 346.1L299.5 465.7L329 465.7L329 639L66 639Z" },
      { m2: 97.5,  d: "M458.5 465.7L458.5 346.1L593 346.1L593 639L329 639L329 465.7Z" },
      { m2: 70.4,  d: "M329 177L593 177L593 346.1L329 346.1Z" },
      { m2: 70.1,  d: "M329 177L329 346.1L66 346.1L66 177Z" } ]
  ];

  var byM2desc = function (a, b) { return b.m2 - a.m2; };

  /* every space on one floor, biggest first — the order the parts are handed out in */
  function floorSpaces(maja, korrus) {
    return (window.TK_PINNAD || []).filter(function (p) {
      return p.maja === maja && p.korrus === korrus;
    }).sort(byM2desc);
  }

  /* the layout whose proportions are closest to this floor's own */
  function layoutFor(spaces) {
    var total = 0, i;
    for (i = 0; i < spaces.length; i++) total += spaces[i].m2;

    var best = null, bestErr = Infinity;
    for (i = 0; i < LAYOUTS.length; i++) {
      var L = LAYOUTS[i];
      if (L.length !== spaces.length) continue;
      var lt = 0, j, err = 0;
      for (j = 0; j < L.length; j++) lt += L[j].m2;
      for (j = 0; j < L.length; j++) {
        var diff = (L[j].m2 / lt) - (spaces[j].m2 / total);
        err += diff * diff;
      }
      if (err < bestErr) { bestErr = err; best = L; }
    }
    return best;
  }

  function outlineFor(p) {
    var plan = PLANS[p.maja + "-" + p.korrus];
    if (plan && plan.units[p.kood]) return plan.units[p.kood];   /* real, from Figma */

    var spaces = floorSpaces(p.maja, p.korrus);
    var L = layoutFor(spaces);
    if (!L) return WHOLE_FLOOR;
    for (var i = 0; i < spaces.length; i++) {
      if (spaces[i].kood === p.kood) return L[i].d;
    }
    return WHOLE_FLOOR;
  }

  function paintPlan(p) {
    var img  = detail.querySelector(".plaan__img");
    var unit = detail.querySelector(".pu");
    if (!img || !unit) return;

    var plan = PLANS[p.maja + "-" + p.korrus];
    img.src = (plan || PLACEHOLDER_IMG).img || PLACEHOLDER_IMG.img;
    unit.setAttribute("d", outlineFor(p));
    unit.classList.add("is-on");
  }

  function open(kood) {
    var all = window.TK_PINNAD || [];
    var p = null;
    for (var i = 0; i < all.length; i++) { if (all[i].kood === kood) { p = all[i]; break; } }

    if (!p) return;

    var nf = window.TK_nf || function (n) { return String(n); };
    var m2 = nf(p.m2) + " m<sup>2</sup>";

    set("[data-d-korrus]", String(p.korrus));
    set("[data-d-suurus]", m2);
    set("[data-d-tookohti]", String(p.tk[1]));
    /* "Kaubandus/Teenindus" is one unbroken word to a browser, so it ran over
       the price cell beside it. A break opportunity after the slash lets it
       wrap where you'd read a break anyway. */
    set("[data-d-funktsioon]", p.ari.replace("/", "/<wbr>"));
    set("[data-d-hind]", "al " + p.hind + " eur/m<sup>2</sup>");
    set("[data-d-lisa]", p.lisa);
    set("[data-d-kood]", p.kood);
    set("[data-d-m2]", m2);
    paintMinimap(p.maja, p.korrus);

    paintPlan(p);

    list.hidden = true;
    detail.hidden = false;
    window.scrollTo({ top: 0, behavior: "auto" });
    var back = detail.querySelector("[data-tagasi]");
    if (back) back.focus();
  }

  function close() {
    detail.hidden = true;
    list.hidden = false;
  }

  /* cards are re-rendered on every filter change, so listen on the grid */
  var grid = document.querySelector("[data-grid]");
  if (grid) {
    grid.addEventListener("click", function (e) {
      var btn = e.target.closest ? e.target.closest("[data-vaata]") : null;
      if (btn) open(btn.getAttribute("data-vaata"));
    });
  }

  var back = detail.querySelector("[data-tagasi]");
  if (back) back.addEventListener("click", close);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !detail.hidden) close();
  });
})();
