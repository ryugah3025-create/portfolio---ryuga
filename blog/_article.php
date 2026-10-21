<?php
$articles = require __DIR__ . '/data/articles.php';
$e = function ($v) { return htmlspecialchars($v, ENT_QUOTES, 'UTF-8'); };

$index = null;
foreach ($articles as $i => $item) {
	if ($item['slug'] === $articleSlug) {
		$index = $i;
		break;
	}
}
if ($index === null) {
	http_response_code(404);
	exit('記事が見つかりません。');
}
$article = $articles[$index];
$next = $articles[$index + 1] ?? null;

$plainTitle = str_replace("\n", '', $article['title']);
$plainBody = str_replace("\n", '', $article['body']);
// 記事タイトル：PCは改行なしの1行。SPだけ、データの最初の\nの位置（例:「サイトを」の後）で改行する
$titleParts = explode("\n", $article['title'], 2);
$titleHeadHtml = $e($titleParts[0]);
$titleTailHtml = isset($titleParts[1]) ? $e(str_replace("\n", '', $titleParts[1])) : '';
// 本文の改行は、データの\n（一覧カード用）ではなく「。」の直後にする。
// 文ごとに<p>に分けておくと、brでの改行より行間（段落の間）を広くとりやすい
$bodySentences = array_filter(explode('。', $plainBody), function ($s) { return trim($s) !== ''; });
$bodyHtml = '';
foreach ($bodySentences as $sentence) {
	$bodyHtml .= '<p>' . $e($sentence) . '。</p>';
}

$pageTitle = $plainTitle . '｜BLOG｜原龍我（ハラリュウガ）';
$pageDescription = mb_strlen($plainBody) > 110 ? mb_substr($plainBody, 0, 110) . '…' : $plainBody;
$pagePath = '/blog/' . $articleSlug . '.php';
$pageCrumb = $plainTitle;
$pageType = 'article';
$bodyClass = 'blog-page blog-article';
$iso = sprintf('%04d-%02d-%02d', $article['year'], $article['month'], $article['day']);
?>
<?php include ( dirname(__FILE__) . '/../template/header.php' ); ?>
<link rel="stylesheet" href="/css/blog-article.css">

	<?php
	$blogPosting = [
		'@context' => 'https://schema.org',
		'@type' => 'BlogPosting',
		'headline' => $plainTitle,
		'description' => $pageDescription,
		'datePublished' => $iso,
		'dateModified' => $iso,
		'author' => ['@type' => 'Person', 'name' => '原龍我', 'url' => $siteUrl . '/'],
		'publisher' => ['@type' => 'Person', 'name' => '原龍我'],
		'mainEntityOfPage' => $siteUrl . $pagePath,
		'image' => $siteUrl . '/images/blog/card.webp',
		'inLanguage' => 'ja',
	];
	?>
	<script type="application/ld+json"><?php echo json_encode($blogPosting, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); ?></script>

	<main class="blog-article-main">
		<article class="blog-paper">
			<div class="blog-paper-scroll">
				<div class="blog-paper-inner">
					<time class="blog-paper-date" datetime="<?php echo $e($iso); ?>">
						<span class="blog-paper-year"><?php echo $e($article['year']); ?>ねん</span>
						<span class="blog-paper-md"><?php echo $e($article['month']); ?>がつ<?php echo $e($article['day']); ?></span>
					</time>
					<h1 class="blog-paper-title"><?php echo $titleHeadHtml; ?><br class="sp"><?php echo $titleTailHtml; ?></h1>
					<div class="blog-paper-body">
						<?php echo $bodyHtml; ?>
					</div>
					<nav class="blog-paper-nav" aria-label="記事の移動">
						<a href="/blog/#list">一覧に戻る</a>
<?php if ($next) : ?>
						<a href="/blog/<?php echo $e($next['slug']); ?>.php">次へ</a>
<?php endif; ?>
					</nav>
				</div>
			</div>
		</article>
	</main>

<?php $gsapLoaded = true; ?>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="/js/blog-article.js?v=<?php echo @filemtime(dirname(__FILE__) . '/../js/blog-article.js'); ?>"></script>
<?php include ( dirname(__FILE__) . '/../template/footer.php' ); ?>
