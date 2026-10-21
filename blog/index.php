<?php
// 戻るボタンで戻ったときに、拡大中だった状態をそのまま復元させないため、ブラウザに保存させない（毎回一覧を読み直す）
header('Cache-Control: no-store');
$pageTitle = 'BLOG｜原龍我（ハラリュウガ）';
$pageDescription = '原龍我（ハラリュウガ）が、Web制作・Web運用にまつわる話などを綴るブログです。';
$pagePath = '/blog/';
$pageCrumb = 'BLOG';
$bodyClass = 'is-blog-fv blog-page';

$articles = require __DIR__ . '/data/articles.php';
$e = function ($v) { return htmlspecialchars($v, ENT_QUOTES, 'UTF-8'); };
$setSize = max(3, count($articles));
$setItems = [];
for ($k = 0; $k < $setSize; $k++) {
	$setItems[] = $articles[$k % count($articles)];
}
?>
<?php include ( dirname(__FILE__) . '/../template/header.php' ); ?>
<link rel="stylesheet" href="/css/blog-fv-figma.css">

	<main class="blog">
		<article>
			<section class="blog-fv-figma">
				<div class="blog-fv-figma-image">
					<img src="/images/blog/blog-fv-hires.png" alt="">
				</div>
				<h1 class="blog-fv-figma-title">BLOG</h1>
			</section>

			<section class="blog-fv2" aria-label="ブログの紹介">
				<div class="blog-fv2-stage">
					<div class="blog-fv2-card">
						<p class="blog-fv2-text">当サイトでは、 <br>Webのことや、<br> 日々の中で感じたこと、<br> 考えていることを、<br> 自分の言葉で綴っていきます。<br>どんな記事が生まれて、どんな場所になっていくのか。<br>自分自身も、今から楽しみです。<br>ぜひ、気軽に覗いていってください。</p>
					</div>
				</div>
			</section>

			<section class="blog-list" aria-label="ブログ記事一覧">
				<div class="blog-list-strip" id="js-blog-strip">
					<ul class="blog-list-track" id="js-blog-track" data-set-size="<?php echo $setSize; ?>">
<?php for ($loop = 0; $loop < 3; $loop++) : foreach ($setItems as $i => $article) :
	$copyAttr = $loop > 0 ? ' aria-hidden="true"' : '';
	$tabAttr = $loop > 0 ? ' tabindex="-1"' : '';
	$iso = sprintf('%04d-%02d-%02d', $article['year'], $article['month'], $article['day']);
?>
						<li class="blog-card js-blog-card is-pos-<?php echo ($i % 3) + 1; ?>"<?php echo $copyAttr; ?>>
							<a href="/blog/<?php echo $e($article['slug']); ?>.php"<?php echo $tabAttr; ?>>
								<time class="blog-card-date" datetime="<?php echo $iso; ?>">
									<span class="blog-card-year"><?php echo $e($article['year']); ?>ねん</span>
									<span class="blog-card-month"><?php echo $e($article['month']); ?>がつ<?php echo $e($article['day']); ?></span>
								</time>
								<span class="blog-card-title"><?php echo nl2br($e($article['title'])); ?></span>
								<span class="blog-card-more">みる</span>
							</a>
						</li>
<?php endforeach; endfor; ?>
					</ul>
				</div>
				<p class="blog-list-hint" id="js-blog-hint" aria-hidden="true">
					<span class="blog-list-hint-arrow blog-list-hint-arrow-left">←</span>
					横にスクロールできます
					<span class="blog-list-hint-arrow blog-list-hint-arrow-right">→</span>
				</p>
			</section>

			<div class="blog-spacer" aria-hidden="true"></div>
		</article>
	</main>

	<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<?php $gsapLoaded = true; ?>
	<script src="/js/blog-fv-figma.js?v=<?php echo @filemtime(dirname(__FILE__) . '/../js/blog-fv-figma.js'); ?>"></script>
<?php include ( dirname(__FILE__) . '/../template/footer.php' ); ?>
