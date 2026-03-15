/* ── NODES DATA (dari map.js) ── */
const NODES = [
  { name:'Kereta Misteri',        jenis:'Dewasa',    durasi:'4 menit',   minHeight:'125 cm', fastTrack:false, open:'10.00', close:'18.45', cap:16,  walkthrough:false },
  { name:'Turangga Rangga',       jenis:'Umum',      durasi:'5 menit',   minHeight:'-',      fastTrack:true,  open:'10.00', close:'18.45', cap:40,  walkthrough:false },
  { name:'Pontang-Pontang',       jenis:'Anak-Anak', durasi:'7 menit',   minHeight:'125 cm', fastTrack:false, open:'10.00', close:'18.45', cap:24,  walkthrough:false },
  { name:'Paralayang',            jenis:'Dewasa',    durasi:'5 menit',   minHeight:'100 cm', fastTrack:false, open:'10.00', close:'18.45', cap:16,  walkthrough:false },
  { name:'Karavel',               jenis:'Anak-Anak', durasi:'5 menit',   minHeight:'100 cm', fastTrack:false, open:'10.00', close:'18.45', cap:24,  walkthrough:false },
  { name:'Kolibri',               jenis:'Anak-Anak', durasi:'4.5 menit', minHeight:'100 cm', fastTrack:false, open:'10.00', close:'18.45', cap:28,  walkthrough:false },
  { name:'Ice Age Arctic Adv.',   jenis:'Dewasa',    durasi:'15 menit',  minHeight:'110 cm', fastTrack:true,  open:'12.00', close:'18.45', cap:20,  walkthrough:false },
  { name:'Turbo Drop',            jenis:'Anak-Anak', durasi:'2 menit',   minHeight:'100 cm', fastTrack:false, open:'10.00', close:'18.45', cap:8,   walkthrough:false },
  { name:'Baling-Baling',         jenis:'Dewasa',    durasi:'3 menit',   minHeight:'145 cm', fastTrack:true,  open:'10.00', close:'18.45', cap:30,  walkthrough:false },
  { name:'Kontiki',               jenis:'Dewasa',    durasi:'1.5 menit', minHeight:'100 cm', fastTrack:false, open:'10.00', close:'18.45', cap:18,  walkthrough:false },
  { name:'Zig Zag',               jenis:'Dewasa',    durasi:'2 menit',   minHeight:'125 cm', fastTrack:true,  open:'10.00', close:'18.45', cap:32,  walkthrough:false },
  { name:'Dream Playground',      jenis:'Anak-Anak', durasi:'60 menit',  minHeight:'125 cm', fastTrack:false, open:'10.00', close:'18.45', cap:250, walkthrough:true  },
  { name:'Galactica',             jenis:'Dewasa',    durasi:'6 menit',   minHeight:'100 cm', fastTrack:false, open:'10.00', close:'18.45', cap:8,   walkthrough:false },
  { name:'Ontang-Anting',         jenis:'Dewasa',    durasi:'2 menit',   minHeight:'100 cm', fastTrack:true,  open:'10.00', close:'18.45', cap:56,  walkthrough:false },
  { name:"Mowgli's Jungle 4D",    jenis:'Umum',      durasi:'3 menit',   minHeight:'100 cm', fastTrack:false, open:'12.00', close:'20.00', cap:40,  walkthrough:false },
  { name:'Arung Jeram',           jenis:'Dewasa',    durasi:'2 menit',   minHeight:'110 cm', fastTrack:true,  open:'10.00', close:'18.45', cap:8,   walkthrough:false },
  { name:'Burung Tempur',         jenis:'Anak-Anak', durasi:'4 menit',   minHeight:'100 cm', fastTrack:false, open:'10.00', close:'18.45', cap:28,  walkthrough:false },
  { name:'Halilintar',            jenis:'Dewasa',    durasi:'1.5 menit', minHeight:'125 cm', fastTrack:true,  open:'10.00', close:'18.45', cap:24,  walkthrough:false },
  { name:'Ombang-Ombang',         jenis:'Dewasa',    durasi:'4.5 menit', minHeight:'100 cm', fastTrack:false, open:'10.00', close:'18.45', cap:40,  walkthrough:false },
  { name:'Baku Toki',             jenis:'Anak-Anak', durasi:'3 menit',   minHeight:'100 cm', fastTrack:false, open:'10.00', close:'18.45', cap:16,  walkthrough:false },
  { name:'Gajah Beledug',         jenis:'Anak-Anak', durasi:'4 menit',   minHeight:'-',      fastTrack:false, open:'10.00', close:'18.45', cap:48,  walkthrough:false },
  { name:'Kora-Kora',             jenis:'Dewasa',    durasi:'3 menit',   minHeight:'125 cm', fastTrack:true,  open:'10.00', close:'18.45', cap:36,  walkthrough:false },
  { name:'Hysteria',              jenis:'Dewasa',    durasi:'1 menit',   minHeight:'145 cm', fastTrack:true,  open:'10.00', close:'18.45', cap:12,  walkthrough:false },
  { name:'Happy Family The Ride', jenis:'Umum',      durasi:'4 menit',   minHeight:'100 cm', fastTrack:false, open:'11.00', close:'18.45', cap:40,  walkthrough:false },
  { name:'Bianglala',             jenis:'Dewasa',    durasi:'20 menit',  minHeight:'-',      fastTrack:true,  open:'10.00', close:'18.45', cap:4,   walkthrough:false },
  { name:'Alap-Alap',             jenis:'Dewasa',    durasi:'1.5 menit', minHeight:'100 cm', fastTrack:true,  open:'10.00', close:'18.45', cap:28,  walkthrough:false },
  { name:'Tornado',               jenis:'Dewasa',    durasi:'3 menit',   minHeight:'145 cm', fastTrack:true,  open:'10.00', close:'18.45', cap:40,  walkthrough:false },
  { name:'Rumah Riana',           jenis:'Dewasa',    durasi:'15 menit',  minHeight:'110 cm', fastTrack:false, open:'11.00', close:'16.30', cap:6,   walkthrough:true  },
  { name:'Niagara-Gara',          jenis:'Dewasa',    durasi:'4.5 menit', minHeight:'125 cm', fastTrack:true,  open:'10.00', close:'20.00', cap:4,   walkthrough:false },
  { name:'Rumah Miring',          jenis:'Umum',      durasi:'2 menit',   minHeight:'-',      fastTrack:false, open:'10.00', close:'18.45', cap:4,   walkthrough:true  },
  { name:'Poci-Poci',             jenis:'Anak-Anak', durasi:'3 menit',   minHeight:'100 cm', fastTrack:false, open:'10.00', close:'18.45', cap:36,  walkthrough:false },
  { name:'Istana Boneka',         jenis:'Umum',      durasi:'20 menit',  minHeight:'-',      fastTrack:true,  open:'10.00', close:'18.45', cap:12,  walkthrough:true  },
];

/* ── Emoji & color per wahana ── */
const EMOJI = {
  'Halilintar':'🎢','Arung Jeram':'🌊','Kora-Kora':'⚓','Tornado':'🌪️',
  'Hysteria':'😱','Baling-Baling':'💨','Niagara-Gara':'💧','Alap-Alap':'🦅',
  'Bianglala':'🎡','Zig Zag':'⚡','Galactica':'🚀','Ontang-Anting':'🎠',
  'Kontiki':'🛶','Ombang-Ombang':'🌊','Ice Age Arctic Adv.':'🧊',
  'Paralayang':'🪂',"Mowgli's Jungle 4D":'🌿','Istana Boneka':'🪆',
  'Dream Playground':'🛝','Turbo Drop':'⬇️','Kolibri':'🐦',
  'Pontang-Pontang':'🎪','Karavel':'⛵','Baku Toki':'🎯',
  'Gajah Beledug':'🐘','Poci-Poci':'🫖','Burung Tempur':'✈️',
  'Kereta Misteri':'🚂','Turangga Rangga':'🐴','Happy Family The Ride':'👨‍👩‍👧',
  'Rumah Riana':'👻','Rumah Miring':'🏚️',
};

const JENIS_COLOR = { 'Dewasa':'#FF6B2B', 'Anak-Anak':'#00B4FF', 'Umum':'#22C55E' };
const JENIS_BG    = { 'Dewasa':'rgba(255,107,43,.1)', 'Anak-Anak':'rgba(0,180,255,.1)', 'Umum':'rgba(34,197,94,.1)' };

/* ── Build counts ── */
const rides = NODES.filter(n => n.name !== 'Entrance' && n.name !== 'Junction');
const cnt = { all: rides.length, Dewasa:0, 'Anak-Anak':0, Umum:0, fasttrack:0 };
rides.forEach(r => {
  if (r.jenis !== '-') cnt[r.jenis] = (cnt[r.jenis]||0) + 1;
  if (r.fastTrack) cnt.fasttrack++;
});
document.getElementById('cnt-all').textContent    = cnt.all;
document.getElementById('cnt-dewasa').textContent  = cnt['Dewasa'];
document.getElementById('cnt-anak').textContent    = cnt['Anak-Anak'];
document.getElementById('cnt-umum').textContent    = cnt['Umum'];
document.getElementById('cnt-ft').textContent      = cnt['fasttrack'];

/* ── Render cards ── */
function buildCard(r, idx) {
  const emoji = EMOJI[r.name] || '🎢';
  const col   = JENIS_COLOR[r.jenis] || '#22C55E';
  const bg    = JENIS_BG[r.jenis]   || 'rgba(34,197,94,.1)';
  const isWalkthrough = r.walkthrough;

  return `
    <div class="wcard" data-jenis="${r.jenis}" data-ft="${r.fastTrack}" data-name="${r.name.toLowerCase()}" style="--wc:${col}">
      <div class="wcard-top">
        <div class="wcard-emoji">${emoji}</div>
        <div class="wcard-badges">
          <span class="wcard-badge" style="background:${bg};color:${col}">${r.jenis}</span>
          ${r.fastTrack ? '<span class="wcard-badge wcard-badge--ft">⚡ Fast Track</span>' : ''}
          ${isWalkthrough ? '<span class="wcard-badge wcard-badge--walk">🚶 Walkthrough</span>' : ''}
        </div>
      </div>
      <div class="wcard-name">${r.name}</div>
      <div class="wcard-meta">
        <div class="wcard-meta-item" title="Jam Buka">
          <span class="wcard-meta-icon">🕐</span>
          <span>${r.open} – ${r.close}</span>
        </div>
        <div class="wcard-meta-item" title="Durasi">
          <span class="wcard-meta-icon">⏱️</span>
          <span>${r.durasi}</span>
        </div>
        <div class="wcard-meta-item" title="Tinggi Minimum">
          <span class="wcard-meta-icon">📏</span>
          <span>${r.minHeight === '-' ? 'Semua' : r.minHeight}</span>
        </div>
        <div class="wcard-meta-item" title="Kapasitas">
          <span class="wcard-meta-icon">👥</span>
          <span>${r.cap} orang</span>
        </div>
      </div>
      <a href="login.html" class="wcard-cta">🎟️ Beli Tiket</a>
    </div>`;
}

function render(filter = 'all', search = '') {
  const q = search.toLowerCase().trim();
  const filtered = rides.filter(r => {
    const matchFilter = filter === 'all'
      ? true
      : filter === 'fasttrack'
      ? r.fastTrack
      : r.jenis === filter;
    const matchSearch = q === '' || r.name.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const grid  = document.getElementById('wahanaGrid');
  const empty = document.getElementById('emptyState');

  if (filtered.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'flex';
  } else {
    empty.style.display = 'none';
    grid.innerHTML = filtered.map((r, i) => buildCard(r, i)).join('');
    // stagger animation
    grid.querySelectorAll('.wcard').forEach((el, i) => {
      el.style.animationDelay = (i * 0.05) + 's';
      el.classList.add('wcard-enter');
    });
  }
}

/* ── Filter buttons ── */
let activeFilter = 'all';
let searchVal = '';

document.getElementById('filterBtns').addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeFilter = btn.dataset.filter;
  render(activeFilter, searchVal);
});

document.getElementById('searchInput').addEventListener('input', e => {
  searchVal = e.target.value;
  render(activeFilter, searchVal);
});

/* ── Navbar scroll ── */
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', scrollY > 40));

/* ── Hamburger ── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('nav-mobile-open');
  hamburger.classList.toggle('open', open);
});

/* ── Init ── */
render();