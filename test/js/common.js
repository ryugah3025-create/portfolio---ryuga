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
        dots.forEach(dot => dot.classList.remove('is-active'));

        slides[index].classList.add('is-active');
        dots[index].classList.add('is-active');

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

    // ドットクリック
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            resetAutoSlide();
        });
    });

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

    const text = document.querySelector('.OurStoryText');

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

html.classList.add('is-lock');
body.classList.add('is-lock');

window.addEventListener('load', () => {
    const loading = document.getElementById('loading');

    setTimeout(() => {
        loading.classList.add('is-hide');

        html.classList.remove('is-lock');
        body.classList.remove('is-lock');

        setTimeout(() => {
            if (window.startTextAnimation) {
                window.startTextAnimation();
            }
        }, 1000);

    }, 3000);
});

// if (!sessionStorage.getItem('visited')) {
//     sessionStorage.setItem('visited', 'true');

//     window.addEventListener('load', () => {
//         setTimeout(() => {
//             document.getElementById('loading').classList.add('is-hide');
//         }, 1500);
//     });
// } else {
//     document.getElementById('loading').style.display = 'none';
// }

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