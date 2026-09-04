/* Map nav (Figma 4:3834) — the two tabs switch which map is shown.
   The plan itself is a static image; the building hover was removed
   on 2026-09-04 at the designer's request. */

(function () {
  "use strict";

  var tabs  = document.querySelectorAll("[data-tab]");
  var views = document.querySelectorAll("[data-view]");
  if (!tabs.length || !views.length) return;

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
    });
  });
})();
