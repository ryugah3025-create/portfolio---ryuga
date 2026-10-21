(function () {
  "use strict";

  // ABOUTページ ファーストビュー：写真が中央に1枚ずつ急に現れて重なる → 全部そろったら下に「ABOUT」が急に現れる。
  // 写真をクリック/タップすると拡大表示（モーダル）。
  var fv = document.getElementById("js-about-fv");
  if (!fv) return;

  var photos = Array.prototype.slice.call(fv.querySelectorAll(".js-fv-photo"));
  var title = document.getElementById("js-about-fv-title");

  // ---- 拡大表示（アニメーションの有無に関わらず使える） ----
  var box = document.getElementById("js-about-lightbox");
  var boxImg = box ? box.querySelector("img") : null;
  var lastFocus = null;
  function openBox(src) {
    if (!box) return;
    lastFocus = document.activeElement;
    boxImg.src = src;
    box.hidden = false;
    // hidden解除の次のフレームでフェードイン
    window.requestAnimationFrame(function () { box.classList.add("is-open"); });
    box.querySelector(".about-lightbox-close").focus();
  }
  function closeBox() {
    if (!box || box.hidden) return;
    box.classList.remove("is-open");
    window.setTimeout(function () {
      box.hidden = true;
      boxImg.removeAttribute("src");
    }, 300);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  photos.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var img = btn.querySelector("img");
      openBox(btn.getAttribute("data-full") || img.currentSrc || img.src);
    });
  });
  if (box) {
    box.addEventListener("click", closeBox);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeBox();
    });
  }

  // ---- 落ちてくるアニメーション ----
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || typeof gsap === "undefined") {
    document.body.classList.remove("is-about-fv"); // 演出なし：ヘッダーもスクロールも、最初から使える
    return; // 何もせず、最初から全部見える状態
  }

  // ---- FVの演出中は、スクロール禁止（ヘッダーはCSS/body.is-about-fvで隠れている） ----
  function stopScroll(e) { if (e.cancelable) e.preventDefault(); }
  function stopKey(e) {
    if ([32, 33, 34, 35, 36, 37, 38, 39, 40].indexOf(e.keyCode) !== -1) e.preventDefault();
  }
  var scrollLocked = false;
  function lockScroll() {
    if (scrollLocked) return;
    scrollLocked = true;
    window.addEventListener("wheel", stopScroll, { passive: false });
    window.addEventListener("touchmove", stopScroll, { passive: false });
    window.addEventListener("keydown", stopKey);
  }
  function unlockScroll() {
    if (!scrollLocked) return;
    scrollLocked = false;
    window.removeEventListener("wheel", stopScroll, { passive: false });
    window.removeEventListener("touchmove", stopScroll, { passive: false });
    window.removeEventListener("keydown", stopKey);
  }
  lockScroll();
  window.setTimeout(unlockScroll, 20000); // 万一のため

  gsap.set(photos, { autoAlpha: 0 });
  gsap.set(title, { autoAlpha: 0 });

  // 写真は、Figmaの位置(中央)に、1枚ずつ急に現れる。写真の枚数が増えても、そのまま動く。
  //  ・1枚目：出たあと、FIRST_HOLD(1秒ほど)止まってから2枚目へ
  //  ・2枚目〜最後の1枚前：テンポよく、ぱんぱんと出る
  //  ・最後の1枚：ワンテンポ(LAST_GAP)遅らせて出す
  //  ・全部そろったら、「ABOUT」が急に現れる
  var FIRST_HOLD = 1.0; // 1枚目を見せて止まる時間(秒)。そのあと2枚目から入っていく
  var STEP = 0.35; // 写真1枚ごとの間隔(秒)
  var LAST_GAP = 0.95; // 最後の1枚の直前の間(秒)
  var START_DELAY = 0.8; // ローディングが終わって画面が見えてから、1枚目が出るまで(秒)
  var TITLE_GAP = 0.95; // 最後の写真から「ABOUT」まで(秒)。ワンテンポずらして出す
  var played = false;
  function play() {
    if (played) return;
    played = true;
    var tl = gsap.timeline({ delay: START_DELAY });
    var t = 0;
    photos.forEach(function (el, i) {
      if (i === 1) t += FIRST_HOLD;
      else if (i > 1) t += i === photos.length - 1 && photos.length > 2 ? LAST_GAP : STEP;
      tl.set(el, { autoAlpha: 1 }, t);
    });
    tl.set(title, { autoAlpha: 1 }, t + TITLE_GAP);
    // 「ABOUT」が出てから少し間を置いて、スクロールできるようにする
    tl.call(unlockScroll, null, t + TITLE_GAP + 0.6);
  }
  // ローディングが終わって、画面が表示されてから始める（ローディング中は始めない）
  (window.onSiteReady || function (f) { f(); })(play);

  // ---- FVのあと：スクロールで進むストーリー（Figma「aboutセクション4」）----
  //  ① FVの写真が上へ流れ去り、「ABOUT」が大きくなりながら画面の一番上まで移動する
  //  ② 「ABOUT」が上に着いてから、キャラクターが画面の中からぽんと現れ、スクロールするとガタガタ横に震えながら下がっていく
  //  ③ そのあいだ、FVの写真が回転しながら上から不規則に降ってきて、まわりに散らばる
  if (typeof ScrollTrigger === "undefined") {
    document.body.classList.remove("is-about-fv");
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  var pin = document.getElementById("js-about-fv-pin");
  var canvas = fv.querySelector(".about-fv-canvas");
  var chars = gsap.utils.toArray(fv.querySelectorAll(".js-story-char"));
  var drops = gsap.utils.toArray(fv.querySelectorAll(".js-story-drop"));
  if (!pin || !canvas || !title || chars.length < 1) return;

  var FV_W = 1603; // Figmaの枠の幅(px)
  var TITLE_TOP_AT = 1.2; // 「ABOUT」が画面の一番上に着く時刻（タイムライン上）
  var SHAKE_AT = 2.3; // キャラクターがガタガタ震えながら下がり始める時刻
  var SHAKE_DUR = 2.2; // その長さ
  var CREDITS_AT = 4.2; // 文章が下から流れ始める時刻
  var END_T = 4.9; // 文章より前の部分の長さ。文章を足した全体の長さは build() で決まる
  var RAIN_AT = 2.2; // 写真が降り始める時刻（最初のキャラクターが出たあと）
  var FV_H = 1540;
  var TITLE_FS = 300; // 大きくなったあとの「ABOUT」の文字サイズ(Figma上のpx)
  var TITLE_TOP = { y: -36 }; // 落ち着く位置（上）
  var STEPS = 5; // 全体の長さ（スクロール量の単位）。キャラクターの数に合わせて増える
  var tl = null;
  var built = false;

  // 1デザインpx = 何画面px か
  function unit() { return canvas.getBoundingClientRect().width / FV_W; }

  function build() {
    if (tl) {
      tl.scrollTrigger.kill();
      tl.kill();
      tl = null;
    }
    gsap.set([title].concat(photos), { clearProps: "transform" });
    gsap.set(chars.concat(drops), { clearProps: "transform,opacity" });

    var isSP = window.matchMedia && window.matchMedia("(max-width: 767px)").matches;
    var s = unit();
    var pinH = pin.clientHeight;
    var pinW = pin.clientWidth;
    var cRect = canvas.getBoundingClientRect();
    var pRect = pin.getBoundingClientRect();
    var canvasTop = cRect.top - pRect.top; // ピン内でのキャンバスの上端

    // 全体の長さ：キャラクターが増えれば長くなる
    // 最後に流れる文章の長さ（スクロール量）は、文章の高さに合わせる
    var credits = document.getElementById("js-about-credits");
    var creditLines = credits ? gsap.utils.toArray(credits.querySelectorAll(".js-credit-line")) : [];
    var unitPx = window.innerHeight * 0.85; // タイムライン1目盛りぶんのスクロール量
    var colH = credits ? credits.offsetHeight : 0;
    var creditsPx = colH + pinH * 0.9; // 文章が下から出きって、上へ消えきるまでのスクロール量
    var creditsT = creditsPx / unitPx; // それをタイムラインの長さにしたもの
    var endT = CREDITS_AT + creditsT + 0.4;
    var dist = unitPx * endT;
    fv.style.height = pinH + dist + "px";

    // 「ABOUT」：いまの位置(FVの左下)から、大きくなりながら中央へ
    var baseFs = parseFloat(window.getComputedStyle(title).fontSize) || 1;
    var scaleTo = (TITLE_FS * s) / baseFs;
    var tw = title.offsetWidth;
    function titleTo(yDesign) {
      return {
        x: (pinW - tw * scaleTo) / 2 - title.offsetLeft, // 横は画面の中央
        y: canvasTop + yDesign * s - title.offsetTop,
        scale: scaleTo
      };
    }
    gsap.set(title, { transformOrigin: "0 0" });

    tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      scrollTrigger: {
        trigger: fv,
        start: "top top",
        end: "+=" + dist,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          rainProgress = self.progress * (tl ? tl.duration() : 1);
          syncRain();
          // 「ABOUT」が画面の一番上に着いたら、ヘッダーを表示する（戻ったら、また隠す）
          document.body.classList.toggle("is-about-fv", rainProgress < TITLE_TOP_AT - 0.02);
        },
        onToggle: function (self) {
          rainVisible = self.isActive;
          syncRain();
        }
      }
    });

    // ① 0→1：FVの写真が上へ流れ去る／「ABOUT」が中央へ／最初のキャラクターが下からせり上がる
    photos.forEach(function (el, i) {
      var dir = i % 2 ? 1 : -1;
      tl.to(el, {
        y: -(pinH * (1.5 + (i % 3) * 0.25)),
        rotation: dir * (25 + (i % 4) * 12),
        duration: 0.9,
        ease: "power2.in"
      }, i * 0.06);
    });
    // 「ABOUT」は、大きくなりながら、画面の一番上まで移動する
    var top = titleTo(TITLE_TOP.y);
    tl.to(title, { x: top.x, y: top.y, scale: top.scale, duration: TITLE_TOP_AT }, 0);

    // 「ABOUT」が上に着いてから、最初のキャラクターが、画面の中(その場)からぽんと出てくる
    var c0 = chars[0];
    var c0Top = canvasTop + parseFloat(c0.style.getPropertyValue("--y")) * s; // ピン内での上端
    tl.fromTo(c0, { autoAlpha: 0, scale: 0.15 },
      { autoAlpha: 1, scale: 1, duration: 0.7, ease: "back.out(1.7)", transformOrigin: "50% 60%" },
      TITLE_TOP_AT);

    // スクロールすると、キャラクターが横にガタガタ震えながら、下へ下がっていく
    var shakes = 22;
    var amp = Math.max(8, 26 * s); // 震える幅(px)
    var kfx = [];
    var kfr = [];
    for (var k = 0; k < shakes; k++) {
      var sign = k % 2 ? 1 : -1;
      var mag = 0.55 + ((k * 7) % 5) * 0.12; // 震えの大きさに少しばらつき
      kfx.push({ x: sign * amp * mag, duration: 1 });
      kfr.push({ rotation: sign * 2.2 * mag, duration: 1 });
    }
    tl.to(c0, { keyframes: kfx, ease: "none", duration: SHAKE_DUR }, SHAKE_AT);
    tl.to(c0, { keyframes: kfr, ease: "none", duration: SHAKE_DUR }, SHAKE_AT);
    tl.to(c0, { y: pinH - c0Top + 60, ease: "power1.in", duration: SHAKE_DUR }, SHAKE_AT);

    // ③ FVの写真は、スクロールとは関係なく、3Dで回転しながら上から下へ「無限に」降り続ける（下で作る）
    buildRain(s, pinH, canvasTop, isSP);
    // ④ 映画のエンディングのように、文章が下から出てきて、上へ流れながら小さくなって消えていく
    if (credits && creditLines.length) {
      var yV = canvasTop + 260 * s; // 消えていく先（「ABOUT」の下あたり）
      var span = pinH - yV;
      var centers = creditLines.map(function (el) { return el.offsetTop + el.offsetHeight / 2; }); // 文章の並びの中での中心
      credits.classList.add("is-ready");
      var clamp = gsap.utils.clamp(0, 1);
      var proxy = { p: 0 };
      var applyCredits = function () {
        var top0 = pinH + 40 - proxy.p * (colH + pinH * 0.95); // 文章の並びの上端(画面上)
        for (var k = 0; k < creditLines.length; k++) {
          var yc = top0 + centers[k];
          var qn = (yc - yV) / span; // 0=消える位置 / 1=画面の下
          var el = creditLines[k];
          if (qn > 1.15 || qn < -0.02) {
            gsap.set(el, { autoAlpha: 0 });
            continue;
          }
          var shrink = clamp(qn / 0.7);
          var scale = 0.18 + 0.82 * Math.pow(shrink, 0.9); // 上へいくほど小さく
          var alpha = clamp((1.15 - qn) / 0.15) * clamp(qn / 0.16); // 下から現れ、上で消える
          var yDisp = yV + span * Math.pow(Math.max(qn, 0), 1.45); // 上ほど間隔がつまる（奥へ遠ざかる感じ）
          gsap.set(el, { y: yDisp - centers[k], scale: scale, autoAlpha: alpha });
        }
      };
      gsap.set(creditLines, { transformOrigin: "50% 50%" });
      applyCredits();
      tl.to(proxy, { p: 1, duration: creditsT, ease: "none", onUpdate: applyCredits }, CREDITS_AT);
    }

    // 全体の長さをそろえる（最後に少し間を置く）
    tl.to({}, { duration: Math.max(0.01, endT - tl.duration()) });
    built = true;
  }

  // ---- 無限に降り続ける写真 ----
  // 各写真が、画面の上の外 → 下の外へ、右回り/左回りに回転しながら(3D)降り、終わったら上から繰り返す。
  // 表示するのはストーリーが進んでいる間だけ。画面に見えていない間は止めて負荷を減らす
  var rain = []; // {tween, el}
  var rainOn = false;
  function killRain() {
    rain.forEach(function (r) { r.tween.kill(); r.sway.kill(); });
    rain = [];
  }
  function buildRain(s, pinH, canvasTop, isSP) {
    killRain();
    gsap.set(drops, { clearProps: "transform,opacity" });
    drops.forEach(function (el, i) {
      // 横の位置：PCは散らばる位置、スマホはスマホ用の位置(data-spx)をそのまま列として使う
      if (el.__pcx === undefined) {
        el.__pcx = parseFloat(el.style.getPropertyValue("--x"));
        el.__pcy = parseFloat(el.style.getPropertyValue("--y"));
      }
      var x = el.__pcx;
      if (isSP && el.getAttribute("data-spx") !== null) x = parseFloat(el.getAttribute("data-spx"));
      el.style.setProperty("--x", x);
      el.style.setProperty("--y", 0);
      var h = el.offsetHeight || 100 * s;
      var top0 = canvasTop; // --y=0 のときの、ピン内での上端
      var dir = i % 2 ? 1 : -1; // 右回り / 左回り
      var rot = parseFloat(el.getAttribute("data-rot")) || 240;
      var dur = 6.5 + (i % 4) * 1.6; // 1枚ごとに速さが違う
      gsap.set(el, { transformPerspective: 700, transformOrigin: "50% 50%" });
      var t = gsap.fromTo(el,
        { y: -(top0 + h + 40), rotation: 0, rotationX: 0, rotationY: 0 },
        {
          y: pinH - top0 + 40,
          rotation: dir * Math.abs(rot),
          rotationX: dir * 360,
          rotationY: -dir * 300,
          duration: dur,
          ease: "none",
          repeat: -1,
          paused: true
        });
      t.progress((i * 0.37) % 1); // 最初から画面のあちこちにいるよう、位置をずらす
      // ふらふら左右にゆれる
      var sway = gsap.to(el, { x: (i % 2 ? 1 : -1) * 28 * s * (1 + (i % 3) * 0.4), duration: 2 + (i % 3) * 0.7, ease: "sine.inOut", yoyo: true, repeat: -1, paused: true });
      rain.push({ tween: t, sway: sway, el: el });
    });
    gsap.set(drops, { autoAlpha: 0 });
    rainOn = false;
    syncRain();
  }
  var rainVisible = true; // ストーリーの部分が画面に見えているか
  var rainProgress = 0; // タイムライン上の現在時刻
  function syncRain() {
    var on = rainProgress >= RAIN_AT;
    rain.forEach(function (r) {
      if (on && rainVisible) { r.tween.play(); r.sway.play(); } else { r.tween.pause(); r.sway.pause(); }
    });
    if (on !== rainOn) {
      rainOn = on;
      gsap.to(drops, { autoAlpha: on ? 1 : 0, duration: 0.6, overwrite: "auto" });
    }
  }

  // 写真のイントロが終わってから作る（位置の測り直しを避けるため、ページ読み込み後に一度だけ）
  function init() {
    build();
    ScrollTrigger.refresh();
  }
  if (document.readyState === "complete") init();
  else window.addEventListener("load", init);

  var resizeTimer;
  var lastW = window.innerWidth;
  window.addEventListener("resize", function () {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      if (built) { build(); ScrollTrigger.refresh(); }
    }, 200);
  });
})();
