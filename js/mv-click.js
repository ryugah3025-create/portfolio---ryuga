(function () {
  "use strict";

  // TOPページ ファーストビュー：キャラクターをクリック(タップ)すると、顔とテキストがランダムに変わる。
  //  ・1〜2回目：ランダムに1つ（好きな食べ物 / 十八番 / 好きな飲み物）
  //  ・3回目以降：「ボタン押しすぎ」
  //  ・最後のクリックから5秒たったら、全て元に戻る
  // 切り替えは、顔は重ねたままクロスフェード、文字は「すっと消えて、ふわっと出る」で自然に入れ替える。
  // （キャラクターやテキストの要素そのものは、スクロール連動(message-scroll.js)が動かすので、中身だけを入れ替える）
  var character = document.getElementById("js-mv-character");
  var subEl = document.querySelector("#js-mv-sub .mv-swap");
  var titleEl = document.querySelector("#js-mv-title-inner .mv-swap");
  if (!character || !subEl || !titleEl) return;

  var faces = Array.prototype.slice.call(character.querySelectorAll(".mv-face"));

  // face: 顔の画像の番号(data-face)
  var BASE = { face: 0, sub: subEl.textContent, title: titleEl.textContent };
  var RANDOM = [
    { face: 1, sub: "好きな食べ物は？", title: "ラーメン" },
    { face: 1, sub: "十八番は？", title: "長渕 Myseif" },
    { face: 1, sub: "好きな飲み物は？", title: "SAPPORO" }
  ];
  var TOO_MUCH = { face: 2, sub: "今思っていることは？", title: "ボタン押しすぎ" };
  var TOO_MUCH_FROM = 3; // このクリック回数以上で「ボタン押しすぎ」
  var RESET_MS = 5000; // 最後のクリックから元に戻るまで
  var FADE_OUT_MS = 280; // 文字が消える時間（.mv-swap の transition と合わせる）

  var clicks = 0;
  var lastIndex = -1;
  var resetTimer = null;
  var ready = false;

  // ---- 見た目の入れ替え ----
  function showFace(n) {
    faces.forEach(function (img) {
      img.classList.toggle("is-active", String(img.getAttribute("data-face")) === String(n));
    });
  }

  var textTimers = new WeakMap();
  function swapText(el, text) {
    if (el.textContent === text && !el.classList.contains("is-out")) return;
    window.clearTimeout(textTimers.get(el));
    el.classList.add("is-out"); // すっと消える
    textTimers.set(el, window.setTimeout(function () {
      el.textContent = text;
      if (el === titleEl) fitTitle(); // 文字は消えている間に、大きさを合わせる
      // 文字が入れ替わったあと、次のフレームでふわっと出す
      window.requestAnimationFrame(function () { el.classList.remove("is-out"); });
    }, FADE_OUT_MS));
  }

  // タイトルが画面の幅を超えるときは、1行に収まるよう文字サイズを縮める（CSSの --mv-title-k）
  var titleBox = document.getElementById("js-mv-title-inner");
  var mainvisualEl = document.getElementById("js-mainvisual");
  function fitTitle() {
    if (!titleBox) return;
    titleBox.style.setProperty("--mv-title-k", 1);
    var avail = (mainvisualEl ? mainvisualEl.clientWidth : window.innerWidth) - 48; // FV幅 - 左右の余白
    var w = titleEl.offsetWidth;
    if (w > avail && w > 0) titleBox.style.setProperty("--mv-title-k", (avail / w).toFixed(3));
  }
  window.addEventListener("resize", fitTitle);

  function apply(v) {
    showFace(v.face);
    swapText(subEl, v.sub);
    swapText(titleEl, v.title);
  }

  // ---- 5秒たったら、全て元に戻る ----
  function scheduleReset() {
    window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(function () {
      clicks = 0;
      lastIndex = -1;
      apply(BASE);
    }, RESET_MS);
  }

  // ---- クリック ----
  function inView() {
    // ファーストビューが見えている間だけ（スクロールでメッセージが流れ始めたら反応しない）
    return window.pageYOffset < window.innerHeight * 0.15;
  }
  function onClick() {
    if (!ready || !inView()) return;
    clicks += 1;
    if (clicks >= TOO_MUCH_FROM) {
      apply(TOO_MUCH);
    } else {
      // ランダム。直前と同じものは続けて出さない
      var i;
      do { i = Math.floor(Math.random() * RANDOM.length); } while (RANDOM.length > 1 && i === lastIndex);
      lastIndex = i;
      apply(RANDOM[i]);
    }
    scheduleReset();
  }

  character.setAttribute("role", "button");
  character.setAttribute("tabindex", "0");
  character.setAttribute("aria-label", "クリックすると顔が変わります");
  character.addEventListener("click", onClick);
  character.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  });

  // ファーストビューの演出が終わってから、クリックできるようにする
  function enable() {
    ready = true;
    character.classList.add("is-clickable");
  }
  if (window.__restoreY) enable();
  window.addEventListener("mv-intro:done", enable);
})();
