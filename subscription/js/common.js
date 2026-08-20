const header = document.querySelector('header');
const mediaQuery = window.matchMedia('(min-width: 769px)');

window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
        header.classList.add('is-small');
    } else {
        header.classList.remove('is-small');
    }
});

document.addEventListener('DOMContentLoaded', () => {

    const slides = document.querySelectorAll('.firstViewImgItem');
    const dots = document.querySelectorAll('.firstViewImgdot span');
    const frame = document.querySelector('.firstViewImgFrame');

    let current = 0;
    const slideCount = slides.length;
    const intervalTime = 8000;
    let autoSlide;

    let startX = 0;
    let endX = 0;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('is-active'));

        slides[index].classList.add('is-active');

        current = index;
    }

    function nextSlide() {
        let next = (current + 1) % slideCount;
        showSlide(next);
    }

    function prevSlide() {
        let prev = (current - 1 + slideCount) % slideCount;
        showSlide(prev);
    }

    function startAutoSlide() {
        autoSlide = setInterval(nextSlide, intervalTime);
    }

    function resetAutoSlide() {
        clearInterval(autoSlide);
        startAutoSlide();
    }

    // --- スワイプ対応 ---

    frame.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });

    frame.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        handleSwipe();
    });

    frame.addEventListener('mousedown', (e) => {
        startX = e.clientX;
    });

    frame.addEventListener('mouseup', (e) => {
        endX = e.clientX;
        handleSwipe();
    });

    function handleSwipe() {
        const diff = startX - endX;

        if (Math.abs(diff) < 50) return; // 少しだけ動いたのは無視

        if (diff > 0) {
            nextSlide(); // 左スワイプ
        } else {
            prevSlide(); // 右スワイプ
        }

        resetAutoSlide();
    }

    // 初期表示
    showSlide(0);
    startAutoSlide();

});


document.addEventListener('DOMContentLoaded', () => {

    const targets = document.querySelectorAll('.js-fade');

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {

            if (entry.isIntersecting) {
                entry.target.classList.add('is-show');
                observer.unobserve(entry.target); // 一度だけ発火
            }

        });
    }, {
        threshold: 0.2,          // 20%見えたら発火
        root: null,              // ビューポート基準
        rootMargin: '0px 0px -200px 0px' // 少し手前で発火
    });

    targets.forEach(target => {
        observer.observe(target);
    });

});
document.addEventListener('DOMContentLoaded', () => {

    const text = document.querySelector('.PresidentStoryText');

    // 子ノードを取得（テキストとbrを区別する）
    const nodes = Array.from(text.childNodes);

    text.innerHTML = '';

    nodes.forEach(node => {

        // テキストノードの場合
        if (node.nodeType === 3) {

            node.textContent.split('').forEach(char => {
                const span = document.createElement('span');
                span.textContent = char;
                text.appendChild(span);
            });

        }

        // <br> の場合はそのまま追加
        if (node.nodeName === 'BR') {
            text.appendChild(document.createElement('br'));
        }

    });

    const spans = text.querySelectorAll('span');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {

                text.classList.add('is-show');

                spans.forEach((span, index) => {
                    span.style.transitionDelay = `${index * 0.03}s`;
                });

                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.3
    });

    observer.observe(text);

});

document.addEventListener('DOMContentLoaded', () => {

    const text = document.querySelector('.firstViewText');
    if (!text) return;

    const nodes = Array.from(text.childNodes);
    text.innerHTML = '';

    nodes.forEach(node => {

        if (node.nodeType === 3) {
            node.textContent.split('').forEach(char => {
                const span = document.createElement('span');
                span.textContent = char;
                span.classList.add('char');
                text.appendChild(span);
            });
        }

        if (node.nodeName === 'BR') {
            text.appendChild(document.createElement('br'));
        }

    });

    const spans = text.querySelectorAll('.char');

    // 👇ここに関数としてまとめる
    window.startTextAnimation = () => {
        text.classList.add('is-show');

        spans.forEach((span, index) => {
            span.style.transitionDelay = `${index * 0.05}s`;
        });
    };

});

const html = document.documentElement;
const body = document.body;
const loading = document.getElementById('loading');

// 【ポイント1】loading要素があるページ（トップ等）だけロックをかける
if (loading) {
    html.classList.add('is-lock');
    body.classList.add('is-lock');
}

window.addEventListener('load', () => {
    // ロックを解除する共通関数
    const unlock = () => {
        html.classList.remove('is-lock');
        body.classList.remove('is-lock');
    };

    // もしloading要素がないページなら、即座にロック解除して終了
    if (!loading) {
        unlock();
        return;
    }

    if (!sessionStorage.getItem('visited')) {
        // --- 【初回訪問時】 ---
        sessionStorage.setItem('visited', 'true');

        setTimeout(() => {
            loading.classList.add('is-hide');
            unlock(); // 確実に解除

            setTimeout(() => {
                if (window.startTextAnimation) window.startTextAnimation();
            }, 1000);
        }, 3000);

    } else {
        // --- 【2回目以降】 ---
        loading.style.display = 'none';
        unlock(); // 確実に解除

        if (window.startTextAnimation) window.startTextAnimation();
    }
});

const menuBtn = document.querySelector('.headerMenuBtn');
const nav = document.querySelector('.headerNav');
const menuText = document.querySelector('.menuText');
const main = document.querySelector('main');

// メニュー開閉
menuBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // ←これ重要
    menuBtn.classList.toggle('is-open');
    nav.classList.toggle('is-open');
    main.classList.toggle('is-open');

    menuText.textContent = menuBtn.classList.contains('is-open')
        ? 'CLOSE'
        : 'MENU';
});

// 外クリックで閉じる
document.addEventListener('click', (e) => {
    // headerの中クリックは無視
    if (header.contains(e.target)) return;

    // 開いてたら閉じる
    if (nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        menuBtn.classList.remove('is-open');
        main.classList.remove('is-open');
        menuText.textContent = 'MENU';
    }
});

// 特定のクラス（serviceContentStrength）にだけスナップを適用する
const sections = document.querySelectorAll('.serviceContentStrength');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // セクションが見えている間だけスナップを有効にする
            document.documentElement.style.scrollSnapType = "y mandatory";
        } else {
            // 外れたら無効にする
            document.documentElement.style.scrollSnapType = "none";
        }
    });
}, { threshold: 0.7 }); // 10%でも見えたらON

sections.forEach(section => observer.observe(section));

document.addEventListener('DOMContentLoaded', () => {
    const list = document.getElementById('workSliderList');
    const cards = list.querySelectorAll('.workCard');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (!list || cards.length === 0) return;

    const updateBtnStatus = () => {
        if (list.scrollWidth > list.clientWidth + 10) {
            prevBtn.classList.add('active');
            nextBtn.classList.add('active');
        } else {
            prevBtn.classList.remove('active');
            nextBtn.classList.remove('active');
        }
    };

    const moveSlider = (direction) => {
        const style = window.getComputedStyle(list);
        const gap = parseInt(style.gap) || 0;
        // offsetWidthで確実に「今見えている1枚分」を取得
        const cardWidth = cards[0].offsetWidth;
        const step = cardWidth + gap;

        // スナップを一時的に無効化
        list.style.scrollSnapType = 'none';

        // scrollToを使い、現在のscrollLeftに対して加算・減算
        // CSSにscroll-behavior: smoothがあるため、JS側のbehaviorは不要な場合が多い
        list.scrollTo({
            left: list.scrollLeft + (step * direction),
            behavior: 'smooth'
        });

        // 移動が終わるまで十分に時間を取ってからスナップを戻す
        // 移動中に戻すと「引き戻し」が発生するため1000ms（1秒）程度確保
        setTimeout(() => {
            list.style.scrollSnapType = 'x mandatory';
        }, 1000);
    };

    nextBtn.addEventListener('click', () => moveSlider(1));
    prevBtn.addEventListener('click', () => moveSlider(-1));

    window.addEventListener('resize', updateBtnStatus);
    updateBtnStatus();
});

document.addEventListener('DOMContentLoaded', () => {
    // すべて「staff」を頭につけた変数名で統一しました
    const staffList = document.getElementById('staffSliderList');
    const staffCards = document.querySelectorAll('.staffCard'); // staffList内のカードを取得
    const staffPrevBtn = document.getElementById('staffprevBtn');
    const staffNextBtn = document.getElementById('staffnextBtn');

    // 要素が存在しない、またはカードがない場合は処理を中断
    if (!staffList || staffCards.length === 0 || !staffPrevBtn || !staffNextBtn) return;

    // --- 1. ボタン表示判定 ---
    const updateBtnStatus = () => {
        if (staffList.scrollWidth > staffList.clientWidth + 10) {
            staffPrevBtn.classList.add('active');
            staffNextBtn.classList.add('active');
        } else {
            staffPrevBtn.classList.remove('active');
            staffNextBtn.classList.remove('active');
        }
    };

    // --- 2. 移動処理 ---
    const moveSlider = (direction) => {
        const style = window.getComputedStyle(staffList);
        const gap = parseInt(style.gap) || 0;
        // 定義した変数 staffCards を使用
        const cardWidth = staffCards[0].offsetWidth;
        const step = cardWidth + gap;

        // スナップを一時的に無効化（staffListに対して実行）
        staffList.style.scrollSnapType = 'none';

        // 定義した変数 staffList を使用
        staffList.scrollTo({
            left: staffList.scrollLeft + (step * direction),
            behavior: 'smooth'
        });

        // 移動が終わる頃にスナップを戻す
        setTimeout(() => {
            staffList.style.scrollSnapType = 'x mandatory';
        }, 800);
    };

    // --- 3. イベント登録 ---
    // nextBtn ではなく staffNextBtn を使用
    staffNextBtn.addEventListener('click', () => moveSlider(1));
    staffPrevBtn.addEventListener('click', () => moveSlider(-1));

    // リサイズ時にボタンの有無を再計算
    window.addEventListener('resize', updateBtnStatus);

    // 初期実行
    updateBtnStatus();
});

// faq
document.addEventListener('DOMContentLoaded', () => {
    const questions = document.querySelectorAll('.faqQuestion');

    questions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;

            // 他の開いている項目を閉じる (不要ならこのブロックを消してください)
            questions.forEach(q => {
                if (q !== question && q.classList.contains('is-active')) {
                    q.classList.remove('is-active');
                    q.nextElementSibling.style.height = '0';
                }
            });

            // 自要素の開閉切り替え
            const isOpen = question.classList.toggle('is-active');

            if (isOpen) {
                // 内容の高さに合わせて開く
                answer.style.height = `${answer.scrollHeight}px`;
            } else {
                // 閉じる
                answer.style.height = '0';
            }
        });
    });

    // 画面リサイズ時に、開いている要素の高さを再計算（ズレ防止）
    window.addEventListener('resize', () => {
        questions.forEach(q => {
            if (q.classList.contains('is-active')) {
                q.nextElementSibling.style.height = `${q.nextElementSibling.scrollHeight}px`;
            }
        });
    });
});

window.addEventListener('scroll', function () {
    const header = document.querySelector('header');
    const firstView = document.querySelector('.firstView');
    const firstViewHeight = firstView.offsetHeight; // firstViewの高さを取得

    if (window.scrollY > firstViewHeight) { // ヘッダーの高さ分などを考慮して微調整
        header.classList.add('is-scrolled');
    } else {
        header.classList.remove('is-scrolled');
    }
});