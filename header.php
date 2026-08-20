<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/php-compat.php';

$currentPage = isset($_GET['page']) ? (string)$_GET['page'] : 'home';
?>

<div class="scroll-progress" id="scroll-progress"></div>

<nav class="top-nav">
  <div class="nav-container">
    <span class="nav-brand">Sohel Ahammad</span>
    
    <button class="nav-toggle" id="nav-toggle" aria-label="Toggle navigation" aria-controls="nav-menu" aria-expanded="false">
      <i class="fa fa-bars"></i>
    </button>

    <div class="nav-links" id="nav-menu">
      <?php
$biolink_data = app_json_read(__DIR__ . '/data/biolink.json');
if ($biolink_data['settings']['show_home'] ?? true): ?>
      <a href="./" class="nav-link <?= $currentPage === 'home' ? 'active' : ''; ?>">
        <i class="fa fa-home"></i>
        <span>Home</span>
      </a>
      <?php
endif; ?>
      <?php if ($biolink_data['settings']['show_experience'] ?? true): ?>
      <a href="skills" class="nav-link <?= $currentPage === 'skills' ? 'active' : ''; ?>">
        <i class="fa fa-briefcase"></i>
        <span>Experience</span>
      </a>
      <?php
endif; ?>
      <?php if ($biolink_data['settings']['show_gallery'] ?? true): ?>
      <a href="gallery" class="nav-link <?= $currentPage === 'gallery' ? 'active' : ''; ?>">
        <i class="fa fa-camera"></i>
        <span>Gallery</span>
      </a>
      <?php
endif; ?>
      <?php if ($biolink_data['settings']['show_blog'] ?? true): ?>
      <a href="blog" class="nav-link <?= $currentPage === 'blog' ? 'active' : ''; ?>">
        <i class="fa fa-rss"></i>
        <span>Blog</span>
      </a>
      <?php
endif; ?>
      <?php if ($biolink_data['settings']['show_contact'] ?? true): ?>
      <a href="contact" class="nav-link <?=($currentPage === 'contact' || $currentPage === 'biolink') ? 'active' : ''; ?>">
        <i class="fa fa-envelope"></i>
        <span>Contact</span>
      </a>
      <?php
endif; ?>
    </div>

    <div class="nav-right">
      <span class="nav-time" id="nav-time"></span>
      <button class="theme-toggle" id="theme-toggle" aria-label="Toggle theme">
        <i class="fa fa-moon-o"></i>
      </button>
    </div>
  </div>
</nav>
