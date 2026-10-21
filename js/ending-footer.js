(function () {
  "use strict";

  // フッターのマークアップはこのスクリプトより後ろに出力されるため、DOMの構築完了を待つ
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
  if (document.documentElement.classList.contains("no-cq")) return; // 古いブラウザは静的表示
  var footer = document.getElementById("js-service-next");
  if (!footer || !footer.classList.contains("ending")) return;
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  var face = document.getElementById("js-ending-face");
  var chars = gsap.utils.toArray(footer.querySelectorAll(".ending-char"));
  var bars = gsap.utils.toArray(footer.querySelectorAll(".js-ending-fade"));

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return; // 動きを減らす設定では、最初から全て表示しておく

  // 最初は何も見えていない状態
  gsap.set(face, { opacity: 0, y: 80, scale: 0.94, transformOrigin: "50% 100%" });
  gsap.set(chars, { opacity: 0, yPercent: -140 });
  gsap.set(bars, { opacity: 0 });

  var played = false;
  function play() {
    if (played) return;
    played = true;

    var tl = gsap.timeline();
    // 1. 顔が出てくる
    tl.to(face, { opacity: 1, y: 0, scale: 1, duration: 1.6, ease: "power3.out" });
    // 2. 「終わり」が1文字ずつ上から降りてくる
    tl.to(chars, {
      opacity: 1,
      yPercent: 0,
      duration: 1.1,
      ease: "bounce.out",
      stagger: 0.5
    }, "+=0.3");
    // 3. 最後にリンクと©がそっと現れる
    tl.to(bars, { opacity: 1, duration: 1.2, ease: "power1.out" }, "+=0.2");
  }

  // PC：フッターが画面の半分あたりまで見えたら、1度だけ再生する。
  // リロード／ブラウザバックで最下部から再開した場合も、この位置に来れば再生される
  // スマホ：フッターが縦いっぱいに(ほぼ全体が画面に)入るまでは再生しない。
  // 途中まで見えた状態で「終わり」が降りてくると、見た目が崩れて見えるため
  var isSP = window.matchMedia && window.matchMedia("(max-width: 767px)").matches;
  if (isSP && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && en.intersectionRatio >= 0.97) {
          io.disconnect();
          play();
        }
      });
    }, { threshold: [0.97, 1] });
    io.observe(footer);
  } else {
    ScrollTrigger.create({
      trigger: footer,
      start: "top 55%",
      once: true,
      onEnter: play
    });
  }
  }
})();
