<?php
$pageTitle = 'BLOG（FV確認）｜原龍我（ハラリュウガ）';
$pagePath = '/blog/fv1.php';
// 確認用ページのため、検索結果に出さない
$pageNoindex = true;
?>
<?php $bodyClass = 'blog-page'; ?>
<?php include ( dirname(__FILE__) . '/../template/header.php' ); ?>
<link rel="stylesheet" href="/css/blog-fv1.css">

	<main class="blog">
		<article>
			<div class="blog-fv1">
				<h1 class="blog-fv1-title">blog</h1>
				<p class="blog-fv1-lead">制作の裏側や、考えていることを書いています。</p>
				<div class="blog-fv1-image">
					<img src="/images/blog/blog-fv.png" alt="">
				</div>
			</div>
		</article>
	</main>

<?php include ( dirname(__FILE__) . '/../template/footer.php' ); ?>
