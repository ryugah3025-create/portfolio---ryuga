document.addEventListener('DOMContentLoaded', () => {
    const workCards = document.querySelectorAll('.workCard');
    const moreBtn = document.querySelector('.workMoreBtnArea');

    // 要素がないページでは何もしない（エラー防止）
    if (!workCards.length || !moreBtn) return;

    const loadCount = 6; // 一回に追加で表示させる数
    let currentVisible = 6; // 最初に見せている数

    // 1. 初期表示の制御
    // 最初から記事が6個以下の場合は、ボタンを即座に非表示にする
    if (workCards.length <= currentVisible) {
        moreBtn.classList.add('is-none');
        // 6個以下なら隠す処理も不要なのでここで終了
        return;
    }

    // 6個目以降を隠す
    workCards.forEach((card, index) => {
        if (index >= currentVisible) {
            card.classList.add('is-hidden');
        }
    });

    // 2. ボタンクリック時の処理
    moreBtn.addEventListener('click', (e) => {
        e.preventDefault();

        // 次に見せる範囲を計算
        const nextVisible = currentVisible + loadCount;

        // 非表示カードを表示
        workCards.forEach((card, index) => {
            if (index >= currentVisible && index < nextVisible) {
                card.classList.remove('is-hidden');
                // もしふわっと出したければ、ここでアニメーション用クラスを追加
                // card.classList.add('is-show'); 
            }
        });

        currentVisible = nextVisible;

        // 全て表示しきったらボタンを消す
        if (currentVisible >= workCards.length) {
            moreBtn.classList.add('is-none');
        }
    });
});