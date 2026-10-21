(function () {
  "use strict";

  // ヘッダーの「おしながき」タブ(ボトル)とnavパネルの開閉。
  //
  // 開くとき : ①ボトルの色が下から満ちる → ②満ちたらnavパネルが膨らむ
  // 閉じるとき: ①navパネルが風船の動きを逆再生して縮む → ②ボトルの色が下へ引いて空になる（これも逆再生）
  //
  // ・PC(マウス): タブにホバーして色が満ちきったらnavが開く。タブ/パネルから離れると閉じる。クリックでも開閉できる
  // ・SP(タッチ): タブをタップ、またはスライド(ドラッグ)すると、色が満ちてnavが開く
  // ・外側のタップ・Esc・リンク選択・パネルを下にスライドで閉じる
  var tab = document.querySelector("header .hamburger");
  var menu = document.querySelector("header .h-menu");
  if (!tab || !menu) return;

  var FILLED = "hamburger-none"; // ボトルに色が満ちている
  var OPEN = "menuIn"; // navパネルが開いている
  var TAB_OPEN = "is-open"; // タブの枠を消す（パネルと一体化）
  var CLOSING = "is-closing"; // パネルが閉じている最中（開くときの動きを逆再生）

  // CSSのtransition時間(_header.scss)と合わせる
  var FILL_MS = 560; // ボトルが満ちる(.hamburger::before の transform)
  var SHRINK_MS = 900; // パネルが閉じる(逆再生。.h-menu の animation h-balloon と同じ長さ)
  var SLIDE_THRESHOLD = 16; // タブをこれ以上(px)動かしたら「スライドした」とみなす
  var HOVER_LEAVE_MS = 260; // ホバーが外れてから閉じるまでの猶予

  // closed → filling → open → closing → closed
  var state = "closed";
  var timer = null;
  var openedByHover = false;

  function clearTimer() {
    if (timer) {
      window.clearTimeout(timer);
      timer = null;
    }
  }

  function setExpanded(v) {
    tab.setAttribute("aria-expanded", v ? "true" : "false");
  }

  // ①色が満ちる → ②パネルが開く
  function openMenu() {
    if (state === "open" || state === "filling") return;
    clearTimer();
    // 閉じている最中(色がまだ満ちている)に開き直す場合は、待たずにすぐパネルを開く
    var wait = state === "closing" && tab.classList.contains(FILLED) ? 0 : FILL_MS;
    state = "filling";
    tab.classList.add(FILLED);
    timer = window.setTimeout(function () {
      timer = null;
      state = "open";
      menu.classList.remove(CLOSING);
      menu.classList.add(OPEN);
      tab.classList.add(TAB_OPEN);
      setExpanded(true);
    }, wait);
  }

  // ①パネルが縮む → ②色が引く
  function closeMenu() {
    if (state === "closed" || state === "closing") return;
    clearTimer();
    var wasOpen = state === "open";
    state = "closing";
    // 開いていたなら、風船の動きを逆再生して閉じる
    if (wasOpen) menu.classList.add(CLOSING);
    menu.classList.remove(OPEN);
    tab.classList.remove(TAB_OPEN);
    setExpanded(false);
    timer = window.setTimeout(function () {
      timer = null;
      state = "closed";
      openedByHover = false;
      menu.classList.remove(CLOSING);
      // 色を引く（開くときの逆再生）。PCでマウスがまだタブの上なら、CSSのホバーで満ちたままになる
      tab.classList.remove(FILLED);
    }, wasOpen ? SHRINK_MS : 0);
  }

  function toggle() {
    if (state === "open" || state === "filling") closeMenu();
    else openMenu();
  }

  // ---- クリック ----
  var suppressClick = false; // スライドで開いた直後の「クリック」は無視する
  tab.addEventListener("click", function () {
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    openedByHover = false; // クリックで操作したら、ホバーを外れても勝手に閉じない
    toggle();
  });

  // ---- PC: ホバーで開く ----
  var overTab = false;
  var overMenu = false;
  var leaveTimer = null;

  function onHoverChange() {
    if (leaveTimer) {
      window.clearTimeout(leaveTimer);
      leaveTimer = null;
    }
    if (overTab || overMenu) return;
    // タブにもパネルにも乗っていない：ホバーで開いた/満ちている途中なら閉じる
    if (!openedByHover) return;
    leaveTimer = window.setTimeout(function () {
      leaveTimer = null;
      if (!overTab && !overMenu) closeMenu();
    }, HOVER_LEAVE_MS);
  }

  tab.addEventListener("pointerenter", function (e) {
    if (e.pointerType !== "mouse") return;
    overTab = true;
    if (state === "closed" || state === "closing") {
      openedByHover = true;
      openMenu(); // 色が満ちきったらnavが開く
    }
    onHoverChange();
  });
  tab.addEventListener("pointerleave", function (e) {
    if (e.pointerType !== "mouse") return;
    overTab = false;
    onHoverChange();
  });
  menu.addEventListener("pointerenter", function (e) {
    if (e.pointerType !== "mouse") return;
    overMenu = true;
    onHoverChange();
  });
  menu.addEventListener("pointerleave", function (e) {
    if (e.pointerType !== "mouse") return;
    overMenu = false;
    onHoverChange();
  });

  // ---- SP: タブのスライド(タッチ/ペン) ----
  var start = null;
  tab.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse") return;
    start = { id: e.pointerId, x: e.clientX, y: e.clientY };
    try { tab.setPointerCapture(e.pointerId); } catch (err) { /* 何もしない */ }
  });
  tab.addEventListener("pointermove", function (e) {
    if (!start || e.pointerId !== start.id) return;
    var d = Math.max(Math.abs(e.clientX - start.x), Math.abs(e.clientY - start.y));
    if (d >= SLIDE_THRESHOLD) {
      start = null;
      openedByHover = false;
      openMenu();
      suppressClick = true;
      window.setTimeout(function () { suppressClick = false; }, 400);
    }
  });
  function endSlide(e) {
    if (start && e.pointerId === start.id) start = null;
  }
  tab.addEventListener("pointerup", endSlide);
  tab.addEventListener("pointercancel", endSlide);

  // ---- パネルを下にスライドすると閉じる ----
  var panelStart = null;
  menu.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse") return;
    panelStart = { id: e.pointerId, y: e.clientY };
  });
  menu.addEventListener("pointermove", function (e) {
    if (!panelStart || e.pointerId !== panelStart.id) return;
    if (e.clientY - panelStart.y > 48) {
      panelStart = null;
      closeMenu();
    }
  });
  menu.addEventListener("pointerup", function () { panelStart = null; });
  menu.addEventListener("pointercancel", function () { panelStart = null; });

  // ---- 閉じる操作 ----
  document.addEventListener("click", function (e) {
    if (state !== "open" && state !== "filling") return;
    if (tab.contains(e.target) || menu.contains(e.target)) return;
    closeMenu();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && (state === "open" || state === "filling")) {
      closeMenu();
      tab.focus();
    }
  });
  menu.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("a")) closeMenu();
  });

  // ---- 最終フッターが見えている間は、ヘッダーを隠す（フッターにnavがあるため） ----
  var ending = document.querySelector("footer.ending");
  if (ending && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var on = en.isIntersecting && en.intersectionRatio >= 0.5;
        document.body.classList.toggle("is-ending", on);
        if (on) closeMenu();
      });
    }, { threshold: [0, 0.5, 1] }).observe(ending);
  }
})();
