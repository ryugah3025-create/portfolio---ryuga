(function () {
  "use strict";

  var section = document.getElementById("js-service");
  var pin = document.getElementById("js-service-pin");
  var reel = document.getElementById("js-service-reel");
  var title = document.getElementById("js-service-title");
  if (!section || !pin || !reel || !title) return;
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  var lines = gsap.utils.toArray(section.querySelectorAll(".js-service-line"));
  var noLink = document.getElementById("js-service-no");

  // 暗い背景がヘッダーの位置まで来ている間、ヘッダーを白系にする（動きを減らす設定でも有効）。
  // ピン留めの後に作らないと、ピン留めで伸びた分が section の高さに含まれず、途中で解除されてしまう
  var darkST = null;
  function createDarkToggle() {
    if (darkST) darkST.kill();
    darkST = ScrollTrigger.create({
      trigger: section,
      start: "top 100px",
      end: "bottom 100px",
      // ピン留めのトリガーより後に測り直す（refresh時の並び替えで先になると、ピン留めの分が含まれない）
      refreshPriority: -1,
      toggleClass: { targets: document.body, className: "is-on-dark" }
    });
  }

  // 「NO??」：次のセクションへ進む
  if (noLink) {
    noLink.addEventListener("click", function (e) {
      var next = document.getElementById("js-service-next");
      if (!next) return;
      e.preventDefault();
      var y = next.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  }

  // コンテナクエリ未対応の古いブラウザは静的表示（ヘッダーの色切り替えだけ行う）
  if (document.documentElement.classList.contains("no-cq")) {
    createDarkToggle();
    return;
  }

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    createDarkToggle();
    return;
  }

  var tl;

  // 1行あたりのスクロール量(px)。画面の高さに比例させつつ、短い画面でも間延びしないよう下限を置く
  function perLine() {
    return Math.max(window.innerHeight * 0.42, 240);
  }

  function build() {
    if (tl) {
      tl.scrollTrigger.kill();
      tl.kill();
      tl = null;
    }
    section.classList.add("is-ready");
    gsap.set(reel, { clearProps: "transform" });
    gsap.set(lines, { clearProps: "opacity,visibility,transform" });

    // 位置は offsetTop で測る（transform の影響を受けない）。値は関数で渡し、
    // フォント読み込み後などの refresh のたびに測り直されるようにする
    function centerOf(el) {
      var y = 0;
      var node = el;
      while (node && node !== reel) {
        y += node.offsetTop;
        node = node.offsetParent;
      }
      return y + el.offsetHeight / 2;
    }
    function viewH() { return pin.clientHeight || window.innerHeight; }
    // 最初は「SERVICE」が画面の中央にある
    function startY() { return viewH() * 0.5 - centerOf(title); }
    // 行が出るたびに、その行が画面の少し下寄り(60%)に来る位置まで全体を上へ送る
    // （SERVICEも一緒に上へ流れていく）
    function yFor(el) { return viewH() * 0.6 - centerOf(el); }

    gsap.set(lines, { autoAlpha: 0, y: 30 });

    // ピン留めは position:sticky（CSS）。セクションの高さ＝画面1つぶん＋スクロール量にする
    var dist = lines.length * perLine();
    section.style.height = pin.offsetHeight + dist + "px";

    tl = gsap.timeline({
      defaults: { ease: "power1.inOut" },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=" + dist,
        scrub: 0.6,
        invalidateOnRefresh: true
      }
    });

    lines.forEach(function (el, i) {
      // 一行ずつ：前の行が出きってから次の行が出る
      if (i === 0) {
        tl.fromTo(reel, { y: startY }, { y: function () { return yFor(el); }, duration: 1 }, 0);
      } else {
        tl.to(reel, { y: function () { return yFor(el); }, duration: 1 }, i);
      }
      tl.to(el, { autoAlpha: 1, y: 0, duration: 0.9 }, i + 0.1);
    });
    // 最後の行を読む間の余韻
    tl.to({}, { duration: 0.6 });

    createDarkToggle();
  }

  build();

  // FVのピン留めはイントロ演出の完了後に作られるため、about-scroll.js側で位置の測り直しが行われる。
  // ここは作成順(ページ上の順)が保たれていれば、その測り直しで正しい位置になる。
  var resizeTimer;
  var lastW = window.innerWidth;
  window.addEventListener("resize", function () {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      build();
      ScrollTrigger.refresh();
    }, 200);
  });
})();
