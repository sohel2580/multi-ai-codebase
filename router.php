<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/php-compat.php';

$basePath = dirname((string)($_SERVER['SCRIPT_NAME'] ?? ''));
$uri = parse_url((string)($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH) ?: '/';
if (strpos($uri, $basePath) === 0) {
    $uri = substr($uri, strlen($basePath));
}
$uri = trim($uri, '/');

if ($uri === '' || $uri === 'index.php') {
    require __DIR__ . '/index.php';
    exit;
}

if ($uri === 'asup' || $uri === 'asup.php' || $uri === 'admin') {
    require __DIR__ . '/pages/admin.php';
    exit;
}

if (preg_match('/^index\.php$/', $uri)) {
    require __DIR__ . '/index.php';
    exit;
}

$pages = ['home', 'skills', 'gallery', 'blog', 'post', 'contact', 'biolink', 'photos'];
if (in_array($uri, $pages, true)) {
    // 'biolink' kept as alias for backward compatibility; both load contact.php
    $_GET['page'] = ($uri === 'biolink') ? 'contact' : $uri;
    require __DIR__ . '/index.php';
    exit;
}

if (file_exists(__DIR__ . '/' . $uri)) {
    return false;
}

$_GET['page'] = $uri;
require __DIR__ . '/index.php';
