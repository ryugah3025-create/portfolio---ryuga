<?php include ( dirname(__FILE__) . '/../wp/wp-load.php'); ?>
<?php wp_head(); ?>
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





















