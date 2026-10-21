(function () {
  "use strict";

  var section = document.getElementById("js-about");
  var pin = document.getElementById("js-about-pin");
  if (!section || !pin) return;
  if (document.documentElement.classList.contains("no-cq")) return; // 古いブラウザは静的表示
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);
  // スマホのアドレスバーの出入りによる高さの変化では、位置の測り直しをしない（途中で固定表示がずれるのを防ぐ）
  // limitCallbacks: 一度のスクロールで同じ場所を何度も通っても、コールバックは1回だけにして負荷を減らす
  ScrollTrigger.config({ ignoreMobileResize: true, limitCallbacks: true });

  var titleSpan = section.querySelector(".about-title span");
  var moreTop = document.getElementById("js-about-more-top");
  var face = document.getElementById("js-about-face");
  var lines = section.querySelectorAll(".js-about-line");
  // polylineの長さを、points属性の座標から計算する（getTotalLength()に未対応の古いブラウザでも動くように）
  function polylineLength(el) {
    var nums = (el.getAttribute("points") || "").trim().split(/[\s,]+/).map(parseFloat);
    var len = 0;
    for (var i = 2; i + 1 < nums.length; i += 2) {
      len += Math.sqrt(Math.pow(nums[i] - nums[i - 2], 2) + Math.pow(nums[i + 1] - nums[i - 1], 2));
    }
    return len || 1;
  }
  var labels = section.querySelectorAll(".js-about-label");
  var caption = document.getElementById("js-about-caption");
  var note = document.getElementById("js-about-note");
  var q1 = document.getElementById("js-about-q1");
  var q2 = document.getElementById("js-about-q2");
  var wonders = section.querySelectorAll(".js-about-wonder");
  var moreLarge = document.getElementById("js-about-more-large");
  var moreLine = document.getElementById("js-about-more-line"); // 「VIEW MORE」を囲む手描きの線
  var moreLineLen = 0;

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  var facePart = [face, lines, labels, caption, note];
  var GREY = 0.08; // 「グレーアウト」した状態の不透明度（黒→薄いグレー）

  // 各ステップ（スクロール1回で進む単位＝要素1つ）の終わりに置くラベル名。build()で埋める。
  // ラベルの位置＝そのステップが完了した時点のスクロール位置になる
  var STEP_LABELS = [];
  // 「順番に続けて表示する」ステップ（吹き出し・「まだかな？」等）の番号。ここへの移動/ここからの移動は、一定の速さ(イージングなし)にする
  var SEQ_STEPS = [];
  // ステップ間の移動にかける時間は「タイムライン上の長さ × この倍率」。大きいほどゆっくり
  var SLOW = 1;

  // ステップ数（ピン留めの長さの見積もり用）: 似顔絵1 + 吹き出し5つ(まとめて1) + 注記1 + グレーアウト1 + 文言2 + 「まだかな？」等4つ(まとめて1) + もっと知る1（この2つのステップは長いぶん、少し多めに見積もる）
  var STEP_COUNT = 10;

  // スマホも、PCと同じく「1操作(スワイプ)=1ステップ」で1つずつ表示する。
  // スマホは1ステップあたりのスクロール量を短めにし、スワイプの反応も少し軽くする
  function smooth() {
    return false;
  }
  function isSP() {
    return window.matchMedia && window.matchMedia("(max-width: 767px)").matches;
  }

  var tl;
  var tweening = false; // ステップ移動中は次の操作を受け付けない

  // ---- タイムライン（全て秒。スクロール位置に連動して進む） ----
  function build() {
    if (tl) {
      tl.scrollTrigger.kill();
      tl.kill();
    }
    gsap.set([moreTop, face, caption, note, labels], { clearProps: "transform,opacity,visibility" });
    gsap.set([q1, q2, wonders, moreLarge], { clearProps: "transform,opacity,visibility" });

    // 初期状態：ステージには何も見えていない
    gsap.set([face, caption, note], { opacity: 0 });
    gsap.set(face, { scale: 0.92, transformOrigin: "50% 60%" });
    gsap.set(labels, { opacity: 0, y: 12 });
    // 吹き出しの線は、実際の長さで「描かれていない」状態にする
    // （pathLength="1"で0〜1にすると、GSAPがpxの値を整数に丸めるため、伸びていく途中が飛んで一気に表示されてしまう）
    Array.prototype.forEach.call(lines, function (line) {
      var len = polylineLength(line);
      gsap.set(line, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 });
    });
    gsap.set([q1, q2, wonders, moreLarge], { autoAlpha: 0, y: 30 });
    // 囲む線は、最初は描かれていない状態にしておく。線の実際の長さを使う
    // （pathLength="1"で0〜1にすると、GSAPがpxの値を整数に丸めるため、途中が飛んで一気に描かれてしまう）
    if (moreLine) {
      moreLineLen = moreLine.getTotalLength();
      gsap.set(moreLine, { strokeDasharray: moreLineLen, strokeDashoffset: moreLineLen });
    }
    // ヘッダー行（もっと知る）はタイトルと同時に、時間で出す（initTitle）。未実行の間は隠しておく
    if (!titlePlayed) gsap.set(moreTop, { opacity: 0 });

    // ピン留めは position:sticky。セクションの高さ＝画面1つぶん＋スクロール量、にしておく
    // （position:fixed のピン留めは、iOSで慣性スクロール中に取り残されて他のセクションに重なることがあるため）
    // スマホは、1ステップあたりのスクロール量を短くして、軽く進める
    var dist = window.innerHeight * STEP_COUNT * (isSP() ? 0.3 : 0.45);
    section.classList.add("is-sticky");
    section.style.height = pin.offsetHeight + dist + "px";

    tl = gsap.timeline({
      defaults: { ease: "power1.inOut" },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=" + dist,
        scrub: isSP() ? 0.4 : 0.8,
        invalidateOnRefresh: true,
        // スクロールバーのドラッグなど、ホイール以外で止まった場合も一番近いステップに合わせる
        snap: smooth() ? false : {
          snapTo: function (value) {
            var total = tl.duration();
            var best = 0;
            var prog = STEP_LABELS.map(function (n) { return tl.labels[n] / total; });
            prog.forEach(function (v, i) {
              if (Math.abs(v - value) < Math.abs(prog[best] - value)) best = i;
            });
            return prog[best];
          },
          delay: 0.2,
          duration: { min: 0.5, max: 1.2 },
          ease: "power1.inOut"
        },
        onEnter: function (self) { settleOnEnter(self, false); },
        onEnterBack: function (self) { settleOnEnter(self, true); }
      }
    });

    // 1ステップ = 要素1つ。ステップの最後にラベルを打つ
    STEP_LABELS = [];
    SEQ_STEPS = [];
    function mark() {
      var name = "s" + STEP_LABELS.length;
      tl.addLabel(name);
      STEP_LABELS.push(name);
    }
    tl.addLabel("s0", 0);
    STEP_LABELS.push("s0");

    // ステップ1：似顔絵（「容姿」も一緒に）
    tl.to(face, { opacity: 1, scale: 1, duration: 1.4 }, ">");
    tl.to(caption, { opacity: 1, duration: 0.9 }, "<0.5");
    mark();

    // ステップ2：吹き出し（立派な耳・おしゃべりな口・地獄耳・無造作な髪・つぶらな瞳）は、
    // 1回のスクロールで、順番に1つずつ（線が伸びてから文言）続けて表示する
    // どの吹き出しも、間隔・伸びる時間・文言の出方を同じにして、一定の速さで出す（イージングもかけない）
    var LABEL_GAP = 0.62; // 吹き出しどうしの間隔
    tl.addLabel("labelsStart", ">");
    labels.forEach(function (label, i) {
      tl.to(lines[i], { strokeDashoffset: 0, duration: 0.8, ease: "none" }, "labelsStart+=" + i * LABEL_GAP);
      tl.to(label, { opacity: 1, y: 0, duration: 0.6, ease: "none" }, "labelsStart+=" + (i * LABEL_GAP + 0.55));
    });
    mark();
    SEQ_STEPS.push(STEP_LABELS.length - 1);

    // ステップ3：「※実物とは異なります。」は最後に
    tl.to(note, { opacity: 1, duration: 1.0 }, ">");
    mark();

    // ステップ4：似顔絵と吹き出しがグレーアウト
    tl.to(face, { opacity: GREY, duration: 1.6 }, ">");
    tl.to(lines, { opacity: GREY, duration: 1.6 }, "<");
    tl.to([labels, caption, note], { opacity: GREY, duration: 1.6 }, "<");
    mark();

    // ステップ5：似顔絵が消えてから「制作物は見てくれましたか？」
    tl.to(facePart, { opacity: 0, duration: 1.0 }, ">");
    tl.to(q1, { autoAlpha: 1, y: 0, duration: 1.2 }, ">");
    mark();

    // ステップ6：「少しは興味を持ってくれましたか？」
    tl.to(q1, { autoAlpha: 0, y: -30, duration: 0.9 }, ">");
    tl.to(q2, { autoAlpha: 1, y: 0, duration: 1.2 }, ">");
    mark();

    // 「まだかな？」「まだまだ？」（4つ）も、1回のスクロールで、上から順番に続けて表示する
    var WONDER_GAP = 0.6; // 1つずつの間隔（一定）
    tl.to(q2, { autoAlpha: 0, y: -30, duration: 0.7 }, ">");
    tl.addLabel("wondersStart", ">");
    wonders.forEach(function (el, i) {
      tl.to(el, { autoAlpha: 1, y: 0, duration: 0.8, ease: "none" }, "wondersStart+=" + i * WONDER_GAP);
    });
    mark();
    SEQ_STEPS.push(STEP_LABELS.length - 1);

    // 最後のステップ：大きな「VIEW MORE」。文字が出たあと、手描きの線で文字のまわりを囲んでいく
    tl.to(moreLarge, { autoAlpha: 1, y: 0, duration: 1.3 }, ">");
    if (moreLine) tl.to(moreLine, { strokeDashoffset: 0, duration: 1.8, ease: "power1.inOut" }, ">");
    mark();
  }

  // ---- ステップの位置（スクロール量）と現在位置 ----
  function stepYs() {
    var st = tl.scrollTrigger;
    var total = tl.duration();
    return STEP_LABELS.map(function (name) {
      return st.start + (tl.labels[name] / total) * (st.end - st.start);
    });
  }

  function currentStep(ys) {
    var y = window.pageYOffset;
    var best = 0;
    for (var i = 1; i < ys.length; i++) {
      if (Math.abs(ys[i] - y) < Math.abs(ys[best] - y)) best = i;
    }
    return best;
  }

  function inRange(y) {
    var st = tl.scrollTrigger;
    return y >= st.start - 2 && y <= st.end + 2;
  }

  var scrollProxy = { y: 0 };
  var moveTween = null;
  function goTo(targetY, seconds, linear) {
    if (moveTween) moveTween.kill();
    tweening = true;
    scrollProxy.y = window.pageYOffset;
    moveTween = gsap.to(scrollProxy, {
      y: targetY,
      duration: Math.max(seconds, 0.6),
      ease: linear ? "none" : "power1.inOut",
      onUpdate: function () { window.scrollTo(0, scrollProxy.y); },
      onComplete: function () { tweening = false; readyAt = Date.now() + COOLDOWN; }
    });
  }

  // スクロール1回 = 1ステップ。戻り値: 操作を消費した(=ブラウザ標準のスクロールを止める)かどうか
  function step(dir) {
    if (!tl || !inRange(window.pageYOffset)) return false;
    var ys = stepYs();
    var idx = currentStep(ys);
    var next = idx + dir;
    // 最初より上、最後より下は、そのままページ全体のスクロールに任せる
    if (next < 0 || next >= ys.length) return false;
    if (tweening) return true;
    var seg = Math.abs(tl.labels[STEP_LABELS[next]] - tl.labels[STEP_LABELS[idx]]);
    // 順番に続けて表示するステップは、一定の速さで（最初と最後だけ速さが変わらないように）
    var linear = SEQ_STEPS.indexOf(next) !== -1 || SEQ_STEPS.indexOf(idx) !== -1;
    goTo(ys[next], seg * SLOW, linear);
    return true;
  }

  // 上/下から慣性スクロールでセクションに入ってきたとき、途中のステップに飛び込まず入口で止める
  function settleOnEnter(self, fromBelow) {
    // リロード／ブラウザバックで途中位置から再開したときは、その位置のまま(そのステップの表示)にする
    if (tweening || window.__restoring || smooth()) return;
    var ys = stepYs();
    var y = window.pageYOffset;
    var target = fromBelow ? ys[ys.length - 1] : ys[0];
    if (Math.abs(y - target) > 2) window.scrollTo(0, target);
  }

  // ---- 入力：ホイール / タッチ / キーボード ----
  // 1回の操作=1ステップ。ホイールを回し続けても止まってしまわないよう、
  //  ・ステップの移動中と、その直後(COOLDOWN)に届いたイベントは、慣性の続きとして捨てる
  //  ・それ以降に溜まった操作量が WHEEL_THRESHOLD を超えたら、次のステップへ進む
  var WHEEL_THRESHOLD = 90;
  var COOLDOWN = 380; // ステップの完了後、次の操作を受け付けるまでの間(ms)
  var wheelAcc = 0;
  var readyAt = 0; // この時刻より前のイベントは無視する
  window.addEventListener("wheel", function (e) {
    if (smooth() || !tl || !inRange(window.pageYOffset)) return;
    if (Math.abs(e.deltaY) < 2) return;
    var dir = e.deltaY > 0 ? 1 : -1;
    var ys = stepYs();
    var idx = currentStep(ys);
    var next = idx + dir;
    if (next < 0 || next >= ys.length) return; // 範囲の外へは通常スクロール
    e.preventDefault();
    var now = Date.now();
    if (tweening || now < readyAt) {
      wheelAcc = 0;
      return;
    }
    if ((wheelAcc > 0 && dir < 0) || (wheelAcc < 0 && dir > 0)) wheelAcc = 0;
    wheelAcc += e.deltaY;
    if (Math.abs(wheelAcc) >= WHEEL_THRESHOLD) {
      wheelAcc = 0;
      step(dir);
    }
  }, { passive: false });

  var touchY = null;
  window.addEventListener("touchstart", function (e) {
    touchY = e.touches.length === 1 ? e.touches[0].clientY : null;
  }, { passive: true });
  window.addEventListener("touchmove", function (e) {
    if (smooth() || touchY === null || !tl || !inRange(window.pageYOffset)) return;
    var dy = touchY - e.touches[0].clientY;
    var dir = dy > 0 ? 1 : -1;
    var ys = stepYs();
    var next = currentStep(ys) + dir;
    if (next < 0 || next >= ys.length) return;
    e.preventDefault();
    if (Math.abs(dy) > (isSP() ? 24 : 36)) {
      touchY = null; // 1回のスワイプで1ステップだけ
      step(dir);
    }
  }, { passive: false });

  window.addEventListener("keydown", function (e) {
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    var dir = 0;
    if (e.key === "ArrowDown" || e.key === "PageDown" || (e.key === " " && !e.shiftKey)) dir = 1;
    else if (e.key === "ArrowUp" || e.key === "PageUp" || (e.key === " " && e.shiftKey)) dir = -1;
    if (!dir || smooth()) return;
    if (step(dir)) e.preventDefault();
  });

  build();

  // ABOUTタイトルはWORKSのタイトルと同じポップイン（works-reveal.jsのplayTitleと同じ動き。ただしゆっくり）。
  // スクロール連動ではなく、セクションが画面に入ったときに一度だけ再生する。
  // 「もっと知る」も同時に現れる
  var titlePlayed = false;
  function initTitle() {
    if (titlePlayed || !titleSpan) return;
    titlePlayed = true;
    gsap.set(titleSpan, { opacity: 0, scale: 0.3, rotate: -6, transformOrigin: "50% 50%" });
    gsap.set(moreTop, { opacity: 0, y: 20 });
    ScrollTrigger.create({
      trigger: pin,
      start: "top 60%",
      once: true,
      onEnter: function () {
        gsap.to(titleSpan, { opacity: 1, scale: 1, rotate: 0, duration: 2, ease: "back.out(1.7)" });
        gsap.to(moreTop, { opacity: 1, y: 0, duration: 1.6, delay: 0.6, ease: "power2.out" });
      }
    });
  }

  // FVのピン留め(message-scroll.js)はイントロ演出の完了後に作られ、その分ページが下に伸びる。
  // ABOUTのトリガーは先に作られているため、位置がずれたままだとWORKSの上で発火してしまう。
  // トリガーを上から順に並べ直して測り直す
  var refreshed = false;
  function resync() {
    if (refreshed) return;
    refreshed = true;
    window.setTimeout(function () {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      initTitle();
    }, 0);
  }
  window.addEventListener("mv-intro:done", resync);
  // message-scroll.jsのフォールバック(12000ms)の後にも一度測り直す
  // イントロ完了のイベントが来なかった場合だけの保険。すでに測り直し済みなら何もしない
  // （スクロールの最中に測り直すと、固定表示が一瞬外れて画面が飛ぶため）
  (window.onSiteReady || function (f) { f(); })(function () {
    window.setTimeout(function () {
      if (!refreshed) resync();
    }, 9800);
  });

  var resizeTimer;
  var lastW = window.innerWidth;
  window.addEventListener("resize", function () {
    // SPのアドレスバー伸縮による高さだけの変化では作り直さない
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(build, 200);
  });
})();
