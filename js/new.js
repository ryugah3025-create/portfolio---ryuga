// ヘッダーのメニュー(おしながき)の開閉は header-menu.js

// 画面トップに戻るボタンの実装
const backBn = document.querySelector("#back-bn");
if (backBn) window.addEventListener("scroll", () => {
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

