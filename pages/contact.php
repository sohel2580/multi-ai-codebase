<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/php-compat.php';

$biolink_file = __DIR__ . '/../data/biolink.json';
$biolink_data = app_json_read($biolink_file);

$profile = $biolink_data['profile'] ?? [
  "name" => "Sohel Ahammad",
  "tagline" => "Professional | Saudi Arabia",
  "image" => "images/profile.jpg"
];

$adminImg = file_exists(__DIR__ . '/../images/profile-320.jpg') ? 'images/profile-320.jpg' : $profile['image'];
if (file_exists(__DIR__ . '/../' . $adminImg)) {
  $adminImg .= '?v=' . filemtime(__DIR__ . '/../' . $adminImg);
}
$profile['image'] = $adminImg;

$contacts = $biolink_data['contacts'] ?? [];
$socials = $biolink_data['socials'] ?? [];
?>

<div class="contact-page biolink-page">

  <!-- ===== Hero Banner ===== -->
  <div class="section revealed contact-hero-section">
    <div class="contact-hero-card card">
      <div class="contact-hero-bg"></div>
      <div class="card-body contact-hero-body">
        <div class="contact-avatar-wrap">
          <img src="<?= app_h($profile['image']); ?>"
               alt="<?= app_h($profile['name']); ?>"
               class="contact-avatar"
               width="90"
               height="90"
               loading="eager"
               decoding="async">
          <span class="contact-online-dot" title="Available for work"></span>
        </div>
        <div class="contact-hero-text">
          <h1 class="contact-hero-name"><?= app_h($profile['name']); ?></h1>
          <p class="contact-hero-tagline"><?= app_h($profile['tagline']); ?></p>
          <div class="contact-availability-badge">
            <span class="status-dot"></span>
            Available &amp; Open to Work
            <span class="contact-response-time">&middot; Usually responds within 24h</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="section contact-trust-section">
    <div class="section-label"><i class="fa fa-handshake-o"></i> Why Contact Me</div>
    <div class="card">
      <div class="card-body">
        <p style="margin:0; color:var(--text-secondary); line-height:1.8;">I am available for work opportunities in Saudi Arabia and open to roles involving electrical termination, testing and commissioning, store keeping, computer operations, or hospitality support. I respond quickly through WhatsApp, Telegram, and email, and I am happy to share more details about my experience and availability.</p>
      </div>
    </div>
  </div>
 
  <!-- ===== Quick Action Buttons ===== -->
  <?php if (!empty($contacts)): ?>
  <div class="section contact-quick-section">
    <div class="section-label"><i class="fa fa-bolt"></i> Quick Contact</div>
    <div class="contact-quick-grid">
      <?php foreach ($contacts as $contact): ?>
        <a href="<?= app_h($contact['url'] ?? '#'); ?>"
           class="contact-quick-card"
           style="--card-color: <?= app_h($contact['color'] ?? '#3b82f6'); ?>;"
           aria-label="<?= app_h($contact['label'] ?? 'Contact'); ?>">
          <div class="contact-quick-icon">
            <?php if (!empty($contact['logo']) && file_exists($contact['logo'])): ?>
              <img src="<?= app_h($contact['logo']); ?>"
                   alt="<?= app_h($contact['label'] ?? ''); ?>"
                   width="22"
                   height="22"
                   loading="lazy"
                   decoding="async">
            <?php
    else: ?>
              <i class="fa <?= app_h($contact['icon'] ?? 'fa-link'); ?>"></i>
            <?php
    endif; ?>
          </div>
          <span class="contact-quick-label"><?= app_h($contact['label'] ?? ''); ?></span>
          <i class="fa fa-arrow-right contact-quick-arrow"></i>
        </a>
      <?php
  endforeach; ?>
    </div>
  </div>
  <?php
endif; ?>
  <!-- ===== Social Links ===== -->
  <?php if (!empty($socials)): ?>
  <div class="section">
    <div class="section-label"><i class="fa fa-share-alt"></i> Social Profiles</div>
    <div class="social-list">
      <?php foreach ($socials as $social): ?>
        <a href="<?= app_h($social['url'] ?? '#'); ?>"
           target="_blank" rel="noopener noreferrer"
           class="social-link">
          <span class="social-icon"
                style="background: <?= app_h($social['color'] ?? ''); ?>;">
            <?php if (!empty($social['logo']) && file_exists($social['logo'])): ?>
              <img src="<?= app_h($social['logo']); ?>"
                     alt="<?= app_h($social['name'] ?? ''); ?>"
                    width="18"
                    height="18"
                    loading="lazy"
                    decoding="async">
            <?php
    else: ?>
              <i class="fa <?= app_h($social['icon'] ?? ''); ?>"></i>
            <?php
    endif; ?>
          </span>
          <span class="social-name"><?= app_h($social['name'] ?? ''); ?></span>
          <span class="social-arrow"><i class="fa fa-external-link"></i></span>
        </a>
      <?php
  endforeach; ?>
    </div>
  </div>
  <?php
endif; ?>

  <div class="status-footer">
    <span class="status-dot-inline"></span>
    SYSTEM ONLINE &middot; AVAILABLE FOR WORK
  </div>

</div>

<script>
/* ===== Copy-to-Clipboard ===== */
function copyText(text, el) {
  navigator.clipboard.writeText(text).then(() => {
    const hint = el.querySelector('.contact-copy-hint');
    if (!hint) return;
    hint.innerHTML = '<i class="fa fa-check"></i>';
    hint.style.color = 'var(--green)';
    setTimeout(() => {
      hint.innerHTML = '<i class="fa fa-copy"></i>';
      hint.style.color = '';
    }, 2000);
  }).catch(() => {});
}
</script>

