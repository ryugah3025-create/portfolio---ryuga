(function () {
  "use strict";

  var loader = document.getElementById("js-site-loader");
  if (!loader) {
    // ローダーがないページ：すぐに準備完了として扱う
    window.__siteLoaded = true;
    window.onSiteReady = function (cb) { cb(); };
    return;
  }

  var ANIMATION_CYCLE = 1900; // CSSのdot-pulse / caption-pulseの1周期(ms)。style.cssのanimation指定と必ず一致させる
  var REQUIRED_CYCLES_AFTER_READY = 0; // 読み込み完了後は追加で待たず、今の周期の区切りが来次第すぐ表示

  var root = document.documentElement;

  // ---- 「ローディングが終わって、画面が表示された」あとで、ページの演出を始めるための仕組み ----
  // ・ローディング中は、中身のアニメーション(CSS/JS)を始めない。
  // ・ローダーのフェードアウトが終わって画面が見えてから、site-loader:done を送り、window.onSiteReady(cb) の待ち行列を実行する
  // ・ローディング中は、裏でスクロールされて演出が始まってしまわないよう、スクロール操作も止める
  var ready = false;
  var waiting = [];
  window.__siteLoaded = false;
  window.onSiteReady = function (cb) {
    if (ready) cb();
    else waiting.push(cb);
  };

  function block(e) {
    if (e.cancelable) e.preventDefault();
  }
  function blockKey(e) {
    if ([32, 33, 34, 35, 36, 37, 38, 39, 40].indexOf(e.keyCode) !== -1) block(e);
  }
  window.addEventListener("wheel", block, { passive: false });
  window.addEventListener("touchmove", block, { passive: false });
  window.addEventListener("keydown", blockKey);

  function markReady() {
    if (ready) return;
    ready = true;
    window.__siteLoaded = true;
    root.classList.remove("is-loading");
    window.removeEventListener("wheel", block, { passive: false });
    window.removeEventListener("touchmove", block, { passive: false });
    window.removeEventListener("keydown", blockKey);
    window.dispatchEvent(new CustomEvent("site-loader:done"));
    waiting.splice(0).forEach(function (fn) { fn(); });
  }

  var FADE_MS = 650; // CSSのフェードアウト(.6s)が終わるまで待つ（_loader.scss と合わせる）
  function finishLoading() {
    loader.classList.add("is-loaded");
    window.setTimeout(function () {
      if (loader.parentNode) {
        loader.parentNode.removeChild(loader);
      }
      markReady(); // 画面が見えてから、ページの演出を始める
    }, FADE_MS);
  }

  // 万が一、読み込みが終わらなくても、いつまでもローディングのままにしない
  window.setTimeout(finishLoading, 20000);

  // ページ遷移のたびに毎回再生する（トップページに限らず全ページで表示）
  var startedAt = Date.now();

  function reveal() {
    // ページの読み込みが完了した時点（回線が遅ければそれだけ遅くなる）から、
    // 現在再生中の周期（ポップの途中）だけは最後まで一巡させてから表示に移る。
    var elapsed = Date.now() - startedAt;
    var remainder = elapsed % ANIMATION_CYCLE;
    var toNextBoundary = remainder === 0 ? 0 : (ANIMATION_CYCLE - remainder);
    var wait = toNextBoundary + (ANIMATION_CYCLE * REQUIRED_CYCLES_AFTER_READY);
    window.setTimeout(finishLoading, wait);
  }

  // 記事ページの「一覧に戻る」（/blog/#list）では、ローディングを出さずにそのまま一覧を表示する
  if (window.location.hash === "#list") {
    if (loader.parentNode) loader.parentNode.removeChild(loader);
    markReady();
    return;
  }

  // ページが完全に読み込み終わるまで待つ（画像・スクリプト含め全て読み込み完了 = load イベント）
  if (document.readyState === "complete") {
    reveal();
  } else {
    window.addEventListener("load", reveal);
  }
})();
