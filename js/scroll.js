// 実績一覧のアイテム(.js-work-item)が画面に入ったら、viewクラスを付けて表示する。
// 古いブラウザでも動くよう、ES5の書き方にし、IntersectionObserverに未対応の場合は最初から表示する
(function () {
    "use strict";

    var items = document.querySelectorAll(".js-work-item");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
        Array.prototype.forEach.call(items, function (el) {
            el.classList.add("view");
        });
        return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("view");
                obs.unobserve(entry.target);
            }
        });
    }, { rootMargin: "-100px 0px" });

    Array.prototype.forEach.call(items, function (el) {
        observer.observe(el);
    });
})();
