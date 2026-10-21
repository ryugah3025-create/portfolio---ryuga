(function () {
  "use strict";
  var RETURN_KEY = "blogReturn";
  var paper = document.querySelector(".blog-paper");
  var hasGsap = typeof window.gsap !== "undefined";
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function readReturn() {
    try { return JSON.parse(window.sessionStorage.getItem(RETURN_KEY) || "null"); } catch (err) { return null; }
  }
  function writeReturn(value) {
    try { window.sessionStorage.setItem(RETURN_KEY, JSON.stringify(value)); } catch (err) { /* 保存できなくても動くようにする */ }
  }

  var saved = readReturn();
  if (saved && saved.opening) {
    writeReturn({ rect: saved.rect, scrollLeft: saved.scrollLeft, opening: false });
    if (paper && hasGsap && !reduceMotion) {
      window.gsap.fromTo(paper, { scale: 1.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: "power2.out" });
    }
  }
})();
