<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/php-compat.php';

// Load Data
$biolinkPath = __DIR__ . '/../data/biolink.json';
$experiencePath = __DIR__ . '/../data/experience.json';

$biolink = app_json_read($biolinkPath);
$experience = app_json_read($experiencePath);

$name = $biolink['profile']['name'] ?? "Sohel Ahammad";
$tagline = $biolink['profile']['tagline'] ?? "Professional | Saudi Arabia";
$sohel_image = file_exists(__DIR__ . '/../images/profile-320.jpg') ? "images/profile-320.jpg" : ($biolink['profile']['image'] ?? "images/profile.jpg");
$sohel_image_version = '';
if (file_exists(__DIR__ . '/../' . $sohel_image)) {
  $sohel_image_version = '?v=' . filemtime(__DIR__ . '/../' . $sohel_image);
}

$gallery_images = array_filter((array)glob("uploads/*.*"), function ($file) {
  return preg_match('/\.(jpg|jpeg|png|gif|webp)$/i', $file);
});
$gallery_images = array_values($gallery_images);

// Take up to 5 latest experiences for highlights if dynamic data exists
if (!empty($experience)) {
  $experience_highlights = array_slice($experience, 0, 5);
}
else {
  $experience_highlights = [
    ["title" => "Store Keeper", "company" => "Saudi Arabia"],
    ["title" => "Hotel Waiter & Cashier", "company" => "Saudi Arabia"],
    ["title" => "Electrical Terminator", "company" => "Saudi Arabia"],
    ["title" => "Computer Operator", "company" => "Saudi Arabia"],
    ["title" => "Testing & Commissioning (T&C) Technician", "company" => "Saudi Arabia"],
  ];
}

// Extract skills from experience for hero tags
$skills_summary = !empty($experience) ? array_column(array_slice($experience, 0, 6), 'title') : ["Store Keeper", "Hotel Waiter", "Cashier", "Electrical Terminator", "Computer Operator", "Testing & Commissioning Technician"];

$stats = [
  ["value" => "4+", "label" => "Years Experience"],
  ["value" => count($experience) ?: "6", "label" => "Job Roles"],
  ["value" => "5", "label" => "Companies"],
  ["value" => "4", "label" => "Languages"],
];
?>

<div class="hero section revealed" id="hero-section">
  <canvas class="particles-canvas" id="particles-canvas"></canvas>
  <div class="hero-photo-wrapper">
    <img src="<?= app_h($sohel_image . $sohel_image_version); ?>" alt="<?= app_h($name); ?>" class="hero-photo" width="140" height="140" decoding="async" fetchpriority="high">
    <div class="speech-bubble" id="typing-bubble"></div>
  </div>
  <h1 class="hero-name"><?= $name; ?></h1>
  <p class="hero-tagline" id="hero-tagline"><?= $tagline; ?></p>
  <div class="hero-tags">
    <?php foreach ($skills_summary as $skill): ?>
      <span class="tag"><?= app_h($skill); ?></span>
    <?php
endforeach; ?>
  </div>
  <div class="hero-actions">
    <a href="skills" class="btn btn-primary">VIEW EXPERIENCE</a>
    <a href="contact" class="btn btn-secondary">CONTACT ME</a>
  </div>
  <div class="status-badge">
    <span class="status-dot"></span>
    AVAILABLE FOR WORK
  </div>
</div>

<div class="section slide-left" id="about">
  <h2 class="section-label"><i class="fa fa-user"></i> About Me</h2>
  <div class="card">
    <div class="card-body">
      <div class="about-text">
        <p class="about-intro">
          Hello! I am <span class="highlight-name"><?= $name; ?></span>, a Saudi Arabia-based professional with hands-on experience in electrical termination, testing and commissioning, store keeping, computer operations, and hospitality support.
        </p>
        <p>
          My background spans industrial and service environments across Saudi Arabia, including cable termination projects, equipment testing, inventory control, document preparation, and customer-facing duties. I am known for being dependable, quick to learn, and comfortable working in fast-paced teams where reliability and accuracy matter.
        </p>
        <p>
          I communicate confidently in Bengali, English, Hindi, and Arabic, which helps me work effectively with diverse teams and clients. Whether the task is technical, operational, or office-based, I bring a strong work ethic and a steady professional attitude to every role.
        </p>
        <div class="about-highlights">
          <div class="about-highlight-item">
            <i class="fa fa-bolt"></i>
            <span>Quick learner & highly adaptable</span>
          </div>
          <div class="about-highlight-item">
            <i class="fa fa-language"></i>
            <span>Multilingual: Bengali, English, Hindi, Arabic</span>
          </div>
          <div class="about-highlight-item">
            <i class="fa fa-laptop"></i>
            <span>Technical skills in Computer Operations & Photoshop</span>
          </div>
          <div class="about-highlight-item">
            <i class="fa fa-handshake-o"></i>
            <span>Strong dedication & professional attitude</span>
          </div>
        </div>
        <div class="about-goal">
          <strong>My Goal:</strong> To continuously grow professionally and take on new challenges that help me develop my skills further.
        </div>
      </div>
    </div>
  </div>
</div>

<div class="section slide-right" id="experience">
  <h2 class="section-label"><i class="fa fa-briefcase"></i> Experience Highlights</h2>
  <div class="card">
    <div class="card-body">
      <div class="exp-grid">
        <?php foreach ($experience_highlights as $index => $exp):
  $icons = ['fa-building', 'fa-cutlery', 'fa-bolt', 'fa-desktop', 'fa-cogs'];
  $icon = $icons[$index % count($icons)];
?>
          <div class="exp-card">
            <i class="fa <?= $icon; ?>" aria-hidden="true"></i>
            <h3><?= app_h($exp['title'] ?? ''); ?></h3>
            <p><?= app_h($exp['company'] ?? $exp['location'] ?? 'Saudi Arabia'); ?></p>
          </div>
        <?php
endforeach; ?>
      </div>
    </div>
  </div>
</div>

<div class="section slide-left" id="stats">
  <h2 class="section-label"><i class="fa fa-bar-chart"></i> Statistics</h2>
  <div class="card">
    <div class="card-body">
      <div class="stats-row">
        <?php foreach ($stats as $stat): ?>
          <div class="stat-item" data-count="<?= $stat['value']; ?>">
            <h3><?= $stat['value']; ?></h3>
            <p><?= $stat['label']; ?></p>
          </div>
        <?php
endforeach; ?>
      </div>
    </div>
  </div>
</div>

<?php if (count($gallery_images) > 0): ?>
<div class="section slide-right">
  <h2 class="section-label"><i class="fa fa-camera"></i> Photos</h2>
  <div class="card">
    <div class="card-body" style="padding: 16px;">
      <div class="gallery-container">
        <?php foreach ($gallery_images as $img): ?>
          <img src="<?= $img; ?>" alt="<?= app_h('Sohel Ahammad portfolio photo showing professional work in Saudi Arabia') ?>" class="gallery-slide" loading="lazy" decoding="async" width="800" height="400">
        <?php
  endforeach; ?>
        <?php if (count($gallery_images) > 1): ?>
          <button class="gallery-prev"><i class="fa fa-chevron-left"></i></button>
          <button class="gallery-next"><i class="fa fa-chevron-right"></i></button>
          <div class="gallery-dots">
            <?php for ($i = 0; $i < count($gallery_images); $i++): ?>
              <span class="gallery-dot<?= $i === 0 ? ' active' : ''; ?>"></span>
            <?php
    endfor; ?>
          </div>
        <?php
  endif; ?>
      </div>
    </div>
  </div>
</div>
<?php
endif; ?>

<script>
(function() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const statObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const item = entry.target;
        const h3 = item.querySelector('h3');
        const finalText = item.getAttribute('data-count') || h3.textContent;
        const num = parseInt(finalText);
        if (!isNaN(num)) {
          let current = 0;
          const suffix = finalText.replace(/[0-9]/g, '');
          const increment = Math.ceil(num / 30);
          const timer = setInterval(() => {
            current += increment;
            if (current >= num) {
              current = num;
              clearInterval(timer);
            }
            h3.textContent = current + suffix;
          }, 50);
        }
        observer.unobserve(item);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-item[data-count]').forEach(item => {
    statObserver.observe(item);
  });
})();

(function() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const bubble = document.getElementById('typing-bubble');
  if (!bubble) return;
  const text = '\u0986\u09b8\u09b8\u09be\u09b2\u09be\u09ae\u09c1 \u0986\u09b2\u09be\u0987\u0995\u09c1\u09ae\u0964';
  let i = 0;
  bubble.textContent = '';
  bubble.style.borderRight = '2px solid var(--accent)';
  function type() {
    if (i < text.length) {
      bubble.textContent += text.charAt(i);
      i++;
      setTimeout(type, 80);
    } else {
      setTimeout(() => { bubble.style.borderRight = 'none'; }, 600);
    }
  }
  setTimeout(type, 800);
})();
</script>

