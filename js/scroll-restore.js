(function () {
  "use strict";

  // トップページ用：リロード／ブラウザバック時に、直前のスクロール位置から再開する。
  // ブラウザ標準の復元は、ピン留め(ScrollTrigger)でページが伸びる前に行われて位置がずれるうえ、
  // ファーストビューの演出が終わるまでスクロール連動の仕組みが作られないため、
  // 位置を自前で保存しておき、演出の構築が終わってから戻す。
  // 戻すと各セクションのScrollTriggerが通常どおり発火し、その位置に応じたアニメーションが再生される
  if (!document.getElementById("js-mainvisual")) return;

  var KEY = "portfolio:top:scrollY";
  var MIN_Y = 50; // これより上(ほぼ最上部)なら復元しない

  try {
    window.history.scrollRestoration = "manual";
  } catch (e) { /* 何もしない */ }

  var nav = (window.performance && performance.getEntriesByType && performance.getEntriesByType("navigation")[0]) || null;
  var navType = nav ? nav.type : "navigate";
  var saved = null;
  try {
    var raw = window.sessionStorage.getItem(KEY);
    if (raw) saved = JSON.parse(raw);
  } catch (e) { saved = null; }

  var restoreY = 0;
  if ((navType === "reload" || navType === "back_forward") && saved && saved.path === location.pathname && saved.y > MIN_Y) {
    restoreY = saved.y;
  }
  // ファーストビューの演出のスキップなどに使う（mainvisual.js）
  window.__restoreY = restoreY;

  // ---- 保存 ----
  var canSave = !restoreY; // 復元が終わるまでは、最上部の0を上書き保存しない
  var saveTimer = null;
  function save() {
    if (!canSave) return;
    try {
      window.sessionStorage.setItem(KEY, JSON.stringify({ path: location.pathname, y: Math.round(window.pageYOffset) }));
    } catch (e) { /* 何もしない */ }
  }
  window.addEventListener("scroll", function () {
    if (saveTimer) return;
    saveTimer = window.setTimeout(function () {
      saveTimer = null;
      save();
    }, 120);
  }, { passive: true });
  window.addEventListener("pagehide", save);

  if (!restoreY) return;

  // ---- 復元 ----
  var userMoved = false;
  ["wheel", "touchstart", "keydown", "mousedown"].forEach(function (ev) {
    window.addEventListener(ev, function () { userMoved = true; }, { passive: true, once: true });
  });

  function jump() {
    if (userMoved) return;
    if (Math.abs(window.pageYOffset - restoreY) > 4) window.scrollTo(0, restoreY);
    if (window.ScrollTrigger) window.ScrollTrigger.update();
  }

  var done = false;
  function restore() {
    if (done) return;
    done = true;
    window.__restoring = true; // about-scroll.js の「入口で止める」処理を、復元中は無効にする
    jump();
    // 直後のScrollTriggerの測り直し(refresh)でずれた場合に備えて、もう一度合わせる
    window.setTimeout(jump, 500);
    window.setTimeout(function () {
      jump();
      window.__restoring = false;
      canSave = true;
      save();
    }, 1200);
  }

  // スクロール連動の仕組み(message-scroll / works-reveal / about-scroll など)が構築されたあとに戻す
  window.addEventListener("mv-intro:done", function () {
    window.setTimeout(restore, 300);
  });
  // イベントが来ない場合の保険
  window.setTimeout(restore, 15000);
})();
