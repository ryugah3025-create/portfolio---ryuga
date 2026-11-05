(function () {
  "use strict";

  // FVのあとセクション1：スクロールして画面に入ったら（IntersectionObserver）、上から順番に表示する。
  //  「こんな課題ありませんか？」＋大きな「？」→「？」が薄くなる → 採用 → 補足 → 集客 → 補足 → 信用 → 補足 →「その課題解決できます！」
  // data-problem-step が同じ要素は一緒に出す（各行の下線は、補足と一緒に左から右へ引く）。
  // 下の要素が先に画面に入っても（速いスクロールや途中からの再読み込み）、上の要素を飛ばさず、上から順に出していく。
  // JSが無い・IntersectionObserverが使えない・動きを減らす設定の場合は、最初から全て表示しておく
  var section = document.getElementById("js-problem");
  if (!section || !window.gsap || !("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var FADE = 0.8; // 文字がフェードインする時間(秒)
  var DRAW = 1.0; // 下線が引かれる時間(秒)
  var MARK_IN = 0.9; // 大きな「？」が出る時間(秒)
  var MARK_HOLD = 0.6; // 大きな「？」を濃いまま見せる時間(秒)
  var MARK_FADE = 0.9; // 大きな「？」が薄くなる時間(秒)
  var MARK_FADED = 0.16; // 薄くなったあとの濃さ（デザインの16%）
  var STEP_GAP = 0.15; // 1つ出きってから、次を出し始めるまで

  // data-problem-step ごとにまとめる（[[要素, 要素], [要素], ...]）
  var steps = [];
  Array.prototype.forEach.call(section.querySelectorAll("[data-problem-step]"), function (el) {
    var n = Number(el.getAttribute("data-problem-step"));
    (steps[n] = steps[n] || []).push(el);
  });
  steps = steps.filter(Boolean);

  var lines = Array.prototype.slice.call(section.querySelectorAll(".problem-line"));
  var bigmark = section.querySelector(".problem-bigmark");
  var texts = Array.prototype.slice.call(section.querySelectorAll("[data-problem-step]:not(.problem-line):not(.problem-bigmark)"));
  gsap.set(texts, { autoAlpha: 0, y: 24 });
  gsap.set(lines, { scaleX: 0 });
  if (bigmark) gsap.set(bigmark, { autoAlpha: 0, scale: 0.6 });

  // 順番待ちの列。文字が画面に入るたびに、そこまでの段階を末尾に足して再生する
  var queue = gsap.timeline({ paused: true });
  var queued = 0;

  function stepTimeline(els) {
    var tl = gsap.timeline();
    els.forEach(function (el) {
      if (el.classList.contains("problem-line")) {
        tl.to(el, { scaleX: 1, duration: DRAW, ease: "power3.inOut" }, 0);
      } else if (el === bigmark) {
        // 大きな「？」がドンと濃く出て、少し見せてから薄くなる。薄くなりきってから、次（採用）に進む
        tl.to(el, { autoAlpha: 1, scale: 1, duration: MARK_IN, ease: "back.out(1.6)" }, 0);
        tl.to(el, { opacity: MARK_FADED, duration: MARK_FADE, ease: "power2.inOut" }, MARK_IN + MARK_HOLD);
      } else {
        tl.to(el, { autoAlpha: 1, y: 0, duration: FADE, ease: "power2.out" }, 0);
      }
    });
    return tl;
  }

  function enqueueUpTo(index) {
    for (; queued <= index; queued++) {
      queue.add(stepTimeline(steps[queued]), queue.duration() > 0 ? "+=" + STEP_GAP : 0);
    }
    queue.play();
  }

  // 文字（下線・大きな「？」以外）が画面の下から15%のところまで入ってきたら、その段階まで出す
  var stepOf = new Map();
  steps.forEach(function (els, i) {
    els.forEach(function (el) {
      if (!el.classList.contains("problem-line") && el !== bigmark) stepOf.set(el, i);
    });
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      enqueueUpTo(stepOf.get(entry.target));
    });
  }, { rootMargin: "0px 0px -15% 0px", threshold: 0 });

  stepOf.forEach(function (_, el) { observer.observe(el); });
})();
