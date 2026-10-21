(function () {
  "use strict";

  var pinWrap = document.getElementById("js-mv-pin-wrap");
  var mainvisual = document.getElementById("js-mainvisual");
  var character = document.getElementById("js-mv-character-clip");
  var startyo = document.getElementById("js-mv-startyo");
  var startyoChars = startyo ? Array.prototype.slice.call(startyo.querySelectorAll(".mv-startyo-char")) : [];
  var dim = document.getElementById("js-mv-dim");
  var messageInner = document.getElementById("js-mv-message-inner");
  var lastLine = document.getElementById("js-mv-message-last");
  var sub = document.getElementById("js-mv-sub");
  var titleInner = document.getElementById("js-mv-title-inner");

  if (!pinWrap || !mainvisual || !messageInner || !lastLine) return;
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);
  // スマホは、スクロール中にアドレスバー/ツールバーが出たり引っ込んだりするだけで
  // window.innerHeightが変わり、そのたびにピン留めの再計算(refresh)が走って
  // スクロールがガクつく/おかしくなる原因になるため、その手の小さなリサイズは無視する
  ScrollTrigger.config({ ignoreMobileResize: true });
  // タッチ操作のスクロールを正規化する。これにより、ページの途中(mv-messageの手前など)まで
  // スクロールしてブラウザのバーが引っ込み、実際の画面が大きくなっても、
  // ピン留めした要素の高さがそれに追従できず下にすき間が見えてしまう問題を防ぐ
  // （PC/マウス操作には影響しないよう、タッチ操作のみに限定する）
  // ただしnormalizeScrollは、タッチのスクロールをブラウザ標準ではなくJSで毎フレーム動かす仕組みのため、
  // ページ全体で有効にすると、FVより下(特にposition:stickyを使うWORKS)でスクロールが重くなったり、
  // 指を離したあと勝手に戻されたりする。必要なのはFVのピン留めの間だけなので、
  // FVのピン留めを抜けたら無効にし、戻ってきたら有効に戻す
  var normalizer = ScrollTrigger.normalizeScroll({ type: "touch,pointer" });
  var normalizerOn = true;
  function syncNormalizer() {
    var st = window.__mvPinST;
    if (!normalizer || !st) return;
    var want = window.pageYOffset < st.end + window.innerHeight;
    if (want === normalizerOn) return;
    normalizerOn = want;
    if (want) normalizer.enable();
    else normalizer.disable();
  }
  window.addEventListener("scroll", syncNormalizer, { passive: true });

  // ---- スクロールで進む一連の流れ（Figma「TOPファーストビュー1〜5」）----
  // ① 「webのことなら」「原龍我」が消え、背景が白→黄色に。「始まるよ」も「原龍我」と同じように、
  //    上から1文字ずつ勢いよく落ちてくる
  // ② 少し間を置く
  // ③ 「始まるよ」が消えきる
  // ④ そのあとに、顔が一気にあご下まで見えるようになる（インパクト強め。始まるよとは重ならない）
  // ⑤ 少し間を置く（黄色い背景に、顔だけが見えている状態＝Figma「TOPファーストビュー4」）
  // ⑥ 気持ちよくスムーズに黒のベールへ切り替わり、あとは今まで通りメッセージが流れる（背景の黄色は残す）
  var COLOR_IMPACT_PX = 1300; // ①のスクロール量(px)。「始まるよ」がゆっくり、テンポよく1文字ずつ落ちてくる（もっとゆっくり）
  var HOLD1_PX = 120; // ②
  var STARTYO_OUT_PX = 220; // ③「始まるよ」が消えきるまで
  var REVEAL_PX = 190; // ④。短くして、シュッと素早く見えるようにする
  var HOLD2_PX = 180; // ⑤
  var COLOR_PHASE_PX = 560; // ⑥の、黒ベールがかかりきるまでのスクロール量(px)
  var YELLOW = "#ffcc00";
  var Y_FULL = "0%"; // あご下まで、全部見える
  // 口元まで全部見えている状態(.mv-character-clipの初期値と合わせる)。
  // スマホはPCより隠す量を少なくしている(_mainvisual.scssの@include sp {}と合わせる)ため、
  // 幅で判定して値を切り替える(_responsive.scssの@mixin spと同じ767px基準)
  function getYHalf() {
    return window.innerWidth <= 767 ? "16%" : "26%";
  }

  var currentST = null;

  // メッセージの各段落(p)を、画面の中央に近いものほどくっきり大きく、離れるほど薄く小さくする。
  // スクロールに合わせて、今読んでいる一段落だけが強調されていく
  var paragraphs = Array.prototype.slice.call(messageInner.querySelectorAll("p"));
  var MIN_OPACITY = 0.16;
  var MIN_SCALE = 0.92;

  // 段落の位置は、getBoundingClientRect(=毎フレームのレイアウト計算)を使わず、
  // 段落のoffsetTop(スクロールしても変わらない)と、messageInnerの現在のyから求める
  function updateEmphasis() {
    var vh = window.innerHeight;
    var mid = vh / 2;
    var reach = vh * 0.3; // 中央からこの距離で「非強調」の状態になる
    var y = gsap.getProperty(messageInner, "y") || 0;
    for (var i = 0; i < paragraphs.length; i++) {
      var p = paragraphs[i];
      var center = y + p.offsetTop + p.offsetHeight / 2;
      var d = Math.abs(center - mid) / reach;
      var t = d < 1 ? d : 1;
      var e = 1 - t * t * (3 - 2 * t); // smoothstep: 中央で1、離れると0
      // 画面から遠い段落は、見えないので触らない
      if (t >= 1 && p.__emph === 0) continue;
      p.__emph = t >= 1 ? 0 : e;
      p.style.opacity = (MIN_OPACITY + (1 - MIN_OPACITY) * e).toFixed(3);
      p.style.transform = "scale(" + (MIN_SCALE + (1 - MIN_SCALE) * e).toFixed(4) + ")";
    }
  }

  function build() {
    if (currentST) {
      currentST.kill();
      currentST = null;
      window.__mvPinST = null;
    }
    gsap.killTweensOf([mainvisual, sub, titleInner, character, dim, messageInner].filter(Boolean).concat(startyoChars));

    var vh = window.innerHeight;

    // メッセージは画面下からスタートし、最後の一文
    // 「ぜひ、ゆっくりご覧ください。」が画面中央に来たところで止まる
    var startY = vh;
    var endY = (vh / 2) - (lastLine.offsetTop + lastLine.offsetHeight / 2);
    var textScrollPx = Math.max(startY - endY, vh * 0.5);

    // 「原龍我」はJS(mainvisual.js)が1文字ずつ落として表示し終えているはず。念のため最終状態に固定してから、
    // スクロール連動のフェードアウト(GSAP)に引き継ぐ
    if (titleInner) {
      Array.prototype.forEach.call(titleInner.querySelectorAll(".mv-char"), function (el) {
        el.style.transition = "none";
        el.style.opacity = "1";
        el.style.transform = "none";
      });
    }

    gsap.set(messageInner, { y: startY });
    gsap.set(mainvisual, { backgroundColor: "#ffffff" });
    if (dim) gsap.set(dim, { opacity: 0 });
    if (sub) gsap.set(sub, { opacity: 1, y: 0 });
    if (titleInner) gsap.set(titleInner, { opacity: 1 });
    if (character) gsap.set(character, { y: getYHalf() });
    if (startyoChars.length) gsap.set(startyoChars, { opacity: 0, y: "-160%", scale: 1 });

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: pinWrap,
        start: "top top",
        end: "+=" + (COLOR_IMPACT_PX + HOLD1_PX + STARTYO_OUT_PX + REVEAL_PX + HOLD2_PX + COLOR_PHASE_PX + textScrollPx),
        scrub: 0.6,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true
      },
      // スクロール(滑らかに追従する分も含む)のたびに、段落の強調度を更新する
      onUpdate: updateEmphasis
    });

    // ---- ① 0 〜 COLOR_IMPACT_PX ----
    // 「webのことなら」「原龍我」がすっと消える（先頭の一瞬だけ）
    if (sub) tl.to(sub, { opacity: 0, y: -12, duration: COLOR_IMPACT_PX * 0.3, ease: "none" }, 0);
    if (titleInner) tl.to(titleInner, { opacity: 0, duration: COLOR_IMPACT_PX * 0.3, ease: "none" }, 0);
    // 背景が白から黄色へ
    tl.to(mainvisual, { backgroundColor: YELLOW, duration: COLOR_IMPACT_PX, ease: "none" }, 0);
    // 「始まるよ」が、上から1文字ずつ、ポップに（大きく弾んで、少し傾きながら）落ちてくる
    if (startyoChars.length) {
      // 間隔を広めにとり、1文字ずつ落ちる様子がはっきりわかるようにする
      var per = (COLOR_IMPACT_PX * 0.7) / startyoChars.length;
      startyoChars.forEach(function (el, i) {
        var tilt = (i % 2 ? 1 : -1) * 20; // 1文字ごとに傾きを左右交互に
        var at = COLOR_IMPACT_PX * 0.2 + i * per;
        var dur = per * 1.8;
        // back.outの大きめのオーバーシュートで、y/scale/回転すべてが弾みながらポンと着地する
        tl.fromTo(el,
          { opacity: 0, y: "-170%", scale: 0.3, rotation: tilt },
          { opacity: 1, y: "0%", scale: 1, rotation: 0, duration: dur, ease: "back.out(3.6)" },
          at);
      });
    }

    // ---- ② 少し間を置く ----
    var revealAt = COLOR_IMPACT_PX + HOLD1_PX;

    // ---- ③ revealAt 〜 +STARTYO_OUT_PX ----
    // まず「始まるよ」が消えきる（顔とは重ならないよう、これが終わってから顔を出し始める）
    if (startyoChars.length) tl.to(startyoChars, { opacity: 0, y: "40%", duration: STARTYO_OUT_PX, ease: "power1.in" }, revealAt);

    // ---- ④ 「始まるよ」が消えたあとに、顔がシュッと素早く、下からせり上がるように、あご下まで見えるようになる ----
    var charRevealAt = revealAt + STARTYO_OUT_PX;
    if (character) {
      // back.out(行き過ぎてから戻る)だと、y:0%を通り過ぎてマイナスになった瞬間に
      // 髪の毛がマスクからはみ出して見切れてしまうため、行き過ぎない鋭いイージングで、
      // 出し切ったところ(y:0%)でぴたっと止める
      // ※以前は拡大(scale)のパルスも足してインパクトを強めていたが、縦横同じ比率で拡大すると
      // 耳がマスクからはみ出して見切れ、縦方向だけ拡大すると今度は画像が縦に伸びて見えてしまうため、
      // 拡大は使わず、位置の動き(y)だけで「シュッと」出し切るようにする
      tl.to(character, { y: Y_FULL, duration: REVEAL_PX, ease: "power3.out" }, charRevealAt);
    }

    // ---- ⑤ 少し間を置く（黄色い背景に、顔だけが見えている状態） ----
    var veilAt = charRevealAt + REVEAL_PX + HOLD2_PX;

    // ---- ⑥ 気持ちよくスムーズに、黒のベールへ切り替わる ----
    // 背景に黒(65%)のベールがかかっていく。キャラクターは消さず、うっすら透けて見える
    // （Figma「TOPファーストビュー後 スクロールすると2」: 背景の上に黒65%の矩形を重ねた状態）
    // イージングを効かせて、切り替わりが唐突にならないようにする。
    // 背景の黄色は、メッセージが流れる間もそのまま残す
    if (dim) {
      tl.to(dim, { opacity: 1, duration: COLOR_PHASE_PX, ease: "power1.inOut" }, veilAt);
    } else {
      tl.to(mainvisual, { backgroundColor: "#b38f00", duration: COLOR_PHASE_PX, ease: "power1.inOut" }, veilAt);
    }

    // メッセージが下からスクロールで流れてくる
    tl.to(messageInner, { y: endY, duration: textScrollPx, ease: "none" }, veilAt + COLOR_PHASE_PX);

    currentST = tl.scrollTrigger;
    window.__mvPinST = currentST;
    syncNormalizer();
    updateEmphasis();
    setupGate(currentST, veilAt);
  }

  // ---- 「始まるよ」〜顔の全体表示までは、スクロール操作では進めさせず、
  //      1回のスクロールで、最後(veilAt。黒いベールの直前)までを自動で再生する ----
  var GATE_DURATION = 4.2; // 自動再生にかける時間(秒)。「始まるよ」を遅くした分、少し長めにする
  var gatePlayed = false;
  var gateTween = null;
  var gateStartAbs = 0;
  var gateEndAbs = 0;
  function setupGate(st, veilAtPx) {
    gatePlayed = false;
    if (gateTween) { gateTween.kill(); gateTween = null; }
    gateStartAbs = st.start;
    gateEndAbs = st.start + veilAtPx;
    // リロード/ブラウザバックで、すでにこの範囲より先まで来ている場合は、あらためて再生しない
    if (window.__restoreY || window.pageYOffset > gateEndAbs - 2) gatePlayed = true;
  }

  // スクロールを止めるべきか（自動再生の最中も含む。開始前だけでなく、再生中もずっと操作を無視する）
  function shouldLockGate() {
    if (gatePlayed) return false;
    var y = window.pageYOffset;
    return y >= gateStartAbs - 1 && y < gateEndAbs;
  }

  function playGate() {
    if (gateTween || gatePlayed) return;
    var proxy = { y: window.pageYOffset };
    gateTween = gsap.to(proxy, {
      y: gateEndAbs,
      duration: GATE_DURATION,
      ease: "power1.inOut",
      onUpdate: function () { window.scrollTo(0, proxy.y); },
      onComplete: function () {
        gateTween = null;
        gatePlayed = true;
      }
    });
  }

  function onGateWheel(e) {
    if (!shouldLockGate()) return;
    e.preventDefault();
    if (!gateTween && e.deltaY > 0) playGate();
  }
  function onGateTouchStart(e) {
    gateTouchY = e.touches.length === 1 ? e.touches[0].clientY : null;
  }
  var gateTouchY = null;
  function onGateTouchMove(e) {
    if (!shouldLockGate() || gateTouchY === null) return;
    e.preventDefault();
    if (gateTween) return;
    var dy = gateTouchY - e.touches[0].clientY;
    if (dy > 8) playGate();
  }
  function onGateKey(e) {
    if (!shouldLockGate()) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    var down = e.key === "ArrowDown" || e.key === "PageDown" || (e.key === " " && !e.shiftKey);
    if (down || e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      if (down && !gateTween) playGate();
    }
  }
  window.addEventListener("wheel", onGateWheel, { passive: false });
  window.addEventListener("touchstart", onGateTouchStart, { passive: true });
  window.addEventListener("touchmove", onGateTouchMove, { passive: false });
  window.addEventListener("keydown", onGateKey);

  var started = false;
  function start() {
    if (started) return;
    started = true;
    build();
  }

  // ファーストビューの一連の演出（キャラクター表示〜タイピング）が終わってから構築する
  window.addEventListener("mv-intro:done", start);
  // 万が一イベントが発火しない場合の保険用フォールバック。
  // mainvisual.js側の最大待ち時間（site-loader:doneが発火しない場合の
  // フォールバック4000ms + キャラクター/コピー/タイトルの演出シーケンス最大5400ms ≒ 9400ms）
  // より確実に長くしておかないと、実際のmv-intro:doneより先にここが発火してしまい、
  // タイトルのポップインアニメーションが始まる前にstyle.animation="none"を
  // インラインで焼き付けてしまい、アニメーションが二度と発火しなくなる不具合が起きる
  // （待ち時間は、ローディングが終わって画面が見えてから数える。ローディングが長引いても早まらない）
  (window.onSiteReady || function (f) { f(); })(function () { window.setTimeout(start, 9500); });

  var resizeTimer;
  var lastResizeWidth = window.innerWidth;
  window.addEventListener("resize", function () {
    if (!started) return;
    // スマホは、アドレスバーの出入りでも高さだけ変わるresizeが発生する。
    // 幅が変わっていない(=画面回転や実際の表示サイズ変更ではない)場合は、作り直さない
    // （作り直すと、スクロール中に途中位置がずれてガクつく/おかしくなる原因になるため）
    var w = window.innerWidth;
    if (w === lastResizeWidth) return;
    lastResizeWidth = w;
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(build, 200);
  });
})();
