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
    const now = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    this.el.textContent = `${days[now.getDay()]} ${months[now.getMonth()]} ${now.getDate()}, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
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
        href.startsWith('http') || href.startsWith('//')) return;
      link.addEventListener('click', e => {
        if (e.metaKey || e.ctrlKey) return;
        e.preventDefault();
        this.curtain.classList.remove('wipe-out', 'flash-edge');
        this.curtain.classList.add('wipe-in');
        setTimeout(() => { window.location.href = href; }, 540);
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

  document.querySelectorAll('.gallery-container').forEach(g => new PhotoGallery(g));
});
