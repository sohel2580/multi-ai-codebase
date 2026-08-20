<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/php-compat.php';

$skills = [
  "Computer Skills" => [
    ["name" => "Microsoft Office Suite", "percentage" => 86],
    ["name" => "Google Workspace", "percentage" => 80],
    ["name" => "Photoshop", "percentage" => 100],
    ["name" => "Python", "percentage" => 90],
  ],
  "Service & Technical" => [
    ["name" => "Store Keeper", "percentage" => 92],
    ["name" => "Electrical Terminator", "percentage" => 99],
    ["name" => "Electrical Testing Comm. Tech", "percentage" => 99],
    ["name" => "Cashier", "percentage" => 98],
    ["name" => "Waiter", "percentage" => 99],
  ],
  "Languages" => [
    ["name" => "à¦¬à¦¾à¦‚à¦²à¦¾", "percentage" => 100],
    ["name" => "English", "percentage" => 85],
    ["name" => "Hindi", "percentage" => 100],
    ["name" => "Arabic", "percentage" => 55],
  ],
];

$experience_file = __DIR__ . '/../data/experience.json';
if (file_exists($experience_file)) {
  $experience = app_json_read($experience_file);
}
else {
  $experience = [
    ["year" => "03-2020 to 09-2020", "title" => "Store Keeper", "company" => "Shapoorji Pallonji, King Abdullah Economic City, Saudi Arabia", "desc" => "Received, sorted, and stored products in stockrooms. Conducted stock checks to maintain the accuracy of inventory. Managed sales receipts and maintained accounting records."],
    ["year" => "10-2020 to 11-2021", "title" => "Hotel Waiter & Customer Cashier", "company" => "Delux Hotel, Riyadh, Saudi Arabia", "desc" => "Took orders from customers for food items and beverages, making recommendations. Processed payments, either by cash or card, accurately and efficiently."],
    ["year" => "12-2021 to 07-2022", "title" => "Computer Operator", "company" => "Delux Computer, Riyadh, Saudi Arabia", "desc" => "Prepared CVs, edited photos, and assisted with job applications. Issued insurance documents, managed the related work. Handled cashier duties."],
    ["year" => "08-2022 to 03-2023", "title" => "Electrical Terminator", "company" => "Jubail 3B Independent Water Project, Saudi Arabia", "desc" => "Connected and disconnected cables, wires, and conductors. Inspected and tested terminations for accuracy and continuity."],
    ["year" => "04-2023 to 08-2023", "title" => "Testing & Commissioning (T&C) Technician", "company" => "Jubail 3B Independent Water Project, Saudi Arabia", "desc" => "Adjusted and operated tested electrical material and equipment. Testing of SCADA levels of communication."],
    ["year" => "09-2023 to 11-2023", "title" => "Electrical Terminator", "company" => "Aramco, Al-Khafji, Saudi Arabia", "desc" => "Exposed and found burnt wiring resulting from a fire in the oil plant. Replaced the faulty wiring and fitted new wiring."],
  ];
}
?>

<div class="skills-page">
  <div class="section slide-right">
    <div class="section-label"><i class="fa fa-code"></i> Skills & Proficiency</div>
    <div class="card" style="margin-bottom: 20px;">
      <div class="card-body">
        <p style="margin:0; color:var(--text-secondary); line-height:1.8;">I am a Saudi Arabia-based professional with practical experience in electrical termination, testing and commissioning, store keeping, computer operations, and hospitality service. My work history reflects a strong mix of technical reliability, inventory control, office support, and customer-facing communication skills.</p>
      </div>
    </div>
    <div class="skills-grid">
      <?php foreach ($skills as $category => $skillSet): ?>
        <div class="skill-category">
          <h4><i class="fa fa-circle"></i> <?= $category; ?></h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 20px;">
            <?php foreach ($skillSet as $skill): ?>
              <div class="skill-ring-wrap">
                <div class="skill-ring" data-percentage="<?= $skill["percentage"]; ?>">
                  <svg width="80" height="80">
                    <circle class="skill-ring-track" cx="40" cy="40" r="35"></circle>
                    <circle class="skill-ring-fill" cx="40" cy="40" r="35"></circle>
                    <text class="skill-ring-label" x="40" y="40">0%</text>
                  </svg>
                </div>
                <div class="skill-ring-name"><?= $skill["name"]; ?></div>
              </div>
            <?php
  endforeach; ?>
          </div>
        </div>
      <?php
endforeach; ?>
    </div>

  </div>

  <div class="section slide-left">
    <div class="section-label"><i class="fa fa-clock-o"></i> Experience Timeline</div>
    <div class="card">
      <div class="card-body">
        <div class="timeline">
          <?php foreach ($experience as $exp): ?>
          <div class="timeline-item">
              <div class="timeline-year"><?= app_h($exp["year"] ?? ''); ?></div>
              <div class="timeline-title"><?= app_h($exp["title"] ?? ''); ?></div>
              <div class="timeline-company"><?= app_h($exp["company"] ?? ''); ?></div>
              <div class="timeline-desc"><?= app_h($exp["desc"] ?? ''); ?></div>
            </div>
          <?php
endforeach; ?>
        </div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="card">
      <div class="card-body">
        <div class="cv-download">
          <p>Need a detailed CV or interview-ready summary with my electrical, store keeping, office support, and hospitality experience? Contact me directly and I will share the full information.</p>
          <a href="contact" class="btn btn-primary">REQUEST MY CV</a>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
(function() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
        entry.target.classList.add('animated');
        const rings = entry.target.querySelectorAll('.skill-ring');
        rings.forEach((ring, i) => {
          const fill = ring.querySelector('.skill-ring-fill');
          const label = ring.querySelector('.skill-ring-label');
          const percentage = parseInt(ring.dataset.percentage);
          const r = 35;
          const circum = 2 * Math.PI * r;
          
          setTimeout(() => {
            if (fill) {
              const offset = circum - (percentage / 100) * circum;
              fill.style.setProperty('--ring-offset', offset);
              fill.classList.add('animated');
            }
            
            if (label) {
              if (reduceMotion) {
                label.textContent = percentage + '%';
                return;
              }
              let current = 0;
              const timer = setInterval(() => {
                current += 1;
                if (current >= percentage) {
                  current = percentage;
                  clearInterval(timer);
                }
                label.textContent = current + '%';
              }, 20);
            }
          }, reduceMotion ? 0 : i * 150);
        });
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.skill-category').forEach(cat => {
    skillObserver.observe(cat);
  });

  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.timeline-item').forEach((item, i) => {
    item.style.transitionDelay = reduceMotion ? '0s' : (i * 0.1) + 's';
    timelineObserver.observe(item);
  });

  document.querySelectorAll('.skill-name span:last-child').forEach(span => {
    const originalText = span.textContent;
    const num = parseInt(originalText);
    if (!isNaN(num)) {
      span.textContent = '0%';
      const parent = span.closest('.skill-item');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && span.textContent === '0%') {
            if (reduceMotion) {
              span.textContent = num + '%';
              return;
            }
            let current = 0;
            const timer = setInterval(() => {
              current += 2;
              if (current >= num) {
                current = num;
                clearInterval(timer);
              }
              span.textContent = current + '%';
            }, 20);
          }
        });
      }, { threshold: 0.5 });
      observer.observe(parent);
    }
  });
})();
</script>
