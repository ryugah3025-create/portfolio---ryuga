<footer class="ending" id="js-service-next">
    <div class="ending-stage">
        <div class="ending-canvas" id="js-ending-canvas">
            <div class="ending-face" id="js-ending-face">
                <img src="/images/about-face.png" alt="原龍我の似顔絵">
            </div>
            <h2 class="ending-title" id="js-ending-title" aria-label="終わり"><span class="ending-char" aria-hidden="true">終</span><span class="ending-char" aria-hidden="true">わ</span><span class="ending-char" aria-hidden="true">り</span></h2>
        </div>
        <div class="ending-bar">
            <nav class="ending-menu-wide js-ending-fade">
                <ul>
                    <li><a href="/blog/index.php">BLOG</a></li>
                    <li><a href="/works/index.php">WORKS</a></li>
                    <li><a href="/about/index.php">ABOUT</a></li>
                    <li><a href="https://lin.ee/VNnLIPN">CONTACT</a></li>
                </ul>
            </nav>
            <p class="ending-copyright-wide js-ending-fade"><small>&copy;2026 原龍我</small></p>
        </div>
    </div>
</footer>
<?php if (empty($gsapLoaded)) : ?>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<?php endif; ?>
<script src="/js/ending-footer.js?v=<?php echo @filemtime(dirname(__FILE__) . '/../js/ending-footer.js'); ?>"></script>
</body>
<script src="/js/header-menu.js?v=<?php echo @filemtime(dirname(__FILE__) . '/../js/header-menu.js'); ?>"></script>
<script src="/js/new.js?v=<?php echo @filemtime(dirname(__FILE__) . '/../js/new.js'); ?>"></script>
</html>