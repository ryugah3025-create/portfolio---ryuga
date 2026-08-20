// ハンバーガーメニュー
const hamburger = document.querySelector(".hamburger");
const hMenu = document.querySelector(".h-menu");
hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("hamburger-none");
    hMenu.classList.toggle("menuIn");
});

// 画面トップに戻るボタンの実装
const backBn = document.querySelector("#back-bn");
window.addEventListener("scroll", () => {
    if (window.scrollY > 500) {
        backBn.classList.add("in");
        backBn.addEventListener("click", () => {
            window.scroll({
                top: 0,
                behavior: "smooth",
            })
        });
    } else {
        backBn.classList.remove("in");
    }
});

