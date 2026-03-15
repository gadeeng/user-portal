/* ════════════════════════════════════════════════════════
   DUFAN — Hero Scene Canvas
   Theme Park panorama:
   • Bianglala (Ferris Wheel) — right, rotating
   • Roller Coaster — full-width bottom track + cart
   • Carousel — lower left, spinning
   • Hot Air Balloon — upper left, bobbing
   • Fairy string lights — top edge
   • Fluffy clouds — drifting slowly
   • Radial center fade so text stays readable
════════════════════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, frame = 0;

  /* ── helpers ── */
  function lerp(a, b, t) { return a + (b - a) * t; }
  function rand(a, b) { return a + Math.random() * (b - a); }

  /* ──────────────────────────────────────────
     FERRIS WHEEL
  ────────────────────────────────────────── */
  let fwRot = 0;
  const FW_N = 10;
  const FW_COLORS = [
    '#FF6B2B','#FFD60A','#FF4785','#00B4FF',
    '#22C55E','#9B5DE5','#FF8F5E','#FFE55A',
    '#FF6B2B','#00B4FF'
  ];

  function drawFerrisWheel() {
    const fwX = W * 0.86;
    const fwY = H * 0.50;
    const R   = Math.min(W * 0.165, H * 0.36, 175);

    ctx.save();
    ctx.translate(fwX, fwY);

    /* ambient glow behind wheel */
    const glowGrad = ctx.createRadialGradient(0, 0, R * 0.2, 0, 0, R * 1.5);
    glowGrad.addColorStop(0, 'rgba(255,107,43,0.10)');
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(-R * 1.6, -R * 1.6, R * 3.2, R * 3.2);

    /* outer rim */
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.strokeStyle = '#FF6B2B';
    ctx.lineWidth = 5;
    ctx.shadowColor = '#FF6B2B';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    /* inner ring */
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.32, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,107,43,0.45)';
    ctx.lineWidth = 3;
    ctx.stroke();

    /* spokes — from inner ring to rim */
    for (let i = 0; i < FW_N; i++) {
      const a = fwRot + (i / FW_N) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * R * 0.32, Math.sin(a) * R * 0.32);
      ctx.lineTo(Math.cos(a) * R,        Math.sin(a) * R);
      ctx.strokeStyle = 'rgba(255,107,43,0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    /* cross-spokes (offset half step) */
    for (let i = 0; i < FW_N; i++) {
      const a = fwRot + (i / FW_N + 0.5 / FW_N) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R);
      ctx.strokeStyle = 'rgba(255,107,43,0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    /* gondolas */
    for (let i = 0; i < FW_N; i++) {
      const a  = fwRot + (i / FW_N) * Math.PI * 2;
      const ax = Math.cos(a) * R;
      const ay = Math.sin(a) * R;
      const cW = R * 0.13, cH = R * 0.115, hang = R * 0.07;
      const color = FW_COLORS[i];

      ctx.save();
      ctx.translate(ax, ay);

      /* hanging string */
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, hang);
      ctx.strokeStyle = 'rgba(80,40,0,0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      /* gondola body (always hangs down, no rotation) */
      ctx.beginPath();
      roundRect(ctx, -cW / 2, hang, cW, cH, 5);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 7;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();

      /* window */
      ctx.beginPath();
      ctx.arc(0, hang + cH * 0.45, cW * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.fill();

      /* small person inside */
      ctx.beginPath();
      ctx.arc(0, hang + cH * 0.2, cW * 0.12, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fill();

      ctx.restore();

      /* rim light dot */
      ctx.beginPath();
      ctx.arc(ax, ay, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    /* center hub */
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.065, 0, Math.PI * 2);
    ctx.fillStyle = '#CC4A15';
    ctx.shadowColor = '#FF6B2B';
    ctx.shadowBlur = 14;
    ctx.fill();
    ctx.shadowBlur = 0;

    /* A-frame support */
    ctx.lineJoin = 'round';
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#CC4A15';
    ctx.beginPath();
    ctx.moveTo(-R * 0.28, R);
    ctx.lineTo(0, R * 0.07);
    ctx.lineTo(R * 0.28, R);
    ctx.stroke();

    /* ground bar */
    ctx.beginPath();
    ctx.moveTo(-R * 0.48, R);
    ctx.lineTo(R * 0.48, R);
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.restore();
  }

  /* ──────────────────────────────────────────
     HOT AIR BALLOON
  ────────────────────────────────────────── */
  function drawBalloon() {
    const bR  = Math.min(W * 0.068, 72);
    const bX  = W * 0.11;
    const bY  = H * 0.27 + Math.sin(frame * 0.007) * 14;
    const stripeColors = ['#FF6B2B','#FFD60A','#FF4785','#22C55E','#00B4FF','#9B5DE5'];

    ctx.save();
    ctx.translate(bX, bY);

    /* balloon body — striped */
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 0, bR, bR * 1.3, 0, 0, Math.PI * 2);
    ctx.clip();

    const stripes = 6;
    for (let i = 0; i < stripes; i++) {
      const x1 = -bR + (i / stripes) * bR * 2;
      const x2 = -bR + ((i + 1) / stripes) * bR * 2;
      ctx.fillStyle = stripeColors[i];
      ctx.fillRect(x1, -bR * 1.4, x2 - x1, bR * 2.8);
    }
    ctx.restore();

    /* outline */
    ctx.beginPath();
    ctx.ellipse(0, 0, bR, bR * 1.3, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.09)';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* highlight sheen */
    ctx.beginPath();
    ctx.ellipse(-bR * 0.28, -bR * 0.35, bR * 0.28, bR * 0.38, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.fill();

    /* ropes */
    const ropeTop  = bR * 1.3;
    const ropeLen  = bR * 0.52;
    const baskW    = bR * 0.55;
    const baskH    = bR * 0.38;
    const baskTop  = ropeTop + ropeLen;

    ctx.strokeStyle = 'rgba(100,60,0,0.55)';
    ctx.lineWidth = 1.5;
    [[-baskW * 0.45, ropeTop], [baskW * 0.45, ropeTop]].forEach(([px, py]) => {
      ctx.beginPath(); ctx.moveTo(-baskW * 0.48, baskTop); ctx.lineTo(px, py); ctx.stroke();
      ctx.beginPath(); ctx.moveTo( baskW * 0.48, baskTop); ctx.lineTo(px, py); ctx.stroke();
    });

    /* basket */
    ctx.fillStyle = '#8B6914';
    roundRect(ctx, -baskW / 2, baskTop, baskW, baskH, 5);
    ctx.fill();
    ctx.strokeStyle = '#6B4F0E';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-baskW / 2, baskTop, baskW, baskH);

    /* basket weave lines */
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, baskTop); ctx.lineTo(0, baskTop + baskH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-baskW/2, baskTop + baskH/2); ctx.lineTo(baskW/2, baskTop + baskH/2); ctx.stroke();

    ctx.restore();
  }

  /* ──────────────────────────────────────────
     ROLLER COASTER
  ────────────────────────────────────────── */
  let cartT = 0;

  function getRCPoints() {
    const pts = [];
    for (let i = 0; i <= 120; i++) {
      const t = i / 120;
      const x = t * W;
      let y = H * 0.87;
      y -= Math.sin(t * Math.PI * 2.2) * H * 0.055;
      /* big hill 1 */
      if (t > 0.18 && t < 0.34)
        y -= Math.sin(((t - 0.18) / 0.16) * Math.PI) * H * 0.20;
      /* big hill 2 */
      if (t > 0.52 && t < 0.67)
        y -= Math.sin(((t - 0.52) / 0.15) * Math.PI) * H * 0.14;
      /* small bump */
      if (t > 0.78 && t < 0.88)
        y -= Math.sin(((t - 0.78) / 0.10) * Math.PI) * H * 0.07;
      pts.push([x, y]);
    }
    return pts;
  }

  function drawRollerCoaster() {
    const pts = getRCPoints();

    /* support pillars */
    ctx.strokeStyle = 'rgba(140,80,20,0.28)';
    ctx.lineWidth = 3;
    pts.forEach(([x, y], i) => {
      if (i % 12 === 0) {
        ctx.beginPath();
        ctx.moveTo(x, y + 6);
        ctx.lineTo(x, H * 0.89);
        ctx.stroke();
      }
    });

    /* track shadow */
    ctx.beginPath();
    pts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y + 3) : ctx.lineTo(x, y + 3));
    ctx.strokeStyle = 'rgba(0,0,0,0.09)';
    ctx.lineWidth = 7;
    ctx.stroke();

    /* track main (lower rail) */
    ctx.beginPath();
    pts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
    ctx.strokeStyle = '#CC4A15';
    ctx.lineWidth = 4.5;
    ctx.stroke();

    /* upper rail (parallel, offset up) */
    ctx.beginPath();
    pts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y - 8) : ctx.lineTo(x, y - 8));
    ctx.strokeStyle = '#FF6B2B';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    /* cross ties */
    ctx.strokeStyle = '#CC4A15';
    ctx.lineWidth = 2;
    pts.forEach(([x, y], i) => {
      if (i % 6 === 0) {
        ctx.beginPath();
        ctx.moveTo(x, y - 8);
        ctx.lineTo(x, y + 2);
        ctx.stroke();
      }
    });

    /* cart animation */
    cartT = (cartT + 0.0025) % 1;
    const ci  = Math.floor(cartT * (pts.length - 2));
    const [cx2, cy2] = pts[ci];
    const [nx,  ny ] = pts[ci + 1];
    const angle = Math.atan2(ny - cy2, nx - cx2);

    ctx.save();
    ctx.translate(cx2, cy2 - 10);
    ctx.rotate(angle);

    /* cart body */
    ctx.fillStyle = '#FF4785';
    roundRect(ctx, -22, -12, 44, 18, 5);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    /* front stripe */
    ctx.fillStyle = '#FFD60A';
    ctx.fillRect(-22, -12, 7, 18);

    /* wheels */
    [-12, 12].forEach(wx => {
      ctx.beginPath();
      ctx.arc(wx, 7, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#1E1040'; ctx.fill();
      ctx.beginPath();
      ctx.arc(wx, 7, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FF6B2B'; ctx.fill();
    });

    /* tiny passengers (heads peeking) */
    const passengerColors = ['#FFD60A','#FF4785','#00B4FF'];
    [-10, 0, 10].forEach((px, pi) => {
      ctx.beginPath();
      ctx.arc(px, -17, 5, Math.PI, 0);
      ctx.fillStyle = passengerColors[pi];
      ctx.fill();
      ctx.beginPath();
      ctx.arc(px, -19, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,200,150,0.9)'; ctx.fill();
    });

    ctx.restore();
  }

  /* ──────────────────────────────────────────
     CAROUSEL
  ────────────────────────────────────────── */
  let carRot = 0;
  const carColors = ['#FF4785','#FFD60A','#00B4FF','#22C55E'];

  function drawCarousel() {
    const cx  = W * 0.07;
    const cy  = H * 0.76;
    const R   = Math.min(W * 0.052, 52);
    const n   = 4;

    ctx.save();
    ctx.translate(cx, cy);

    /* center pole */
    ctx.beginPath();
    ctx.moveTo(0, -R * 2.6);
    ctx.lineTo(0, R * 0.9);
    ctx.strokeStyle = '#CC4A15';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.stroke();

    /* conical roof */
    ctx.beginPath();
    ctx.moveTo(0, -R * 3.1);
    ctx.lineTo(-R * 1.5, -R * 1.9);
    ctx.lineTo(R * 1.5, -R * 1.9);
    ctx.closePath();
    ctx.fillStyle = '#FF6B2B';
    ctx.fill();
    ctx.beginPath(); /* inner cone stripe */
    ctx.moveTo(0, -R * 3.1);
    ctx.lineTo(-R * 0.4, -R * 1.9);
    ctx.lineTo(R * 0.4, -R * 1.9);
    ctx.closePath();
    ctx.fillStyle = '#FFD60A';
    ctx.fill();
    /* roof rim circle */
    ctx.beginPath();
    ctx.ellipse(0, -R * 1.9, R * 1.5, R * 0.3, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#CC4A15';
    ctx.fill();

    /* spinning horses */
    for (let i = 0; i < n; i++) {
      const a   = carRot + (i / n) * Math.PI * 2;
      const hx  = Math.cos(a) * R;
      const bobY = Math.sin(carRot * 2 + i * 1.5) * R * 0.18;
      const hy   = R * 0.3 + bobY;
      const col  = carColors[i];

      /* hanging arm */
      ctx.beginPath();
      ctx.moveTo(0, -R * 0.5);
      ctx.lineTo(hx, hy - R * 0.55);
      ctx.strokeStyle = 'rgba(204,74,21,0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      /* horse body */
      ctx.save();
      ctx.translate(hx, hy);
      /* body */
      ctx.beginPath();
      ctx.ellipse(0, 0, R * 0.38, R * 0.24, 0, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
      /* neck */
      ctx.beginPath();
      ctx.ellipse(R * 0.28, -R * 0.22, R * 0.14, R * 0.1, 0.5, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
      /* head */
      ctx.beginPath();
      ctx.arc(R * 0.38, -R * 0.3, R * 0.14, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
      /* eye */
      ctx.beginPath();
      ctx.arc(R * 0.44, -R * 0.34, R * 0.04, 0, Math.PI * 2);
      ctx.fillStyle = '#1E1040';
      ctx.fill();
      /* legs */
      [[-R*0.15, R*0.22],[R*0.1, R*0.22]].forEach(([lx, ly]) => {
        ctx.beginPath();
        ctx.moveTo(lx, R * 0.2);
        ctx.lineTo(lx, ly);
        ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.stroke();
      });
      ctx.restore();
    }

    /* base platform */
    ctx.beginPath();
    ctx.ellipse(0, R * 0.9, R * 1.35, R * 0.28, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#CC4A15';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, R * 0.9, R * 1.35, R * 0.28, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#FF6B2B';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  /* ──────────────────────────────────────────
     FAIRY STRING LIGHTS
  ────────────────────────────────────────── */
  const LIGHT_COLORS = ['#FF6B2B','#FFD60A','#FF4785','#00B4FF','#22C55E','#9B5DE5'];
  const NUM_LIGHTS = 22;

  function drawFairyLights() {
    const y0 = H * 0.055, y1 = H * 0.085;
    const sag = H * 0.025;

    /* string wire */
    ctx.beginPath();
    for (let i = 0; i <= 80; i++) {
      const t = i / 80;
      const x = t * W;
      const y = lerp(y0, y1, t) + Math.sin(t * Math.PI) * sag;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(100,60,0,0.22)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    /* bulbs */
    for (let i = 0; i < NUM_LIGHTS; i++) {
      const t = i / (NUM_LIGHTS - 1);
      const x = t * W;
      const y = lerp(y0, y1, t) + Math.sin(t * Math.PI) * sag;
      const color = LIGHT_COLORS[i % LIGHT_COLORS.length];
      const blink = 0.55 + 0.45 * Math.sin(frame * 0.048 + i * 0.72);

      /* drop string */
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 10);
      ctx.strokeStyle = 'rgba(80,40,0,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      /* bulb glow */
      ctx.save();
      ctx.globalAlpha = blink * 0.4;
      ctx.shadowColor = color;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(x, y + 14, 8, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();

      /* bulb main */
      ctx.save();
      ctx.globalAlpha = blink;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(x, y + 14, 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.shadowBlur = 0;
      /* bulb cap */
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(x - 3, y + 9, 6, 4);
      ctx.restore();
    }
  }

  /* ──────────────────────────────────────────
     CLOUDS
  ────────────────────────────────────────── */
  const clouds = [
    { x: 0.18, y: 0.16, s: 1.0,  spd: 0.00014 },
    { x: 0.50, y: 0.10, s: 0.70, spd: 0.00009  },
    { x: 0.72, y: 0.19, s: 0.82, spd: 0.00011  },
  ];

  function drawCloud(x, y, s) {
    const r = 30 * s;
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    ctx.shadowColor = 'rgba(255,190,130,0.25)';
    ctx.shadowBlur = 20;
    [
      [0,    0,    r      ],
      [-r*.75, r*.32, r*.68],
      [ r*.75, r*.22, r*.72],
      [-r*1.35, r*.54, r*.52],
      [ r*1.35, r*.48, r*.54],
    ].forEach(([dx, dy, dr]) => {
      ctx.beginPath();
      ctx.arc(x + dx, y + dy, dr, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  /* ──────────────────────────────────────────
     CENTER FADE (keep text readable)
  ────────────────────────────────────────── */
  function drawCenterFade() {
    const grad = ctx.createRadialGradient(W / 2, H / 2, W * 0.1, W / 2, H / 2, W * 0.48);
    grad.addColorStop(0,   'rgba(255,248,232,0.82)');
    grad.addColorStop(0.6, 'rgba(255,248,232,0.30)');
    grad.addColorStop(1,   'rgba(255,248,232,0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  /* ──────────────────────────────────────────
     ROUND RECT helper (polyfill)
  ────────────────────────────────────────── */
  function roundRect(c, x, y, w, h, r) {
    if (c.roundRect) {
      c.beginPath();
      c.roundRect(x, y, w, h, r);
    } else {
      c.beginPath();
      c.moveTo(x + r, y);
      c.lineTo(x + w - r, y);
      c.quadraticCurveTo(x + w, y, x + w, y + r);
      c.lineTo(x + w, y + h - r);
      c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      c.lineTo(x + r, y + h);
      c.quadraticCurveTo(x, y + h, x, y + h - r);
      c.lineTo(x, y + r);
      c.quadraticCurveTo(x, y, x + r, y);
      c.closePath();
    }
  }

  /* ──────────────────────────────────────────
     MAIN DRAW LOOP
  ────────────────────────────────────────── */
  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = 0.92;

    /* clouds first (back) */
    clouds.forEach(cl => {
      cl.x += cl.spd;
      if (cl.x > 1.25) cl.x = -0.18;
      drawCloud(cl.x * W, cl.y * H, cl.s);
    });

    drawFairyLights();
    drawCarousel();
    drawBalloon();
    drawRollerCoaster();
    drawFerrisWheel();

    ctx.globalAlpha = 1;
    drawCenterFade();

    /* advance rotations */
    fwRot  += 0.003;
    carRot += 0.009;
    frame++;
    requestAnimationFrame(draw);
  }

  /* ──────────────────────────────────────────
     RESIZE
  ────────────────────────────────────────── */
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();