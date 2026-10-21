

<?php
$pageTitle = 'WORKS｜制作実績 | 原龍我（ハラリュウガ）';
$pageDescription = '原龍我（ハラリュウガ）のホームページ制作・Web制作の実績一覧。ポートフォリオサイト、サロン、飲食店、訪問看護ステーションなど、これまでに手がけたWebサイトを紹介します。';
$pagePath = '/works/';
$pageCrumb = 'WORKS';
?>
<?php $bodyClass = 'is-works-fv'; ?>
<?php include ( dirname(__FILE__) . '/../template/header.php' ); ?>

  <main class="work">
    <article>
        <div class="work-text">
          <section class="works-fv" id="js-works-fv">
            <!-- 1画面ぶんの舞台：中央に「WORKS」、四隅から顔が覗き込む。スクロールで「O」の中へズームして潜り抜ける -->
            <div class="works-stage" id="js-works-stage">
              <div class="works-face works-face--tl js-works-face"><img src="../images/about-face.png" alt=""></div>
              <div class="works-face works-face--tr js-works-face"><img src="../images/about-face.png" alt=""></div>
              <div class="works-face works-face--br js-works-face"><img src="../images/about-face.png" alt=""></div>
              <div class="works-face works-face--bl js-works-face"><img src="../images/about-face.png" alt=""></div>
              <h1 class="works-title" id="js-works-title" aria-label="WORKS"><span class="works-char" aria-hidden="true">W</span><span class="works-char" id="js-works-o" aria-hidden="true">O</span><span class="works-char" aria-hidden="true">R</span><span class="works-char" aria-hidden="true">K</span><span class="works-char" aria-hidden="true">S</span></h1>
            </div>
          </section>
          <!-- 実績リスト（Figma「wroksの実績リスト」）：中央に大きく1件、右上と左下に前後の実績がのぞく。
               左右(横スクロール/スワイプ/←→)または上下のスクロールで、中央が気持ちよく切り替わる -->
          <section class="works-gallery" id="js-gallery" aria-label="制作実績">
            <div class="works-gallery-stage" id="js-gallery-stage">
              <a class="works-top" href="/">トップに戻る<span class="link-note">ぼたん</span></a>
              <ul class="works-cards">
                <!-- ポートフォリオは一旦非表示
                <li class="works-card js-gallery-card" data-key="1">
                  <a class="js-modal-btn" href="javascript:void(0)" data-key="1"><img src="/images/works/portfolio.jpg" alt="原龍我 ポートフォリオサイト"></a>
                  <p class="works-card-name">ポートフォリオ</p>
                </li>
                -->
                <li class="works-card js-gallery-card" data-key="2">
                  <a class="js-modal-btn" href="javascript:void(0)" data-key="2"><img src="/images/works/nail-1f.jpg" alt="プライベートサロン 1/f private salon"></a>
                  <p class="works-card-name">1/f private salon</p>
                </li>
                <li class="works-card js-gallery-card" data-key="3">
                  <a class="js-modal-btn" href="javascript:void(0)" data-key="3"><img src="/images/works/musashiya.jpg" alt="武蔵家 松戸店"></a>
                  <p class="works-card-name">武蔵家 松戸店</p>
                </li>
                <li class="works-card js-gallery-card" data-key="4">
                  <a class="js-modal-btn" href="javascript:void(0)" data-key="4"><img src="/images/works/nakagawa.jpg" alt="訪問看護ステーション 中川"></a>
                  <p class="works-card-name">訪問看護ステーション 中川</p>
                </li>
                <li class="works-card js-gallery-card" data-key="5">
                  <a class="js-modal-btn" href="javascript:void(0)" data-key="5"><img src="/images/modal_ph.jpg" alt="株式会社 4life"></a>
                  <p class="works-card-name">株式会社 4life</p>
                </li>
                <li class="works-card js-gallery-card" data-key="demo">
                  <a class="js-modal-btn" href="javascript:void(0)" data-key="demo"><img src="/images/works/demo-site.jpg" alt="デモサイト（LPサイト）"></a>
                  <p class="works-card-name">demo site</p>
                </li>
              </ul>
            </div>
          </section>
          <?php include ( dirname(__FILE__) . '/../template/modal.php' ); ?>

          <div id="back-bn">
            <img src="../images/index_bn01.png" alt="">
          </div>
        </div>
    </article>
  </main>
  <script src="../js/scroll.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <script src="../js/works-fv.js?v=<?php echo @filemtime(dirname(__FILE__) . '/../js/works-fv.js'); ?>"></script>
  <script src="../js/works-gallery.js?v=<?php echo @filemtime(dirname(__FILE__) . '/../js/works-gallery.js'); ?>"></script>
  <?php $gsapLoaded = true; ?>
  <?php include ( dirname(__FILE__) . '/../template/footer.php' ); ?>