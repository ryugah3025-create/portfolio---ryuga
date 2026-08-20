    <div class="modal">
        <div class="modal-content">
            <div class="modal-close"><a href="javascript:void(0)">close</a></div>
            <div class="modal-img">
                <img class="modal-thumbnail" src="" alt="">
            </div>
            <div class="modal-text-area">
                <h1 class="modal-title"></h1>
                <dl>
                    <dt>概要：</dt>
                    <dd class="overview-text"></dd>
                    <dt>制作範囲：</dt>
                    <dd class="range-text"></dd>
                    <dt>制作期間：</dt>
                    <dd class="period-text"></dd>
                    <dt>使用ツール：</dt>
                    <dd class="tool-text"></dd>
                    <dt>使用言語：</dt>
                    <dd class="language-text"></dd>
                </dl>
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
    const overviewText = document.querySelector(".overview-text");
    const rangeText = document.querySelector(".range-text");
    const periodText = document.querySelector(".period-text");
    const toolText = document.querySelector(".tool-text");
    const languageText = document.querySelector(".language-text");
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
        overviewText.textContent = resultModalContent.overview;
        rangeText.textContent = resultModalContent.range;
        periodText.textContent = resultModalContent.period;
        toolText.textContent = resultModalContent.tool;
        languageText.textContent = resultModalContent.language;
        moreBtn.href = resultModalContent.link;
        moreBtn.setAttribute('href', resultModalContent.lick);
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

    const targetModalArray = [
        {
            id: 1,
            thumbnail: "https://ryuga325.digick.jp/images/modal_ph01.jpg",
            titlemodal: "店名：ポートフォリオ",
            overview: "このサイトは、自身が一から手がけた作品や、関わってきたプロジェクトを記録として残しておくために立ち上げました。",
            range: "企画、設計、デザイン、開発",
            period: "1.5ヶ月",
            tool: "Photoshop/Illustrator/VSCode",
            language: "HTML/PHP/SCSS(CSS)/JavaScript/CMS（一部使用)",
            lick: "https://ryuga325.digick.jp/",
        },
        {
            id: 2,
            thumbnail: "https://ryuga325.digick.jp/images/modal_ph02.jpg",
            titlemodal: "店名：1/f private salon",
            overview: "知人の紹介でネイルサロンのWebサイトを制作しました。オーナーさんに掲載したい情報やデザインのイメージをヒアリングし、店内の雰囲気に合わせたデザインを提案し、企画から制作までを一貫して担当しました。",
            range: "企画、設計、デザイン、開発、運用",
            period: "2ヶ月",
            tool: "Photoshop/Illustrator/VSCode",
            language: "HTML/PHP/SCSS(CSS)/JavaScript(jQuery)/CMS（一部使用)",
            lick: "https://fbunno1.mods.jp/",
        },
        {
            id: 3,
            thumbnail: "https://ryuga325.digick.jp/images/modal_ph03.jpg",
            titlemodal: "店名：武蔵家 松戸店",
            overview: "武蔵家の魅力をもっと多くの人に届けたいと思い、QRコードでアクセスできるスマホに特化した紹介サイトを作成しました。並んでる間にも食欲が爆発する、よだれ注意なサイトを作成しました！",
            range: "企画、設計、デザイン、開発",
            period: "2ヶ月",
            tool: "Photoshop/Illustrator/Git/VSCode",
            language: "HTML/SCSS(CSS)/JavaScript",
            lick: "http://matsudo-musashiya.site/",
        },
        {
            id: 4,
            thumbnail: "https://ryuga325.digick.jp/images/modal_ph04.jpg",
            titlemodal: "店名：訪問看護ステーション 中川",
            overview: "代表の熱い想いと事業の真価を整理し、地域に信頼を届けるWebサイトへ。「悪くなってからではなく、悪くならないように支える」という姿勢と、一人ひとりの人生に誠実に寄り添う看護のかたちを、安心感のあるデザインと丁寧な情報設計で表現しました。",
            range: "企画、設計、デザイン、開発",
            period: "2ヶ月",
            tool: "Photoshop/Illustrator/VSCode",
            language: "HTML/SCSS(CSS)/JavaScript",
            lick: "https://houmon-nakagawa.site/",
        },
        {
            id: 5,
            thumbnail: "https://ryuga325.digick.jp/images/modal_ph.jpg",
            titlemodal: "店名：株式会社 4life",
            overview: "代表から直接伺った熱い想いや会社のコンセプトを深く噛み砕き、その世界観をそのままサイトのデザインへ愚直に落とし込んでいます。言葉とデザインが一丸となったサイトを、ぜひご覧ください。",
            range: "企画、設計、デザイン、開発",
            period: "1.5ヶ月",
            tool: "Photoshop/Illustrator/VSCode",
            language: "HTML/SCSS(CSS)/JavaScript",
            lick: "https://houmon-nakagawa.site/",
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