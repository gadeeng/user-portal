/* ════════════════════════════════════════
   DUFAN dashboard — canvas.js
   Carnival Maximalism bg: warm night sky,
   confetti particles, festoon lights, Ferris wheel silhouette
════════════════════════════════════════ */
(function () {
  const c = document.getElementById('bg-canvas');
  const cx = c.getContext('2d');
  let W, H;

  /* ── Confetti particles ── */
  const COLS = ['#FF6B2B','#FFD60A','#FF4785','#22C55E','#00B4FF','#9B5DE5','#FF8F5E'];
  const particles = [];
  const NUM_P = 70;

  function makeP() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2 + .5,
      vx: (Math.random() - .5) * .2,
      vy: -Math.random() * .35 - .05,
      alpha: Math.random() * .45 + .1,
      color: COLS[Math.floor(Math.random() * COLS.length)],
      phase: Math.random() * Math.PI * 2,
    };
  }
  function initP() { particles.length = 0; for (let i = 0; i < NUM_P; i++) particles.push(makeP()); }

  /* ── Seeded stars ── */
  const STARS = (() => {
    const arr = []; let s = 99;
    const rng = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
    for (let i = 0; i < 80; i++) arr.push({ rx: rng(), ry: rng() * .65, r: rng() * 1.1 + .25, phase: rng() * Math.PI * 2 });
    return arr;
  })();

  /* ── Festoon lights along the top ── */
  const FESTOONS = (() => {
    const cols = ['#FF6B2B','#FFD60A','#FF4785','#00B4FF','#22C55E','#9B5DE5'];
    return Array.from({ length: 22 }, (_, i) => ({
      rx: i / 21,
      col: cols[i % cols.length],
      phase: Math.random() * Math.PI * 2,
    }));
  })();

  /* ── Ferris wheel silhouette (top-right) ── */
  function drawFerrisWheel(t) {
    const fx = W * .88, fy = H * .32, R = Math.min(W, H) * .11;
    cx.save(); cx.globalAlpha = .12;

    // Outer ring
    cx.beginPath(); cx.arc(fx, fy, R, 0, Math.PI * 2);
    cx.strokeStyle = '#FF6B2B'; cx.lineWidth = 2.5; cx.stroke();

    // Inner hub
    cx.beginPath(); cx.arc(fx, fy, R * .12, 0, Math.PI * 2);
    cx.fillStyle = '#FFD60A'; cx.fill();

    // Spokes (rotating)
    const rot = t * .25;
    for (let i = 0; i < 8; i++) {
      const a = rot + (i / 8) * Math.PI * 2;
      cx.beginPath();
      cx.moveTo(fx, fy);
      cx.lineTo(fx + Math.cos(a) * R, fy + Math.sin(a) * R);
      cx.strokeStyle = '#FF6B2B'; cx.lineWidth = 1.2; cx.stroke();

      // Gondola
      cx.save();
      cx.translate(fx + Math.cos(a) * R, fy + Math.sin(a) * R);
      cx.beginPath();
      cx.roundRect(-4, -3, 8, 7, 2);
      cx.fillStyle = COLS[i % COLS.length]; cx.fill();
      cx.restore();
    }

    // Support leg
    cx.beginPath();
    cx.moveTo(fx - R * .15, fy + R);
    cx.lineTo(fx - R * .5, fy + R * 1.4);
    cx.moveTo(fx + R * .15, fy + R);
    cx.lineTo(fx + R * .5, fy + R * 1.4);
    cx.strokeStyle = '#FF6B2B'; cx.lineWidth = 2; cx.stroke();

    cx.restore();
  }

  /* ── Resize ── */
  function resize() { W = c.width = window.innerWidth; H = c.height = window.innerHeight; initP(); }

  /* ── Draw loop ── */
  let frame = 0;
  function draw() {
    frame++;
    const t = frame / 60;
    cx.clearRect(0, 0, W, H);

    // Sky gradient — warm carnival night
    const sky = cx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0,   '#1E1040');
    sky.addColorStop(.45, '#2D1B69');
    sky.addColorStop(1,   '#3B1A3A');
    cx.fillStyle = sky; cx.fillRect(0, 0, W, H);

    // Warm stage glow
    const glow = cx.createRadialGradient(W * .5, H * .4, 0, W * .5, H * .4, W * .5);
    glow.addColorStop(0,   'rgba(255,107,43,.06)');
    glow.addColorStop(.6,  'rgba(255,71,133,.03)');
    glow.addColorStop(1,   'rgba(0,0,0,0)');
    cx.fillStyle = glow; cx.fillRect(0, 0, W, H);

    // Stars
    STARS.forEach(st => {
      const a = .3 + .6 * (.5 + .5 * Math.sin(t * 1.7 + st.phase));
      const r = st.r * (.85 + .28 * Math.sin(t * 2.3 + st.phase));
      cx.beginPath(); cx.arc(st.rx * W, st.ry * H, r, 0, Math.PI * 2);
      cx.fillStyle = `rgba(255,251,239,${a})`; cx.fill();
    });

    // Ground warm strip
    const ground = cx.createLinearGradient(0, H * .78, 0, H);
    ground.addColorStop(0, 'rgba(255,107,43,0)');
    ground.addColorStop(1, 'rgba(255,107,43,.06)');
    cx.fillStyle = ground; cx.fillRect(0, H * .78, W, H * .22);

    // Ferris wheel silhouette
    drawFerrisWheel(t);

    // Festoon lights along top
    const ropeY = Math.min(H * .04, 28);
    cx.beginPath(); cx.moveTo(0, ropeY); cx.lineTo(W, ropeY);
    cx.strokeStyle = 'rgba(255,251,239,.1)'; cx.lineWidth = 1; cx.stroke();
    FESTOONS.forEach(f => {
      const lx = f.rx * W;
      const pulse = .55 + .45 * Math.sin(t * 2.2 + f.phase);
      const br = 4;
      cx.save();
      cx.shadowColor = f.col; cx.shadowBlur = 12 * pulse;
      cx.beginPath(); cx.arc(lx, ropeY + 9, br, 0, Math.PI * 2);
      cx.fillStyle = f.col + Math.round(pulse * 220).toString(16).padStart(2, '0');
      cx.fill(); cx.restore();
    });

    // Confetti particles
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy + Math.sin(frame * .02 + p.phase) * .06;
      if (p.y < -10) { Object.assign(p, makeP()); p.y = H + 5; }
      const a = p.alpha * (.65 + .35 * Math.sin(frame * .04 + p.phase));
      cx.save(); cx.globalAlpha = Math.max(0, a);
      cx.shadowColor = p.color; cx.shadowBlur = 5;
      cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      cx.fillStyle = p.color; cx.fill(); cx.restore();
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();