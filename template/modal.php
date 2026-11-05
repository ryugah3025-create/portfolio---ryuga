    <div class="modal">
        <div class="modal-content">
            <div class="modal-close"><a href="javascript:void(0)">close</a></div>
            <div class="modal-img">
                <img class="modal-thumbnail" src="" alt="">
            </div>
            <div class="modal-text-area">
                <h1 class="modal-title"></h1>
                <p class="modal-note"></p>
                <!-- 項目（サイトのコンセプト・担当した内容など）は、下のtargetModalArrayの内容から自動で並べる -->
                <dl class="modal-detail"></dl>
                <div class="botton-amine rotateback">
                    <a class="more-btn" href="" target="_blank"><span>MORE</span><span>click</span></a>
                </div>
            </div>
        </div>
    </div>
    <script>
    const modalBtn = document.querySelectorAll(".js-modal-btn");
    const modal = document.querySelector(".modal");
    const modalClose = document.querySelector(".modal-close");

    const modalThumbnail = document.querySelector(".modal-thumbnail");
    const modalTitle = document.querySelector(".modal-title");
    const modalNote = document.querySelector(".modal-note");
    const modalDetail = document.querySelector(".modal-detail");
    // モーダルに表示する項目と見出し。値が空の項目は表示しない
    // （値を配列にすると、1要素ずつ段落に分けて表示する）
    const modalFields = [
        { key: "purpose", label: "サイトのコンセプト：" },
        { key: "overview", label: "概要：" },
        { key: "role", label: "担当した内容：" },
        { key: "range", label: "制作範囲：" },
        { key: "period", label: "制作期間：" },
        { key: "update", label: "公開後の更新方法：" },
        { key: "tool", label: "使用ツール：" },
        { key: "language", label: "使用言語：" },
    ];
    const moreBtn = document.querySelector(".more-btn");
    const eventBtn = (event) => {
        const nowClickedElement = event.currentTarget;
        const nowClickedKey = nowClickedElement.dataset.key;

        function getModalContent(clicked) {
        return clicked.id == nowClickedKey;
        }

        const resultModalContent = targetModalArray.find(getModalContent);

        modalThumbnail.setAttribute('src', resultModalContent.thumbnail);
        modalTitle.textContent = resultModalContent.titlemodal;
        modalNote.textContent = resultModalContent.note || "";
        modalNote.style.display = resultModalContent.note ? "" : "none";
        modalDetail.innerHTML = "";
        modalFields.forEach(field => {
            const value = resultModalContent[field.key];
            if (!value || (Array.isArray(value) && !value.length)) return;
            const dt = document.createElement("dt");
            dt.textContent = field.label;
            const dd = document.createElement("dd");
            (Array.isArray(value) ? value : [value]).forEach(text => {
                const para = document.createElement("p");
                para.textContent = text;
                dd.appendChild(para);
            });
            modalDetail.appendChild(dt);
            modalDetail.appendChild(dd);
        });
        moreBtn.href = resultModalContent.link;
        moreBtn.setAttribute('href', resultModalContent.lick);
        // リンク先がない実績(デモサイトなど)は、MOREボタンを出さない
        moreBtn.parentNode.style.display = resultModalContent.lick ? "" : "none";
        modal.classList.add("is-active");
    };
    modalBtn.forEach(ele => {ele.addEventListener("click", eventBtn)});
    const eventClose = function() {
        modal.classList.remove("is-active");
    };
    modalClose.addEventListener("click", eventClose)
    const frameClose = function (e) {
        if (e.target == modal) {
            console.log(e.target);
            modal.classList.remove("is-active");
        }
    };
    window.addEventListener("click", frameClose)

    // モーダル表示中は、後ろのページ(本体)をスクロールさせない。
    // ※ bodyにoverflow:hiddenは使わない（position:stickyが効かなくなるため）ので、
    //   wheel/touchmove/キー操作を捕まえて止める。captureで先に受け取り、
    //   works-gallery.js・top-works.jsのスクロール演出にも届かないようにする。
    //   モーダル自体(.modal)に縦スクロールの余地があるときだけ、その中はスクロールできる
    const modalCanScroll = (dy) => {
        if (dy < 0) return modal.scrollTop > 0;
        if (dy > 0) return modal.scrollTop + modal.clientHeight < modal.scrollHeight - 1;
        return false;
    };
    window.addEventListener("wheel", (e) => {
        if (!modal.classList.contains("is-active")) return;
        e.stopPropagation();
        if (!modal.contains(e.target) || !modalCanScroll(e.deltaY)) e.preventDefault();
    }, { capture: true, passive: false });
    let modalTouchY = null;
    window.addEventListener("touchstart", (e) => {
        if (!modal.classList.contains("is-active")) return;
        e.stopPropagation();
        modalTouchY = e.touches.length === 1 ? e.touches[0].clientY : null;
    }, { capture: true, passive: true });
    window.addEventListener("touchmove", (e) => {
        if (!modal.classList.contains("is-active")) return;
        e.stopPropagation();
        if (modalTouchY === null) { e.preventDefault(); return; }
        const y = e.touches[0].clientY;
        const dy = modalTouchY - y;
        modalTouchY = y;
        if (!modalCanScroll(dy)) e.preventDefault();
    }, { capture: true, passive: false });
    window.addEventListener("keydown", (e) => {
        if (!modal.classList.contains("is-active")) return;
        if (e.key === "Escape") { eventClose(); return; }
        const step = { ArrowDown: 40, ArrowUp: -40, PageDown: modal.clientHeight * 0.9, PageUp: -modal.clientHeight * 0.9, " ": modal.clientHeight * 0.9, End: modal.scrollHeight, Home: -modal.scrollHeight, ArrowLeft: 0, ArrowRight: 0 }[e.key];
        if (step === undefined) return;
        e.stopPropagation();
        e.preventDefault();
        modal.scrollBy(0, e.shiftKey && e.key === " " ? -step : step);
    }, true);

    const targetModalArray = [
        {
            id: "demo",
            thumbnail: "/images/works/demo-site.jpg",
            titlemodal: "デモサイト（LPサイト）",
            purpose: [
                "まだサイトを持っていない企業様や、以前に作ったサイトをリニューアルしたいけれど予算は抑えたい方に向けて作りました。",
                "早く用意したい、でもデザイン性と機能性にはこだわりたいという方にぴったりです。",
                "このデモサイトは販売も行っています。運用サービスをご利用の場合は、このサイトを無償で提供しますので、まずはお気軽にご相談ください。",
            ],
            role: "企画（コンセプトづくり）→ 設計（ページ構成）→ デザイン → 開発（サイトの制作）",
            period: "約1.5か月",
            lick: "https://ryuga325.digick.jp/subscription/indexDemo.html",
        },
        {
            // ポートフォリオ（現在は一覧に表示していない）
            id: 1,
            thumbnail: "/images/works/portfolio.jpg",
            titlemodal: "店名：ポートフォリオ",
            overview: "これから先、便利なツールやAIが進化し、一定のクオリティのWebサイトは、誰でも作れる時代になっていくと思います。だからこそ、これからのWeb制作で大切になるのは、「誰と仕事をするのか」「どんな想いを持っているのか」「どのようなプロセスで形にしていくのか」そして、人だからこそ考えられる「その企業・お店にしかない表現」だと考えています。このポートフォリオでは、単に制作実績を並べるのではなく、「この人と一緒に仕事をしたい」と思っていただけることを目指しました。一つひとつのサイトに込めた意図や、デザイン・構成の背景まで含めて、制作物をご紹介しています。",
            range: "企画、設計、デザイン、開発",
            period: "1.5ヶ月",
            tool: "Photoshop/Illustrator/VSCode",
            language: "HTML/PHP/SCSS(CSS)/JavaScript/CMS（一部使用)",
            lick: "https://ryuga325.digick.jp/",
        },
        {
            id: 2,
            thumbnail: "/images/works/nail-1f.jpg",
            titlemodal: "1/f private salon（長野県松本市・プライベートサロン）",
            purpose: [
                "プライベートサロンの魅力である、落ち着いた空間と心地よさを、Webサイトでも感じていただくこと。",
                "情報を伝えるだけでなく、サイトを開いた瞬間から「この空間でゆっくり過ごしてみたい」と思っていただけるよう、余白を活かした落ち着きのあるデザインにしました。写真・色・文字・余白のバランスを意識して設計し、サロンの世界観をそのままWeb上で表現しています。",
            ],
            role: ["企画（コンセプトづくり）→ 設計（ページ構成）→ デザイン → 開発（サイトの制作）→ 公開",],
            period: "約2か月",
            update: "WordPressで構築しているため、お知らせなどの更新や運用は、お客様ご自身で行っていただいています。",
            lick: "https://fbunno1.mods.jp/",
        },
        {
            id: 3,
            thumbnail: "/images/works/musashiya.jpg",
            titlemodal: "武蔵家 松戸店（ラーメン店）のQRサイト",
            purpose: [
                "料理を待っている時間や、列に並んでいる時間に見てもらうためのサイト。",
                "「食べる前に、もっとこの店やラーメンのことを知ってもらう。」知れば知るほど「早く食べたい」「もっと食べたい」と思ってもらえるよう、来店前の期待感を高めることを目的にしました。限られた時間でも楽しんで見てもらえるよう、写真や文章の見せ方、ページの流れまで含めて設計しています。",
            ],
            role: "企画（コンセプトづくり）→ 設計（ページ構成）→ デザイン → 開発（サイトの制作）",
            period: "約2か月",
            update: "公開後の修正や更新は、その都度ご連絡をいただき、制作した私が直接対応しています。",
            lick: "http://matsudo-musashiya.site/",
        },
        {
            id: 4,
            thumbnail: "/images/works/nakagawa.jpg",
            titlemodal: "訪問看護ステーション 中川（訪問看護）",
            purpose: [
                "看護を必要としている方やご家族が見たときに、訪問看護ステーション 中川様のそのままの良さが伝わるよう設計しました。",
                "丸みのあるフォントや色で温かみを出しながら、全体は誠実でしっかりとした作りに。「悪くならないように支える」という姿勢や、一人ひとりの人生に寄り添う看護のあり方を、代表の想いとあわせて言葉とデザインに落とし込みました。",
            ],
            role: "企画（コンセプトづくり）→ 設計（ページ構成）→ デザイン → 開発（サイトの制作）",
            period: "約2か月",
            update: "公開後は、分析をもとに目的に合わせた修正や更新を、対応させていただいております。",
            lick: "https://houmon-nakagawa.site/",
        },
        {
            id: 5,
            thumbnail: "/images/modal_ph.jpg",
            titlemodal: "株式会社 4life（コーポレートサイト）",
            note: "※現在、公開準備中です。公開まで、いましばらくお待ちください。",
            purpose: [
                "代表から直接伺った熱い想いと会社のコンセプトを、言葉とデザインの両方で伝えるためのサイトです。",
                "想いやコンセプトを深く噛み砕き、その世界観をそのままデザインに落とし込みました。言葉とデザインが一丸となった、会社らしさが伝わるサイトを目指しています。",
            ],
            role: "企画（コンセプトづくり）→ 設計（ページ構成）→ デザイン → 開発（サイトの制作）",
            period: "約1.5か月",
            // 公開準備中のため、MOREボタンは出さない
            lick: "",
        },
        {
            id: "private1",
            thumbnail: "https://ryuga325.digick.jp/images/priveta/modal_ph12.jpg",
            titlemodal: "店名：ホットペッパーグルメ",
            overview: "総画面数1,000以上に及ぶ大規模Webサイトにおいて、既存ページの改修をはじめ、キャンペーンページの制作や新規機能の実装など、サイト全体の用件定義・開発・運用を幅広く対応しています。",
            range: "用件定義、開発・保守・運用",
            period: "1年以上",
            tool: "figma/Git/jenkins/JIRA/confluence/VSCode",
            language: "HTML/SCSS(CSS)/JavaScript/Vue/jQuery/JAVA/JSP",
            lick: "https://www.hotpepper.jp/SA11/",
        },
        {
            id: "private2",
            thumbnail: "https://ryuga325.digick.jp/images/priveta/modal_ph01.jpg",
            titlemodal: "店名：スターツデベロップメント株式会社",
            overview: "ホームページと「ブランド」画面の制作を行いました。",
            range: "開発",
            period: "0.5ヶ月",
            tool: "Photoshop/Illustrator/VSCode",
            language: "HTML/SCSS(CSS)/JavaScript(jQuery)",
            lick: "https://www.starts-development.co.jp/",
        },
        {
            id: "private3",
            thumbnail: "https://ryuga325.digick.jp/images/priveta/modal_ph02.jpg",
            titlemodal: "店名：しまねの伝統工芸と食品 いいものしまね",
            overview: "サイトリニューアルに際しては、デザイナーと打ち合わせを重ね、製造（実装）目線での観点から、実装が難しい点や実装上避けたい点について意見を共有しながら、現実的かつ実現可能な形での制作を進めました。",
            range: "開発",
            period: "1.5ヶ月",
            tool: "Photoshop/Illustrator/VSCode",
            language: "HTML/SCSS(CSS)/JavaScript(jQuery)",
            lick: "https://www.iimono-shimane.jp/",
        },
        {
            id: "private4",
            thumbnail: "https://ryuga325.digick.jp/images/priveta/modal_ph03.jpg",
            titlemodal: "店名：しまねジョブガール",
            overview: "2023年のインタビューページ（/interview2023/）の制作を担当しました。デザイナーからのデザイン納品後、約1ヶ月で実装・調整を行い、納品まで対応しました。",
            range: "開発",
            period: "1ヶ月",
            tool: "Photoshop/Illustrator/VSCode",
            language: "HTML/SCSS(CSS)/JavaScript(jQuery)",
            lick: "https://www.shimane-jobgirl.com/",
        },
        {
            id: "private5",
            thumbnail: "https://ryuga325.digick.jp/images/priveta/modal_ph04.jpg",
            titlemodal: "店名：株式会社住宅サービスLP作成",
            overview: "住宅サービス様のランディングページの制作を行いました。",
            range: "開発",
            period: "0.5ヶ月",
            tool: "Photoshop/Illustrator/VSCode",
            language: "HTML/SCSS(CSS)",
            lick: "https://www.j-s.jp/monohoshi/",
        },
        {
            id: "private6",
            thumbnail: "https://ryuga325.digick.jp/images/priveta/modal_ph09.jpg",
            titlemodal: "店名：道の駅 うえの",
            overview: "ホームページ（一部）および「上野村でしたいこと」ページの制作を担当しました。また、定期的な情報更新や画像の差し替え、ページの体裁調整などの運用業務にも対応しておりました。",
            range: "開発・保守・運用",
            period: "開発（0.5ヶ月）",
            tool: "Photoshop/Illustrator/VSCode",
            language: "HTML/SCSS(CSS)/JavaScript(jQuery)",
            lick: "https://www.michinoeki-ueno.jp/",
        },
        {
            id: "private7",
            thumbnail: "https://ryuga325.digick.jp/images/priveta/modal_ph05.jpg",
            titlemodal: "店名：株式会社 フジクラ",
            overview: "NORENというCMSの構築および保守・運用を担当しておりました。入社時より退職者からの業務引き継ぎを受け、一時的に属人化していた状況でしたが、自ら一から仕様書やマニュアルを作成し、他メンバーでも対応可能な体制を構築しました。",
            range: "保守・運用",
            period: "特になし",
            tool: "Photoshop/Illustrator/VSCode",
            language: "HTML/SCSS(CSS)/CMS(NOREN)",
            lick: "https://www.fujikura.co.jp/",
        },
        {
            id: "private8",
            thumbnail: "https://ryuga325.digick.jp/images/priveta/modal_ph07.jpg",
            titlemodal: "店名：株式会社 Japanエアロ インスペクション",
            overview: "定期的な情報更新や画像の差し替え、ページの一部体裁の調整などを行っておりました。また、保守性向上のためにコードのリファクタリングにも取り組んでおりました。",
            range: "保守・運用",
            period: "特になし",
            tool: "Photoshop/Illustrator/VSCode",
            language: "HTML/CSS)/JavaScript(jQuery)",
            lick: "https://www.jai-c.jp/",
        },
        {
            id: "private9",
            thumbnail: "https://ryuga325.digick.jp/images/priveta/modal_ph08.jpg",
            titlemodal: "店名：NCA日本貨物航空株式会社",
            overview: "定期的な情報更新や画像の差し替え、ページの一部体裁の調整などを行っておりました。また、保守性向上のためにコードのリファクタリングにも取り組んでおりました。",
            range: "保守・運用",
            period: "特になし",
            tool: "Photoshop/Illustrator/VSCode",
            language: "HTML/CSS/CMS",
            lick: "https://www.nca.aero/main.html",
        },
        {
            id: "private10",
            thumbnail: "https://ryuga325.digick.jp/images/priveta/modal_ph10.jpg",
            titlemodal: "店名：株式会社 宇田川建築設計事務所",
            overview: "定期的な情報更新や画像の差し替え、ページの一部体裁の調整などを行っておりました。また、保守性向上のためにコードのリファクタリングにも取り組んでおりました。",
            range: "保守・運用",
            period: "特になし",
            tool: "Photoshop/Illustrator/VSCode",
            language: "HTML/SCSS(CSS)/JavaScript(jQuery)",
            lick: "https://udagawa-sekkei.co.jp/",
        },
        {
            id: "private11",
            thumbnail: "https://ryuga325.digick.jp/images/priveta/modal_ph11.jpg",
            titlemodal: "店名：楠原輸送 株式会社",
            overview: "定期的な情報更新や画像の差し替え、ページの一部体裁の調整などを行っておりました。また、保守性向上のためにコードのリファクタリングにも取り組んでおりました。",
            range: "保守・運用",
            period: "特になし",
            tool: "Photoshop/Illustrator/VSCode",
            language: "HTML/SCSS(CSS)",
            lick: "https://www.kusuhara.co.jp/",
        },
        {
            id: "private12",
            thumbnail: "https://ryuga325.digick.jp/images/priveta/modal_ph06.jpg",
            titlemodal: "店名：株式会社 ダイアナ",
            overview: "定期的な情報更新や画像の差し替え、ページの一部体裁の調整などを行っておりました。また、保守性向上のためにコードのリファクタリングにも取り組んでおりました。",
            range: "保守・運用",
            period: "特になし",
            tool: "Photoshop/Illustrator/VSCode",
            language: "HTML/CSS/CMS/JavaScript(jQuery)",
            lick: "https://www.diana.co.jp/",
        },
    ]
    </script>