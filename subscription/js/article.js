// 商品の紹介スライド
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('slideContainer');
    const wrapper = document.getElementById('slideWrapper');
    const originalItems = document.querySelectorAll('.slideItem');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const dotsContainer = document.getElementById('slideDots');

    if (originalItems.length <= 1) {
        if (container) container.classList.add('is-disabled');
        return;
    }

    // スワイプ時のスクロール干渉を防ぐ（重要）
    wrapper.style.touchAction = 'pan-y';

    // --- ドット生成 ---
    originalItems.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('is-active');
        dot.addEventListener('click', () => {
            if (isTransitioning) return;
            counter = index + 1;
            moveSlide(0);
        });
        dotsContainer.appendChild(dot);
    });
    const dots = dotsContainer.querySelectorAll('.dot');

    // クローン作成
    const firstClone = originalItems[0].cloneNode(true);
    const lastClone = originalItems[originalItems.length - 1].cloneNode(true);
    wrapper.appendChild(firstClone);
    wrapper.insertBefore(lastClone, originalItems[0]);

    const allItems = wrapper.querySelectorAll('.slideItem');
    let counter = 1;
    let isTransitioning = false;

    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID = 0;

    const updateDots = () => {
        dots.forEach(dot => dot.classList.remove('is-active'));
        let activeIndex = counter - 1;
        if (counter >= allItems.length - 1) activeIndex = 0;
        if (counter <= 0) activeIndex = originalItems.length - 1;
        if (dots[activeIndex]) dots[activeIndex].classList.add('is-active');
    };

    const updatePosition = () => {
        currentTranslate = -counter * 100;
        prevTranslate = currentTranslate;
        wrapper.style.transform = `translateX(${currentTranslate}%)`;
        updateDots();
    };
    updatePosition();

    const moveSlide = (direction) => {
        isTransitioning = true;
        wrapper.style.transition = "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        counter += direction;
        updatePosition();
    };

    nextBtn.addEventListener('click', () => { if (!isTransitioning) moveSlide(1); });
    prevBtn.addEventListener('click', () => { if (!isTransitioning) moveSlide(-1); });

    wrapper.addEventListener('transitionend', () => {
        isTransitioning = false;
        if (counter >= allItems.length - 1) {
            wrapper.style.transition = "none";
            counter = 1;
            updatePosition();
        }
        if (counter <= 0) {
            wrapper.style.transition = "none";
            counter = allItems.length - 2;
            updatePosition();
        }
    });

    // --- スワイプ/ドラッグ制御 ---
    const getPositionX = (e) => {
        return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    };

    // タッチ終了時専用の取得（changedTouchesを使う）
    const getEndPositionX = (e) => {
        return e.type.includes('mouse') ? e.pageX : e.changedTouches[0].clientX;
    };

    const dragStart = (e) => {
        if (isTransitioning) return;
        isDragging = true;
        startPos = getPositionX(e);
        wrapper.style.transition = "none";
        container.style.cursor = "grabbing";
    };

    const dragMove = (e) => {
        if (!isDragging) return;
        const currentPosition = getPositionX(e);
        const diff = ((currentPosition - startPos) / container.offsetWidth) * 100;
        wrapper.style.transform = `translateX(${prevTranslate + diff}%)`;
    };

    const dragEnd = (e) => {
        if (!isDragging) return;
        isDragging = false;
        container.style.cursor = "grab";

        const endPos = getEndPositionX(e);
        const movedBy = endPos - startPos;

        // 50px以上動いたらスライド、それ以下なら戻る
        if (movedBy < -50) {
            moveSlide(1);
        } else if (movedBy > 50) {
            moveSlide(-1);
        } else {
            moveSlide(0);
        }
    };

    // イベント登録
    wrapper.addEventListener('mousedown', dragStart);
    wrapper.addEventListener('touchstart', dragStart, { passive: true });

    window.addEventListener('mousemove', dragMove);
    window.addEventListener('touchmove', dragMove, { passive: false });

    window.addEventListener('mouseup', dragEnd);
    window.addEventListener('touchend', dragEnd);

    // 画像のデフォルトドラッグを禁止
    wrapper.querySelectorAll('img').forEach(img => {
        img.addEventListener('dragstart', (e) => e.preventDefault());
    });
});