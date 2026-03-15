(function () {
  const c = document.getElementById('bg-canvas');
  const cx = c.getContext('2d');
  let W, H;

  /* ── Confetti particle config ── */
  const SHAPES = ['circle', 'rect', 'star', 'heart'];
  const COLORS = [
    '#FF6B2B', '#FFD60A', '#FF4785', '#00B4FF',
    '#22C55E', '#9B5DE5', '#FF8F5E', '#FFE55A',
  ];
  const NUM = 55;
  const particles = [];

  function randBetween(a, b) { return a + Math.random() * (b - a); }

  function makeP() {
    return {
      x: Math.random() * W,
      y: randBetween(-60, H * 1.1),
      size: randBetween(5, 14),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      vx: randBetween(-0.4, 0.4),
      vy: randBetween(0.2, 0.7),
      rot: Math.random() * Math.PI * 2,
      rotV: randBetween(-0.02, 0.02),
      alpha: randBetween(0.2, 0.55),
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: randBetween(0.01, 0.03),
    };
  }

  function initP() {
    particles.length = 0;
    for (let i = 0; i < NUM; i++) particles.push(makeP());
  }

  function drawStar(ctx, x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const rad = i % 2 === 0 ? r : r * 0.45;
      const px = x + Math.cos(angle) * rad;
      const py = y + Math.sin(angle) * rad;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  function drawHeart(ctx, x, y, r) {
    ctx.beginPath();
    ctx.moveTo(x, y + r * 0.25);
    ctx.bezierCurveTo(x, y - r * 0.5, x - r, y - r * 0.5, x - r, y);
    ctx.bezierCurveTo(x - r, y + r * 0.6, x, y + r * 1.0, x, y + r * 1.2);
    ctx.bezierCurveTo(x, y + r * 1.0, x + r, y + r * 0.6, x + r, y);
    ctx.bezierCurveTo(x + r, y - r * 0.5, x, y - r * 0.5, x, y + r * 0.25);
    ctx.closePath();
  }

  function drawParticle(p) {
    cx.save();
    cx.globalAlpha = p.alpha;
    cx.fillStyle = p.color;
    cx.translate(p.x, p.y);
    cx.rotate(p.rot);

    switch (p.shape) {
      case 'circle':
        cx.beginPath();
        cx.arc(0, 0, p.size, 0, Math.PI * 2);
        cx.fill();
        break;
      case 'rect':
        cx.fillRect(-p.size, -p.size * 0.55, p.size * 2, p.size * 1.1);
        break;
      case 'star':
        drawStar(cx, 0, 0, p.size);
        cx.fill();
        break;
      case 'heart':
        drawHeart(cx, 0, -p.size * 0.5, p.size * 0.5);
        cx.fill();
        break;
    }
    cx.restore();
  }

  /* ── Subtle dot grid for texture ── */
  function drawDotGrid() {
    cx.save();
    cx.globalAlpha = 0.018;
    cx.fillStyle = '#FF6B2B';
    for (let x = 0; x < W; x += 48) {
      for (let y = 0; y < H; y += 48) {
        cx.beginPath();
        cx.arc(x, y, 2, 0, Math.PI * 2);
        cx.fill();
      }
    }
    cx.restore();
  }

  let frame = 0;

  function draw() {
    frame++;
    cx.clearRect(0, 0, W, H);

    drawDotGrid();

    particles.forEach(p => {
      /* Wobble side-to-side */
      p.wobble += p.wobbleSpeed;
      p.x += p.vx + Math.sin(p.wobble) * 0.3;
      p.y += p.vy;
      p.rot += p.rotV;

      /* Reset when off screen */
      if (p.y > H + 30 || p.x < -40 || p.x > W + 40) {
        Object.assign(p, makeP());
        p.y = -20;
        p.x = Math.random() * W;
      }

      drawParticle(p);
    });

    requestAnimationFrame(draw);
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    c.width  = W * dpr;
    c.height = H * dpr;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initP();
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();