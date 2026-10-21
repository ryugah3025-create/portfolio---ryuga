(function () {
  "use strict";
  var fv = document.querySelector(".blog-fv-figma");
  var fv2 = document.querySelector(".blog-fv2");
  var title = document.querySelector(".blog-fv-figma-title");
  var image = document.querySelector(".blog-fv-figma-image");
  var list = document.querySelector(".blog-list");
  var strip = document.getElementById("js-blog-strip");
  var track = document.getElementById("js-blog-track");
  var cards = track ? Array.prototype.slice.call(track.querySelectorAll(".js-blog-card")) : [];
  var setSize = parseInt(track && track.getAttribute("data-set-size"), 10) || 3;

  var IMAGE_DELAY = 600; // 「BLOG」のあと、画像が出るまでの間(ms)
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof window.gsap !== "undefined";
  var RETURN_KEY = "blogReturn"; // 記事ページとの受け渡し（戻ったときの位置・カードの場所）

  function show() {
    if (title) title.classList.add("is-shown");
    window.setTimeout(function () {
      if (image) image.classList.add("is-shown");
    }, IMAGE_DELAY);
  }
  (window.onSiteReady || function (f) { f(); })(show);

  function revealCard(card) {
    if (card.getAttribute("data-revealed")) return;
    card.setAttribute("data-revealed", "1");
    if (!hasGsap || reduceMotion) {
      card.style.opacity = "1";
      return;
    }
    window.gsap.fromTo(
      card,
      { x: window.innerWidth * 0.08, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.7, ease: "back.out(1.8)" }
    );
  }

  function checkCards() {
    if (!listShown || !strip) return;
    var stripRect = strip.getBoundingClientRect();
    cards.forEach(function (card) {
      if (card.getAttribute("data-revealed")) return;
      var r = card.getBoundingClientRect();
      var visibleW = Math.min(r.right, stripRect.right) - Math.max(r.left, stripRect.left);
      if (visibleW >= r.width * 0.25) revealCard(card);
    });
  }

  var setStart = 0; // 真ん中のセットの先頭位置(px)
  var setWidth = 0; // 1セットの幅(px)

  function measure() {
    if (!strip || cards.length < setSize * 3) return;
    setStart = cards[setSize].offsetLeft;
    setWidth = cards[setSize * 2].offsetLeft - setStart;
  }

  function wrap() {
    if (!strip || !setWidth) return;
    var sl = strip.scrollLeft;
    if (sl >= setStart + setWidth || sl < setStart) {
      var n = Math.floor((sl - setStart) / setWidth);
      strip.scrollLeft = sl - n * setWidth;
    }
  }

  if (strip) {
    measure();
    // 記事から戻った場合は、クリックしたときの位置に戻す
    var savedReturn = readReturn();
    if (savedReturn && typeof savedReturn.scrollLeft === "number" && window.location.hash === "#list") {
      strip.scrollLeft = savedReturn.scrollLeft;
    } else {
      strip.scrollLeft = setStart;
    }
    try { window.sessionStorage.removeItem(RETURN_KEY); } catch (err) { /* 何もしない */ }
    strip.addEventListener("scroll", function () {
      wrap();
      checkCards();
    }, { passive: true });
  }

  window.addEventListener("resize", function () {
    if (!strip || !setWidth) return;
    var offset = (((strip.scrollLeft - setStart) % setWidth) + setWidth) % setWidth;
    measure();
    strip.scrollLeft = setStart + offset;
    checkCards();
  });

  var IDLE_MS = 3000; // 操作がなくなってから、動き出すまでの時間(ms)
  var HINT_DISTANCE = 0.12; // 送る幅（画面幅に対する割合）
  var idleTimer = null;

  var hint = document.getElementById("js-blog-hint");

  function stopHint() {
    window.clearTimeout(idleTimer);
    if (hint) hint.classList.remove("is-shown");
    if (hasGsap && strip) window.gsap.killTweensOf(strip);
  }

  function scheduleHint() {
    stopHint();
    if (!listLatched || !strip) return;
    idleTimer = window.setTimeout(function () {
      if (hint) hint.classList.add("is-shown");
      if (hasGsap && !reduceMotion) playHint();
    }, IDLE_MS);
  }

  function playHint() {
    var start = strip.scrollLeft;
    var d = window.innerWidth * HINT_DISTANCE;
    window.gsap.to(strip, {
      scrollLeft: start + d,
      duration: 1.2,
      ease: "power2.inOut",
      onComplete: function () {
        window.gsap.to(strip, { scrollLeft: start, duration: 1.2, ease: "power2.inOut" });
      },
    });
  }

  ["wheel", "touchstart", "touchend", "pointerdown", "keydown"].forEach(function (name) {
    window.addEventListener(name, scheduleHint, { passive: true });
  });

  var listShown = false;

  var listLatched = false; // 一度一覧が出たら true のまま（FVに戻さない）

  function getRange() {
    return document.documentElement.scrollHeight - window.innerHeight;
  }

  function getProgress() {
    var range = getRange();
    if (range <= 0) return 1;
    return Math.min(1, Math.max(0, window.pageYOffset / range));
  }

  function updateHeader() {
    document.body.classList.toggle("is-blog-fv", !listLatched);
    document.documentElement.classList.toggle("is-blog-list", listLatched);
    document.body.classList.toggle("is-blog-list", listLatched);
  }

  function ramp(x, from, to) {
    return Math.min(1, Math.max(0, (x - from) / (to - from)));
  }

  // 記事（紙）が中央で止まったあと、少しでも上へスクロールしたら、残りを自動で上まで送る
  var autoFrame = null;
  function autoScrollTo(to) {
    var from = window.pageYOffset;
    var startAt = null;
    var DURATION = 900;
    function step(now) {
      if (startAt === null) startAt = now;
      var k = Math.min(1, (now - startAt) / DURATION);
      var eased = 1 - Math.pow(1 - k, 3);
      window.scrollTo(0, from + (to - from) * eased);
      autoFrame = k < 1 ? requestAnimationFrame(step) : null;
    }
    autoFrame = requestAnimationFrame(step);
  }

  // 順番：FV1（中央の画像）→ 記事（紙）が下から出て中央で止まり、もう一度スクロールすると上へ消える → 記事一覧
  // ブラウザのズーム(例:90%)だと端数px分、scrollYが本当のrangeに届かないことがあるため、少し手前でも「着いた」とみなす
  var RANGE_EPS = 2;

  function onScroll() {
    var H = window.innerHeight;
    var range = getRange();
    var sy = window.pageYOffset;

    if (listLatched) {
      if (sy < range - RANGE_EPS) {
        window.scrollTo(0, range);
        sy = range;
      }
    } else if (sy >= range - RANGE_EPS) {
      listLatched = true;
      scheduleHint();
    }

    var AUTO_START = H * 1.5 + H * 0.04;
    if (!listLatched && autoFrame === null && sy > AUTO_START && range > sy) {
      autoScrollTo(range);
    }

    // 下から出て中央で止まり、もう一度スクロールすると上へ消える（記事一覧に切り替わったあとは、消えたまま）
    var enter = listLatched ? 1 : ramp(sy, 0, H);
    var exit = listLatched ? 1 : ramp(sy, H * 1.5, Math.max(range, H * 1.5 + 1));

    // FV1（中央の画像・BLOG）は、記事一覧に切り替わるまでそのまま残す。その上に、記事（紙）が下から出てくる
    // 中央の画像は、記事（紙）と一緒に上へ消えていく
    if (image) {
      image.style.opacity = listLatched ? "0" : "";
      image.style.transform = "translate(-50%, calc(-50% - " + (exit * 100) + "vh))";
    }
    if (title) title.style.opacity = listLatched ? "0" : "";
    if (fv) fv.style.display = listLatched ? "none" : "";

    if (fv2) fv2.style.transform = "translateY(" + ((1 - enter) * 100 - exit * 100) + "%)";

    if (list) list.classList.toggle("is-shown", listLatched);
    if (listLatched !== listShown) {
      listShown = listLatched;
      if (listShown) checkCards();
    }
    updateHeader();
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  window.addEventListener("load", checkCards);
  window.addEventListener("pageshow", checkCards);
  window.addEventListener("orientationchange", function () { window.setTimeout(checkCards, 300); });
  window.setTimeout(checkCards, 1200);

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  if (window.location.hash === "#list") {
    window.scrollTo(0, Math.round(getRange()));
  }
  onScroll();

  window.addEventListener("wheel", function (e) {
    if (!listLatched || !strip || e.ctrlKey) return; // ctrl+ホイールはブラウザの拡大
    if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return; // 横方向の操作はそのまま使う
    e.preventDefault();
    var unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
    strip.scrollLeft += e.deltaY * unit;
  }, { passive: false });

  var touchX = null;
  var touchY = null;
  if (strip) {
    strip.addEventListener("touchstart", function (e) {
      touchX = e.touches[0].clientX;
      touchY = e.touches[0].clientY;
    }, { passive: true });

    strip.addEventListener("touchmove", function (e) {
      if (!listLatched || touchY === null) return;
      var x = e.touches[0].clientX;
      var y = e.touches[0].clientY;
      var dx = x - touchX;
      var dy = touchY - y; // 指を上へ動かす（下にスクロール）と、dy はプラス
      touchX = x;
      touchY = y;
      if (Math.abs(dy) <= Math.abs(dx)) return; // 横の動きはブラウザに任せる
      e.preventDefault();
      strip.scrollLeft += dy;
    }, { passive: false });

    strip.addEventListener("touchend", function () {
      touchX = null;
      touchY = null;
    }, { passive: true });
  }

  function readReturn() {
    try { return JSON.parse(window.sessionStorage.getItem(RETURN_KEY) || "null"); } catch (err) { return null; }
  }
  function writeReturn(value) {
    try { window.sessionStorage.setItem(RETURN_KEY, JSON.stringify(value)); } catch (err) { /* 保存できなくても動くようにする */ }
  }

  var opening = false;

  // スワイプや戻るボタンで、記事に行く直前の状態（拡大中のカード）が復元されたときは、コピーを消して一覧に戻す
  window.addEventListener("pageshow", function (e) {
    if (!e.persisted) return;
    document.querySelectorAll("body > .js-blog-card").forEach(function (clone) { clone.remove(); });
    cards.forEach(function (card) { card.style.visibility = ""; });
    opening = false;
  });

  if (track) {
    track.addEventListener("click", function (e) {
      // 新しいタブで開く操作（Ctrl・Cmd・中ボタン・Shift）は、そのまま通す
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var link = e.target.closest ? e.target.closest("a") : null;
      if (!link || !track.contains(link)) return;
      var card = link.closest(".js-blog-card");
      var href = link.getAttribute("href");
      e.preventDefault();
      if (opening || !href) return;
      opening = true;

      if (!hasGsap || reduceMotion || !card) {
        window.location.href = href;
        return;
      }
      stopHint();

      var r = card.getBoundingClientRect();
      writeReturn({
        rect: { x: r.left, y: r.top, w: r.width, h: r.height },
        scrollLeft: strip.scrollLeft,
        opening: true,
      });

      var clone = card.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.style.cssText =
        "position:fixed;left:" + r.left + "px;top:" + r.top + "px;" +
        "width:" + r.width + "px;height:" + r.height + "px;" +
        "margin:0;transform:none;opacity:1;visibility:visible;pointer-events:none;z-index:50;";
      document.body.appendChild(clone);
      card.style.visibility = "hidden";

      var target = { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
      if (window.matchMedia && window.matchMedia("(min-width: 768px)").matches) {
        var ratio = r.width / r.height;
        var targetH = Math.max(window.innerHeight, window.innerWidth / ratio);
        var targetW = targetH * ratio;
        target = {
          left: (window.innerWidth - targetW) / 2,
          top: (window.innerHeight - targetH) / 2,
          width: targetW,
          height: targetH,
        };
      }

      window.gsap.to(clone, {
        left: target.left,
        top: target.top,
        width: target.width,
        height: target.height,
        duration: 0.7,
        ease: "power2.inOut",
        onComplete: function () {
          window.location.href = href;
        },
      });
    });
  }
})();
