

<?php include ( dirname(__FILE__) . '/../template/header.php' ); ?>

  <main class="work">
    <article>
        <div class="work-text">
          <div class="mainvisual">
            <div class="character">
              <img src="../images/work-ic01.png" alt="">
            </div>
            <div class="mainvisual-wrap">
              <h1 class="heading01">WORKS</h1>
            </div>
          </div>
          <div class="content">
            <section>
              <ul class="work-list">
                <li class="work-item js-work-item" id="starts">
                  <figure class="image">
                    <a class="js-modal-btn" href="javascript:void(0)" data-key="1"><img src="/images/index_ph27.jpg" alt="原龍我 ポートフォリオサイト"></a>
                  </figure>
                  <div class="text-area">
                    <h3><a class="js-modal-btn" href="javascript:void(0)" data-key="1">制作物：ポートフォリオサイト</a></h3>
                    <p>店名：ポートフォリオ</p>
                    <p>制作期間：1.5ヶ月</p>
                    <p>企画〜デザイン〜製造〜運用まで一貫して作成しました。</p>
                  </div>
                </li>
                <li class="work-item js-work-item" id="starts">
                  <figure class="image">
                    <a class="js-modal-btn" href="javascript:void(0)" data-key="2"><img src="/images/index_ph24.jpg" alt="ネイルサロン 1/f private salon"></a>
                  </figure>
                  <div class="text-area">
                    <h3><a class="js-modal-btn" href="javascript:void(0)" data-key="2">制作物：コーポレートサイト</a></h3>
                    <p>店名：1/f private salon</p>
                    <p>制作期間：2ヶ月</p>
                    <p>企画〜デザイン〜製造〜運用まで一貫して対応させていただきました。</p>
                  </div>
                </li>
                <li class="work-item js-work-item" id="starts">
                  <figure class="image">
                    <a class="js-modal-btn" href="javascript:void(0)" data-key="3"><img src="/images/index_ph30.png" alt="武蔵家 松戸"></a>
                  </figure>
                  <div class="text-area">
                    <h3><a class="js-modal-btn" href="javascript:void(0)" data-key="3">制作物：QRコードサイト</a></h3>
                    <p>店名：武蔵家 松戸店</p>
                    <p>制作期間：2ヶ月</p>
                    <p>企画〜デザイン〜製造を一貫して作成しました。</p>
                  </div>
                </li>
                <li class="work-item js-work-item" id="starts">
                  <figure class="image">
                    <a class="js-modal-btn" href="javascript:void(0)" data-key="4"><img src="/images/index_ph31.png" alt="訪問看護サービス 4LIFE"></a>
                  </figure>
                  <div class="text-area">
                    <h3><a class="js-modal-btn" href="javascript:void(0)" data-key="4">制作物：コーポレートサイト（LP）</a></h3>
                    <p>店名：訪問看護ステーション 中川</p>
                    <p>制作期間：2ヶ月</p>
                    <p>企画〜デザイン〜製造〜運用まで一貫して対応させていただきました。</p>
                  </div>
                </li>
                <li class="work-item js-work-item" id="starts">
                  <figure class="image">
                    <a class="js-modal-btn" href="javascript:void(0)" data-key="5"><img src="/images/index_ph.jpg" alt="訪問看護サービス 4LIFE"></a>
                  </figure>
                  <div class="text-area">
                    <h3><a class="js-modal-btn" href="javascript:void(0)" data-key="5">制作物：コーポレートサイト（LP）</a></h3>
                    <p>店名：株式会社 4life</p>
                    <p>制作期間：1.5ヶ月</p>
                    <p>企画〜デザイン〜製造〜運用まで一貫して対応させていただきました。</p>
                  </div>
                </li>
              </ul>
              <?php include ( dirname(__FILE__) . '/../template/modal.php' ); ?>
            </section>
            
            <section>
              <div class="contactText">
                <p>私と一緒にWebサイトをつくってみたい方は、お気軽にご連絡ください！</p>
                <p>また、月額2万円で制作〜修正・運用・SEOまでまとめて対応するサービスも行っています。</p>
                <p>掲載していない制作実績もございますので、気になる方はぜひご連絡ください。</p>
              </div>
              <div class="botton-amine rotateback">
                <a href="https://lin.ee/VNnLIPN"><span>CONTACT</span><span>click</span></a>
              </div>
            </section>
          </div>
          <div id="back-bn">
            <img src="../images/index_bn01.png" alt="">
          </div>
          <p class="scrooll"><span>scrooll</span></p>
        </div>
    </article>
  </main>
  <script src="../js/scroll.js"></script>
  <script>
  const scrollStyle = document.querySelector(".scrooll");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 500) {
      scrollStyle.classList.add("none");
    }
  });
  </script>
  <?php include ( dirname(__FILE__) . '/../template/footer.php' ); ?>