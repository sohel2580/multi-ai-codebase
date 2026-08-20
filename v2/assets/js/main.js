const Motion = {
  reduce: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  finePointer: window.matchMedia('(hover: hover) and (pointer: fine)').matches,
};

class Preloader {
  constructor() {
    this.el = document.getElementById('preloader');
    if (!this.el) return;
    this.hide = () => {
      if (this.done) return;
      this.done = true;
      const delay = Motion.reduce ? 0 : 120;
      setTimeout(() => {
        this.el.classList.add('hidden');
        setTimeout(() => this.el.remove(), Motion.reduce ? 0 : 500);
      }, delay);
    };
    this.done = false;
    window.addEventListener('load', this.hide);
    setTimeout(this.hide, Motion.reduce ? 0 : 1200);
  }
}

class ScrollReveal {
  constructor() {
    this.elements = document.querySelectorAll('.section');
    this.init();
  }

  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    this.elements.forEach(el => observer.observe(el));
  }
}

class StickyNav {
  constructor() {
    this.nav = document.querySelector('.top-nav');
    this.toggleBtn = document.getElementById('nav-toggle');
    this.menu = document.getElementById('nav-menu');

    if (!this.nav) return;

    window.addEventListener('scroll', () => {
      this.nav.classList.toggle('scrolled', window.scrollY > 10);
      // Close menu on any scroll
      if (this.menu && this.menu.classList.contains('active')) {
        this.closeMenu();
      }
    }, { passive: true });

    if (this.toggleBtn && this.menu) {
      this.toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = this.menu.classList.contains('active');
        isOpen ? this.closeMenu() : this.openMenu();
      });

      // Close menu on nav-link click
      this.menu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => this.closeMenu());
      });

      // Close menu on click outside
      document.addEventListener('click', (e) => {
        if (this.menu.classList.contains('active') &&
          !this.menu.contains(e.target) &&
          !this.toggleBtn.contains(e.target)) {
          this.closeMenu();
        }
      });

      // Close menu on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.menu.classList.contains('active')) {
          this.closeMenu();
        }
      });
    }
  }

  openMenu() {
    this.menu.classList.add('active');
    this.toggleBtn.setAttribute('aria-expanded', 'true');
    const icon = this.toggleBtn.querySelector('i');
    if (icon) icon.className = 'fa fa-times';
  }

  closeMenu() {
    this.menu.classList.remove('active');
    this.toggleBtn.setAttribute('aria-expanded', 'false');
    const icon = this.toggleBtn.querySelector('i');
    if (icon) icon.className = 'fa fa-bars';
  }
}


class NavClock {
  constructor() {
    this.el = document.getElementById('nav-time');
    if (!this.el) return;
    this.tick();
    setInterval(() => this.tick(), 1000);
  }

  tick() {
    try {
      const now = new Date();
      const options = { timeZone: 'Asia/Riyadh', hour: '2-digit', minute: '2-digit', hour12: false };
      const timeStr = new Intl.DateTimeFormat('en-GB', options).format(now);
      this.el.innerHTML = `<i class="fa fa-clock-o" style="color:#10b981;margin-right:3px;"></i> ${timeStr} <span style="font-size:0.75rem;color:var(--text-muted);">Riyadh</span>`;
    } catch (e) {
      const now = new Date();
      this.el.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
  }
}

class PhotoGallery {
  constructor(container) {
    this.container = container;
    this.images = container.querySelectorAll('.gallery-slide');
    this.currentIndex = 0;
    this.autoSlideInterval = null;
    this.isAnimating = false;
    this.init();
  }

  init() {
    if (this.images.length === 0) return;
    this.images[0].classList.add('active');
    const dotsContainer = this.container.querySelector('.gallery-dots');
    if (dotsContainer && dotsContainer.children.length === 0 && this.images.length > 1) {
      for (let i = 0; i < this.images.length; i++) {
        const dot = document.createElement('span');
        dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
        dotsContainer.appendChild(dot);
      }
    }
    this.updateDots();
    if (this.images.length > 1) {
      this.startAutoSlide();
      this.setupControls();
      this.setupTouch();
      this.setupDotClicks();
    }
  }

  showSlide(index, direction) {
    if (this.isAnimating || index === this.currentIndex) return;
    this.isAnimating = true;
    const oldSlide = this.images[this.currentIndex];
    const newSlide = this.images[index];
    const dir = direction || (index > this.currentIndex ? 'next' : 'prev');
    oldSlide.classList.remove('active', 'slide-out-left', 'slide-out-right');
    newSlide.classList.remove('active', 'slide-out-left', 'slide-out-right');
    if (dir === 'next') {
      newSlide.style.transform = 'translateX(60px) scale(0.97)';
      oldSlide.classList.add('slide-out-left');
    } else {
      newSlide.style.transform = 'translateX(-60px) scale(0.97)';
      oldSlide.classList.add('slide-out-right');
    }
    void newSlide.offsetWidth;
    newSlide.style.transform = '';
    newSlide.classList.add('active');
    this.currentIndex = index;
    this.updateDots();
    setTimeout(() => {
      oldSlide.classList.remove('slide-out-left', 'slide-out-right');
      this.isAnimating = false;
    }, 650);
  }

  nextSlide() {
    const next = (this.currentIndex + 1) % this.images.length;
    this.showSlide(next, 'next');
  }

  prevSlide() {
    const prev = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.showSlide(prev, 'prev');
  }

  startAutoSlide() {
    this.autoSlideInterval = setInterval(() => this.nextSlide(), 4000);
  }

  stopAutoSlide() {
    clearInterval(this.autoSlideInterval);
  }

  setupControls() {
    const prevBtn = this.container.querySelector('.gallery-prev');
    const nextBtn = this.container.querySelector('.gallery-next');
    if (prevBtn) prevBtn.addEventListener('click', () => { this.stopAutoSlide(); this.prevSlide(); this.startAutoSlide(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { this.stopAutoSlide(); this.nextSlide(); this.startAutoSlide(); });
    this.container.addEventListener('mouseenter', () => this.stopAutoSlide());
    this.container.addEventListener('mouseleave', () => this.startAutoSlide());
  }

  setupTouch() {
    let startX = 0;
    this.container.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    this.container.addEventListener('touchend', (e) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        this.stopAutoSlide();
        diff > 0 ? this.nextSlide() : this.prevSlide();
        this.startAutoSlide();
      }
    });
  }

  setupDotClicks() {
    const dots = this.container.querySelectorAll('.gallery-dot');
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        this.stopAutoSlide();
        const dir = i > this.currentIndex ? 'next' : 'prev';
        this.showSlide(i, dir);
        this.startAutoSlide();
      });
    });
  }

  updateDots() {
    const dots = this.container.querySelectorAll('.gallery-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === this.currentIndex);
    });
  }
}

class ThemeToggle {
  constructor() {
    this.btn = document.getElementById('theme-toggle');
    if (!this.btn) return;
    this.icon = this.btn.querySelector('i');
    this.loadTheme();
    this.btn.addEventListener('click', () => this.toggle());
  }

  loadTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      this.updateIcon('light');
    } else {
      document.documentElement.removeAttribute('data-theme');
      this.updateIcon('dark');
    }
  }

  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    if (current === 'light') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
      this.updateIcon('dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      this.updateIcon('light');
    }
  }

  updateIcon(theme) {
    if (!this.icon) return;
    if (theme === 'dark') {
      this.icon.className = 'fa fa-sun-o';
    } else {
      this.icon.className = 'fa fa-moon-o';
    }
  }
}

class ScrollProgress {
  constructor() {
    this.bar = document.getElementById('scroll-progress');
    if (!this.bar) return;
    this.ticking = false;
    window.addEventListener('scroll', () => this.requestUpdate(), { passive: true });
    this.update();
  }

  requestUpdate() {
    if (this.ticking) return;
    this.ticking = true;
    requestAnimationFrame(() => {
      this.update();
      this.ticking = false;
    });
  }

  update() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    this.bar.style.width = progress + '%';
  }
}

class PageTransition {
  constructor() {
    this.wrapper = document.querySelector('.page-transition-wrapper');
    if (!this.wrapper) return;
    this.init();
  }

  init() {
    document.querySelectorAll('a[href*="index.php"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('javascript')) return;
        if (link.classList.contains('active')) return;
        if (window.location.href.endsWith(href)) return;

        e.preventDefault();
        this.wrapper.classList.add('fade-out');

        setTimeout(() => {
          window.location.href = href;
        }, 300);
      });
    });
  }
}

class BackToTop {
  constructor() {
    this.btn = document.getElementById('back-to-top');
    if (!this.btn) return;
    window.addEventListener('scroll', () => this.toggle(), { passive: true });
    this.btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    this.toggle();
  }

  toggle() {
    this.btn.classList.toggle('visible', window.scrollY > 400);
  }
}

class SmoothScroll {
  constructor() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          e.preventDefault();
          const offset = 72;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }
}

class CardTilt {
  constructor() {
    if (Motion.reduce || !Motion.finePointer) return;
    this.cards = document.querySelectorAll('.exp-card');
    if (!this.cards.length) return;
    this.init();
  }

  init() {
    this.cards.forEach(card => {
      card.addEventListener('mousemove', (e) => this.handleMove(e, card));
      card.addEventListener('mouseleave', (e) => this.handleLeave(e, card));
      card.addEventListener('mouseenter', () => card.classList.add('tilt-active'));
    });
  }

  handleMove(e, card) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px) scale(1.02)`;
  }

  handleLeave(e, card) {
    card.classList.remove('tilt-active');
    card.style.transform = '';
  }
}

class ParticleBackground {
  constructor() {
    if (Motion.reduce) return;
    this.canvas = document.getElementById('particles-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: -9999, y: -9999 };
    this.resize();
    this.running = true;
    this.createParticles();
    this.animate();
    window.addEventListener('resize', () => this.resize());
    document.addEventListener('visibilitychange', () => {
      this.running = !document.hidden;
      if (this.running) this.animate();
    });

    // Mouse tracking for repel effect
    this.canvas.parentElement.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    }, { passive: true });
    this.canvas.parentElement.addEventListener('mouseleave', () => {
      this.mouse.x = -9999;
      this.mouse.y = -9999;
    });

    // Click burst
    this.canvas.parentElement.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.burst(e.clientX - rect.left, e.clientY - rect.top);
    });
  }

  resize() {
    const hero = this.canvas.parentElement;
    this.canvas.width = hero.offsetWidth;
    this.canvas.height = hero.offsetHeight;
  }

  createParticles() {
    const count = window.innerWidth < 768 ? 18 : 32;
    for (let i = 0; i < count; i++) {
      this.particles.push(this.makeParticle());
    }
  }

  makeParticle(x, y, burst = false) {
    return {
      x: x ?? Math.random() * this.canvas.width,
      y: y ?? Math.random() * this.canvas.height,
      size: burst ? Math.random() * 2.5 + 1 : Math.random() * 2 + 0.5,
      speedX: burst ? (Math.random() - 0.5) * 4 : (Math.random() - 0.5) * 0.3,
      speedY: burst ? (Math.random() - 0.5) * 4 : (Math.random() - 0.5) * 0.3,
      opacity: burst ? Math.random() * 0.8 + 0.2 : Math.random() * 0.4 + 0.1,
      life: burst ? 1.0 : null,
      burst,
    };
  }

  burst(x, y) {
    for (let i = 0; i < 18; i++) {
      this.particles.push(this.makeParticle(x, y, true));
    }
  }

  animate() {
    if (!this.running) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const repelRadius = 80;
    const repelStrength = 2.5;

    this.particles = this.particles.filter(p => {
      if (p.burst) {
        p.life -= 0.022;
        if (p.life <= 0) return false;
        p.opacity = p.life * 0.9;
      }
      return true;
    });

    this.particles.forEach(p => {
      // Mouse repel
      const dx = p.x - this.mouse.x;
      const dy = p.y - this.mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < repelRadius && dist > 0) {
        const force = (repelRadius - dist) / repelRadius;
        p.x += (dx / dist) * force * repelStrength;
        p.y += (dy / dist) * force * repelStrength;
      }

      p.x += p.speedX;
      p.y += p.speedY;

      // Wrap around (non-burst only)
      if (!p.burst) {
        if (p.x < 0) p.x = this.canvas.width;
        if (p.x > this.canvas.width) p.x = 0;
        if (p.y < 0) p.y = this.canvas.height;
        if (p.y > this.canvas.height) p.y = 0;
      }

      // Draw
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      if (isLight) {
        this.ctx.fillStyle = `rgba(59, 130, 246, ${p.opacity * 0.6})`;
      } else {
        this.ctx.fillStyle = `rgba(96, 165, 250, ${p.opacity})`;
      }
      this.ctx.fill();
    });

    // Connection lines (only between non-burst particles within distance)
    const normal = this.particles.filter(p => !p.burst);
    normal.forEach((p1, i) => {
      normal.slice(i + 1).forEach(p2 => {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          const lineOpacity = (1 - dist / 100) * 0.15;
          if (isLight) {
            this.ctx.strokeStyle = `rgba(59, 130, 246, ${lineOpacity * 0.5})`;
          } else {
            this.ctx.strokeStyle = `rgba(96, 165, 250, ${lineOpacity})`;
          }
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      });
    });

    requestAnimationFrame(() => this.animate());
  }
}

class HeroParallax {
  constructor() {
    if (Motion.reduce) return;
    this.hero = document.getElementById('hero-section');
    this.photo = this.hero ? this.hero.querySelector('.hero-photo-wrapper') : null;
    this.tags = this.hero ? this.hero.querySelector('.hero-tags') : null;
    if (!this.hero || !this.photo) return;
    this.hero.classList.add('parallax-active');
    this.ticking = false;
    window.addEventListener('scroll', () => this.requestUpdate(), { passive: true });
  }

  requestUpdate() {
    if (this.ticking) return;
    this.ticking = true;
    requestAnimationFrame(() => {
      this.update();
      this.ticking = false;
    });
  }

  update() {
    const scrollY = window.scrollY;
    const heroH = this.hero.offsetHeight;
    if (scrollY > heroH) return;
    const factor = scrollY * 0.15;
    this.photo.style.transform = `translateY(${factor}px)`;
    if (this.tags) {
      this.tags.style.transform = `translateY(${factor * 0.5}px)`;
    }
  }
}

class TaglineTyping {
  constructor() {
    if (Motion.reduce) return;
    this.el = document.getElementById('hero-tagline');
    if (!this.el) return;
    this.originalText = this.el.textContent.trim();
    this.phrases = ['Professional', 'Saudi Arabia', 'Hard Worker', 'Multilingual'];
    this.currentPhrase = 0;
    this.charIndex = 0;
    this.isDeleting = false;
    this.el.innerHTML = '';
    this.staticSpan = document.createElement('span');
    this.staticSpan.textContent = this.originalText + ' | ';
    this.el.appendChild(this.staticSpan);
    this.textSpan = document.createElement('span');
    this.textSpan.style.color = 'var(--accent)';
    this.el.appendChild(this.textSpan);
    this.cursor = document.createElement('span');
    this.cursor.className = 'typing-cursor';
    this.el.appendChild(this.cursor);
    setTimeout(() => this.type(), 1500);
  }

  type() {
    const phrase = this.phrases[this.currentPhrase];
    if (this.isDeleting) {
      this.charIndex--;
      this.textSpan.textContent = phrase.substring(0, this.charIndex);
      if (this.charIndex === 0) {
        this.isDeleting = false;
        this.currentPhrase = (this.currentPhrase + 1) % this.phrases.length;
        setTimeout(() => this.type(), 400);
        return;
      }
      setTimeout(() => this.type(), 40);
    } else {
      this.charIndex++;
      this.textSpan.textContent = phrase.substring(0, this.charIndex);
      if (this.charIndex === phrase.length) {
        this.isDeleting = true;
        setTimeout(() => this.type(), 2000);
        return;
      }
      setTimeout(() => this.type(), 80);
    }
  }
}

class CardGlowTracker {
  constructor() {
    if (!Motion.finePointer) return;
    this.cards = document.querySelectorAll('.card');
    if (!this.cards.length) return;
    this.init();
  }

  init() {
    this.cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', x + 'px');
        card.style.setProperty('--mouse-y', y + 'px');
      });
    });
  }
}

class FooterWave {
  constructor() {
    if (Motion.reduce) return;
    this.wave = document.getElementById('footer-wave-svg');
    if (!this.wave) return;
    this.paths = this.wave.querySelectorAll('.wave-animated');
    this.offset = 0;
    this.running = true;
    document.addEventListener('visibilitychange', () => {
      this.running = !document.hidden;
      if (this.running) this.animate();
    });
    this.animate();
  }

  animate() {
    if (!this.running) return;
    this.offset += 0.3;
    this.paths.forEach((path, i) => {
      const d = this.generateWave(i);
      path.setAttribute('d', d);
    });
    requestAnimationFrame(() => this.animate());
  }

  generateWave(index) {
    const amplitude = 8 + index * 3;
    const frequency = 0.02 - index * 0.003;
    const offset = this.offset + index * 30;
    let d = 'M0,20';
    for (let x = 0; x <= 800; x += 5) {
      const y = 20 + Math.sin((x + offset) * frequency) * amplitude;
      d += ` L${x},${y}`;
    }
    if (index === 0) {
      d += ' L800,40 L0,40 Z';
    }
    return d;
  }
}


/* ===== #2 – Cursor Spotlight ===== */
class CursorSpotlight {
  constructor() {
    if (!Motion.finePointer || Motion.reduce) return;
    this.el = document.createElement('div');
    this.el.className = 'cursor-spotlight';
    document.body.appendChild(this.el);
    this.x = window.innerWidth / 2;
    this.y = window.innerHeight / 2;
    this.tx = this.x;
    this.ty = this.y;
    window.addEventListener('mousemove', e => { this.tx = e.clientX; this.ty = e.clientY; }, { passive: true });
    this.running = true;
    document.addEventListener('visibilitychange', () => {
      this.running = !document.hidden;
      if (this.running) this.raf();
    });
    this.raf();
  }
  raf() {
    if (!this.running) return;
    this.x += (this.tx - this.x) * 0.12;
    this.y += (this.ty - this.y) * 0.12;
    this.el.style.left = this.x + 'px';
    this.el.style.top = this.y + 'px';
    requestAnimationFrame(() => this.raf());
  }
}

/* ===== #6 – Magnetic Buttons ===== */
class MagneticButtons {
  constructor() {
    if (!Motion.finePointer || Motion.reduce) return;
    this.btns = document.querySelectorAll('.btn, .nav-link, .theme-toggle, .back-to-top');
    this.init();
  }
  init() {
    this.btns.forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * 0.30;
        const dy = (e.clientY - cy) * 0.30;
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }
}

/* ===== #7 – Stagger Child Reveal ===== */
class StaggerReveal {
  constructor() {
    this.targets = document.querySelectorAll(
      '.exp-grid, .about-highlights, .hero-tags, .stats-row, .skills-grid, .social-list, .quick-actions'
    );
    if (!this.targets.length) return;
    this.targets.forEach(el => el.classList.add('stagger-children'));
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('stagger-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    this.targets.forEach(el => obs.observe(el));
  }
}

/* ===== #4 – Hero Orbital Ring ===== */
class HeroOrbitalRing {
  constructor() {
    if (Motion.reduce) return;
    const wrapper = document.querySelector('.hero-photo-wrapper');
    if (!wrapper) return;

    // Glowing conic ring
    const ring = document.createElement('div');
    ring.className = 'hero-ring';
    wrapper.appendChild(ring);

    // 4 orbiting skill badges
    const badges = [
      { icon: 'fa-laptop', dur: '7s', start: '0deg', r: '90px' },
      { icon: 'fa-briefcase', dur: '9s', start: '90deg', r: '90px' },
      { icon: 'fa-bolt', dur: '8s', start: '180deg', r: '90px' },
      { icon: 'fa-language', dur: '10s', start: '270deg', r: '90px' },
    ];

    badges.forEach(b => {
      const badge = document.createElement('div');
      badge.className = 'hero-orbit-badge';
      badge.style.setProperty('--orbit-dur', b.dur);
      badge.style.setProperty('--orbit-start', b.start);
      badge.style.setProperty('--orbit-r', b.r);
      badge.innerHTML = `<i class="fa ${b.icon}"></i>`;
      wrapper.appendChild(badge);
    });
  }
}

/* ===== #5 – Timeline Flow Dot ===== */
class TimelineFlowDot {
  constructor() {
    if (Motion.reduce) return;
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;
    const dot = document.createElement('div');
    dot.className = 'timeline-flow-dot';
    timeline.appendChild(dot);
  }
}

/* ===== #10 – Enhanced Page Curtain Transition ===== */
class PageCurtain {
  constructor() {
    if (Motion.reduce) return;
    this.curtain = document.createElement('div');
    this.curtain.className = 'page-curtain';
    document.body.appendChild(this.curtain);

    // On page load — wipe-in then wipe-out to reveal page
    this.curtain.classList.add('wipe-in');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.curtain.classList.add('wipe-out');
        // After curtain exits, fire edge-flash via a separate overlay div
        setTimeout(() => {
          this.curtain.classList.remove('wipe-in', 'wipe-out');
          const flash = document.createElement('div');
          flash.className = 'page-flash-overlay';
          document.body.appendChild(flash);
          setTimeout(() => flash.remove(), 700);
        }, 600);
      });
    });

    // Intercept nav clicks
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript') ||
        href.startsWith('mailto') || href.startsWith('tel') ||
        href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//') ||
        link.getAttribute('target') === '_blank' || link.hasAttribute('download')) return;
      link.addEventListener('click', e => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        this.curtain.classList.remove('wipe-out', 'flash-edge');
        this.curtain.classList.add('wipe-in');
        setTimeout(() => { window.location.href = href; }, 500);
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Preloader();
  new CursorSpotlight();
  new ThemeToggle();
  new ScrollReveal();
  new StickyNav();
  new NavClock();
  new ScrollProgress();
  new BackToTop();
  new SmoothScroll();
  new CardTilt();
  new ParticleBackground();
  new HeroParallax();
  new TaglineTyping();
  new CardGlowTracker();
  new FooterWave();
  new MagneticButtons();
  new StaggerReveal();
  new HeroOrbitalRing();
  new TimelineFlowDot();
  new PageCurtain();

  // Instant Link Hover Prefetching
  const prefetchedUrls = new Set();
  document.querySelectorAll('a[href$=".html"], a[href="./"], a[href="index.html"]').forEach(link => {
    link.addEventListener('mouseenter', () => {
      const href = link.getAttribute('href');
      if (href && !prefetchedUrls.has(href) && !href.startsWith('#') && !href.startsWith('http')) {
        prefetchedUrls.add(href);
        const prefetchLink = document.createElement('link');
        prefetchLink.rel = 'prefetch';
        prefetchLink.href = href;
        document.head.appendChild(prefetchLink);
      }
    }, { passive: true });
  });

  // PWA Service Worker Registration
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then(reg => {
        console.log('[PWA] Service Worker registered with scope:', reg.scope);
      }).catch(err => {
        console.log('[PWA] Service Worker registration failed:', err);
      });
    });
  }

  document.querySelectorAll('.gallery-container').forEach(g => new PhotoGallery(g));
});

// Global Command Palette & Search Index
class CommandPalette {
  constructor() {
    this.modal = document.getElementById('cmd-palette');
    this.input = document.getElementById('cmd-palette-input');
    this.results = document.getElementById('cmd-palette-results');
    this.isOpen = false;
    this.selectedIndex = 0;
    this.items = [
      { title: 'Home Page', category: 'Navigation', desc: 'Portfolio Overview & Executive Summary', url: 'index.html', icon: 'fa-home' },
      { title: 'Experience & Skills Matrix', category: 'Navigation', desc: 'Career History, Timeline & Skill Meters', url: 'skills.html', icon: 'fa-briefcase' },
      { title: 'Photo Gallery', category: 'Navigation', desc: '10 High-Resolution Workplace & Project Photos', url: 'gallery.html', icon: 'fa-camera' },
      { title: 'Blog & Technical Articles', category: 'Navigation', desc: 'Work Experiences in Saudi Arabia', url: 'blog.html', icon: 'fa-rss' },
      { title: 'Contact & Hiring Hub', category: 'Navigation', desc: 'WhatsApp, Telegram, Email & Recruiter Details', url: 'contact.html', icon: 'fa-envelope' },
      { title: 'Delux Telecom Android App', category: 'Android Project', desc: 'Mobile App & Telecom Portal by Sohel Ahammad', url: 'https://deluxtelecom.pp.ua/', icon: 'fa-android', isExternal: true },
      { title: 'Electrical Terminator (Saudi Arabia)', category: 'Experience', desc: 'Seder Group - High-voltage cable glanding & termination', url: 'skills.html#experience-section', icon: 'fa-bolt' },
      { title: 'Testing & Commissioning Technician', category: 'Experience', desc: 'Eman Contracting - Continuity, megger & safety tests', url: 'skills.html#experience-section', icon: 'fa-check-circle' },
      { title: 'Store Keeper & Inventory Specialist', category: 'Experience', desc: 'Gulf Contracting - Warehouse & stock management', url: 'skills.html#experience-section', icon: 'fa-archive' },
      { title: 'Download Official ATS Resume (Print)', category: 'Action', desc: 'Print / Save Executive PDF CV with QR Code', action: 'printCV', icon: 'fa-file-pdf-o' },
      { title: 'Direct WhatsApp Inquiry', category: 'Action', desc: 'Open Chat with Sohel Ahammad (+966 55 183 9526)', url: 'https://wa.me/+966551839526', icon: 'fa-whatsapp', isExternal: true },
      { title: 'Admin Management Portal', category: 'Admin', desc: 'Manage Experience Timeline, Jobs & CV Sync', url: 'admin.html', icon: 'fa-shield' }
    ];

    this.filteredItems = [...this.items];
    this.init();
  }

  init() {
    if (!this.modal || !this.input) return;

    // Open on Ctrl+K or Cmd+K
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.toggle();
      } else if (e.key === 'Escape' && this.isOpen) {
        this.close();
      } else if (this.isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.selectedIndex = (this.selectedIndex + 1) % this.filteredItems.length;
          this.render();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          this.selectedIndex = (this.selectedIndex - 1 + this.filteredItems.length) % this.filteredItems.length;
          this.render();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          this.selectCurrent();
        }
      }
    });

    // Close on backdrop click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    // Live search input
    this.input.addEventListener('input', () => {
      const q = this.input.value.toLowerCase().trim();
      this.filteredItems = this.items.filter(item => 
        item.title.toLowerCase().includes(q) || 
        item.category.toLowerCase().includes(q) || 
        item.desc.toLowerCase().includes(q)
      );
      this.selectedIndex = 0;
      this.render();
    });

    document.querySelectorAll('.cmd-palette-trigger').forEach(btn => {
      btn.addEventListener('click', () => this.open());
    });
  }

  open() {
    this.isOpen = true;
    this.modal.classList.add('active');
    this.input.value = '';
    this.filteredItems = [...this.items];
    this.selectedIndex = 0;
    this.render();
    setTimeout(() => this.input.focus(), 50);
  }

  close() {
    this.isOpen = false;
    this.modal.classList.remove('active');
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  selectCurrent() {
    const item = this.filteredItems[this.selectedIndex];
    if (!item) return;
    this.close();
    if (item.action === 'printCV') {
      window.location.href = 'resume.html?print=true';
    } else if (item.url) {
      if (item.isExternal) window.open(item.url, '_blank');
      else window.location.href = item.url;
    }
  }

  render() {
    if (!this.results) return;
    if (this.filteredItems.length === 0) {
      this.results.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-muted);">
          <i class="fa fa-search" style="font-size: 1.5rem; margin-bottom: 8px; display: block;"></i>
          No results found for "${this.input.value}"
        </div>
      `;
      return;
    }

    this.results.innerHTML = this.filteredItems.map((item, idx) => `
      <div class="cmd-palette-item ${idx === this.selectedIndex ? 'focused' : ''}" data-index="${idx}">
        <div class="cmd-palette-item-left">
          <div class="cmd-palette-item-icon">
            <i class="fa ${item.icon}"></i>
          </div>
          <div class="cmd-palette-item-text">
            <h4>${item.title}</h4>
            <p>${item.desc}</p>
          </div>
        </div>
        <span class="cmd-palette-badge">${item.category}</span>
      </div>
    `).join('');

    this.results.querySelectorAll('.cmd-palette-item').forEach(el => {
      el.addEventListener('click', () => {
        this.selectedIndex = parseInt(el.dataset.index);
        this.selectCurrent();
      });
      el.addEventListener('mouseenter', () => {
        this.selectedIndex = parseInt(el.dataset.index);
        this.results.querySelectorAll('.cmd-palette-item').forEach((e, i) => {
          e.classList.toggle('focused', i === this.selectedIndex);
        });
      });
    });
  }
}

// 3D Phone Perspective Hover Controller
class PhoneTiltEffect {
  constructor() {
    this.device = document.querySelector('.phone-device-body');
    if (!this.device) return;
    const wrap = document.querySelector('.phone-mockup-wrapper');
    if (!wrap) return;

    wrap.addEventListener('mousemove', (e) => {
      const rect = wrap.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotateX = -(y / rect.height) * 16;
      const rotateY = (x / rect.width) * 16;
      this.device.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
    });

    wrap.addEventListener('mouseleave', () => {
      this.device.style.transform = 'rotateY(-8deg) rotateX(4deg)';
    });
  }
}

// Global Command Palette & Helpers Init
window.openCmdPalette = function() {
  if (window.cmdPaletteInstance) window.cmdPaletteInstance.open();
};

window.printResumeATS = function() {
  window.location.href = 'resume.html?print=true';
};

// WhatsApp Inquiry Builder
window.selectInquiryTopic = function(topic, btn) {
  document.querySelectorAll('.inquiry-btn-topic').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const msgInput = document.getElementById('whatsapp-msg-input');
  if (msgInput) {
    msgInput.value = `Hello Sohel Ahammad, I am interested in discussing your ${topic} experience in Saudi Arabia. Are you available for a conversation?`;
  }
};

window.sendCustomWhatsApp = function() {
  const msgInput = document.getElementById('whatsapp-msg-input');
  const text = msgInput ? msgInput.value.trim() : 'Hello Sohel Ahammad, I would like to connect with you regarding job opportunities.';
  const url = `https://wa.me/+966551839526?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};

// App Showcase Modal Global Controllers
window.openAppModal = function() {
  const modal = document.getElementById('app-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

window.closeAppModal = function() {
  const modal = document.getElementById('app-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.cmdPaletteInstance = new CommandPalette();
  new PhoneTiltEffect();
  initDynamicDomainAndQR();
  if (typeof window.selectKsaProject === 'function') {
    window.selectKsaProject('riyadh');
  }
});

// Universal Dynamic Domain & QR Code Resolution
function initDynamicDomainAndQR() {
  let origin = 'https://sohel.pro.bd';
  let isLocal = true;
  try {
    if (window.location && window.location.origin && window.location.origin !== 'null' && !window.location.origin.startsWith('file:')) {
      origin = window.location.origin;
      isLocal = false;
    }
  } catch (e) {}

  const currentPath = window.location.pathname || '';
  const dirPath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
  const baseUrl = isLocal ? 'https://sohel.pro.bd/' : (origin + dirPath);

  // Auto-update dynamic QR images
  document.querySelectorAll('img[data-dynamic-qr="cv"]').forEach(img => {
    const cvUrl = baseUrl + 'resume.html';
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(cvUrl)}`;
  });

  document.querySelectorAll('img[data-dynamic-qr="home"]').forEach(img => {
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(baseUrl)}`;
  });

  // Auto-update text displays
  document.querySelectorAll('[data-dynamic-domain="current-cv"]').forEach(el => {
    el.textContent = baseUrl + 'resume.html';
  });

  document.querySelectorAll('[data-dynamic-domain="current-home"]').forEach(el => {
    el.textContent = baseUrl;
    if (el.tagName === 'A') el.href = baseUrl;
  });
}

// Interactive KSA Project Map Controller
const KSA_PROJECTS_DATA = {
  riyadh: {
    title: 'Sadawi PV 380/115 kV BSP Substation & Current Base',
    city: 'Riyadh, Saudi Arabia 🇸🇦',
    role: 'Electrical Terminator & Field Specialist',
    date: '04-2026 to Present',
    desc: 'Installed, glanded, terminated, and tested HV/LV power and control cables adhering to SEC 380/115 kV substation technical specifications.',
    tags: ['SEC Substation', 'HV/LV Cable Termination', 'Continuity & Megger']
  },
  khafji: {
    title: 'Saudi Aramco Oil Plant Project',
    city: 'Al-Khafji, Saudi Arabia',
    role: 'Electrical Terminator (Industrial Maintenance)',
    date: '09-2023 to 11-2023',
    desc: 'Exposed and diagnosed burnt electrical wiring in oil plant systems. Replaced faulty lines with certified Aramco-standard cabling and safety permits.',
    tags: ['Saudi Aramco', 'Oil Plant Overhaul', 'Strict Safety Compliance']
  },
  jubail: {
    title: 'Jubail 3B Independent Water Project (IWP)',
    city: 'Jubail Industrial City, Saudi Arabia',
    role: 'T&C Technician & Electrical Terminator',
    date: '08-2022 to 08-2023',
    desc: 'Conducted Testing & Commissioning (T&C) on electrical switchgear and SCADA telemetry systems for the major desalination water plant.',
    tags: ['Desalination Mega-Plant', 'SCADA Telemetry', 'Testing & Commissioning']
  },
  kaec: {
    title: 'Shapoorji Pallonji Industrial Project',
    city: 'King Abdullah Economic City (KAEC), Saudi Arabia',
    role: 'Store Keeper & Material Controller',
    date: '03-2020 to 09-2020',
    desc: 'Managed central warehouse storage, organized electrical and construction materials, and maintained real-time audit stock registers.',
    tags: ['Warehouse Logistics', 'Material Control', 'Stock Auditing']
  }
};

window.selectKsaProject = function(key) {
  const data = KSA_PROJECTS_DATA[key];
  if (!data) return;
  
  document.querySelectorAll('.ksa-map-pin').forEach(p => p.classList.remove('active'));
  const activePin = document.querySelector(`.ksa-map-pin[data-project="${key}"]`);
  if (activePin) activePin.classList.add('active');

  const panel = document.getElementById('ksa-project-details');
  if (panel) {
    panel.innerHTML = `
      <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(37,99,235,0.12);border:1px solid rgba(37,99,235,0.3);padding:3px 10px;border-radius:6px;font-size:0.75rem;color:#60a5fa;font-weight:700;margin-bottom:8px;">
        <i class="fa fa-map-marker"></i> ${data.city}
      </div>
      <h3 style="margin:0 0 4px;font-size:1.15rem;color:var(--text-primary);">${data.title}</h3>
      <div style="font-size:0.84rem;font-weight:600;color:var(--accent);margin-bottom:10px;">${data.role} &middot; <span style="color:var(--text-muted);">${data.date}</span></div>
      <p style="font-size:0.86rem;color:var(--text-secondary);line-height:1.6;margin-bottom:12px;">${data.desc}</p>
      <div style="display:flex;flex-wrap:wrap;gap:6px;">
        ${data.tags.map(t => `<span style="background:rgba(255,255,255,0.05);border:1px solid var(--border);padding:2px 8px;border-radius:4px;font-size:0.72rem;color:var(--text-primary);">${t}</span>`).join('')}
      </div>
    `;
  }
};

// Project Estimator Controller on contact.html
let selectedService = 'Cable Termination & T&C';
let selectedLocation = 'Riyadh';
let selectedDuration = 'Full-Time Project / Monthly';

window.setEstimatorOption = function(type, value, el) {
  if (type === 'service') selectedService = value;
  if (type === 'location') selectedLocation = value;
  if (type === 'duration') selectedDuration = value;

  const container = el.parentElement;
  if (container) {
    container.querySelectorAll('.estimator-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
  }

  const output = document.getElementById('estimator-summary-text');
  if (output) {
    output.textContent = `Inquiry for: ${selectedService} in ${selectedLocation} (${selectedDuration})`;
  }
};

window.sendEstimatorWhatsApp = function() {
  const text = `Hello Sohel Ahammad, I would like to inquire about hiring you for:\n• Service: ${selectedService}\n• Location: ${selectedLocation}\n• Engagement: ${selectedDuration}\n\nPlease let me know your availability in Saudi Arabia.`;
  window.open(`https://wa.me/+966551839526?text=${encodeURIComponent(text)}`, '_blank');
};


