<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/php-compat.php';

$gallery_images = array_filter((array)glob("uploads/*.*"), function($file) {
    return preg_match('/\.(jpg|jpeg|png|gif|webp)$/i', $file);
});
$gallery_images = array_values($gallery_images);
?>

<div class="gallery-page">
  <div class="section revealed">
    <div class="section-label"><i class="fa fa-camera"></i> Photo Gallery</div>
    <div class="card">
      <div class="card-body">
        <div class="gallery-header">
          <h1>My Photo Gallery</h1>
          <p>Total Photos: <?= count($gallery_images) ?></p>
        </div>
        <p style="margin: 0 0 20px; color: var(--text-secondary); line-height: 1.8;">These portfolio photos highlight Sohel Ahammad's professional work history in Saudi Arabia, including electrical, service, and office-based responsibilities.</p>
 
        <?php if (count($gallery_images) > 0): ?>
          <div class="gallery-grid">
            <?php foreach ($gallery_images as $index => $img): ?>
              <div class="gallery-item" onclick="openLightbox(<?= $index ?>)">
                <img src="<?= app_h($img) ?>" alt="<?= app_h('Sohel Ahammad portfolio gallery photo ' . ($index + 1) . ' for electrical, store keeping, or service work in Saudi Arabia') ?>" loading="lazy" decoding="async" width="220" height="220">
                <i class="fa fa-search-plus view-icon"></i>
              </div>
            <?php endforeach; ?>
          </div>
        <?php else: ?>
          <div class="no-photos">
            <i class="fa fa-camera"></i>
            <p>No photos uploaded yet</p>
          </div>
        <?php endif; ?>
      </div>
    </div>
  </div>
</div>

<div class="lightbox" id="lightbox">
  <span class="lightbox-close" onclick="closeLightbox()">&times;</span>
  <span class="lightbox-nav lightbox-prev" onclick="prevPhoto()">&#10094;</span>
  <img src="" alt="Sohel Ahammad portfolio gallery photo" id="lightbox-img" decoding="async">
  <span class="lightbox-nav lightbox-next" onclick="nextPhoto()">&#10095;</span>
  <div class="lightbox-counter" id="lightbox-counter"></div>
</div>

<script>
const galleryImages = <?= json_encode($gallery_images) ?>;
let currentIndex = 0;

function openLightbox(index) {
  currentIndex = index;
  updateLightbox();
  document.getElementById('lightbox').classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Prevent downloading images via right-click or drag
document.addEventListener('contextmenu', function(e) {
  if (e.target.tagName === 'IMG') {
    e.preventDefault();
  }
});

document.addEventListener('dragstart', function(e) {
  if (e.target.tagName === 'IMG') {
    e.preventDefault();
  }
});

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
  document.body.style.overflow = '';
}

function updateLightbox() {
  document.getElementById('lightbox-img').src = galleryImages[currentIndex];
  document.getElementById('lightbox-counter').textContent = (currentIndex + 1) + ' / ' + galleryImages.length;
}

function nextPhoto() {
  currentIndex = (currentIndex + 1) % galleryImages.length;
  updateLightbox();
}

function prevPhoto() {
  currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
  updateLightbox();
}

document.addEventListener('keydown', function(e) {
  if (!document.getElementById('lightbox').classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') nextPhoto();
  if (e.key === 'ArrowLeft') prevPhoto();
});

document.getElementById('lightbox').addEventListener('click', function(e) {
  if (e.target === this) closeLightbox();
});
</script>
