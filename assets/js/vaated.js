/* Map nav (Figma 4:3834) — the two tabs switch which map is shown.
   Asendiplaan is a static image. 3D vaade has building hovers:
   the building tints orange and a tooltip rises on a leader line. */

(function () {
  "use strict";

  /* ---- tabs ------------------------------------------------- */
  var tabs  = document.querySelectorAll("[data-tab]");
  var views = document.querySelectorAll("[data-view]");

  Array.prototype.forEach.call(tabs, function (tab) {
    tab.addEventListener("click", function () {
      var name = tab.getAttribute("data-tab");

      Array.prototype.forEach.call(tabs, function (t) {
        var on = t === tab;
        t.classList.toggle("is-active", on);
        if (on) t.setAttribute("aria-current", "page");
        else t.removeAttribute("aria-current");
      });

      Array.prototype.forEach.call(views, function (v) {
        v.hidden = v.getAttribute("data-view") !== name;
      });

      hideTip();
    });
  });

  /* ---- 3D building hover ------------------------------------ */
  var stage = document.querySelector("[data-stage3d]");
  if (!stage) return;

  var tip   = stage.querySelector("[data-tip]");
  var label = stage.querySelector("[data-tip-label]");
  var hots  = stage.querySelectorAll(".h3");
  var LEADER = 32;

  function showTip(g) {
    var maja   = g.getAttribute("data-maja");
    var anchor = g.getAttribute("data-anchor").split(",").map(Number);  // where the leader lands
    var r  = stage.getBoundingClientRect();
    var sx = r.width / 1440, sy = r.height / 720;

    label.textContent = maja;
    tip.hidden = false;

    // measure with the label in place, then sit the box above the anchor
    tip.style.visibility = "hidden";
    var w = tip.offsetWidth, h = tip.offsetHeight;
    tip.style.visibility = "";

    var left = anchor[0] * sx - w / 2;
    left = Math.max(8, Math.min(left, r.width - w - 8));
    var top = anchor[1] * sy - h;

    tip.style.left = left + "px";
    tip.style.top  = Math.max(8, top) + "px";
    tip.classList.add("is-on");

    Array.prototype.forEach.call(hots, function (h2) { h2.classList.toggle("is-on", h2 === g); });
  }

  function hideTip() {
    if (!tip) return;
    tip.classList.remove("is-on");
    Array.prototype.forEach.call(hots, function (h2) { h2.classList.remove("is-on"); });
  }

  Array.prototype.forEach.call(hots, function (g) {
    g.addEventListener("mouseenter", function () { showTip(g); });
    g.addEventListener("focus", function () { showTip(g); });
  });

  stage.addEventListener("mouseleave", hideTip);

  tip.addEventListener("transitionend", function (e) {
    if (e.propertyName === "opacity" && !tip.classList.contains("is-on")) tip.hidden = true;
  });
})();
