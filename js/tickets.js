/* ── FAQ toggle ── */
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

/* ── Navbar ── */
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', scrollY > 40));

/* ── Hamburger ── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('nav-mobile-open');
  hamburger.classList.toggle('open', open);
});

/* ── Scroll reveal ── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }});
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* ── Stagger grid children ── */
document.querySelectorAll('.tix-grid .tix-card, .tix-rules-grid .tix-rule-card').forEach((el, i) => {
  el.style.transitionDelay = (i * 0.09) + 's';
});

/* ── Confetti burst ── */
const CONFETTI_COLORS = ['#FF6B2B','#FFD60A','#FF4785','#00B4FF','#22C55E','#9B5DE5','#FFFFFF'];
function burstConfetti(ox, oy) {
  for (let i = 0; i < 70; i++) {
    const p = document.createElement('div');
    p.classList.add('confetti-piece');
    const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    const size  = 6 + Math.random() * 10;
    const angle = Math.random() * Math.PI * 2;
    const speed = 80 + Math.random() * 240;
    const tx    = Math.cos(angle) * speed;
    const ty    = Math.sin(angle) * speed - (60 + Math.random() * 140);
    p.style.cssText = `left:${ox}px;top:${oy}px;width:${size}px;height:${size * .55}px;background:${color};border-radius:${Math.random()>.5?'50%':'2px'};--tx:${tx}px;--ty:${ty}px;--rot:${Math.random()*720-360}deg;--dur:${.65+Math.random()*.85}s`;
    document.body.appendChild(p);
    p.addEventListener('animationend', () => p.remove(), {once:true});
  }
}
document.querySelectorAll('.confetti-btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const r = this.getBoundingClientRect();
    burstConfetti(r.left + r.width/2, r.top + r.height/2);
    if (this.tagName === 'A') { e.preventDefault(); const h = this.href; setTimeout(() => location.href = h, 450); }
  });
});