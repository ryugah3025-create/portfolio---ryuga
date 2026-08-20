document.addEventListener('DOMContentLoaded', () => {
    const html = document.documentElement;
    const body = document.body;
    const text = document.querySelector('.firstViewText');
    const scrollHint = document.querySelector('.scrooll');
    const header = document.querySelector('.headerWrap');

    if (!text) return;

    // --- 初期設定：ヘッダーを隠しておく ---
    if (scrollHint) scrollHint.style.opacity = "0";
    if (header) header.classList.add('is-hidden');

    html.classList.add('is-lock');
    body.classList.add('is-lock');

    // --- タイピングアニメーションのロジック（中略） ---
    const nodes = Array.from(text.childNodes);
    text.innerHTML = '';
    let charIndex = 0;
    const delayStep = 0.06;
    nodes.forEach(node => {
        if (node.nodeType === 3) {
            const cleanText = node.textContent.trim().replace(/[\n\r\t]/g, "");
            if (cleanText.length === 0) return;
            cleanText.split('').forEach(char => {
                const span = document.createElement('span');
                span.textContent = char;
                span.classList.add('char');
                span.style.transitionDelay = `${charIndex * delayStep}s`;
                text.appendChild(span);
                charIndex++;
            });
        } else if (node.nodeName === 'BR') {
            text.appendChild(document.createElement('br'));
        }
    });

    requestAnimationFrame(() => {
        text.classList.add('is-show');
    });

    const animationDuration = (charIndex * delayStep * 1000) + 1000;

    setTimeout(() => {
        // 1. スクロールロック解除
        html.classList.remove('is-lock');
        body.classList.remove('is-lock');

        // 2. スクロールヒント表示
        if (scrollHint) {
            scrollHint.classList.add('is-show');
            scrollHint.style.opacity = "";
        }

        // 3. 【重要】解除直後に判定関数を1回だけ手動で実行する
        // これにより、0px地点（100px以内）なら隠れたまま、
        // もし何らかの理由ですでにスクロールしてれば出す、という挙動になります。
        if (header) {
            updateHeaderVisibility(header);
            // 4. その後、スクロールイベントの監視を開始
            window.addEventListener('scroll', () => updateHeaderVisibility(header));
        }

        console.log('Animation done: Scroll enabled & observer started');
    }, animationDuration);
});

// --- 上下100px判定用の関数（共通化） ---
function updateHeaderVisibility(header) {
    const scrollY = window.scrollY;
    const fullHeight = document.documentElement.scrollHeight;
    const browserHeight = window.innerHeight;
    const bottomPos = fullHeight - browserHeight;

    // 上から100px以内、または下から100px以内なら隠す
    if (scrollY <= 500 || scrollY >= bottomPos - 400) {
        header.classList.add('is-hidden');
    } else {
        header.classList.remove('is-hidden');
    }
}

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
    const accordionBtns = document.querySelectorAll('.accordionBtn');

    accordionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // ボタンの見た目を切り替え
            btn.classList.toggle('is-active');

            // 次の要素（featureList）を取得して表示切り替え
            const list = btn.nextElementSibling;
            list.classList.toggle('is-open');

            // テキストを切り替える（親切設計）
            if (btn.classList.contains('is-active')) {
                btn.textContent = '詳細内容を閉じる';
            } else {
                btn.textContent = '詳細内容を表示';
            }
        });
    });
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
