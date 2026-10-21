(function () {
  "use strict";

  // WORKSページ：ファーストビューの演出（Figma「worksファーストビュー1〜3」）と、下に続く文字のタイミングアニメーション。
  //  ① 「WORKS」が1文字ずつ現れる
  //  ② 時計回りに（左上→右上→右下→左下）、四隅から顔が覗き込んでくる
  //  ③ スクロール操作で、「WORKS」の「O」へズームしていき、「O」の真ん中を潜り抜ける
  //  ④ 潜り抜けた先に、実績リスト(works-gallery.js)が現れる → 通常のスクロール
  //  ⑤ 上へスクロールして最上部に戻ると、③→①②の状態へ逆再生する
  // ①〜④の間は、演出が崩れないようスクロールを止めておく（③は「スクロール操作」が合図）。
  var fv = document.getElementById("js-works-fv");
  if (!fv) return;
  if (typeof gsap === "undefined") return;

  var stageEl = document.getElementById("js-works-stage");
  var title = document.getElementById("js-works-title");
  var chars = gsap.utils.toArray(title.querySelectorAll(".works-char"));
  var oChar = document.getElementById("js-works-o");
  var faces = gsap.utils.toArray(fv.querySelectorAll(".js-works-face")); // 左上→右上→右下→左下（時計回り）

  // ファーストビューの演出中は、ヘッダーを隠す（body.is-works-fv。worksページのPHPで最初から付けてある）
  function headerHidden(hidden) {
    document.body.classList.toggle("is-works-fv", hidden);
  }

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasST = typeof ScrollTrigger !== "undefined";
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  // ---- 下に続く文字のタイミングアニメーション（制作物・お問い合わせ） ----
  function setupReveals() {
    if (!hasST || reduceMotion) return;
    var groups = [];
    document.querySelectorAll(".work-item .text-area").forEach(function (area) {
      groups.push({ trigger: area, targets: area.children });
    });
    var contact = document.querySelector(".contactText");
    if (contact) groups.push({ trigger: contact, targets: contact.children });

    groups.forEach(function (g) {
      var targets = gsap.utils.toArray(g.targets);
      gsap.set(targets, { opacity: 0, y: 22 });
      ScrollTrigger.create({
        trigger: g.trigger,
        start: "top 82%",
        once: true,
        onEnter: function () {
          gsap.to(targets, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", stagger: 0.35 });
        }
      });
    });
  }

  // ---- 演出なし（動きを減らす設定 / 途中位置からの再開）：潜り抜けたあとの状態にする ----
  var startedAtTop = window.pageYOffset < 50;
  if (reduceMotion || !startedAtTop) {
    gsap.set(stageEl, { display: "none" });
    headerHidden(false);
    setupReveals();
    return;
  }

  // ---- 顔の配置：角度と、覗き込む方向（画面の外→定位置） ----
  // 左上・右上は逆さまに、左下・右下はやや傾いて。
  // Figmaの回転角は「反時計回りが正」、CSS/GSAPは「時計回りが正」なので、符号を逆にして合わせている
  // （Figma: 左上 -135° / 右上 135° / 右下 30° / 左下 -30°）
  var FACE = [
    { rot: 135, dx: -1, dy: -1 }, // 左上
    { rot: -135, dx: 1, dy: -1 }, // 右上
    { rot: -30, dx: 1, dy: 1 }, // 右下
    { rot: 30, dx: -1, dy: 1 } // 左下
  ];
  function vw() { return window.innerWidth; }
  function vh() { return window.innerHeight; }

  // ---- 初期状態 ----
  var locked = true; // スクロールを止めておく
  var stage = "intro"; // intro → ready → busy → done（再ロック中は full → busy → ready）

  gsap.set(title, { xPercent: -50, yPercent: -50 });
  gsap.set(chars, { opacity: 0, y: 70, rotate: -8, transformOrigin: "50% 100%" });
  faces.forEach(function (el, i) {
    gsap.set(el, {
      xPercent: -50,
      yPercent: -50,
      rotation: FACE[i].rot,
      x: FACE[i].dx * vw() * 0.5,
      y: FACE[i].dy * vh() * 0.5,
      opacity: 1
    });
  });

  // ---- 「O」の中心（潜り抜ける点）の測定 ----
  // 返り値: { ox, oy: タイトル内でのOの中心(px)、cx, cy: 画面上のOの中心(px)、scale: Oの穴が画面を覆いきる倍率 }
  function measureO() {
    var fs = parseFloat(getComputedStyle(title).fontSize);
    var ff = getComputedStyle(title).fontFamily;
    var lh = parseFloat(getComputedStyle(title).lineHeight) || fs * 1.2;
    var tRect = title.getBoundingClientRect(); // 文字ごとの動き(y/rotate)には影響されない

    // グリフの実寸(高さ・幅)と、ベースラインの位置（フォントの寸法から。文字の動きの影響を受けないよう、レイアウト値で求める）
    var gw = fs * 0.72;
    var gh = fs * 0.72;
    var mid = fs * 0.36; // ベースラインから、Oの中心までの高さ
    var baseFromTop = lh / 2 + fs * 0.3; // 行の上端からベースラインまで（フォント寸法が取れないときの目安）
    try {
      var ctx = document.createElement("canvas").getContext("2d");
      ctx.font = fs + "px " + ff;
      var m = ctx.measureText("O");
      gw = (m.actualBoundingBoxLeft || 0) + (m.actualBoundingBoxRight || m.width);
      var asc = m.actualBoundingBoxAscent || fs * 0.72;
      var desc = m.actualBoundingBoxDescent || 0;
      gh = asc + desc;
      mid = (asc - desc) / 2;
      if (m.fontBoundingBoxAscent) {
        var fA = m.fontBoundingBoxAscent;
        var fD = m.fontBoundingBoxDescent || 0;
        baseFromTop = (lh - (fA + fD)) / 2 + fA; // 行間の上下の余白(half-leading)を含めたベースライン位置
      }
    } catch (e) { /* 既定値のまま */ }

    var cxScreen = tRect.left + oChar.offsetLeft + oChar.offsetWidth / 2;
    var cyScreen = tRect.top + baseFromTop - mid;
    // Oの穴は、外形のおよそ 55% × 50%。それが画面を覆うのに必要な倍率に、余裕(1.2倍)をみる
    var need = Math.max(vw() / (gw * 0.55), vh() / (gh * 0.5)) * 1.2;
    return {
      ox: cxScreen - tRect.left,
      oy: cyScreen - tRect.top,
      cx: cxScreen,
      cy: cyScreen,
      scale: need
    };
  }

  // ---- ③ ズームして「O」を潜り抜ける（一時停止状態で作り、再生/逆再生する） ----
  var zoomTL = null;
  function buildZoom() {
    if (zoomTL) zoomTL.kill();
    // 一度タイトルの変形(ズーム分)を外して、正しい位置を測る
    gsap.set(title, { scale: 1, x: 0, y: 0 });
    var o = measureO();
    var dx = vw() / 2 - o.cx; // Oの中心を画面の中心へ
    var dy = vh() / 2 - o.cy;
    zoomTL = gsap.timeline({ paused: true });
    // 顔は、カメラが進むにつれて外へ流れて消える
    faces.forEach(function (el, i) {
      zoomTL.to(el, {
        x: "+=" + FACE[i].dx * vw() * 0.35,
        y: "+=" + FACE[i].dy * vh() * 0.35,
        scale: 1.6,
        opacity: 0,
        duration: 1.5,
        ease: "power2.in"
      }, 0);
    });
    // 「WORKS」は「O」の中心を軸に拡大しながら、Oの中心が画面の中心に来る
    zoomTL.to(title, {
      scale: o.scale,
      x: dx,
      y: dy,
      transformOrigin: o.ox + "px " + o.oy + "px",
      duration: 2.8,
      ease: "power3.in"
    }, 0);
    // 穴の中(白)を抜けたら、舞台を消して、下の案内文が見えるようにする
    zoomTL.set(stageEl, { autoAlpha: 0 }, 2.75);
    return zoomTL;
  }

  // ---- スクロールのロックと、操作の受け付け ----
  var LOCK_KEYS = { 32: 1, 33: 1, 34: 1, 35: 1, 36: 1, 37: 1, 38: 1, 39: 1, 40: 1 };
  var STEP_THRESHOLD = 60;
  var acc = 0;
  var finishedAt = 0;

  // amount: 正=進む(下へスクロール) / 負=戻る(上へスクロール)
  function feed(amount) {
    if (stage !== "ready" && stage !== "full") return;
    if ((acc > 0 && amount < 0) || (acc < 0 && amount > 0)) acc = 0;
    acc += amount;
    if (acc >= STEP_THRESHOLD) {
      acc = 0;
      if (stage === "ready") forward();
    } else if (acc <= -STEP_THRESHOLD) {
      acc = 0;
      if (stage === "full") backward();
    }
  }

  function atTopAfterDone() {
    return false && stage === "done" && window.pageYOffset <= 1 && Date.now() - finishedAt > 400;
  }
  // 通常スクロールで最上部に戻ってきたら、再びロックして逆再生できる状態にする
  function relock() {
    if (stage !== "done") return;
    locked = true;
    stage = "full";
    acc = 0;
    headerHidden(true); // ファーストビューに戻るので、ヘッダーを隠す
    window.scrollTo(0, 0);
  }

  function onWheel(e) {
    if (locked) {
      e.preventDefault();
      if (e.deltaY !== 0) feed(e.deltaY);
      return;
    }
    if (e.deltaY < 0 && atTopAfterDone()) {
      e.preventDefault();
      relock();
      feed(e.deltaY);
    }
  }
  var lastTouchY = null;
  function onTouchStart(e) {
    lastTouchY = e.touches.length === 1 ? e.touches[0].clientY : null;
  }
  function onTouchMove(e) {
    if (lastTouchY === null) return;
    var y = e.touches[0].clientY;
    var d = lastTouchY - y; // 正=指を上へ(=下へスクロール)
    if (locked) {
      e.preventDefault();
      lastTouchY = y;
      if (d !== 0) feed(d);
      return;
    }
    if (d < 0 && atTopAfterDone()) {
      e.preventDefault();
      lastTouchY = y;
      relock();
      feed(d);
    }
  }
  function onKey(e) {
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    var down = (e.keyCode === 32 && !e.shiftKey) || e.keyCode === 34 || e.keyCode === 40;
    var up = e.keyCode === 33 || e.keyCode === 38 || (e.keyCode === 32 && e.shiftKey);
    if (locked) {
      if (LOCK_KEYS[e.keyCode]) e.preventDefault();
      if (down) feed(STEP_THRESHOLD);
      else if (up) feed(-STEP_THRESHOLD);
      return;
    }
    if (up && atTopAfterDone()) {
      e.preventDefault();
      relock();
      feed(-STEP_THRESHOLD);
    }
  }
  var lastY = 0;
  function onScroll() {
    var y = window.pageYOffset;
    if (locked && y !== 0) window.scrollTo(0, 0);
    else if (!locked && y < lastY && atTopAfterDone()) relock();
    lastY = y;
  }
  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("keydown", onKey);
  window.addEventListener("scroll", onScroll, { passive: true });

  // ---- 進む：ズーム → 通常スクロール（実績リストが現れる） ----
  function forward() {
    if (stage !== "ready") return;
    stage = "busy";
    zoomTL.eventCallback("onReverseComplete", null);
    zoomTL.eventCallback("onComplete", function () {
      stage = "done";
      locked = false;
      headerHidden(false); // 潜り抜けたあとは、ヘッダーを表示する
      finishedAt = Date.now();
      lastY = window.pageYOffset;
    });
    zoomTL.play(0);
  }

  // ---- 戻る（逆再生）：ズームアウト → 最初の状態 ----
  function backward() {
    if (stage !== "full") return;
    stage = "busy";
    zoomTL.eventCallback("onComplete", null);
    zoomTL.eventCallback("onReverseComplete", function () {
      stage = "ready";
    });
    zoomTL.reverse();
  }

  // ---- 「トップに戻る」ボタン：FVへ戻り、ズームを逆再生する（works-gallery.js から呼ぶ） ----
  window.__worksFV = {
    replay: function () {
      if (stage !== "done" || !zoomTL) return false;
      locked = true;
      stage = "full";
      acc = 0;
      headerHidden(true);
      window.scrollTo(0, 0);
      backward();
      return true;
    }
  };

  // ---- ①② イントロ（サイトローダーが終わってから） ----
  function playIntro() {
    if (stage !== "intro" || playIntro.started) return;
    playIntro.started = true;
    var tl = gsap.timeline({
      onComplete: function () {
        stage = "ready";
      }
    });
    // ① 「WORKS」が1文字ずつ、ぽんぽんと現れる
    tl.to(chars, {
      opacity: 1,
      y: 0,
      rotate: 0,
      duration: 0.7,
      ease: "back.out(2)",
      stagger: 0.14
    }, 0.2);
    // ② 時計回りに、四隅から顔が覗き込んでくる（左上→右上→右下→左下）。顔ごとに少し遅らせる
    faces.forEach(function (el, i) {
      tl.to(el, { x: 0, y: 0, duration: 1.0, ease: "back.out(1.4)" }, 1.3 + i * 0.55);
    });
  }
  // ローディングが終わって、画面が表示されてから始める（ローディング中は始めない）
  (window.onSiteReady || function (f) { f(); })(playIntro);

  // フォント読み込み後に測る（Itimの寸法で「O」の位置を求めるため）
  function prepare() {
    if (stage !== "intro" && stage !== "ready") return;
    // イントロの途中は、タイトル/顔のx,yが動いているので、タイトルだけを対象に測り直す（顔は触らない）
    buildZoom();
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(prepare);
  else prepare();
  window.addEventListener("load", prepare);
  var resizeTimer;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(prepare, 200);
  });

  setupReveals();

  // 万が一演出が始まらない場合でも、スクロールできなくなったままにしない
  window.setTimeout(function () {
    if (stage === "intro") {
      locked = false;
      gsap.set(stageEl, { display: "none" });
      headerHidden(false);
      stage = "done";
    }
  }, 60000);
})();
