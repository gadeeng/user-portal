/* ════════════════════════════════════════════
   DUFAN — Animation Controller
   • Hero letter-by-letter pop
   • Stat count-up
   • Mouse parallax on hero decos
   • Confetti burst on CTA buttons
   • Scroll reveal with stagger
   • Membership perks entrance
════════════════════════════════════════════ */

/* ──────────────────────────────
   1. HERO TITLE — Letter Pop
────────────────────────────── */
function initHeroTitle() {
  const words = document.querySelectorAll('.hero-word');
  let totalDelay = 0.15;

  words.forEach(wordEl => {
    const text = wordEl.dataset.word || '';
    const isAccent = wordEl.classList.contains('hero-word--accent');
    wordEl.innerHTML = '';

    [...text].forEach((char) => {
      const span = document.createElement('span');
      span.classList.add('hero-letter');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.animationDelay = `${totalDelay}s`;

      if (isAccent) {
        span.style.background = 'linear-gradient(135deg, #FF6B2B 0%, #FF4785 50%, #9B5DE5 100%)';
        span.style.webkitBackgroundClip = 'text';
        span.style.webkitTextFillColor = 'transparent';
        span.style.backgroundClip = 'text';
      }

      wordEl.appendChild(span);
      totalDelay += char === ' ' ? 0.04 : 0.055;
    });

    totalDelay += 0.12;
  });
}

/* ──────────────────────────────
   2. STAT COUNT-UP
────────────────────────────── */
function countUp(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1400;
  const fps = 60;
  const steps = (duration / 1000) * fps;
  let frame = 0;

  const tick = () => {
    frame++;
    const progress = frame / steps;
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    el.textContent = current + suffix;

    if (frame % 8 === 0) {
      el.classList.add('counting');
      setTimeout(() => el.classList.remove('counting'), 120);
    }

    if (frame < steps) requestAnimationFrame(tick);
    else el.textContent = target + suffix;
  };
  requestAnimationFrame(tick);
}

const statObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.stat-n[data-target]').forEach((el, i) => {
        setTimeout(() => countUp(el), i * 120);
      });
      statObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });

const statsBar = document.getElementById('stats');
if (statsBar) statObserver.observe(statsBar);

/* ──────────────────────────────
   4. CONFETTI BURST
────────────────────────────── */
const CONFETTI_COLORS = [
  '#FF6B2B','#FFD60A','#FF4785','#00B4FF',
  '#22C55E','#9B5DE5','#FF8F5E','#FFE55A','#FFFFFF'
];

function burstConfetti(originX, originY, count) {
  count = count || 70;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.classList.add('confetti-piece');

    const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    const isCircle = Math.random() > 0.5;
    const size = 6 + Math.random() * 10;
    const angle = Math.random() * Math.PI * 2;
    const speed = 80 + Math.random() * 240;
    const tx = Math.cos(angle) * speed;
    const ty = Math.sin(angle) * speed - (60 + Math.random() * 140);
    const rot = `${Math.random() * 720 - 360}deg`;
    const dur = `${0.65 + Math.random() * 0.85}s`;

    piece.style.cssText = `
      left:${originX}px; top:${originY}px;
      width:${size}px; height:${isCircle ? size : size * 0.55}px;
      background:${color};
      border-radius:${isCircle ? '50%' : '2px'};
      --tx:${tx}px; --ty:${ty}px; --rot:${rot}; --dur:${dur};
    `;

    document.body.appendChild(piece);
    piece.addEventListener('animationend', () => piece.remove(), { once: true });
  }
}

document.querySelectorAll('.confetti-btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const rect = this.getBoundingClientRect();
    burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 70);
    if (this.tagName === 'A') {
      e.preventDefault();
      const href = this.href;
      setTimeout(() => { window.location.href = href; }, 450);
    }
  });
});

/* ──────────────────────────────
   5. SCROLL REVEAL
────────────────────────────── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

document.querySelectorAll(
  '.attractions-grid .attr-card, .events-grid .event-card, .tickets-grid .ticket-card, .stats-bar .stat-item'
).forEach((el, i) => { el.style.transitionDelay = `${i * 0.09}s`; });

/* ──────────────────────────────
   6. MEMBERSHIP PERKS ENTRANCE
────────────────────────────── */
const membershipInner = document.querySelector('.membership-inner');
if (membershipInner) {
  const perksObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.perk').forEach((p, i) => {
          setTimeout(() => {
            p.style.opacity = '1';
            p.style.transform = 'scale(1)';
          }, 300 + i * 80);
        });
        perksObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  perksObs.observe(membershipInner);
}

/* ──────────────────────────────
   7. NAVBAR SCROLL EFFECT
────────────────────────────── */
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

/* ──────────────────────────────
   8. HAMBURGER MENU
────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('nav-mobile-open');
    hamburger.classList.toggle('open', isOpen);
  });
  // Close on link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('nav-mobile-open');
      hamburger.classList.remove('open');
    });
  });
}

/* ── INIT ── */
initHeroTitle();