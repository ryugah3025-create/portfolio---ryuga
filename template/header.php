<?php
// ---- SEO用のhead情報 ----
// 各ページは、このファイルを読み込む前に次の変数を設定できる（すべて省略可。省略するとTOPページ用の値になる）
//   $pageTitle       : <title>
//   $pageDescription : メタディスクリプション（検索結果に表示される説明文。80〜120文字くらい）
//   $pagePath        : このページのパス（例: '/about/'）。canonical / OGPのURLになる
//   $pageNoindex     : true にすると、検索結果に出さない（noindex）
//   $pageType        : og:type（既定 'website'。プロフィールページは 'profile'）
// サイトのURL（本番）。ドメインが変わったらここだけ直す
$siteUrl = 'https://ryuga325.digick.jp';
$siteName = '原龍我｜ハラリュウガ';
$defaultTitle = '原龍我 | ハラリュウガ｜東京のホームページ制作・Web制作・Web運用';
$defaultDescription = '東京を拠点に、ホームページ制作・Web制作・Web運用を行う原龍我（ハラリュウガ）のポートフォリオサイト。制作実績、月額制のWeb運用サービス、プロフィールを掲載しています。';
$title = isset($pageTitle) && $pageTitle !== '' ? $pageTitle : $defaultTitle;
$description = isset($pageDescription) && $pageDescription !== '' ? $pageDescription : $defaultDescription;
$path = isset($pagePath) && $pagePath !== '' ? $pagePath : '/';
$noindex = !empty($pageNoindex);
$ogType = isset($pageType) && $pageType !== '' ? $pageType : 'website';
$canonical = $siteUrl . $path;
$ogImage = $siteUrl . '/images/ogp.jpg';
$e = function ($v) { return htmlspecialchars($v, ENT_QUOTES, 'UTF-8'); };
?>
<!DOCTYPE html>
<html lang="ja">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="google-site-verification" content="hAGOLLi0ZvKt7l-WBL4chh_gPCnR8i3pdKFLtXzN_D4" />
  <script>
    // ローディングが終わるまでは、ページ中身のアニメーションを止めておく（site-loader.js が終わったら外す。万一のため30秒で外す）
    document.documentElement.classList.add("is-loading");
    window.setTimeout(function () { document.documentElement.classList.remove("is-loading"); }, 30000);
    // コンテナクエリ(cqw等)に未対応の古いブラウザでは、動きのある演出をやめて、読める静的レイアウトにする
    try { if (!(window.CSS && CSS.supports && CSS.supports("container-type", "inline-size"))) document.documentElement.classList.add("no-cq"); } catch (e) { document.documentElement.classList.add("no-cq"); }
  </script>
  <title><?php echo $e($title); ?></title>
  <meta name="description" content="<?php echo $e($description); ?>">
  <meta name="author" content="原龍我">
  <meta name="robots" content="<?php echo $noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1'; ?>">
<?php if (!$noindex) : ?>
  <link rel="canonical" href="<?php echo $e($canonical); ?>">
<?php endif; ?>
  <meta name="theme-color" content="#ffffff">
  <!-- OGP（SNSでシェアされたときの表示） -->
  <meta property="og:locale" content="ja_JP">
  <meta property="og:type" content="<?php echo $e($ogType); ?>">
  <meta property="og:site_name" content="<?php echo $e($siteName); ?>">
  <meta property="og:title" content="<?php echo $e($title); ?>">
  <meta property="og:description" content="<?php echo $e($description); ?>">
  <meta property="og:url" content="<?php echo $e($canonical); ?>">
  <meta property="og:image" content="<?php echo $e($ogImage); ?>">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="<?php echo $e($title); ?>">
  <meta name="twitter:description" content="<?php echo $e($description); ?>">
  <meta name="twitter:image" content="<?php echo $e($ogImage); ?>">
<?php if (!$noindex) :
  // 構造化データ（検索エンジンに、サイトと運営者を伝える）
  $person = [
    '@type' => 'Person',
    '@id' => $siteUrl . '/#person',
    'name' => '原龍我',
    'alternateName' => ['ハラリュウガ', 'Ryuga Hara'],
    'url' => $siteUrl . '/',
    'image' => $ogImage,
    'jobTitle' => 'Web制作・Web運用',
    'description' => '東京を拠点に、ホームページ制作・Web制作・Web運用を行っています。',
    'knowsAbout' => ['ホームページ制作', 'Web制作', 'Web運用', 'Webサイト運用・改善'],
  ];
  $graph = [
    $person,
    [
      '@type' => 'WebSite',
      '@id' => $siteUrl . '/#website',
      'url' => $siteUrl . '/',
      'name' => $siteName,
      'inLanguage' => 'ja',
      'publisher' => ['@id' => $siteUrl . '/#person'],
    ],
    [
      '@type' => $ogType === 'profile' ? 'ProfilePage' : 'WebPage',
      '@id' => $canonical . '#webpage',
      'url' => $canonical,
      'name' => $title,
      'description' => $description,
      'isPartOf' => ['@id' => $siteUrl . '/#website'],
      'about' => ['@id' => $siteUrl . '/#person'],
      'inLanguage' => 'ja',
    ],
  ];
  if ($path !== '/') {
    $graph[] = [
      '@type' => 'BreadcrumbList',
      'itemListElement' => [
        ['@type' => 'ListItem', 'position' => 1, 'name' => 'TOP', 'item' => $siteUrl . '/'],
        ['@type' => 'ListItem', 'position' => 2, 'name' => isset($pageCrumb) && $pageCrumb !== '' ? $pageCrumb : $title, 'item' => $canonical],
      ],
    ];
  }
?>
  <script type="application/ld+json"><?php echo json_encode(['@context' => 'https://schema.org', '@graph' => $graph], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); ?></script>
<?php endif; ?>
  <meta name="google-site-verification" content="lKjqW3PWf9S9KvQqd0ea0NKJ5qeZnhNZL8Jy5d_ZMCA" />

  <!-- css -->
  <link rel="icon" href="/../images/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@1,100&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Lato:ital@1&display=swap" rel="stylesheet">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fjalla+One&family=Rock+3D&display=swap" rel="stylesheet">
  <!-- BLOG記事一覧用フォント（手書き風の本文・タイトル） -->
  <link href="https://fonts.googleapis.com/css2?family=Zen+Kurenaido&display=swap" rel="stylesheet">
  <!-- TOPファーストビュー用フォント -->
  <link href="https://fonts.googleapis.com/css2?family=Itim&family=Jeju+Myeongjo&family=Noto+Sans+JP:wght@400;700;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/reset.css">
  <link rel="stylesheet" href="/css/style.css?v=<?php echo @filemtime(dirname(__FILE__) . '/../css/style.css'); ?>">
</head>

<body<?php echo isset($bodyClass) && $bodyClass !== '' ? ' class="' . htmlspecialchars($bodyClass, ENT_QUOTES) . '"' : ''; ?>>
  <?php include ( dirname(__FILE__) . '/loader.php' ); ?>
  <script src="/js/site-loader.js?v=<?php echo @filemtime(dirname(__FILE__) . '/../js/site-loader.js'); ?>"></script>
  <header>
    <div class="header-wrap">
      <div class="h-logo">
        <a href="/"><img src="/images/header-logo.png" alt="原龍我 トップへ"></a>
      </div>
      <nav class="h-menu" id="h-menu" aria-label="おしながき">
        <ul>
          <li><a href="/blog/index.php">BLOG</a></li>
          <li><a href="/works/index.php">WORKS</a></li>
          <li><a href="/about/index.php">ABOUT</a></li>
          <li><a href="https://lin.ee/VNnLIPN">CONTACT</a></li>
        </ul>
      </nav>
      <button type="button" class="hamburger" aria-expanded="false" aria-controls="h-menu">
        <span class="hamburger-text">おしながき</span>
      </button>
    </div>
  </header>