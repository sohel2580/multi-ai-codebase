<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/php-compat.php';

ob_start();
ini_set('display_errors', '0');
error_reporting(E_ALL);
header("Cache-Control: public, max-age=60");
header("Expires: " . gmdate("D, d M Y H:i:s", time() + 60) . " GMT");
header("X-Frame-Options: SAMEORIGIN");
header("X-Content-Type-Options: nosniff");
header("X-XSS-Protection: 1; mode=block");
$page = isset($_GET['page']) ? (string)$_GET['page'] : 'home';
if ($page === 'admin') { require __DIR__ . '/pages/admin.php'; exit; }
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
<?php
$biolinkPath = __DIR__ . '/data/biolink.json';
$biolink = app_json_read($biolinkPath);
$defaultName    = $biolink['profile']['name']    ?? 'Sohel Ahammad';
$defaultTagline = $biolink['profile']['tagline'] ?? 'Professional Portfolio';
$defaultImage   = $biolink['profile']['image']   ?? 'images/profile.jpg';
$protocol = 'https';
$host = $_SERVER['HTTP_HOST'] ?? 'sohel.pro.bd';
$scriptName = $_SERVER['SCRIPT_NAME'] ?? '/index.php';
$basePath = rtrim(dirname($scriptName), '\\/');
$baseUrl  = $protocol . '://' . $host . $basePath;
$baseHref = ($basePath === '/' || $basePath === '\\') ? '/' : $basePath . '/';
$page       = isset($_GET['page']) ? (string)$_GET['page'] : 'home';
$pageSlugs = [
    'home' => '',
    'skills' => 'skills',
    'gallery' => 'gallery',
    'blog' => 'blog',
    'contact' => 'contact',
    'post' => 'post',
];
$canonicalPath = $pageSlugs[$page] ?? ($page === 'post' ? 'post' : $page);
$canonicalQuery = '';
if ($page === 'post' && isset($_GET['id']) && $_GET['id'] !== '') {
    $canonicalQuery = '?id=' . rawurlencode((string)$_GET['id']);
}
$siteUrl = $baseUrl . ($canonicalPath ? '/' . rawurlencode($canonicalPath) : '/') . $canonicalQuery;
$seoTitle   = "$defaultName | Saudi Arabia Electrical Terminator & Multi-Skill Portfolio";
$seoDesc    = "$defaultName is a Saudi Arabia-based electrical terminator and multi-skilled professional with experience in electrical termination, testing and commissioning, store keeping, computer operations, and hospitality.";
$seoImage   = $baseUrl . '/' . ltrim($defaultImage, '/');
$baseKeywords = app_h($defaultName) . ", Sohel Ahammad portfolio, Saudi Arabia professional, electrical terminator Saudi Arabia, testing commissioning technician, store keeper, computer operator Riyadh, hotel waiter cashier";
$seoKeywords  = $baseKeywords;
if ($page === 'skills') {
    $seoTitle = "Experience & Skills | Electrical Terminator Saudi Arabia | $defaultName";
    $seoDesc  = "Explore $defaultName's experience as an electrical terminator, testing and commissioning technician, store keeper, computer operator, and waiter cashier in Saudi Arabia.";
    $seoKeywords = "Electrical Terminator Saudi Arabia, Testing and Commissioning Technician, Store Keeper, Computer Operator, Skills, Experience, " . $baseKeywords;
} elseif ($page === 'gallery') {
    $seoTitle = "Photo Gallery | $defaultName Portfolio";
    $seoDesc  = "View the professional portfolio photos of $defaultName from Saudi Arabia, highlighting electrical work, store keeping, office support, and service roles.";
    $seoKeywords = "Photo Gallery, Portfolio Photos, Saudi Arabia Worker, " . $baseKeywords;
} elseif ($page === 'blog') {
    $seoTitle = "Work Experience Blog | $defaultName";
    $seoDesc  = "Read practical articles from $defaultName about electrical termination, testing and commissioning, store keeping, computer operations, and hospitality in Saudi Arabia.";
    $seoKeywords = "Saudi Arabia Work Experience Blog, Electrical Technician Blog, Store Keeper Tips, Computer Operator Skills, " . $baseKeywords;
} elseif ($page === 'contact') {
    $seoTitle = "Contact $defaultName | Saudi Arabia Professional";
    $seoDesc  = "Contact $defaultName for work opportunities in Saudi Arabia through WhatsApp, Telegram, email, and social media profiles.";
    $seoKeywords = "Contact Sohel Ahammad, WhatsApp, Telegram, Email, Saudi Arabia Professional, " . $baseKeywords;
} elseif ($page === 'post' && isset($_GET['id'])) {
    $blogPath = __DIR__ . '/data/blog.json';
    if (file_exists($blogPath)) {
        $blogs = app_json_read($blogPath);
        $blogId = $_GET['id'];
        $currentBlog = null;
        if (isset($blogs[$blogId])) { $currentBlog = $blogs[$blogId]; }
        else { foreach ($blogs as $b) { if (isset($b['id']) && $b['id'] == $blogId) { $currentBlog = $b; break; } } }
        if ($currentBlog) {
            $seoTitle = app_h($currentBlog['title'] ?? '') . " | $defaultName";
            $seoDesc = app_string_excerpt((string)($currentBlog['content'] ?? ''), 150) . '...';
            if (!empty($currentBlog['image'])) { $seoImage = $baseUrl . '/' . ltrim($currentBlog['image'], '/'); }
            $siteUrl = $baseUrl . '/post?id=' . rawurlencode((string)$blogId);
            if (!empty($currentBlog['tags']) && is_array($currentBlog['tags'])) {
                $blogTags = implode(', ', $currentBlog['tags']);
                $hashTags = implode(', ', array_map(fn($t) => '#' . str_replace(' ', '', $t), $currentBlog['tags']));
                $seoKeywords = app_h($blogTags) . ", " . app_h($hashTags) . ", " . $baseKeywords;
            }
        }
    }
}
?>
  <title><?= app_h($seoTitle) ?></title>
  <link rel="icon" href="images/logo.png" type="image/png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <meta name="description" content="<?= app_h($seoDesc) ?>">
  <meta name="keywords" content="<?= $seoKeywords ?>">
  <meta name="author" content="<?= app_h($defaultName) ?>">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <meta name="theme-color" content="#0f172a">
  <meta name="format-detection" content="telephone=no">
  <meta property="og:type" content="<?= ($page === 'post') ? 'article' : 'website' ?>">
  <meta property="og:title" content="<?= app_h($seoTitle) ?>">
  <meta property="og:description" content="<?= app_h($seoDesc) ?>">
  <meta property="og:image" content="<?= app_h($seoImage) ?>">
  <meta property="og:locale" content="en_US">
  <meta property="article:author" content="<?= app_h($defaultName) ?>">
  <base href="<?= app_h($baseHref) ?>">
  <meta property="og:url" content="<?= app_h($siteUrl) ?>">
  <meta property="og:site_name" content="<?= app_h($defaultName) ?> Portfolio">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="<?= app_h($seoTitle) ?>">
  <meta name="twitter:description" content="<?= app_h($seoDesc) ?>">
  <meta name="twitter:image" content="<?= app_h($seoImage) ?>">
  <link rel="alternate" hreflang="en" href="<?= app_h($siteUrl) ?>">
  <link rel="canonical" href="<?= app_h($siteUrl) ?>">
<?php
$sameAs = [];
foreach (($biolink['socials'] ?? []) as $social) {
    if (!empty($social['url'])) {
        $sameAs[] = $social['url'];
    }
}
$schema = [
    '@context' => 'https://schema.org',
    '@graph' => [
        [
            '@type' => 'WebSite',
            '@id' => $baseUrl . '/#website',
            'url' => $baseUrl . '/',
            'name' => $defaultName . ' Portfolio',
            'description' => $seoDesc,
        ],
        [
            '@type' => 'Person',
            '@id' => $baseUrl . '/#person',
            'name' => $defaultName,
            'url' => $baseUrl . '/',
            'image' => $seoImage,
            'jobTitle' => 'Electrical Terminator and Multi-Skilled Professional',
            'description' => $seoDesc,
            'workLocation' => [
                '@type' => 'Country',
                'name' => 'Saudi Arabia',
            ],
            'nationality' => [
                '@type' => 'Country',
                'name' => 'Bangladesh',
            ],
            'hasOccupation' => [
                '@type' => 'Occupation',
                'name' => 'Electrical Terminator and Multi-Skilled Professional',
            ],
            'knowsAbout' => ['Electrical Termination', 'Testing and Commissioning', 'Store Keeping', 'Computer Operations', 'Hospitality Service'],
            'sameAs' => $sameAs,
        ],
        [
            '@type' => 'ProfilePage',
            '@id' => $siteUrl . '#webpage',
            'url' => $siteUrl,
            'name' => $seoTitle,
            'description' => $seoDesc,
            'about' => ['@id' => $baseUrl . '/#person'],
            'isPartOf' => ['@id' => $baseUrl . '/#website'],
        ],
        [
            '@type' => 'BreadcrumbList',
            '@id' => $siteUrl . '#breadcrumb',
            'itemListElement' => [
                [
                    '@type' => 'ListItem',
                    'position' => 1,
                    'name' => 'Home',
                    'item' => $baseUrl . '/',
                ],
                [
                    '@type' => 'ListItem',
                    'position' => 2,
                    'name' => $page === 'home' ? 'Profile' : ucfirst($page),
                    'item' => $siteUrl,
                ],
            ],
        ],
    ],
];
if ($page === 'post' && !empty($currentBlog)) {
    $schema['@graph'][] = [
        '@type' => 'Article',
        'headline' => $currentBlog['title'] ?? $seoTitle,
        'description' => $seoDesc,
        'image' => $seoImage,
        'author' => ['@id' => $baseUrl . '/#person'],
        'publisher' => ['@id' => $baseUrl . '/#person'],
        'datePublished' => $currentBlog['date'] ?? null,
        'keywords' => is_array($currentBlog['tags'] ?? null) ? implode(', ', $currentBlog['tags']) : '',
        'mainEntityOfPage' => $siteUrl,
    ];
}
$cssVersion = file_exists(__DIR__ . '/assets/css/styles.css') ? filemtime(__DIR__ . '/assets/css/styles.css') : time();
$jsVersion = file_exists(__DIR__ . '/assets/js/main.js') ? filemtime(__DIR__ . '/assets/js/main.js') : time();
?>
  <script type="application/ld+json"><?= json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?></script>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap">
  <link rel="preload" href="assets/css/styles.css?v=<?= $cssVersion ?>" as="style">
  <link rel="stylesheet" href="assets/css/styles.css?v=<?= $cssVersion ?>">
  <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></noscript>
</head>
<body>
<div class="preloader" id="preloader">
  <div class="preloader-inner">
    <div class="preloader-ring"></div>
    <span class="preloader-name">Sohel Ahammad</span>
  </div>
</div>
<?php include __DIR__ . '/header.php'; ?>
<main class="page-content" id="page-content">
  <div class="page-transition-wrapper">
  <?php
  $allowedPages = ['home', 'skills', 'contact', 'gallery', 'blog', 'post'];
  $page     = isset($_GET['page']) ? (string)$_GET['page'] : 'home';
  $pageFile = __DIR__ . "/pages/{$page}.php";
  if (in_array($page, $allowedPages, true) && file_exists($pageFile)) {
      include $pageFile;
  } elseif (in_array($page, $allowedPages, true)) {
      echo "<div class='section revealed' style='text-align:center;padding:80px 0;'><h2>Coming Soon</h2><a href='index.php' class='btn btn-primary'>Go Home</a></div>";
  } else {
      echo "<div class='section revealed' style='text-align:center; padding:80px 0;'>";
      echo "<div style='font-size:48px; margin-bottom:20px; color:var(--text-tertiary);'><i class='fa fa-exclamation-circle'></i></div>";
      echo "<h2 style='margin-bottom:12px; font-size:1.5rem;'>Page Not Found</h2>";
      echo "<p style='color:var(--text-secondary); margin-bottom:24px;'>The requested page does not exist.</p>";
      echo "<a href='index.php' class='btn btn-primary'>Go Home</a>";
      echo "</div>";
  }
  ?>
  </div>
</main>
<?php include __DIR__ . '/footer.php'; ?>
<script src="assets/js/main.js?v=<?= $jsVersion ?>" defer></script>
</body>
</html>
<?php ob_end_flush(); ?>