(function () {
  "use strict";

  var mainvisual = document.getElementById("js-mainvisual");
  if (!mainvisual) return; // トップページ以外では何もしない

  var character = document.getElementById("js-mv-character");
  var sub = document.getElementById("js-mv-sub");
  var titleInner = document.getElementById("js-mv-title-inner");
  var titleChars = Array.prototype.slice.call(mainvisual.querySelectorAll(".mv-char"));
  var header = document.querySelector("header");

  // ---- ①顔が(鼻のあたりまで見えた状態で)ふわっと現れる → ②「原龍我」が上から1文字ずつ降ってくる → ③「webのことなら」を表示 ----
  var CHAR_PEEK_DELAY = 300; // 顔が現れ始めるまでの間(ms)
  var CHAR_PEEK_DURATION = 550; // 顔が現れきるまでの時間(ms)。style.cssのtransition:transformと合わせる（シュッと素早く）
  var TITLE_DELAY_AFTER_CHAR = 250; // 顔が定位置に着いてから、タイトルが降り始めるまで(ms)
  var TITLE_CHAR_STAGGER = 380; // 「原」「龍」「我」、1文字ごとの間(ms)。ゆっくり、テンポよく1文字ずつ
  var TITLE_CHAR_DURATION = 1200; // 1文字が落ちて弾んで止まるまで(ms)
  var SUB_DELAY_AFTER_TITLE = 250; // タイトルが落ちきってから「webのことなら」まで(ms)
  var SUB_DURATION = 1000; // 「webのことなら」の表示アニメーション時間(ms)。style.cssのtransitionと合わせる
  var SCROLL_SHOW_THRESHOLD = 10; // これ以上スクロールしたらヘッダーを表示（ファーストビュー内では常に非表示）

  // タイトルが降りきって「webのことなら」が終わる(=mv-intro:done)までは、スクロールできないようにする。
  // ・ホイール / タッチ / キー操作を止め、スクロールバーのドラッグ等で動いても最上部に戻す
  // ・リロード／ブラウザバックで途中位置から再開する場合は、演出をスキップするのでロックしない
  var scrollLocked = !window.__restoreY;
  var LOCK_KEYS = { 32: 1, 33: 1, 34: 1, 35: 1, 36: 1, 37: 1, 38: 1, 39: 1, 40: 1 };
  function stop(e) {
    if (scrollLocked) e.preventDefault();
  }
  function unlockScroll() {
    scrollLocked = false;
  }
  if (scrollLocked) {
    window.addEventListener("wheel", stop, { passive: false });
    window.addEventListener("touchmove", stop, { passive: false });
    window.addEventListener("keydown", function (e) {
      if (!scrollLocked) return;
      var t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (LOCK_KEYS[e.keyCode]) e.preventDefault();
    });
    window.addEventListener("scroll", function () {
      if (scrollLocked && window.pageYOffset !== 0) window.scrollTo(0, 0);
    }, { passive: true });
    window.addEventListener("mv-intro:done", unlockScroll);
    // 万が一演出が完了しない場合の保険（サイトローダー+演出の最大待ち時間より十分に長く）
    window.setTimeout(unlockScroll, 20000);
  }

  var played = false;

  function play() {
    if (played) return;
    played = true;

    // リロード／ブラウザバックで途中のスクロール位置から再開する場合は、
    // ファーストビューの演出を待たずに完了状態にして、すぐスクロール連動の仕組みを構築させる
    if (window.__restoreY) {
      if (character) character.classList.add("is-visible");
      if (sub) sub.classList.add("is-visible");
      titleChars.forEach(function (el) {
        el.style.transition = "none";
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      window.setTimeout(function () {
        window.dispatchEvent(new CustomEvent("mv-intro:done"));
      }, 0);
      return;
    }

    // ① 顔が、鼻のあたりまで見えた状態でふわっと現れる（あご下まで見えるのは、スクロールしてから）
    window.setTimeout(function () {
      if (character) character.classList.add("is-visible");
    }, CHAR_PEEK_DELAY);

    // ② 顔が定位置に着いたら、「原」「龍」「我」が上から1文字ずつ落ちて弾む
    var titleStart = CHAR_PEEK_DELAY + CHAR_PEEK_DURATION + TITLE_DELAY_AFTER_CHAR;
    window.setTimeout(function () {
      if (!titleChars.length) return;
      if (typeof gsap !== "undefined") {
        // 上から1文字ずつ落ちてくるだけ(シンプルに)
        gsap.fromTo(titleChars,
          { opacity: 0, y: "-160%" },
          {
            opacity: 1,
            y: "0%",
            duration: TITLE_CHAR_DURATION / 1000,
            ease: "bounce.out",
            stagger: TITLE_CHAR_STAGGER / 1000
          });
      } else {
        // GSAPが読み込めない場合は、動きなしでそのまま表示する
        titleChars.forEach(function (el) {
          el.style.opacity = "1";
          el.style.transform = "none";
        });
      }
    }, titleStart);
    var titleEnd = titleStart + TITLE_CHAR_DURATION + (titleChars.length - 1) * TITLE_CHAR_STAGGER;

    // ③ タイトルが落ちきったら、「webのことなら」を下からフェードイン
    window.setTimeout(function () {
      if (sub) sub.classList.add("is-visible");
    }, titleEnd + SUB_DELAY_AFTER_TITLE);

    // ④ 「webのことなら」が出終わったら、ファーストビューの一連の演出が完了したことを知らせる
    // （スクロール連動メッセージ側はこのタイミングまで待ってから構築する）
    window.setTimeout(function () {
      window.dispatchEvent(new CustomEvent("mv-intro:done"));
    }, titleEnd + SUB_DELAY_AFTER_TITLE + SUB_DURATION);

  }

  // サイトローディングが終わって、画面が表示されてから開始（ローディング中は始めない）
  (window.onSiteReady || function (f) { f(); })(play);

  // ヘッダーはファーストビュー内では非表示のまま、スクロールを始めたら表示する。
  // TOPページではスクロール連動メッセージ（message-scroll.js）のピン留めが
  // 完全に終わって通常スクロールに戻ってから表示したいので、
  // window.__mvPinST（ScrollTriggerのインスタンス）の進捗も見て判定する
  function updateHeaderByScroll() {
    if (!header) return;
    var pinST = window.__mvPinST;
    var pinFinished = !pinST || pinST.progress >= 1;
    if (pinFinished && window.scrollY > SCROLL_SHOW_THRESHOLD) {
      header.classList.add("is-visible");
    } else {
      header.classList.remove("is-visible");
    }
  }
  window.addEventListener("scroll", updateHeaderByScroll, { passive: true });
  updateHeaderByScroll(); // リロード時に途中までスクロールされている場合の初期状態を反映
})();
