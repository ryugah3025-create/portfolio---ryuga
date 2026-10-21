(function () {
  "use strict";

  var section = document.querySelector(".work-content");
  if (!section) return;
  if (typeof gsap === "undefined") return;

  var titleSpan = section.querySelector("h2 span");
  var detail = section.querySelector(".work-detail");
  var items = section.querySelectorAll(".list-work .item-work");

  if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);

  // 各カードの「不規則な」入場方向・距離。.item-workの数が増えても
  // インデックスをこの配列の長さで割った余りで割り当てるので、
  // 何個追加されても自動的にバラバラな方向から出てくる
  var ENTRANCE_OFFSETS = [
    { x: -90, y: 40 },
    { x: 90, y: -30 },
    { x: 0, y: 90 },
    { x: -70, y: -60 },
    { x: 80, y: 50 },
    { x: -40, y: 80 }
  ];

  function offsetFor(i) {
    return ENTRANCE_OFFSETS[i % ENTRANCE_OFFSETS.length];
  }

  // 初期状態：タイトルは小さく縮こまった状態、詳細文は下、
  // カードはCSSで指定された最終位置（散らばった回転・オフセット）から
  // さらにランダムな方向にずらした位置から始める
  if (titleSpan) {
    gsap.set(titleSpan, { transformOrigin: "50% 50%" });
  }
  items.forEach(function (item, i) {
    var off = offsetFor(i);
    gsap.set(item, { x: "+=" + off.x, y: "+=" + off.y });
  });

  function playTitle() {
    gsap.to(titleSpan, {
      opacity: 1,
      scale: 1,
      rotate: 0,
      duration: 1.2,
      ease: "back.out(1.7)"
    });
  }

  function playDetail() {
    gsap.to(detail, {
      opacity: 1,
      y: 0,
      duration: .9,
      ease: "power2.out"
    });
  }

  function playItem(item, i) {
    var off = offsetFor(i);
    gsap.to(item, {
      opacity: 1,
      x: "-=" + off.x,
      y: "-=" + off.y,
      duration: 1,
      ease: "back.out(1.4)"
    });
  }

  // FVのピン留め演出（message-scroll.js）がスクロール量を書き換えるより前に
  // ScrollTriggerを作成すると、各要素のトリガー位置がまだ確定しておらず
  // 「見えていないのに発火する／見えているのに発火しない」ズレが起きる。
  // そのため、mainvisual.jsが送出する mv-intro:done を待ってから作成する。
  // （message-scroll.js側のフォールバックが4600msなので、それより長めに待つ）
  function init() {
    if (typeof ScrollTrigger === "undefined") {
      // ScrollTriggerが読み込めなかった場合のフォールバック：一括表示
      if (titleSpan) playTitle();
      if (detail) playDetail();
      items.forEach(function (item, i) { playItem(item, i); });
      return;
    }

    // ピン留め用スペーサーの挿入でページ全体のレイアウトが変わっているので、
    // 念のため最新のレイアウトを計算し直してからトリガーを作る
    ScrollTrigger.refresh();

    // タイトル・詳細文・各カードそれぞれに個別のトリガーを持たせ、
    // 要素ごとに画面に入ったタイミングで表示する
    if (titleSpan) {
      ScrollTrigger.create({
        trigger: titleSpan,
        start: "top 90%",
        once: true,
        onEnter: playTitle
      });
    }
    if (detail) {
      ScrollTrigger.create({
        trigger: detail,
        start: "top 90%",
        once: true,
        onEnter: playDetail
      });
    }
    items.forEach(function (item, i) {
      ScrollTrigger.create({
        trigger: item,
        start: "top 90%",
        once: true,
        onEnter: function () { playItem(item, i); }
      });
    });
  }

  var didInit = false;
  function initOnce() {
    if (didInit) return;
    didInit = true;
    init();
  }

  window.addEventListener("mv-intro:done", initOnce, { once: true });
  // mv-intro:doneはmainvisual.js側の演出が全て終わってから発火するため、
  // 最大でおよそ9400ms程度かかることがある（message-scroll.jsと同じ理由）。
  // ここも十分長い保険用フォールバックにしておく
  (window.onSiteReady || function (f) { f(); })(function () { window.setTimeout(initOnce, 9500); });
})();
