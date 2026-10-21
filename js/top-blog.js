(function () {
  "use strict";

  var section = document.querySelector(".top-blog-sticky");
  var track = document.getElementById("js-top-blog-track");
  if (!section || !track) return;

  // 最新の記事（最大3件）が、重なった位置（手前・右奥・左奥）のどれかに入る
  var items = Array.prototype.slice.call(track.querySelectorAll(".top-blog-item"));
  var count = items.length; // 3枚のはずだが、記事数が変わっても壊れないようにしておく
  var hasGsap = typeof window.gsap !== "undefined";
  var hasMatter = typeof window.Matter !== "undefined";
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 紙を置く場所（Figma「top_BLOGセクション2」の位置・角度）。%はセクションの幅・高さに対する割合。
  // 上の案内文（.top-blog-lead）と重ならないよう、Figmaの位置より少し下にずらしてある
  var SLOTS = [
    { x: 50, y: 66, rotate: 0, z: 3 }, // 手前：画面の横中央
    { x: 64.3, y: 62.6, rotate: -15, z: 2 }, // 右奥
    { x: 43, y: 71.1, rotate: 15, z: 1 }, // 左奥
  ];

  var frontPointer = 0; // 何回「次へ」が押されたか（0枚目が手前のとき0）
  var landed = false; // 落ちて重なる演出が終わったら true
  var busy = false; // アニメーション中は、次の操作を受け付けない

  function rel(k) {
    return ((k - frontPointer) % count + count) % count; // 0=手前, 1=右奥, 2=左奥
  }

  function slotPx(slot) {
    var r = section.getBoundingClientRect();
    return {
      x: (r.width * slot.x) / 100,
      y: (r.height * slot.y) / 100,
      rotate: slot.rotate,
      z: slot.z,
    };
  }

  // getBoundingClientRect()は回転した見た目の大きさ（傾いていると、実寸より大きく返る）になるため、
  // 回転の影響を受けない、計算上の幅・高さ（getComputedStyle）を使う
  function cardSize() {
    var cs = window.getComputedStyle(items[0]);
    return { w: parseFloat(cs.width), h: parseFloat(cs.height) };
  }

  // 1枚を、所定の位置（中心がtx, ty）に置く
  function place(item, px, size, immediate) {
    var x = px.x - size.w / 2;
    var y = px.y - size.h / 2;
    var tf = "translate3d(" + x + "px, " + y + "px, 0) rotate(" + px.rotate + "deg)";
    item.style.zIndex = String(px.z);
    if (!hasGsap || reduceMotion || immediate) {
      item.style.transform = tf;
      item.style.opacity = "1";
      return;
    }
    window.gsap.to(item, { x: x, y: y, rotation: px.rotate, opacity: 1, duration: 0.7, ease: "power2.out" });
  }

  // 今の並びどおりに、3枚をそれぞれの位置に置き直す
  function layout(immediate) {
    var size = cardSize();
    items.forEach(function (item, k) {
      var slot = SLOTS[rel(k)];
      place(item, slotPx(slot), size, immediate);
    });
  }

  // ---- 手前にする（矢印、またはクリックされたカード） ----
  function rotateFront(dir) {
    if (busy) return;
    frontPointer = ((frontPointer + dir) % count + count) % count;
    busy = true;
    layout(false);
    window.setTimeout(function () { busy = false; }, hasGsap && !reduceMotion ? 750 : 0);
  }

  var prevBtn = section.querySelector(".top-blog-arrow.is-prev");
  var nextBtn = section.querySelector(".top-blog-arrow.is-next");
  if (prevBtn) prevBtn.addEventListener("click", function () { if (landed) rotateFront(-1); });
  if (nextBtn) nextBtn.addEventListener("click", function () { if (landed) rotateFront(1); });

  // ---- 手前以外のカードをクリックしたら、手前へ回す。手前のカードは、そのまま記事へ遷移する ----
  track.addEventListener("click", function (e) {
    var item = e.target.closest ? e.target.closest(".top-blog-item") : null;
    if (!item || !landed) return;
    var k = items.indexOf(item);
    if (rel(k) !== 0) {
      e.preventDefault();
      if (!busy) rotateFront(rel(k) === 1 ? 1 : -1);
    }
    // 手前のカードは、.top-blog-hit（<a>）の通常のリンク遷移に任せる
  });

  // ---- 落ちて重なる演出（Matter.jsで実際に落として、最後に所定の位置へ収める） ----
  function settleToSlots() {
    landed = true;
    layout(false);
  }

  function fallIn() {
    if (reduceMotion || !hasMatter) {
      items.forEach(function (item) { item.style.opacity = "1"; });
      settleToSlots();
      return;
    }
    var Engine = window.Matter.Engine;
    var World = window.Matter.World;
    var Bodies = window.Matter.Bodies;
    var Body = window.Matter.Body;

    var r = section.getBoundingClientRect();
    var size = cardSize();
    var engine = Engine.create();
    engine.gravity.y = 1.1;

    var ground = Bodies.rectangle(r.width / 2, r.height * 0.56 + size.h * 0.4, r.width * 2, 40, { isStatic: true });
    var wallL = Bodies.rectangle(-30, r.height / 2, 60, r.height * 2, { isStatic: true });
    var wallR = Bodies.rectangle(r.width + 30, r.height / 2, 60, r.height * 2, { isStatic: true });
    World.add(engine.world, [ground, wallL, wallR]);

    // 画面の本当に上（セクションの外）から落ちてくるように、セクションの高さぶん以上、上から始める
    var dropFrom = r.height * 1.15;
    var STAGGER = 450; // 1枚ずつ、はっきりテンポよく見えるように間隔を広げる

    var bodies = items.map(function (item, i) {
      var slot = SLOTS[rel(i)];
      // 真上（自分の置き場所の真上）から、ほぼまっすぐ落ちてくる
      var startX = (r.width * slot.x) / 100 + (Math.random() - 0.5) * r.width * 0.02;
      var startY = -dropFrom - i * (size.h * 0.5);
      var body = Bodies.rectangle(startX, startY, size.w * 0.96, size.h * 0.96, {
        restitution: 0.22,
        friction: 0.6,
        frictionAir: 0.018,
      });
      Body.setAngle(body, (Math.random() - 0.5) * 0.5);
      item.style.opacity = "0";
      item.style.zIndex = String(SLOTS[rel(i)].z);
      return body;
    });

    // 1枚ずつ、はっきり間をおいて落としはじめる
    bodies.forEach(function (body, i) {
      window.setTimeout(function () {
        World.add(engine.world, body);
        items[i].style.opacity = "1";
      }, i * STAGGER);
    });

    var running = true;
    var last = null;
    function tick(now) {
      if (!running) return;
      if (last === null) last = now;
      var delta = Math.min(32, now - last);
      last = now;
      Engine.update(engine, delta);
      bodies.forEach(function (body, i) {
        var w = size.w * 0.96;
        var h = size.h * 0.96;
        items[i].style.transform =
          "translate3d(" + (body.position.x - w / 2) + "px, " + (body.position.y - h / 2) + "px, 0) rotate(" + (body.angle * 180 / Math.PI) + "deg)";
      });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    // 十分に落ちて重なったところで、物理演算をやめて、Figmaどおりの位置へふわっと収める
    window.setTimeout(function () {
      running = false;
      settleToSlots();
    }, bodies.length * STAGGER + 2000);
  }

  var started = false;
  function startIfVisible() {
    if (started) return;
    var r = section.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.75 && r.bottom > 0) {
      started = true;
      fallIn();
    }
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          started = true;
          fallIn();
          io.disconnect();
        }
      });
    }, { threshold: 0.3 });
    io.observe(section);
  } else {
    window.addEventListener("scroll", startIfVisible, { passive: true });
    startIfVisible();
  }

  window.addEventListener("resize", function () {
    if (landed) layout(true);
  });
})();
