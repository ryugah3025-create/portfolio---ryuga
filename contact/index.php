<?php include ( dirname(__FILE__) . '/../wp/wp-load.php'); ?>
<?php wp_head(); ?>
<?php
$pageTitle = 'CONTACT｜お問い合わせ | 原龍我（ハラリュウガ）';
$pageDescription = 'ホームページ制作・Web制作・Web運用のご相談、お見積りは、原龍我（ハラリュウガ）までお気軽にお問い合わせください。';
$pagePath = '/contact/';
$pageCrumb = 'CONTACT';
?>
<?php include ( dirname(__FILE__) . '/../template/header.php' ); ?>

	<main class="contact">
		<article>
			<div class="content">
				<?php echo do_shortcode( '[contact-form-7 id="f0ccf02" title="コントタクトフォーム"]' ); ?>
			</div>
			<div id="back-bn">
				<img src="../images/index_bn01.png" alt="">
			</div>
		</article>
	</main>

<?php include ( dirname(__FILE__) . '/../template/footer.php' ); ?>
<?php wp_footer(); ?>





















