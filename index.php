
  <?php $bodyClass = 'is-top'; ?>
  <?php include ( dirname(__FILE__) . '/template/header.php' ); ?>

  <link rel="stylesheet" href="/css/top-blog.css">
  <link rel="stylesheet" href="/css/top-works.css">

  <main>
    <article>
      <div class="mv-pin-wrap" id="js-mv-pin-wrap">
      <div class="mainvisual" id="js-mainvisual">
        <!-- 表示の順番（Figma「TOPファーストビュー1」）：①顔が画面の下から半分覗き込んでくる → ②「原龍我」が上から1文字ずつ降ってくる → ③「webのことなら」が現れる -->
        <div class="mv-copy">
          <p class="mv-copy-sub" id="js-mv-sub"><span class="mv-swap">webのことなら</span></p>
          <h1 class="mv-copy-title"><span class="mv-copy-title-inner" id="js-mv-title-inner"><span class="mv-swap" id="js-mv-title-text"><span class="mv-char">原</span><span class="mv-char">龍</span><span class="mv-char">我</span></span></span></h1>
        </div>
        <!-- キャラクター。フッターの顔と同じように、画面の一番下に据える。クリックすると、顔とテキストがランダムに変わる（js/mv-click.js）。
             1枚目(data-face=0)が通常の顔。最初は下半分（あご）が隠れている(内側のjs-mv-character-clipをtranslateYで下げている)。
             スクロールすると、あご下まで一気に見えるようになる。クリックできる範囲(js-mv-character)は、隠れている下半分も含めて常にフルサイズにしておく -->
        <div class="mv-stage" id="js-mv-stage">
          <div class="mv-character" id="js-mv-character">
            <div class="mv-character-clip" id="js-mv-character-clip">
              <img class="mv-face is-active" data-face="0" src="/images/mv-face-0.png" alt="原龍我">
              <img class="mv-face" data-face="1" src="/images/mv-face-1.png" alt="" aria-hidden="true">
              <img class="mv-face mv-face--wide" data-face="2" src="/images/mv-face-2.png" alt="" aria-hidden="true">
            </div>
          </div>
        </div>
      </div>
      <!-- スクロールすると、背景が黄色に変わり、「始まるよ」が「原龍我」と同じように上から1文字ずつ落ちてくる
           （Figma「TOPファーストビュー2〜3」）。そのあと、これが消えながら顔があご下まで見えるようになる -->
      <div class="mv-startyo" id="js-mv-startyo" aria-hidden="true">
        <span class="mv-startyo-char">始</span><span class="mv-startyo-char">ま</span><span class="mv-startyo-char">る</span><span class="mv-startyo-char">よ</span>
      </div>
      <div class="mv-dim" id="js-mv-dim"></div>
      <div class="mv-message" id="js-mv-message">
        <div class="mv-message-inner" id="js-mv-message-inner">
          <p>はじめまして。</p>
          <p>当サイトを<wbr>ご覧いただき、<br>ありがとうございます。</p>
          <p>これから先、<br>AIや便利なツールがさらに進化し、<br>今まで人が時間をかけていたことも、<br>どんどん簡単になって<wbr>いくと思います。</p>
          <p>誰でも、<wbr>ある程度のことは<br>自分でできる時代。</p>
          <p>だからこそ私自身、</p>
          <p>どう向き合い、<br>どうつくり、<br>どう表現するか</p>
          <p>を考え続け、<br>より良いものをつくり、<br>課題を解決していく<wbr>ことを<br>大切にしています。</p>
          <p>このサイトは、<br>ただ実績を見ていただくため<br>だけではなく、</p>
          <p>「この人と仕事がしたい」</p>
          <p>と思っていただく<wbr>ために、<br>つくりました。</p>
          <p>申し遅れました。<br>Web制作・運用を<wbr>しております、<br>原 龍我（ハラ リュウガ）<wbr>と申します。</p>
          <p id="js-mv-message-last">どうぞ、<wbr>ゆっくりご覧ください。</p>
        </div>
      </div>
      </div>
      <?php
      // BLOGセクションに出す最新の記事（記事データの先頭から3件まで）。記事を追加すると自動で入れ替わる
      $topArticles = array_slice(require __DIR__ . '/blog/data/articles.php', 0, 3);
      // 記事が3件に満たないときは、3枚になるまで最新の記事を入れて埋める（臨時）
      for ($k = count($topArticles); $k < 3 && $topArticles; $k++) {
        $topArticles[] = $topArticles[0];
      }
      $topEsc = function ($v) { return htmlspecialchars($v, ENT_QUOTES, 'UTF-8'); };
      $topCard = function ($article) use ($topEsc) {
        $iso = sprintf('%04d-%02d-%02d', $article['year'], $article['month'], $article['day']);
        ?>
          <li class="top-blog-item is-side">
            <a class="top-blog-hit" href="/blog/<?php echo $topEsc($article['slug']); ?>.php">
              <time class="top-blog-date" datetime="<?php echo $iso; ?>">
                <span class="top-blog-year"><?php echo $topEsc($article['year']); ?>ねん</span>
                <span class="top-blog-md"><?php echo $topEsc($article['month']); ?>がつ<?php echo $topEsc($article['day']); ?></span>
              </time>
              <span class="top-blog-card-title"><?php echo nl2br($topEsc($article['title'])); ?></span>
              <span class="top-blog-card-more">みる</span>
            </a>
          </li>
        <?php
      };
      ?>
      <!-- BLOGのお知らせ（Figma「top_BLOGセクション1・2」）。左に「BLOG」、右に「記事一覧」へのリンク、
           その下に案内文。さらにその下に、紙が1枚ずつ落ちてきて少し傾いて重なる（最新の記事を3件まで）。
           矢印で、どれを手前にするか切り替えられる -->
      <!-- 一旦、トップのBLOGセクションを非表示にするためコメントアウト中
      <section class="top-blog">
        <div class="top-blog-pin">
          <div class="top-blog-sticky">
            <div class="top-blog-top">
              <div class="top-blog-head">
                <h2 class="top-blog-title">BLOG</h2>
                <a class="top-blog-list-link" href="/blog/">記事一覧<span class="link-note">ぼたん</span></a>
              </div>
              <p class="top-blog-lead">Webに関する<br>ホットなニュースや、<br class="sp">日々の中で感じたこと、<br>などを発信しております。</p>
            </div>
            <ul class="top-blog-track" id="js-top-blog-track">
              <?php foreach ($topArticles as $article) { $topCard($article); } ?>
            </ul>
            <button type="button" class="top-blog-arrow is-prev" aria-label="前の記事"><span aria-hidden="true">←</span></button>
            <button type="button" class="top-blog-arrow is-next" aria-label="次の記事"><span aria-hidden="true">→</span></button>
          </div>
        </div>
      </section>
      -->
      <?php
      // 背景の線（images/top-works-line.svg）のpathデータを読み込んで、そのまま埋め込む
      // （js/top-works.jsがgetTotalLength()で長さを測り、描かれる演出に使うため、
      //   <img>ではなくインラインSVGにする必要がある）
      $topWorksLineSvg = @file_get_contents(__DIR__ . '/images/top-works-line.svg');
      $topWorksPathD = '';
      if ($topWorksLineSvg && preg_match('/<path[^>]*\sd="([^"]+)"/', $topWorksLineSvg, $topWorksMatch)) {
        $topWorksPathD = $topWorksMatch[1];
      }
      ?>
      <!-- WORKSの実績紹介（Figma「top_worksセクション1〜4」）。「デザインで課題解決」に続いて
           手描き風の一筆書きの線が描かれる。
           スクロールすると薄いグレーの膜がかぶさり、文言が下から順番に表示され、
           続いて実績カード3枚（左右のボタンでスライド）と「View more」が出てくる。
           その間は画面を固定（position:sticky）したままにする（js/top-works.js） -->
      <section class="top-works" id="js-top-works">
        <div class="top-works-pin" id="js-top-works-pin">
          <div class="top-works-stage" id="js-top-works-stage">
            <svg class="top-works-svg" viewBox="0 0 1020 836" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
              <path id="js-top-works-path" class="top-works-path" d="<?php echo $topWorksPathD; ?>"></path>
            </svg>
          </div>
          <!-- スクロールすると線の上にかぶさる、薄いグレーの膜（文言を目立たせる） -->
          <div class="top-works-veil" id="js-top-works-veil" aria-hidden="true"></div>
          <!-- 文言（英語キャプション＋日本語見出し）のリスト。スクロールに合わせてリストごと上へ動き、
               下から1つずつ表示される（js/top-works.js） -->
          <div class="top-works-slides" id="js-top-works-slides">
            <div class="top-works-slide" id="js-top-works-slide-0" data-slide-index="0">
              <p class="top-works-slide-en">Solving Problems Through Design</p>
              <p class="top-works-slide-ja">デザインで課題解決</p>
            </div>
            <div class="top-works-slide" id="js-top-works-slide-1" data-slide-index="1">
              <p class="top-works-slide-en">Partnering with Leading Brands to Build Meaningful Websites.</p>
              <p class="top-works-slide-ja">これまでさまざまな企業様のサイトを<br class="sp">つくってきました。</p>
            </div>
            <div class="top-works-slide" id="js-top-works-slide-2" data-slide-index="2">
              <p class="top-works-slide-en">Here is a selection of our work.</p>
              <p class="top-works-slide-ja">その一部ではありますが、掲載します。</p>
            </div>
            <div class="top-works-slide" id="js-top-works-slide-3" data-slide-index="3">
              <p class="top-works-slide-en">Some projects cannot be shown online due to confidentiality.<br>Please feel free to contact us to see more of our work.</p>
              <p class="top-works-slide-ja">都合上掲載できない制作実績もございますので、<br>見たい方はお気軽にご連絡ください。</p>
            </div>
          </div>
          <!-- 実績カード（Figma「top_worksセクション4」）。3枚が横並びで、左右の透明なボタンでスライドできる。
               画像は/images/works/のサムネイルを使い、クリックすると実績一覧(works/index.php)と同じ
               モーダル(template/modal.php)で詳細を見られる -->
          <div class="top-works-cards" id="js-top-works-cards">
            <div class="top-works-cards-track">
              <a class="top-works-card js-modal-btn js-top-works-card" href="javascript:void(0)" data-key="2">
                <img src="/images/works/nail-1f.jpg" alt="プライベートサロン 1/f private salon" loading="lazy">
                <p class="top-works-card-name">1/f private salon</p>
              </a>
              <a class="top-works-card js-modal-btn js-top-works-card" href="javascript:void(0)" data-key="3">
                <img src="/images/works/musashiya.jpg" alt="武蔵家 松戸店" loading="lazy">
                <p class="top-works-card-name">武蔵家 松戸店</p>
              </a>
              <a class="top-works-card js-modal-btn js-top-works-card" href="javascript:void(0)" data-key="4">
                <img src="/images/works/nakagawa.jpg" alt="訪問看護ステーション 中川" loading="lazy">
                <p class="top-works-card-name">訪問看護ステーション 中川</p>
              </a>
            </div>
            <button type="button" class="top-works-cards-btn is-prev" id="js-top-works-prev" aria-label="前の実績"><svg class="top-works-cards-btn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 4.6c2.4 2.5 4.7 4.8 7 7.4-2.2 2.5-4.5 4.9-7.1 7.4"></path></svg></button>
            <button type="button" class="top-works-cards-btn is-next" id="js-top-works-next" aria-label="次の実績"><svg class="top-works-cards-btn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 4.6c2.4 2.5 4.7 4.8 7 7.4-2.2 2.5-4.5 4.9-7.1 7.4"></path></svg></button>
          </div>
          <!-- 実績カードのあとに右下へ表示する「View more」。実績一覧ページ(/works/)へ誘導する -->
          <div class="top-works-cta" id="js-top-works-cta">
            <a class="top-works-cta-btn" href="/works/">View more</a>
          </div>
        </div>
      </section>
      <section class="about-scroll" id="js-about">
        <div class="about-scroll-pin" id="js-about-pin">
          <div class="content">
            <div class="about-head">
              <h2 class="about-title"><span>ABOUT</span></h2>
              <a href="/about/index.php" class="about-more-top" id="js-about-more-top">もっと知る<span class="link-note">ぼたん</span></a>
            </div>
          </div>
          <div class="about-stage">
          <div class="about-canvas">

            <div class="about-face" id="js-about-face">
              <img src="/images/about-face.png" alt="原 龍我の似顔絵">
            </div>

            <svg class="about-lines" id="js-about-lines" viewBox="90 380 1390 980" aria-hidden="true">
              <polyline class="js-about-line" points="1026,532 1108,475 1157,475"/>
              <polyline class="js-about-line" points="1067,766 1149,709 1198,709"/>
              <polyline class="js-about-line" points="902,834 1023,953 1156,953"/>
              <polyline class="js-about-line" points="339,623 547,623 630,706"/>
              <polyline class="js-about-line" points="395,1066 616,1066 699,983"/>
            </svg>

            <ul class="about-labels" id="js-about-labels">
              <li class="js-about-label" style="--x:1172;--y:452">無造作な髪</li>
              <li class="js-about-label" style="--x:1210;--y:682">福を呼ぶ耳</li>
              <li class="js-about-label" style="--x:1197;--y:929">立派な鼻</li>
              <li class="js-about-label" style="--x:115;--y:599">つぶらな瞳</li>
              <li class="js-about-label" style="--x:138;--y:1042">おしゃべりな口</li>
            </ul>
            <p class="about-caption" id="js-about-caption">容姿</p>
            <p class="about-note" id="js-about-note">※実物とは異なります。</p>

            <p class="about-question" id="js-about-q1">ブログは見てくれましたか？</p>
            <p class="about-question" id="js-about-q2">制作物は見てくれましたか？</p>
            <p class="about-wonder js-about-wonder" style="--x:407;--y:452;--fs:67">もっと知りたい</p>
            <p class="about-wonder js-about-wonder" style="--x:834;--y:559;--fs:42">もっともっと</p>
            <p class="about-wonder js-about-wonder" style="--x:419;--y:640;--fs:67">もっと知りたい</p>
            <p class="about-wonder js-about-wonder" style="--x:853;--y:781;--fs:42">もっともっと</p>
            <!-- 「VIEW MORE」(Figma「aboutセクション5」)。文字が出たあと、手描きの線(aboutボタン線.svg)で
                 文字のまわりをぐるっと囲んでいく（js/about-scroll.js） -->
            <a href="/about/index.php" class="about-more-large" id="js-about-more-large"><span class="about-more-large-text">VIEW MORE<svg class="about-more-large-line" viewBox="0 0 971 325" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path id="js-about-more-line" d="M459.95 287.848C459.726 287.848 459.502 287.848 411.111 287.848C362.721 287.848 266.172 287.848 204.4 284.604C83.4313 278.251 42.7927 238.245 16.4957 209.002C-3.02692 187.293 0.494349 143.288 2.91964 109.43C7.61795 43.8398 163.205 35.539 219.381 22.8881C251.839 15.5785 292.815 8.76357 379.065 4.55246C465.316 0.341358 595.726 -0.471205 679.125 3.99771C762.524 8.46662 794.96 18.2416 829.43 32.4823C900.813 61.972 939.127 88.3334 944.155 101.726C952.332 123.503 945.117 146.674 938.724 162.219C924.804 196.07 871.904 232.526 790.159 281.238C690.947 340.359 638.969 321.99 564.614 314.252C516.481 309.243 448.691 291.04 389.839 280.151C283.99 260.567 216.863 252.064 179.789 238.997C100.484 211.045 66.4573 176.291 41.8821 155.616C31.9194 147.235 29.8815 135.566 28.5309 124.035C26.8599 109.769 31.2007 98.0893 38.2792 91.3204C55.6814 74.6794 80.4354 71.2148 123.115 60.1458C159.473 50.716 226.59 37.2522 337.549 27.7292C448.507 18.2062 601.505 13.9796 698.187 14.0914C830.68 14.2447 879.584 26.585 903.251 33.7933C925.993 40.7196 939.508 51.7425 946.157 59.2124C961.969 76.9772 968.603 133.225 969.692 205.969C970.287 245.769 905.551 262.098 768.864 299.856C729.735 310.665 696.503 312.85 646.969 314.843C597.434 316.836 532.072 316.424 491.505 315.023C437.051 313.143 377.554 304.103 305.394 295.963C278.622 292.518 271.843 290.462 249.592 285.234C227.341 280.006 189.823 271.668 139.409 261.461"></path></svg></span></a>
          </div>
          </div>
        </div>
      </section>
      <section class="service" id="js-service">
        <div class="service-pin" id="js-service-pin">
          <div class="service-reel" id="js-service-reel">
            <h2 class="service-title" id="js-service-title">SERVICE</h2>
            <div class="service-block">
              <p class="service-line js-service-line">貴社のWeb担当、</p>
              <p class="service-line js-service-line">私にやらせて<wbr>ください。</p>
            </div>
            <div class="service-block">
              <p class="service-line js-service-line">Webサイトは、</p>
              <p class="service-line js-service-line">作って終わりでは<wbr>ありません。</p>
            </div>
            <div class="service-block">
              <p class="service-line service-line--md js-service-line">本来の目的は、</p>
              <p class="service-line service-line--md js-service-line">サイトを作ることではなく、</p>
              <p class="service-line service-line--md js-service-line">その先にある「成果」に<wbr>つなげること。</p>
            </div>
            <div class="service-block">
              <p class="service-line js-service-line">新しいお客様に<wbr>見つけてもらう。</p>
              <p class="service-line js-service-line">会社の魅力を<wbr>知ってもらう。</p>
              <p class="service-line js-service-line">「ここで働きたい」と<wbr>思ってもらう。</p>
            </div>
            <div class="service-block">
              <p class="service-line service-line--md js-service-line">けれど実際は、</p>
              <p class="service-line service-line--md js-service-line">「サイトを作っただけで、<wbr>成果につながる運用や<wbr>改善はしないまま」</p>
              <p class="service-line service-line--md js-service-line">という会社さんも<wbr>少なくありません。</p>
            </div>
            <div class="service-block">
              <p class="service-line js-service-line">そこで、月額制で</p>
              <p class="service-line js-service-line">貴社のWeb担当として、</p>
              <p class="service-line js-service-line">制作から運用、改善、<wbr>分析まで、</p>
              <p class="service-line js-service-line">Webに関することを<wbr>継続してサポートします。</p>
            </div>
            <div class="service-block">
              <p class="service-line js-service-line">ただ更新するだけではなく、</p>
              <p class="service-line js-service-line">どうすればもっと<wbr>見てもらえるのか。</p>
              <p class="service-line js-service-line">どうすれば問い合わせや<wbr>応募につながるのか。</p>
              <p class="service-line js-service-line">一緒に考え、<wbr>改善していきます。</p>
            </div>
            <div class="service-block">
              <p class="service-line js-service-line">「サイトをもっと<wbr>活用したい。」</p>
              <p class="service-line js-service-line">「サイトのデザインを<wbr>もっと良くしたい。」</p>
              <p class="service-line js-service-line">「お問い合わせや<wbr>求人への応募を<wbr>増やしたい。」</p>
            </div>
            <div class="service-block">
              <p class="service-line js-service-line">そんな会社様へ。</p>
            </div>
            <div class="service-block">
              <p class="service-line js-service-line">数社限定で</p>
              <p class="service-line js-service-line">Web担当を月額制で雇えます。</p>
              <p class="service-line js-service-line">現在モニターを募集しています。</p>
            </div>
            <div class="service-cluster">
              <p class="service-cluster-item service-cluster-item--center js-service-line" style="--x:0;--y:0;--fs:88">詳しい内容を、<br>聞いてみませんか？</p>
              <a href="https://lin.ee/VNnLIPN" class="service-cluster-item service-choice service-choice--yes js-service-line" style="--x:201;--y:380;--fs:120">YES??<span class="link-note">ぼたん</span></a>
              <a href="#js-service-next" class="service-cluster-item service-choice service-choice--no js-service-line" id="js-service-no" style="--x:766;--y:380;--fs:120">NO??<span class="link-note">ぼたん</span></a>
            </div>
          </div>
        </div>
      </section>
      <div id="back-bn"><img src="/images/index_bn01.png" alt=""></div>
      <?php include ( dirname(__FILE__) . '/template/modal.php' ); ?>
    </article>
  </main>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js"></script>
  <script src="/js/top-blog.js?v=<?php echo @filemtime(dirname(__FILE__) . '/js/top-blog.js'); ?>"></script>
  <script src="/js/top-works.js?v=<?php echo @filemtime(dirname(__FILE__) . '/js/top-works.js'); ?>"></script>
  <script src="/js/scroll-restore.js?v=<?php echo @filemtime(dirname(__FILE__) . '/js/scroll-restore.js'); ?>"></script>
  <script src="/js/scroll.js"></script>
  <script src="/js/mainvisual.js?v=<?php echo @filemtime(dirname(__FILE__) . '/js/mainvisual.js'); ?>"></script>
  <script src="/js/message-scroll.js?v=<?php echo @filemtime(dirname(__FILE__) . '/js/message-scroll.js'); ?>"></script>
  <script src="/js/about-scroll.js?v=<?php echo @filemtime(dirname(__FILE__) . '/js/about-scroll.js'); ?>"></script>
  <script src="/js/mv-click.js?v=<?php echo @filemtime(dirname(__FILE__) . '/js/mv-click.js'); ?>"></script>
  <script src="/js/service-reel.js?v=<?php echo @filemtime(dirname(__FILE__) . '/js/service-reel.js'); ?>"></script>
  <script>
    const title = document.querySelectorAll("h2 span");
    const cb = (erement,observer) => {
        erement.forEach(elnt => {
            if (elnt.isIntersecting) {
              elnt.target.classList.add("in");
              observer.unobserve(elnt.target);
            }
        });
    }
    const options = {
      rootMargin: "-100px 0px",
    }
    const io = new IntersectionObserver(cb, options)
    title.forEach(element => { io.observe(element); });
  </script>
  <?php $gsapLoaded = true; include ( dirname(__FILE__) . '/template/footer.php' ); ?>

