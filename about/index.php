
<?php
$pageTitle = 'ABOUT｜原龍我（ハラリュウガ）のプロフィール';
$pageDescription = '東京を拠点にホームページ制作・Web制作・Web運用を行う原龍我（ハラリュウガ）のプロフィール。2000年生まれ。バイクで東北一周の旅に出た18歳の夏から、Web制作の道に進むまでを紹介します。';
$pagePath = '/about/';
$pageType = 'profile';
$pageCrumb = 'ABOUT';
?>
<?php $bodyClass = 'is-about-fv'; // FVの間はヘッダーを隠す（「ABOUT」が画面の一番上に着いたら about-fv.js が外す） ?>
<?php include ( dirname(__FILE__) . '/../template/header.php' ); ?>

	<main class="about">
		<article>
			<?php
			// ---- ファーストビューの写真（Figma「aboutFV」）----
			// 写真を増やすときは、この配列の「最後」に1行足すだけ。順番どおりに1枚ずつ現れて重なり、最後の1枚だけワンテンポ遅れて現れる。
			//  src / full : 表示用の画像 / 拡大表示用の画像（images/ に置く。表示用は幅1500px程度、拡大用は最大1800px程度に軽くしておく）
			//  w          : 幅（Figmaの1603x1540の枠の中でのpx）。省略すると 700
			//  x, y       : 左上の位置（同じくpx）。省略すると、幅と画像の縦横比から、写真エリアの中央に置く
			//  alt        : 画像の説明（省略可）
			$aboutPhotos = [
				['src' => 'about-fv-1.jpg', 'full' => 'about-fv-1-full.jpg', 'x' => 180, 'y' => 304, 'w' => 1243],
				['src' => 'about-fv-2.jpg', 'full' => 'about-fv-2-full.jpg', 'x' => 371, 'y' => 155, 'w' => 861],
				['src' => 'about-fv-3.jpg', 'full' => 'about-fv-3-full.jpg', 'x' => 501, 'y' => 360, 'w' => 603],
				['src' => 'about-fv-5.jpg', 'full' => 'about-fv-5-full.jpg', 'x' => 380, 'y' => 166, 'w' => 852],
				['src' => 'about-fv-6.jpg', 'full' => 'about-fv-6-full.jpg', 'x' => 302, 'y' => 496, 'w' => 999],
				['src' => 'about-fv-4.jpg', 'full' => 'about-fv-4-full.jpg', 'x' => 500, 'y' => 200, 'w' => 603], // 最後の1枚
			];
			?>
			<?php
			// ---- FVのあと、スクロールで進むストーリー（Figma「aboutセクション4」）----
			// 「ABOUT」が画面の上へ大きくなりながら移動 → キャラクターが出てきて、ガタガタ震えながら下がっていく → FVの写真が回転しながら降り続ける
			// $aboutChars : キャラクター画像。「ABOUT」が上に着いたあと、その場からぽんと出てきて、スクロールするとガタガタ横に震えながら下がっていく（1枚だけ使う）
			//               x, y, w は Figmaの1603x1540の枠の中でのpx
			// $aboutDrops : 降ってくる写真。sx/sy=降り始めの位置、ex/ey=最後に散らばる位置（左上のpx）、w=幅、rot=降りながら回る角度(°)
			//               spx/spy=スマホで散らばる位置（省略するとPCと同じ。スマホは画面の左右が切れるので、キャラクターの上下に置く）
			$aboutChars = [
				['src' => 'about-char-0.png', 'x' => 450, 'y' => 303, 'w' => 736],
			];
			// $aboutCredits : 最後にスクロールで下から上へ流れていく文章（映画のエンディング風）。
			//   1グループ = 1かたまり（グループの間に少し間があく）。1行は 文字列、または [文字列, 文字サイズ(Figmaのpx。省略は44)]
			$aboutCredits = [
				[['ここまで見にきていただき、', 40], ['ありがとうございます。', 40]],
				['2000年、東京生まれ。'],
				['原龍我と申します。'],
				[['私の原点は、18歳の夏。', 60]],
				['友人と『FREEDOM』を読み、', '影響を受け、', '気づいたら東北一周のバイク旅に出た。'],
				['目的を決めずただ走る、', '山を走ったり、', '海沿いを走ったり、', '夜は道の駅で寝る。'],
				['今思えば、よくあれで無事帰れたなと思う。'],
				['そんな私がweb制作をやりたいと思ったきっかけは、', 'カフェのホームページを見た時だった。'],
				['サイトだけで「ここ、行きたい」と思った。'],
				['たった数ページのサイトに、情報が詰められている。'],
				['情報は整理されていて、知りたい情報と', 'そのお店の雰囲気を想像できる、サイトのデザイン。'],
				['「webサイトって、こんなに人の心動かせるんだ」', 'そんな力があるのかと思った。'],
				['webサイトは'],
				['人と人、'],
				['人と物、'],
				['人とサービスを繋げる。'],
				['そんなことができるものは、', '他になかなかないなと思う。'],
				['だから私は、webというものに魅力を感じていて、', 'そんな素敵な仕事を今後も続けていきたい。'],
				['まだ出会えていない方も、'],
				['すでに繋がってくださっている方も、'],
				['webを通して、'],
				['あなたの事業のお力になれたら嬉しいです。'],
				['最後まで読んでいただき、', 'ありがとうございました!'],
			];
			$aboutDrops = [
				['src' => 'about-fv-1.jpg', 'sx' => -144, 'sy' => -198, 'ex' => -106, 'ey' => 735, 'spx' => 300, 'spy' => 1400, 'w' => 264, 'rot' => -200],
				['src' => 'about-fv-2.jpg', 'sx' => 1248, 'sy' => -457, 'ex' => 1286, 'ey' => 476, 'spx' => 1180, 'spy' => 1290, 'w' => 119, 'rot' => 260],
				['src' => 'about-fv-2.jpg', 'sx' => 1445, 'sy' => -198, 'ex' => 1483, 'ey' => 735, 'spx' => 1040, 'spy' => 1420, 'w' => 226, 'rot' => -320],
				['src' => 'about-fv-3.jpg', 'sx' => -45, 'sy' => 228, 'ex' => -7, 'ey' => 1161, 'spx' => 640, 'spy' => 1470, 'w' => 177, 'rot' => 170],
				['src' => 'about-fv-3.jpg', 'sx' => 1367, 'sy' => -873, 'ex' => 1405, 'ey' => 60, 'spx' => 1130, 'spy' => -250, 'w' => 126, 'rot' => -240],
				['src' => 'about-fv-4.jpg', 'sx' => 76, 'sy' => -534, 'ex' => 114, 'ey' => 399, 'spx' => 360, 'spy' => -220, 'w' => 88, 'rot' => 300],
			];
			?>
			<!-- ファーストビュー：写真が中央に1枚ずつ急に現れて重なり、全部そろったら下に「ABOUT」。写真をクリックで拡大表示 -->
			<section class="about-fv" id="js-about-fv">
				<div class="about-fv-pin" id="js-about-fv-pin">
				<div class="about-fv-canvas">
<?php foreach ($aboutPhotos as $i => $ph) :
	$w = isset($ph['w']) ? $ph['w'] : 700;
	$size = @getimagesize(dirname(__FILE__) . '/../images/' . $ph['src']);
	$h = ($size && $size[0] > 0) ? $w * $size[1] / $size[0] : $w;
	$x = isset($ph['x']) ? $ph['x'] : (1603 - $w) / 2;
	$y = isset($ph['y']) ? $ph['y'] : max(0, 700 - $h / 2);
	$full = isset($ph['full']) ? $ph['full'] : $ph['src'];
	$alt = isset($ph['alt']) ? $ph['alt'] : '';
?>
					<button type="button" class="about-fv-photo js-fv-photo" style="--x:<?php echo round($x); ?>;--y:<?php echo round($y); ?>;--w:<?php echo round($w); ?>;z-index:<?php echo $i + 1; ?>" data-full="../images/<?php echo htmlspecialchars($full); ?>" aria-label="写真を拡大する"><img src="../images/<?php echo htmlspecialchars($ph['src']); ?>" alt="<?php echo htmlspecialchars($alt); ?>"></button>
<?php endforeach; ?>
<?php foreach ($aboutChars as $i => $c) : ?>
					<img class="about-story-char js-story-char" style="--x:<?php echo $c['x']; ?>;--y:<?php echo $c['y']; ?>;--w:<?php echo $c['w']; ?>;z-index:<?php echo 100 + $i; ?>" src="../images/<?php echo htmlspecialchars($c['src']); ?>" alt="" aria-hidden="true">
<?php endforeach; ?>
<?php foreach ($aboutDrops as $i => $d) : ?>
					<img class="about-story-drop js-story-drop" style="--x:<?php echo $d['ex']; ?>;--y:<?php echo $d['ey']; ?>;--w:<?php echo $d['w']; ?>;z-index:<?php echo 50 + $i; ?>" data-sx="<?php echo $d['sx']; ?>" data-sy="<?php echo $d['sy']; ?>" data-rot="<?php echo $d['rot']; ?>"<?php if (isset($d['spx'])) : ?> data-spx="<?php echo $d['spx']; ?>" data-spy="<?php echo $d['spy']; ?>"<?php endif; ?> src="../images/<?php echo htmlspecialchars($d['src']); ?>" alt="" aria-hidden="true">
<?php endforeach; ?>
				</div>
				<h1 class="about-fv-title" id="js-about-fv-title">ABOUT</h1>
				<div class="about-credits" id="js-about-credits" aria-label="プロフィール">
<?php foreach ($aboutCredits as $group) : ?>
					<div class="about-credit-group">
<?php foreach ($group as $line) :
	$text = is_array($line) ? $line[0] : $line;
	$fs = is_array($line) && isset($line[1]) ? $line[1] : 44;
?>
						<p class="about-credit-line js-credit-line" style="--fs:<?php echo (int)$fs; ?>"><?php echo htmlspecialchars($text); ?></p>
<?php endforeach; ?>
					</div>
<?php endforeach; ?>
				</div>
				</div>
			</section>
			<div class="about-lightbox" id="js-about-lightbox" hidden>
				<button type="button" class="about-lightbox-close" aria-label="閉じる">&times;</button>
				<img src="" alt="">
			</div>
			<section>
				<div id="back-bn"><img src="../images/index_bn01.png" alt=""></div>
			</section>
		</article>
	</main>

	<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
	<script src="../js/about-fv.js?v=<?php echo @filemtime(dirname(__FILE__) . '/../js/about-fv.js'); ?>"></script>
	<?php $gsapLoaded = true; ?>
	<?php include ( dirname(__FILE__) . '/../template/footer.php' ); ?>