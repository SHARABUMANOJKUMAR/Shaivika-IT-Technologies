/**
 * SHAIVIKA IT TECHNOLOGIES - Main JavaScript
 * Shared utilities: navbar, scroll reveal, animations, counter
 */

// ===== NAVBAR =====
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.mobile-nav');

window.addEventListener('scroll', () => {
  if (window.scrollY > 30) {
    navbar?.classList.add('scrolled');
  } else {
    navbar?.classList.remove('scrolled');
  }
}, { passive: true });

hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileNav?.classList.toggle('open');
  document.body.style.overflow = mobileNav?.classList.contains('open') ? 'hidden' : '';
});

// Close mobile nav on link click
document.querySelectorAll('.mobile-nav a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger?.classList.remove('open');
    mobileNav?.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// Active nav link
function setActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}
setActiveNav();

// ===== SCROLL REVEAL =====
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    observer.observe(el);
  });
}

// ===== COUNTER ANIMATION =====
function animateCounter(el, target, duration = 2000) {
  let start = 0;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString() + (el.dataset.suffix || '');
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function initCounters() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        if (!isNaN(target)) {
          animateCounter(el, target);
          observer.unobserve(el);
        }
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-target]').forEach(el => observer.observe(el));
}

// ===== NOTIFICATION =====
function showNotification(message, type = 'success') {
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();

  const notif = document.createElement('div');
  notif.className = `notification ${type}`;
  notif.innerHTML = `
    <span class="notification-icon">${type === 'success' ? '✅' : '❌'}</span>
    <span class="notification-text">${message}</span>
  `;
  document.body.appendChild(notif);
  setTimeout(() => notif.classList.add('show'), 10);
  setTimeout(() => {
    notif.classList.remove('show');
    setTimeout(() => notif.remove(), 400);
  }, 4000);
}

// ===== NEWSLETTER FORM =====
function initNewsletter() {
  const form = document.querySelector('.newsletter-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('.newsletter-input');
    if (input?.value?.includes('@')) {
      showNotification('Subscribed successfully! Welcome aboard 🚀', 'success');
      input.value = '';
    } else {
      showNotification('Please enter a valid email address.', 'error');
    }
  });
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===== FILTER (Portfolio/Blog) =====
function initFilter() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('[data-filter-group]') || btn.parentElement;
      parent.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      const container = document.querySelector('[data-filter-container]');
      if (!container) return;

      container.querySelectorAll('[data-category]').forEach(item => {
        if (filter === 'all' || item.dataset.category?.includes(filter)) {
          item.style.display = '';
          item.style.animation = 'fadeInUp 0.4s ease forwards';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

// ===== MODAL =====
function initModals() {
  document.querySelectorAll('[data-modal-open]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const modal = document.querySelector(trigger.dataset.modalOpen);
      modal?.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target === el) {
        const overlay = el.closest('.modal-overlay') || el.querySelector('.modal-overlay') || document.querySelector('.modal-overlay.open');
        overlay?.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(modal => {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      });
    }
  });
}

// ===== FORM VALIDATION =====
function initContactForm() {
  const form = document.querySelector('#contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    form.querySelectorAll('[required]').forEach(field => {
      field.classList.remove('error');
      if (!field.value.trim()) {
        field.classList.add('error');
        valid = false;
      }
    });

    const emailField = form.querySelector('[type="email"]');
    if (emailField && emailField.value && !emailField.value.includes('@')) {
      emailField.classList.add('error');
      valid = false;
    }

    if (valid) {
      const btn = form.querySelector('[type="submit"]');
      const original = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;
      setTimeout(() => {
        showNotification('Message sent successfully! We will contact you soon. 🎉', 'success');
        form.reset();
        btn.textContent = original;
        btn.disabled = false;
      }, 1500);
    } else {
      showNotification('Please fill in all required fields.', 'error');
    }
  });

  // Real-time validation
  form.querySelectorAll('.form-input, .form-textarea').forEach(field => {
    field.addEventListener('input', () => {
      if (field.value.trim()) field.classList.remove('error');
    });
  });
}

// ===== TYPING EFFECT =====
function initTypingEffect() {
  const el = document.querySelector('.typing-text');
  if (!el) return;
  const texts = el.dataset.texts?.split('|') || [];
  if (!texts.length) return;
  let idx = 0, charIdx = 0, deleting = false;

  function type() {
    const current = texts[idx];
    if (!deleting) {
      el.textContent = current.slice(0, ++charIdx);
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(type, 2000);
        return;
      }
    } else {
      el.textContent = current.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting = false;
        idx = (idx + 1) % texts.length;
      }
    }
    setTimeout(type, deleting ? 50 : 80);
  }
  type();
}

// ===== SIDEBAR NAV (Services page) =====
function initServicesSidebar() {
  const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
  if (!sidebarLinks.length) return;

  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      sidebarLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        const offset = 100;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // Highlight on scroll
  const sections = document.querySelectorAll('[data-section]');
  if (!sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        sidebarLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-80px 0px -70% 0px' });

  sections.forEach(s => observer.observe(s));
}

// ===== PAGINATION =====
function initPagination() {
  document.querySelectorAll('.page-btn[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.pagination');
      group?.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// ===== PARALLAX ORBS =====
function initParallax() {
  document.addEventListener('mousemove', (e) => {
    const orbs = document.querySelectorAll('.orb');
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    orbs.forEach((orb, i) => {
      const factor = (i + 1) * 0.4;
      orb.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
    });
  });
}

// ===== LOGO MOUSE-TILT =====
function initLogoTilt() {
  const logos = document.querySelectorAll('[data-logo-tilt]');
  if (!logos.length) return;

  logos.forEach(logo => {
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let rafId = null;
    let isHovering = false;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function animate() {
      currentX = lerp(currentX, targetX, 0.10);
      currentY = lerp(currentY, targetY, 0.10);

      // Compose tilt with levitation - pause CSS anim, apply via JS
      logo.style.transform = `rotateX(${currentY}deg) rotateY(${currentX}deg)`;

      if (Math.abs(currentX - targetX) > 0.01 || Math.abs(currentY - targetY) > 0.01 || isHovering) {
        rafId = requestAnimationFrame(animate);
      } else {
        // Fully settled on reset
        logo.style.transform = '';
        logo.style.animation = '';
        rafId = null;
      }
    }

    logo.addEventListener('mousemove', (e) => {
      const rect = logo.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      // Max ±12deg tilt — professional, not exaggerated
      targetX = ((e.clientX - cx) / (rect.width / 2)) * 12;
      targetY = ((e.clientY - cy) / (rect.height / 2)) * -12;
    });

    logo.addEventListener('mouseenter', () => {
      isHovering = true;
      // Pause CSS levitation while tilting
      logo.style.animation = 'none';
      if (!rafId) rafId = requestAnimationFrame(animate);
    });

    logo.addEventListener('mouseleave', () => {
      isHovering = false;
      targetX = 0;
      targetY = 0;
      // Resume levitation once tilt resets fully (handled in animate())
    });
  });
}

// ===== INIT ALL =====
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initCounters();
  initNewsletter();
  initFilter();
  initModals();
  initContactForm();
  initTypingEffect();
  initServicesSidebar();
  initPagination();
  initParallax();
  initLogoTilt();
});



/* ===== THEME TOGGLE LOGIC ===== */
(function() {
    console.log('Theme toggle script loaded.');
    const root = document.documentElement;
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    function updateTheme(theme) {
        if (theme === 'dark') {
            root.setAttribute('data-theme', 'dark');
            document.querySelectorAll('.theme-toggle-btn').forEach(btn => btn.innerHTML = '&#x2600;');
        } else {
            root.removeAttribute('data-theme');
            document.querySelectorAll('.theme-toggle-btn').forEach(btn => btn.innerHTML = '&#x1F319;');
        }
    }
    
    // Set initial
    updateTheme(currentTheme);

    // Event delegation for clicks
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.theme-toggle-btn');
        if (btn) {
            e.preventDefault();
            const isDark = root.hasAttribute('data-theme');
            const newTheme = isDark ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            updateTheme(newTheme);
            console.log('Theme changed to', newTheme);
        }
    });
})();
