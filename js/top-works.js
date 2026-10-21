(function () {
  "use strict";

  // TOPのWORKSセクション（Figma「top_worksセクション1〜4」）
  // 1. 画面に入ってきたら「デザインで課題解決」→手描きの線を自動で再生する(イントロ)
  // 2. スクロールすると、線の上に薄いグレーの膜がかぶさる
  // 3. 続けてスクロールすると、文言のリストが下から上へ動き、1つずつ表示される
  // 4. さらにスクロールすると、実績カード3枚が横並びで現れる(左右のボタンでスライド)
  // 5. 最後に、右下に「View more」が現れる
  // 2〜5はスクロール量にそのまま連動させる(上へスクロールすればそのまま逆に戻る)。
  // その間、画面はposition:stickyで固定したままにする

  var section = document.getElementById("js-top-works");
  var pin = document.getElementById("js-top-works-pin");
  var path = document.getElementById("js-top-works-path");
  var slidesWrap = document.getElementById("js-top-works-slides");
  var slides = slidesWrap ? Array.prototype.slice.call(slidesWrap.querySelectorAll(".top-works-slide")) : [];
  var veil = document.getElementById("js-top-works-veil");
  var cardsWrap = document.getElementById("js-top-works-cards");
  var cardEls = cardsWrap ? Array.prototype.slice.call(cardsWrap.querySelectorAll(".top-works-card")) : [];
  var prevBtn = document.getElementById("js-top-works-prev");
  var nextBtn = document.getElementById("js-top-works-next");
  var ctaWrap = document.getElementById("js-top-works-cta");
  if (!section || !pin || !path) return;

  var hasGsap = typeof window.gsap !== "undefined";
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // スクロール連動の演出は、GSAPがあり、prefers-reduced-motionでないときだけ行う
  // （画面固定自体はCSSのposition:stickyで行うので、ScrollTriggerプラグインは不要）。
  // それ以外（フォールバック）は、css/top-works.css側の基本スタイルで全部を普通に縦並びで見せる
  var useScene = hasGsap && !reduceMotion && slides.length > 0 && !!veil && !!cardsWrap && !!ctaWrap;

  function isSP() {
    return window.matchMedia && window.matchMedia("(max-width: 767px)").matches;
  }
  function clamp01(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
  }

  // ---- イントロ(文言0→線) ----
  // 画面に入ってきたら自動で最後まで再生する（スクロール量には連動させない）。
  // 再生中はスクロールを止める(wheel/touchmove/キー操作をブロックする)。
  // ※ bodyにoverflow:hiddenは使わない（position:stickyが効かなくなるため。sass/style.scss参照）
  var sceneActive = false; // イントロが終わって、スクロール連動を始めてよいか

  var introLocked = false;
  var introLockTimer = null;
  var introLockY = 0; // イントロ中に止めておく位置(セクションの先頭)
  var INTRO_LOCK_MAX = 15000; // ms。万一、終了の合図が来なかったときの保険(イントロは約9秒)
  function blockScroll(e) {
    if (e.cancelable) e.preventDefault();
  }
  function blockScrollKey(e) {
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if ([32, 33, 34, 35, 36, 38, 40].indexOf(e.keyCode) !== -1) blockScroll(e);
  }
  // 勢いよくスクロールしてきたときは、ロックした後も慣性・スムーズスクロールの続き
  // (wheelイベントを伴わないもの)やnormalizeScrollの動きで位置が進んでしまい、
  // セクションを通過したところで止まって見える。ロック中は、ずれたら毎回先頭へ戻す
  function holdIntroScroll() {
    if (Math.abs(window.pageYOffset - introLockY) > 1) window.scrollTo(0, introLockY);
  }
  function lockIntroScroll() {
    if (introLocked) return;
    introLocked = true;
    window.addEventListener("wheel", blockScroll, { passive: false });
    window.addEventListener("touchmove", blockScroll, { passive: false });
    window.addEventListener("keydown", blockScrollKey);
    // 画面に入ってきたときの慣性スクロールの勢いをここで止め、セクションの先頭にぴったり合わせる
    // （画面はposition:stickyで固定されているので、見た目は変わらない）
    introLockY = sectionTopAbs();
    holdIntroScroll();
    window.addEventListener("scroll", holdIntroScroll, { passive: true });
    introLockTimer = window.setTimeout(unlockIntroScroll, INTRO_LOCK_MAX);
  }
  function unlockIntroScroll() {
    if (!introLocked) return;
    introLocked = false;
    window.clearTimeout(introLockTimer);
    window.removeEventListener("wheel", blockScroll, { passive: false });
    window.removeEventListener("touchmove", blockScroll, { passive: false });
    window.removeEventListener("keydown", blockScrollKey);
    window.removeEventListener("scroll", holdIntroScroll, { passive: true });
  }

  function setup() {
    var total = path.getTotalLength();
    path.style.strokeDasharray = String(total);
    path.style.strokeDashoffset = String(total);
    return total;
  }

  function slideParts(slide) {
    return {
      en: slide.querySelector(".top-works-slide-en"),
      ja: slide.querySelector(".top-works-slide-ja"),
    };
  }

  // イントロ(文言0「デザインで課題解決」→線)。画面に入ってきたら最後まで自動で再生する
  function reveal() {
    var total = setup();

    if (reduceMotion || !hasGsap) {
      path.style.opacity = "1";
      path.style.strokeDashoffset = "0";
      return; // 文言・カードはCSS側の基本スタイルで最初から全部見えている
    }

    lockIntroScroll();
    var tl = window.gsap.timeline();

    // 1. まず「デザインで課題解決」(スライド0)を、日本語→英語の順で表示する
    if (slides[0]) {
      var introParts = slideParts(slides[0]);
      tl.to(introParts.ja, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" });
      tl.to(introParts.en, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, "<+0.22");
    }

    // 2. 続いて、線(SVG)を描いていく。線はopacity:0で隠してあるので、
    //    描かれ始めの少し手前でフェードインさせておく
    tl.to(path, { opacity: 1, duration: 1.6, ease: "power1.out" }, "+=0.45");
    // 描画は1本の一定速度ではなく、「ゆっくり→速く→またゆっくり」と手描き感のある
    // 速度変化をつけるため、strokeDashoffsetを3段に分けてアニメーションする
    tl.to(path, { strokeDashoffset: total * 0.65, duration: 2.5, ease: "power2.in" }, "<"); // ゆっくり出だし→徐々に加速
    tl.to(path, { strokeDashoffset: total * 0.2, duration: 1.6, ease: "none" }); // 中盤は一定ペース
    tl.to(path, { strokeDashoffset: 0, duration: 2.6, ease: "power2.out" }); // 終盤は減速してゆっくり描き終える
    // 3. 線が描き終わったら、背景として少し薄く落ち着かせる
    tl.to(path, { opacity: 0.6, duration: 0.9, ease: "power1.out" }, "+=0.3");

    // 全部表示し終わったら、スクロール連動を始める
    tl.call(function () {
      unlockIntroScroll();
      activateScene();
    });
  }

  var started = false;
  function start() {
    if (started) return;
    started = true;
    // 基準位置(スクロール量0)は、ページ読み込み直後ではなく、ここ(pinの上端が画面上端に
    // 到達した瞬間)に測る。FVのピン留め(message-scroll.js)が後からページの高さを伸ばすため、
    // 先に測っておくと値が古くなってズレる
    carouselTop = sectionTopAbs();
    reveal();
  }

  // 監視対象は.top-works-pin（常にビューポート1つぶんの高さ=100vh）にする。
  // 判定は「交差率がほぼ1」ではなく「pinの上端がビューポート上端にほぼ到達したか」で行う
  // （スマホはアドレスバーの出入りで、交差率が1に届かないことがあるため）
  var TOP_TOLERANCE = 2; // px
  function checkStart() {
    if (started) return;
    var top = pin.getBoundingClientRect().top;
    if (top <= TOP_TOLERANCE && top > -window.innerHeight) start();
  }
  var io = null;
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && en.boundingClientRect.top <= TOP_TOLERANCE) {
            start();
            io.disconnect();
          }
        });
      },
      { threshold: [0, 0.25, 0.5, 0.75, 0.9, 0.98, 1] }
    );
    io.observe(pin);
  }
  // 交差率のthresholdをまたいだときしかコールバックが呼ばれないため、スクロールのたびにも
  // 直接位置を確認する（IntersectionObserverに未対応の古いブラウザでは、こちらだけで判定する）
  var scrollCheckTicking = false;
  window.addEventListener(
    "scroll",
    function () {
      if (started || scrollCheckTicking) return;
      scrollCheckTicking = true;
      window.requestAnimationFrame(function () {
        scrollCheckTicking = false;
        checkStart();
        if (started && io) io.disconnect();
      });
    },
    { passive: true }
  );

  // ======================================================================
  // スクロール連動（膜→文言→実績カード→View more）
  // ======================================================================
  var carouselTop = 0; // セクションの先頭(スクロール量0の基準位置)
  var stepDist = 0; // 1区切りぶんのスクロール量
  var veilStart = 0;
  var veilEnd = 0;
  var listStart = 0;
  var listEnd = 0;
  var cardsStart = 0;
  var cardsEnd = 0;
  var totalDist = 0;
  var pinH = 0;
  var slotTop = 0; // 文言リストの、ピン上端からの位置(動かす前)
  var captionTops = [];
  var captionHs = [];
  var listTravel = 0; // 文言リストを上へ動かす合計距離
  var introOffset = 0; // イントロ終了時点で、セクション先頭からすでに進んでいた量

  function sectionTopAbs() {
    return section.getBoundingClientRect().top + window.pageYOffset;
  }
  function relY() {
    return window.pageYOffset - carouselTop;
  }

  // スクロール量(セクション先頭からの距離)に応じた見た目にする
  function render(y) {
    if (!useScene) return;

    // 2. 薄いグレーの膜
    var veilP = clamp01((y - veilStart) / (veilEnd - veilStart));
    veil.style.opacity = veilP.toFixed(3);

    // 3. 文言のリストを上へ動かす。各文言は、画面の下から入ってくるときにフェードインし、
    //    画面の上へ抜けていくときにフェードアウトする
    var listP = clamp01((y - listStart) / (listEnd - listStart));
    var t = -listTravel * listP;
    slidesWrap.style.transform = "translate3d(0," + t.toFixed(1) + "px,0)";
    for (var k = 0; k < slides.length; k++) {
      var top = slotTop + captionTops[k] + t;
      var bottom = top + captionHs[k];
      // 2つ目以降は、膜と一緒に出てくる（最初は「デザインで課題解決」だけを見せる）
      var inO = k === 0 ? 1 : clamp01((pinH - top) / (pinH * 0.22)) * veilP;
      var outO = clamp01(bottom / (pinH * 0.12));
      slides[k].style.opacity = Math.min(inO, outO).toFixed(3);
    }

    // 4〜5. スマホ：実績カードとView moreは、文言のリストに続いて、スクロールに合わせて下から
    //      上がってくる(指と1:1)。上がってくる途中でふわっと現れ、カードが画面の中央に来たところで
    //      表示しきる
    if (spLayout) {
      var rise = listTravel * (1 - listP);
      var cardCenter = spCardsTop + spImgH / 2 + rise;
      var spO = clamp01((pinH * 0.9 - cardCenter) / (pinH * 0.4)) * veilP;
      cardsWrap.style.opacity = spO.toFixed(3);
      cardsWrap.style.transform = "translate3d(0," + rise.toFixed(1) + "px,0)";
      cardsWrap.style.pointerEvents = spO > 0.95 ? "auto" : "none";
      var spCtaO = clamp01((spO - 0.7) / 0.3);
      ctaWrap.style.opacity = spCtaO.toFixed(3);
      ctaWrap.style.transform = "translate3d(0," + rise.toFixed(1) + "px,0)";
      ctaWrap.style.pointerEvents = spCtaO > 0.95 ? "auto" : "none";
      return;
    }

    // 4. 実績カード（少し下からフェードイン）
    var cardsP = clamp01((y - cardsStart) / (cardsEnd - cardsStart));
    cardsWrap.style.opacity = cardsP.toFixed(3);
    cardsWrap.style.transform = "translate3d(0," + ((1 - cardsP) * 50).toFixed(1) + "px,0)";
    cardsWrap.style.pointerEvents = cardsP > 0.95 ? "auto" : "none";

    // 5. View more（カードが出きる少し手前から）
    var ctaP = clamp01((cardsP - 0.55) / 0.45);
    ctaWrap.style.opacity = ctaP.toFixed(3);
    ctaWrap.style.transform = "translate3d(0," + ((1 - ctaP) * 20).toFixed(1) + "px,0)";
    ctaWrap.style.pointerEvents = ctaP > 0.95 ? "auto" : "none";
  }

  // イントロが終わったら、スクロール連動を始める。
  // 画面に入ってきたときの慣性スクロールなどで、イントロ中に少し下まで進んでいた場合も、
  // いきなり膜や文言を出さないよう、イントロが終わった時点の位置を「スクロール量0」として数え直す
  // （そのぶんセクションの高さも伸ばす）。スクロールし始めてから、膜→文言の順に出てくる
  function activateScene() {
    sceneActive = true;
    if (!useScene) return;
    var y = window.pageYOffset - sectionTopAbs();
    introOffset = y > 0 && y < totalDist ? y : 0;
    buildScene();
    updateSnap();
  }

  var sceneTicking = false;
  window.addEventListener(
    "scroll",
    function () {
      if (!started || !sceneActive || sceneTicking) return;
      sceneTicking = true;
      window.requestAnimationFrame(function () {
        sceneTicking = false;
        render(relY());
        updateSnap();
      });
    },
    { passive: true }
  );

  // ---- 実績カードのスライダー ----
  // 4枚を中央に重ねて置き、「中央(0)・左(-1)・右(+1)・隠れている(±2)」の位置へtransformで動かす。
  // 最初はFigma通り、左：訪問看護ステーション 中川／中央：武蔵家 松戸店／右：portfolio
  var cardIdx = 1;
  var cardW = 0;
  var cardSideDist = 0;
  var cardVis = []; // 各カードの今の見た目の位置
  function cardOffset(i) {
    var n = cardEls.length;
    var o = (((i - cardIdx) % n) + n) % n;
    if (o > n / 2) o -= n;
    return o;
  }
  function cardTransform(v) {
    var a = Math.abs(v);
    var x = v * cardSideDist;
    var yy = a === 0 ? 0 : cardW * 0.03;
    var s = a === 0 ? 1 : a === 1 ? 0.8 : 0.7;
    var r = a === 0 ? 0 : v < 0 ? -0.6 : 0.6;
    return (
      "translate(-50%,-50%) translate3d(" + x.toFixed(1) + "px," + yy.toFixed(1) + "px,0) rotate(" + r + "deg) scale(" + s + ")"
    );
  }
  function applyCards() {
    cardEls.forEach(function (el, i) {
      var o = cardOffset(i);
      var last = cardVis[i];
      var v;
      if (Math.abs(o) <= 1) {
        v = o;
      } else {
        // 隠れるときは、出ていった側(左なら左、右なら右)の外へ消える
        v = last !== undefined && last < 0 ? -2 : 2;
      }
      if (last !== undefined && Math.abs(v - last) > 1.5) {
        // 反対側から入ってくるときは、画面を横切らないよう、入ってくる側の外へ一瞬で移してから動かす
        el.classList.add("is-instant");
        el.style.transform = cardTransform(v > 0 ? v + 1 : v - 1);
        el.style.opacity = "0";
        void el.offsetWidth;
        el.classList.remove("is-instant");
      }
      el.style.transform = cardTransform(v);
      el.style.opacity = Math.abs(v) <= 1 ? "1" : "0";
      el.style.zIndex = String(3 - Math.abs(v));
      // 見えているカードは""(親の.top-works-cardsに従う)にする。"auto"にすると、カードが
      // まだ透明で出ていない間(親がpointer-events:none)も、タップでモーダルが開いてしまう
      el.style.pointerEvents = Math.abs(v) <= 1 ? "" : "none";
      el.setAttribute("tabindex", Math.abs(v) <= 1 ? "0" : "-1");
      cardVis[i] = v;
    });
  }
  // カードを置く範囲は、画面の高さに対する割合ではなく、実際の寸法から決める。
  // 上端は「最後の文言(画面上部に来たとき)の下」、下端は「View moreの上」にして、その間に収まる
  // 大きさでカードを表示する。こうすると、画面の縦が低くても、文言・カード・View moreが重ならず、
  // カードが必ず見える
  var CARD_MIN_AREA = 72; // px。これより狭くはしない
  var captionFinalBottom = 0; // 最後の文言が画面上部に来たときの下端(ピン上端から)
  var spLayout = false; // スマホのレイアウト(カードが下から上がってきて画面中央で止まる)か
  var spCardsTop = 0; // スマホ：カード(画像)の最終的な上端
  var spImgH = 0; // スマホ：カード画像の高さ
  var spNameH = 24;
  var spGap = 10;
  function layoutCards() {
    var sp = isSP();
    var gap = Math.max(10, Math.round(pinH * 0.025));
    var ctaH = ctaWrap.offsetHeight;
    var nameEl = cardEls[cardIdx] ? cardEls[cardIdx].querySelector(".top-works-card-name") : null;
    var nameH = nameEl ? nameEl.offsetHeight + 6 : 24;

    if (sp) {
      // スマホ：カードの画像の中心が画面の中央に来る位置(spCardsTop。buildSceneで計算)に置き、
      // View moreはそのすぐ下に置く
      cardW = spImgH * 1.5;
      cardSideDist = cardW * 0.98;
      cardsWrap.style.top = Math.round(spCardsTop) + "px";
      cardsWrap.style.height = Math.round(spImgH) + "px";
      ctaWrap.style.top = Math.round(spCardsTop + spImgH + spNameH + spGap) + "px";
      ctaWrap.style.bottom = "auto";
    } else {
      ctaWrap.style.top = "";
      ctaWrap.style.bottom = "";
    }
    var areaTop = captionFinalBottom + gap;
    var areaBottom;
    if (sp) {
      // スマホは、View moreを画面の下から60px(CSSのbottom)に置き、カードはそのすぐ上に置く
      var spCtaBottom = parseFloat(window.getComputedStyle(ctaWrap).bottom) || 60;
      areaBottom = pinH - spCtaBottom - ctaH - gap;
    } else {
      var ctaBottom = parseFloat(window.getComputedStyle(ctaWrap).bottom) || pinH * 0.05;
      areaBottom = pinH - ctaBottom - ctaH - gap;
    }
    if (!sp) {
      var areaH = Math.max(CARD_MIN_AREA, areaBottom - areaTop);
      var areaW = cardsWrap.clientWidth;
      var imgH = Math.max(40, areaH - nameH - 6);
      // 大きさの上限は、以前の見た目(画像の高さ＝画面の高さの約38%)と同じにする。
      // 縦が低い画面では、置ける範囲(imgH)に合わせてそれより小さくなる
      var maxImgH = pinH * 0.377;
      cardW = Math.min(areaW * 0.5, Math.min(imgH, maxImgH) * 1.5);
      cardSideDist = cardW * 0.96;
      cardsWrap.style.top = Math.round(areaTop) + "px";
      cardsWrap.style.height = Math.round(areaH) + "px";
    }
    cardEls.forEach(function (el) {
      el.style.width = cardW.toFixed(1) + "px";
      // 画像の高さも指定しておく(3:2)。aspect-ratioに未対応の古いブラウザでも高さが揃うように
      var img = el.querySelector("img");
      if (img) img.style.height = (cardW / 1.5).toFixed(1) + "px";
    });
    cardEls.forEach(function (el) {
      el.classList.add("is-instant");
    });
    applyCards();
    void cardsWrap.offsetWidth;
    cardEls.forEach(function (el) {
      el.classList.remove("is-instant");
    });
  }
  if (prevBtn && nextBtn && cardEls.length > 1) {
    prevBtn.addEventListener("click", function () {
      cardIdx = (cardIdx - 1 + cardEls.length) % cardEls.length;
      applyCards();
    });
    nextBtn.addEventListener("click", function () {
      cardIdx = (cardIdx + 1) % cardEls.length;
      applyCards();
    });
  }

  // ---- 実績カードの部分だけ、1回のスクロールで1区切りずつ止める ----
  // イントロ・膜・文言のリストは、普通のスクロールでなめらかに動かす（止めない）。
  // 止まる位置(snapAll)は、文言を表示し終えた位置(カードが出る直前)とカードが出きった位置の2つ。
  // カードのあとABOUTへは、一気に飛ばさず普通のスクロールで移っていく。
  // ・スマホ(タッチ)：ブラウザ標準のスクロールスナップを使う。止まる位置ごとに目印(.top-works-snap)を
  //   置き、カードの部分にいる間だけhtmlにscroll-snap-type: y mandatoryを付ける。目印はscroll-snap-stop:
  //   alwaysなので、勢いよくフリックしても飛ばさず、次の位置で必ず止まる。スクロールのロック
  //   (touchmoveのpreventDefault)は使わないので、スマホでスクロールできなくなる不具合は起きない
  // ・PC(ホイール)：標準のスナップは「1回のホイールの移動量に一番近い位置」に吸着するため、
  //   間隔が広いと元の位置に戻されて進めない。そこでホイールだけはJSで受け取り、
  //   1回の操作で次の位置までスクロールさせて止める（ABOUTセクションと同じ考え方）
  // 範囲の外(文言の部分・カードより下)へは、普通のスクロールでそのまま出られる
  var useCssSnap = !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
  var snapEls = [];
  var snapAll = []; // セクション先頭からの距離(px)
  var snapOn = false;
  var SNAP_EDGE = 4; // px
  function buildSnapPoints() {
    snapEls.forEach(function (el) {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
    snapEls = [];
    snapAll = [Math.round(cardsStart), Math.round(cardsEnd)];
    snapAll.forEach(function (off) {
      var el = document.createElement("div");
      el.className = "top-works-snap";
      el.setAttribute("aria-hidden", "true");
      el.style.top = introOffset + off + "px";
      section.appendChild(el);
      snapEls.push(el);
    });
  }
  function updateSnap() {
    if (!useCssSnap || !useScene) return;
    // スマホのレイアウトでは、カードもスクロールに合わせて上がってくるので、吸着して止める処理は使わない
    if (spLayout) {
      if (snapOn) {
        snapOn = false;
        document.documentElement.classList.remove("is-works-snap");
      }
      return;
    }
    // カードの部分の外へ出たらすぐ外し、文言の部分やABOUTへは普通にスクロールできるようにする
    var y = relY();
    var want =
      sceneActive && snapAll.length > 0 && y >= snapAll[0] - SNAP_EDGE && y <= snapAll[snapAll.length - 1] + SNAP_EDGE;
    if (want === snapOn) return;
    snapOn = want;
    document.documentElement.classList.toggle("is-works-snap", want);
  }

  var WHEEL_THRESHOLD = 30;
  var WHEEL_COOLDOWN = 350; // ms。移動し終えた直後に届く、慣性の続きのホイールは捨てる
  var wheelAcc = 0;
  var wheelReadyAt = 0;
  var stepTween = null;
  window.addEventListener(
    "wheel",
    function (e) {
      if (useCssSnap || !useScene || !sceneActive) return;
      var y = relY();
      if (!snapAll.length || y < snapAll[0] - SNAP_EDGE || y > snapAll[snapAll.length - 1] + SNAP_EDGE) return;
      if (Math.abs(e.deltaY) < 1) return;
      var dir = e.deltaY > 0 ? 1 : -1;
      var target = -1;
      if (dir > 0) {
        for (var i = 0; i < snapAll.length; i++) {
          if (snapAll[i] > y + SNAP_EDGE) {
            target = i;
            break;
          }
        }
      } else {
        for (var j = snapAll.length - 1; j >= 0; j--) {
          if (snapAll[j] < y - SNAP_EDGE) {
            target = j;
            break;
          }
        }
      }
      if (target === -1) return; // 範囲の外へは普通にスクロールさせる
      e.preventDefault();
      if (stepTween || Date.now() < wheelReadyAt) {
        wheelAcc = 0;
        return;
      }
      if (wheelAcc * dir < 0) wheelAcc = 0;
      wheelAcc += e.deltaY;
      if (Math.abs(wheelAcc) < WHEEL_THRESHOLD) return;
      wheelAcc = 0;
      scrollToRel(snapAll[target]);
    },
    { passive: false }
  );
  function scrollToRel(rel) {
    var proxy = { y: window.pageYOffset };
    stepTween = window.gsap.to(proxy, {
      y: carouselTop + rel,
      duration: 0.8,
      ease: "power2.inOut",
      onUpdate: function () {
        window.scrollTo(0, proxy.y);
      },
      onComplete: function () {
        stepTween = null;
        wheelReadyAt = Date.now() + WHEEL_COOLDOWN;
      },
    });
  }
  // PCで、文言の部分から普通のスクロールのまま、カードが出かけの中途半端な位置で止まったときは、
  // 近いほうの止まる位置(カードが出る直前／出きった位置)へなめらかに寄せる
  var settleTimer = null;
  window.addEventListener(
    "scroll",
    function () {
      if (useCssSnap || !useScene || !sceneActive) return;
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(function () {
        if (stepTween || snapAll.length < 2) return;
        var y = relY();
        var a = snapAll[0];
        var b = snapAll[1];
        if (y > a + SNAP_EDGE && y < b - SNAP_EDGE) scrollToRel(y - a < b - y ? a : b);
      }, 200);
    },
    { passive: true }
  );

  // WORKSの高さが変わると、その下のセクション(ABOUTなど)の位置もずれる。ABOUTはScrollTriggerで
  // 位置を測っているため、測り直さないと、まだWORKSにいるうちにABOUT側の「段階ごとに進める・
  // 近くの段階へ吸い寄せる」処理が動き出し、勝手にABOUTへスクロールしてしまう。
  // WORKSより下にあるものだけを測り直す（FVのピン留めまで測り直すと画面が飛ぶことがあるため）
  var lastSectionH = 0;
  function refreshFollowingTriggers() {
    if (!window.ScrollTrigger || !window.ScrollTrigger.getAll) return;
    window.requestAnimationFrame(function () {
      window.ScrollTrigger.getAll().forEach(function (t) {
        var el = t.trigger;
        if (el && el.nodeType === 1 && section.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) {
          t.refresh();
        }
      });
    });
  }

  // View moreの右端を、ABOUTセクションの「もっと知る」ボタン(js-about-more-top)の右端に揃える
  var aboutMoreTop = document.getElementById("js-about-more-top");
  // 画面右下に固定されている「おしながき」ボタンと縦の位置が重なるときは、その左に逃がす
  var menuBtn = document.querySelector(".hamburger");
  function alignCta() {
    var vw = document.documentElement.clientWidth;
    var right = 16;
    if (aboutMoreTop) {
      var gap = Math.round(vw - aboutMoreTop.getBoundingClientRect().right);
      if (gap > 0) right = Math.max(16, gap);
    }
    if (menuBtn) {
      var m = menuBtn.getBoundingClientRect();
      var ctaH = ctaWrap.offsetHeight;
      var ctaTop = ctaWrap.style.top
        ? parseFloat(ctaWrap.style.top)
        : pinH - (parseFloat(window.getComputedStyle(ctaWrap).bottom) || 0) - ctaH;
      if (m.width > 0 && m.left > vw / 2 && ctaTop + ctaH > m.top - 8 && ctaTop < m.bottom + 8) {
        right = Math.max(right, Math.round(vw - m.left + 12));
      }
    }
    ctaWrap.style.right = right + "px";
    ctaWrap.style.left = "";
    // スマホは、View moreの左端を、ABOUTセクションの「もっと知る」ボタンの左端に揃える
    if (isSP() && aboutMoreTop) {
      var aboutLeft = Math.round(aboutMoreTop.getBoundingClientRect().left);
      if (aboutLeft > 0) {
        ctaWrap.style.left = aboutLeft + "px";
        ctaWrap.style.right = "auto";
      }
    }

    // 右の「>」ボタンも、「おしながき」ボタンと縦の位置が重なるときは、その左に逃がす
    if (nextBtn && menuBtn) {
      nextBtn.style.right = "";
      var mb = menuBtn.getBoundingClientRect();
      var bh = nextBtn.offsetHeight;
      var btnTop = cardsWrap.offsetTop + cardsWrap.offsetHeight / 2 - bh / 2;
      if (mb.width > 0 && mb.left > vw / 2 && btnTop + bh > mb.top - 8 && btnTop < mb.bottom + 8) {
        nextBtn.style.right = Math.round(vw - mb.left + 12) + "px";
      }
    }
  }

  // ---- 寸法の計算 ----
  function buildScene() {
    if (!useScene) return;

    section.classList.add("is-sticky");

    // 文言リストは「デザインで課題解決」の高さぶんだけ場所を取り、残りはその下(画面の外)に続ける
    slidesWrap.style.transform = "";
    slidesWrap.style.height = slides[0].offsetHeight + "px";

    pinH = pin.offsetHeight;
    slotTop = slidesWrap.getBoundingClientRect().top - pin.getBoundingClientRect().top;
    captionTops = slides.map(function (s) {
      return s.offsetTop;
    });
    captionHs = slides.map(function (s) {
      return s.offsetHeight;
    });
    // 最後の文言が画面の上の方(Figma「セクション4」の位置)に来るまで、リストを上へ動かす
    var targetTop = Math.max(12, pinH * (isSP() ? 0.08 : 0.07));
    spLayout = isSP();
    if (spLayout) {
      // スマホ：カードの画像の中心が画面の中央に来るように置き、最後の文言はそのすぐ上で止める
      spGap = Math.max(10, Math.round(pinH * 0.025));
      var spNameEl = cardEls[cardIdx] ? cardEls[cardIdx].querySelector(".top-works-card-name") : null;
      spNameH = spNameEl ? spNameEl.offsetHeight + 6 : 24;
      spImgH = Math.min((cardsWrap.clientWidth * 0.7) / 1.5, pinH * 0.328);
      spCardsTop = pinH / 2 - spImgH / 2;
      var lastH = captionHs[slides.length - 1];
      // 最後の文言とカードの間は、ゆったりめに空ける(画面の高さの6%・最低40px)
      var spCaptionGap = Math.max(40, Math.round(pinH * 0.06));
      targetTop = Math.max(12, spCardsTop - spCaptionGap - lastH);
      // 縦が低くて文言が収まりきらないときは、カードを文言の下までずらす
      spCardsTop = Math.max(spCardsTop, targetTop + lastH + spCaptionGap);
    }
    listTravel = Math.max(0, slotTop + captionTops[slides.length - 1] - targetTop);
    captionFinalBottom = targetTop + captionHs[slides.length - 1];

    stepDist = window.innerHeight * (isSP() ? 0.5 : 0.6);
    veilStart = stepDist * 0.15;
    veilEnd = stepDist;
    listStart = stepDist;
    listEnd = listStart + stepDist * (slides.length - 1);
    if (isSP()) {
      // スマホは、文言のリストが指の動きと同じだけ動く(1:1)ようにする。リストの移動距離より
      // スクロール量が長いと、指についてこず、引っかかって重く感じるため
      // 膜がかかり始めると同時に文言も動き出すようにして、最初から止まって感じる区間をなくす
      veilEnd = veilStart + stepDist * 0.6;
      listStart = veilStart;
      listEnd = listStart + Math.max(stepDist * 0.5, listTravel);
    }
    cardsStart = listEnd;
    cardsEnd = cardsStart + stepDist;
    totalDist = cardsEnd + stepDist * 0.5;
    if (spLayout) {
      // スマホは、カードは文言のリストと一緒に上がってきて、リストが止まると同時に表示しきる。
      // そのあと何も動かない区間が長いと重く感じるので、カードを見て押せるだけの短い余白にする
      cardsEnd = cardsStart + 1;
      totalDist = listEnd + stepDist * 0.6;
    }
    var newH = Math.round(pinH + totalDist + introOffset);
    section.style.height = newH + "px";
    if (newH !== lastSectionH) {
      lastSectionH = newH;
      refreshFollowingTriggers();
    }

    layoutCards();
    alignCta();
    buildSnapPoints();
    if (started) carouselTop = sectionTopAbs() + introOffset;
    render(sceneActive ? relY() : 0);
  }

  buildScene();

  // Googleフォント(display=swap)は非同期に読み込まれ、後から実際のフォントに置き換わる
  // （文字の高さ・行間が変わる）。読み込み完了が確認でき次第、正しいサイズで測り直す
  if (window.document.fonts && window.document.fonts.ready) {
    window.document.fonts.ready.then(function () {
      buildScene();
    });
  }

  var resizeTimer;
  var lastW = window.innerWidth;
  window.addEventListener("resize", function () {
    // SPのアドレスバー伸縮による高さだけの変化では作り直さない（PCは高さが変わっても作り直す。
    // 文字サイズなどを画面の高さに合わせて変えているため）
    if (window.innerWidth === lastW && isSP()) return;
    lastW = window.innerWidth;
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(buildScene, 200);
  });
})();
