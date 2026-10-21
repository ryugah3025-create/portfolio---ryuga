(function () {
  "use strict";

  // WORKSページ：FVのあとは、すぐに実績リスト（無限スライド）。
  // ・ページ自体はスクロールさせず、上下左右のホイール/スワイプ・←→キーの1回ごとに前後の実績へ切り替わる。
  //   最後の件の次は最初の件に戻り、どこまでも続く（フッターにも、FVにも戻らない。戻るのは「トップに戻る」ボタン）
  // ・中央以外のカードをクリック/タップ：そのカードが中央に来る。中央のカードをクリック：詳細のモーダル
  var gallery = document.getElementById("js-gallery");
  if (!gallery) return;
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);

  var stage = document.getElementById("js-gallery-stage");
  var cards = gsap.utils.toArray(gallery.querySelectorAll(".js-gallery-card"));
  var N = cards.length;
  if (N < 2) return;

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- 位置の目安（Figmaの1600x1214の枠に対する割合。上に「トップに戻る」があるので、中央は少し下げてある）----
  // o=0: 中央 / o=+1: 右上 / o=-1: 左下 / ±2: その先（画面の外）
  // left, top: カード左上の位置(画面の幅・高さに対する%)、w: カードの幅(画面の幅に対する%)、a: 不透明度
  var PC = {
    "-2": { left: -50, top: 118, w: 30, a: 0 },
    "-1": { left: -23.6, top: 83.7, w: 39.9, a: 1 },
    "0": { left: 27.3, top: 28.6, w: 45.7, a: 1 },
    "1": { left: 78.6, top: -6.2, w: 34.4, a: 1 },
    "2": { left: 122, top: -40, w: 30, a: 0 }
  };
  // スマホ（縦長）：中央を大きく、右上・左下の隅にぴったり寄せて、前後の実績をのぞかせる
  var SP = {
    "-2": { left: -46, top: 108, w: 40, a: 0 },
    "-1": { left: 0, top: 84, w: 52, a: 1 },
    "0": { left: 6, top: 34, w: 88, a: 1 },
    "1": { left: 56, top: 0, w: 54, a: 1 },
    "2": { left: 112, top: -22, w: 40, a: 0 }
  };
  function anchors() {
    return window.matchMedia && window.matchMedia("(max-width: 767px)").matches ? SP : PC;
  }

  var W = 0;
  var H = 0;
  var cardW = 0; // 中央に来たときのカードの幅(px)
  var A = anchors();
  var P = {}; // 画面サイズに合わせて計算した位置(px)と倍率

  // 中央のカードは、画面の幅にも高さにも必ず収まる大きさにする（縦に短い画面でも、はみ出さない）
  function measure() {
    W = stage.clientWidth;
    H = stage.clientHeight;
    A = anchors();
    var byWidth = (A["0"].w / 100) * W;
    var byHeight = H * (0.95 - A["0"].top / 100) * 1.5; // カードは3:2。下に余白を残す
    cardW = Math.min(byWidth, byHeight);
    gallery.style.setProperty("--card-w", cardW + "px");

    P = {};
    ["-2", "-1", "0", "1", "2"].forEach(function (k) {
      var a = A[k];
      P[k] = { x: a.left * W / 100, y: a.top * H / 100, s: a.w / A["0"].w, a: a.a };
    });
    P["0"].x = (W - cardW) / 2; // 横は必ず画面の中央
    P["0"].s = 1;
  }

  // なめらかに切り替わるよう、区間の途中はイージングをかけて補間する
  function ease(t) {
    return t * t * (3 - 2 * t); // smoothstep
  }
  function stateAt(o) {
    if (o <= -2) return { x: P["-2"].x, y: P["-2"].y, s: P["-2"].s, a: 0 };
    if (o >= 2) return { x: P["2"].x, y: P["2"].y, s: P["2"].s, a: 0 };
    var k = Math.floor(o);
    var t = ease(o - k);
    var p = P[String(k)];
    var q = P[String(k + 1)];
    var lerp = function (a, b) { return a + (b - a) * t; };
    return { x: lerp(p.x, q.x), y: lerp(p.y, q.y), s: lerp(p.s, q.s), a: lerp(p.a, q.a) };
  }

  // 無限に続くよう、各カードの「中央からのずれ」を -N/2〜N/2 の範囲に巻き戻す
  function wrap(o) {
    return o - N * Math.floor(o / N + 0.5);
  }
  var current = 0; // 連続値（巻き戻さない。増え続けてよい）
  function place(c) {
    current = c;
    cards.forEach(function (el, i) {
      var o = wrap(i - c);
      var st = stateAt(o);
      gsap.set(el, {
        x: st.x,
        y: st.y,
        scale: st.s,
        opacity: st.a,
        visibility: st.a < 0.01 ? "hidden" : "visible",
        zIndex: 20 - Math.round(Math.abs(o) * 4)
      });
    });
  }

  measure();
  place(0);

  // 「動きを減らす」設定：切り替えは行わず、全件を縦に並べて見せる（CSS側で対応）
  if (reduceMotion) {
    gallery.classList.add("is-static");
    return;
  }
  // 実績リストが最後の画面になるので、最終フッターは使わない
  document.documentElement.classList.add("works-list-page");

  // ---- 実績の切り替え（1回の操作=1件。最後の次は最初に戻る）----
  var target = 0; // 目的の件（巻き戻さない整数）
  var slide = null;
  var busyUntil = 0;
  function index() {
    return ((Math.round(target) % N) + N) % N;
  }
  function moveBy(delta) {
    target += delta;
    if (slide) slide.kill();
    var o = { c: current };
    slide = gsap.to(o, {
      c: target,
      duration: Math.min(0.8 + 0.15 * (Math.abs(delta) - 1), 1.2),
      ease: "power3.inOut",
      onUpdate: function () { place(o.c); }
    });
  }
  function hop(dir) {
    var now = Date.now();
    if (now < busyUntil) return; // 切り替え中や、その直後に入ってくる慣性のイベントは、同じ1回の操作として無視
    busyUntil = now + 900;
    moveBy(dir);
  }

  function fvBusy() {
    // ファーストビューの演出中(ヘッダーが隠れている間)は、上に重なっているので操作を受け付けない
    return document.body.classList.contains("is-works-fv");
  }
  // 操作1回ぶん。dir: 1=下/次, -1=上/前
  function act(dir) {
    if (fvBusy()) return false;
    hop(dir);
    return true;
  }

  window.addEventListener("wheel", function (e) {
    if (fvBusy()) return;
    var horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    var d = horizontal ? e.deltaX : e.deltaY;
    if (Math.abs(d) < 4) return;
    var dir = d > 0 ? 1 : -1;
    if (act(dir)) e.preventDefault();
  }, { passive: false });

  // スワイプ（案内文・実績リストともに touch-action:none。指の動きを見て1回の操作にする）
  var tx = null;
  var ty = null;
  var swiped = false;
  window.addEventListener("touchstart", function (e) {
    if (e.touches.length !== 1) { tx = null; return; }
    tx = e.touches[0].clientX;
    ty = e.touches[0].clientY;
    swiped = false;
  }, { passive: true });
  window.addEventListener("touchmove", function (e) {
    if (tx === null || swiped || fvBusy()) return;
    var dx = e.touches[0].clientX - tx;
    var dy = e.touches[0].clientY - ty;
    var ax = Math.abs(dx);
    var ay = Math.abs(dy);
    if (Math.max(ax, ay) < 36) return;
    swiped = true;
    if (ax > ay * 1.2) {
      hop(dx < 0 ? 1 : -1); // 左へスワイプ=次
    } else {
      act(dy < 0 ? 1 : -1); // 上へスワイプ=次(下へ進む)
    }
  }, { passive: true });

  window.addEventListener("keydown", function (e) {
    if (fvBusy()) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    var dir = 0;
    if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") dir = 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") dir = -1;
    if (dir && act(dir)) e.preventDefault();
  });

  // ---- カードのクリック：中央以外は、そのカードを中央に。中央ならモーダル(既存の処理) ----
  // ---- 「トップに戻る」：WORKSのFVへ戻る（ズームの逆再生。works-fv.js） ----
  var topBtn = gallery.querySelector(".works-top");
  if (topBtn) {
    topBtn.addEventListener("click", function (e) {
      if (window.__worksFV && window.__worksFV.replay()) e.preventDefault();
    });
  }

  gallery.addEventListener("click", function (e) {
    var li = e.target.closest && e.target.closest(".js-gallery-card");
    if (!li) return;
    var i = cards.indexOf(li);
    var delta = wrap(i - index());
    if (delta !== 0) {
      e.preventDefault();
      e.stopPropagation();
      busyUntil = Date.now() + 900;
      moveBy(delta);
    }
  }, true);

  var resizeTimer;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      measure();
      place(current);
    }, 200);
  });
})();
