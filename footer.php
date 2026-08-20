<?php /* Hidden SVG defs - provides gradients used by skill rings and other SVG effects */?>
<svg width="0" height="0" style="position:absolute;pointer-events:none">
  <defs>
    <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#3b82f6"/>
      <stop offset="33%"  stop-color="#a78bfa"/>
      <stop offset="66%"  stop-color="#ec4899"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
  </defs>
</svg>

<button class="back-to-top" id="back-to-top" aria-label="Back to top">
  <i class="fa fa-chevron-up"></i>
</button>

<div class="footer-wave">
  <svg id="footer-wave-svg" viewBox="0 0 800 40" preserveAspectRatio="none">
    <path class="wave-animated wave-path-fill" d="M0,20 L800,20 L800,40 L0,40 Z"></path>
    <path class="wave-animated wave-path" d="M0,20 L800,20"></path>
  </svg>
</div>

<footer>
  <p>&copy; <?= date('Y'); ?> Sohel Ahammad. All rights reserved.</p>
</footer>
