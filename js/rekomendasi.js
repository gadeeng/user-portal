/**
 * rekomendasi.js
 * Panel rekomendasi wahana — Hybrid Hierarchical Routing + PWT
 * Import file ini dari inlineMap.js
 */

import {
  buildDistMatrix,
  recommendNextRide,
  VISITOR_WEIGHTS,
  PAKET_TO_VISITOR,
  ZONE_LABELS,
  NODE_ZONE_MAP,
  nowInMinutes,
  formatReason,
} from './routing.js';

/* ══════════════════════════════════════════════
   STATE SESI — pengganti properti agent di simulasi
══════════════════════════════════════════════ */
let _dist        = null;   // matriks Floyd-Warshall, dihitung sekali
let _nodes       = [];     // referensi NODES dari map.js
let _currentNode = 0;      // posisi terakhir (0 = entrance)
let _currentZone = 1;      // zona aktif (1–4)
let _visited     = new Set(); // indeks node yang sudah dikunjungi
let _skipped     = new Set(); // indeks node yang dilewati
let _ridesCount  = 0;
let _history     = [];     // [{ name, zone, skipped }]
let _ticket      = null;   // tiket aktif yang dipilih
let _closeMin    = 18 * 60 + 45; // jam tutup Dufan (1125 menit)
let _mode        = 'hhr'; // 'hhr' | 'fastest'

/* ══════════════════════════════════════════════
   INIT — dipanggil dari inlineMap.js setelah
   NODES dan CONNS diterima via postMessage
══════════════════════════════════════════════ */
export function initRekomendasi(nodes, conns) {
  _nodes = nodes;
  _dist  = buildDistMatrix(nodes, conns);
  _injectCSS();
  _injectHTML();
  // Kalau tiket sudah ada (loaded sebelum postMessage datang), langsung update dropdown
  if (window._tickets?.length) updateTicketOptions(window._tickets);
  console.log('[Rekomendasi] Siap. Floyd-Warshall selesai untuk', nodes.length, 'node.');
}

/* ══════════════════════════════════════════════
   UPDATE DROPDOWN TIKET
   Dipanggil dari inlineMap.js setiap kali tickets berubah
══════════════════════════════════════════════ */
export function updateTicketOptions(tickets) {
  const sel  = document.getElementById('rek-ticket-sel');
  const wrap = document.getElementById('rek-ticket-wrap');
  if (!sel) return;

  const today = new Date().toISOString().slice(0, 10);

  // Filter: hanya tiket hari ini + VALID
  // Grup: hanya tampilkan tiket leader — anggota lain cukup scan di wahana
  const valid = tickets.filter(t => {
    if (t.status !== 'VALID') return false;
    if (t.date !== today) return false;
    const isGrup = ['GROUP', 'GROUP_PRIORITY', 'GROUP_FAMILY'].includes(t.paket);
    if (isGrup && t.isGroupLeader === false) return false;
    return true;
  });

  if (!valid.length) {
    wrap && (wrap.style.display = 'none');
    const info = document.getElementById('rek-ticket-info');
    if (info) {
      const adaValid = tickets.some(t => t.status === 'VALID');
      info.textContent = adaValid
        ? '⚠️ Tiketmu valid tapi bukan untuk hari ini.'
        : '⚠️ Belum ada tiket VALID. Beli tiket dulu!';
      info.style.display = 'block';
    }
    return;
  }

  wrap && (wrap.style.display = 'block');
  const info = document.getElementById('rek-ticket-info');
  if (info) info.style.display = 'none';

  const PKG_LABEL = {
    SOLO:'Solo', SOLO_PRIORITY:'Solo Fast Track',
    GROUP:'Grup', GROUP_PRIORITY:'Grup Fast Track', GROUP_FAMILY:'Family',
  };

  sel.innerHTML = '<option value="">-- Pilih tiket yang kamu pakai hari ini --</option>'
    + valid.map(t => {
        const label  = PKG_LABEL[t.paket] || t.paket;
        const isGrup = ['GROUP','GROUP_PRIORITY','GROUP_FAMILY'].includes(t.paket);
        const suffix = isGrup
          ? ` · ${t.numAdults} dewasa${t.numChildren ? ' + ' + t.numChildren + ' anak' : ''}`
          : '';
        return `<option value="${t.id}">[${label}${suffix}] ${t.id}</option>`;
      }).join('');
}

/* ══════════════════════════════════════════════
   PILIH TIKET — dipanggil saat dropdown berubah
══════════════════════════════════════════════ */
function _onTicketSelect(id) {
  const tickets = window._tickets || [];
  const t = tickets.find(x => x.id === id);
  if (!t) return;

  // Reset sesi
  _ticket      = t;
  _currentNode = 0;
  _currentZone = 1;
  _visited     = new Set();
  _skipped     = new Set();
  _ridesCount  = 0;
  _history     = [];

  // Hitung jam tutup dari tanggal kunjungan (default 18:45)
  _closeMin = 18 * 60 + 45;

  const vType = PAKET_TO_VISITOR[t.paket] || 'SOLO';
  const w     = VISITOR_WEIGHTS[vType];

  // Tampilkan badge info bobot
  const badge = document.getElementById('rek-badge');
  if (badge) {
    badge.textContent = `${w.label} · m1=${w.m1} · m2=${w.m2} · toleransi=${w.limit} mnt`;
    badge.style.display = 'block';
  }

  const tabs = document.getElementById('rek-mode-tabs');
  if (tabs) tabs.style.display = 'flex';
  _renderStatus();
  _runRekomendasi();
}

/* ══════════════════════════════════════════════
   JALANKAN HHR + PWT
   Dipanggil setiap kali: pilih tiket, tap selesai, tap lewati, atau
   data Firebase berubah (otomatis dari window._qData update)
══════════════════════════════════════════════ */
export function runRekomendasi() {
  _runRekomendasi();
}

function _runRekomendasi() {
  if (!_ticket || !_dist || !_nodes.length) return;

  const vType      = PAKET_TO_VISITOR[_ticket.paket] || 'SOLO';
  const isPriority = _ticket.fastTrack || false;
  const minHeight  = _ticket.minHeight || 0;
  const minutesLeft = Math.max(0, _closeMin - nowInMinutes());
  const nowMin      = nowInMinutes();
  const excludedSet = new Set([..._visited, ..._skipped]);

  let result;
  if (_mode === 'fastest') {
    result = _recommendFastest({ vType, minHeight, minutesLeft, nowMin, excludedSet });
  } else {
    result = recommendNextRide({
      nodes:       _nodes,
      dist:        _dist,
      currentNode: _currentNode,
      currentZone: _currentZone,
      visitedIds:  excludedSet,
      qData:       window._qData  || {},
      wtData:      window._wtData || {},
      visitorType: vType,
      minutesLeft,
      nowMinutes:  nowMin,
      minHeight,
      ridesCount:  _ridesCount,
      isPriority,
    });
  }

  _renderStatus();
  _renderCard(result, vType);
  _renderHistory();
}

/* ══════════════════════════════════════════════
   MODE ANTRIAN TERCEPAT
   Abaikan zona dan jarak — sort semua wahana
   yang eligible berdasarkan estimasi waitTime ascending
══════════════════════════════════════════════ */
function _recommendFastest({ vType, minHeight, minutesLeft, nowMin, excludedSet }) {
  const { estimateQueueTime, parseDurasi, isEligible, NODE_ZONE_MAP: ZM } =
    window._routingUtils || {};

  const qData  = window._qData  || {};
  const wtData = window._wtData || {};

  const candidates = [];

  _nodes.forEach((node, idx) => {
    if (node.type !== 'ride') return;
    if (excludedSet.has(idx)) return;

    // Hitung waitTime
    function getQ(n) {
      if (!n.queueId) return 0;
      if (n.walkthrough) {
        const wt = wtData[n.queueId] || { in:0, out:0 };
        return Math.max(0, (wt.in||0) - (wt.out||0));
      }
      return qData[n.queueId] || 0;
    }

    const durasi   = _parseDurasi(node.durasi);
    const q        = getQ(node);
    const waitTime = _estimateQ(q, node.cap, durasi);
    const walkDist = _dist[0]?.[idx] ?? 1e9; // dari entrance, bukan posisi saat ini
    const walkTime = walkDist / 100;

    if (!_isEligible({ node, nodeIdx: idx, visitedIds: excludedSet, minHeight,
                        minutesLeft, nowMinutes: nowMin, visitorType: vType,
                        walkTime, waitTime })) return;

    const zone = NODE_ZONE_MAP[idx] || 1;
    candidates.push({ nodeIdx: idx, node, zone, waitTime, walkTime,
                      pwt: waitTime, breakdown: { waitTime, walkTime,
                      popMod:0, indoorBonus:0, m1:0, m2:1, isDesperate:false },
                      reason: 'fastest-queue' });
  });

  if (!candidates.length) return null;

  // Sort: waitTime ascending, tie-break by walkTime
  candidates.sort((a, b) => a.waitTime - b.waitTime || a.walkTime - b.walkTime);
  return { ...candidates[0], nextZone: candidates[0].zone };
}

// Helper lokal (duplikat routing.js agar tidak perlu re-export)
function _parseDurasi(s) {
  if (!s || s === '-') return 0;
  const m = String(s).match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}
function _estimateQ(q, cap, runtime, turnover=2) {
  if (!q || q <= 0) return 0;
  const c = cap || 10;
  return Math.ceil(q / c) * ((runtime || 5) + turnover);
}
function _parseTime(s) {
  if (!s || s === '-') return 0;
  const [h, m] = s.replace(':', '.').split('.').map(Number);
  return (h||0)*60 + (m||0);
}
function _isEligible({ node, nodeIdx, visitedIds, minHeight,
                        minutesLeft, nowMinutes, visitorType, walkTime, waitTime }) {
  if (node.type !== 'ride') return false;
  if (visitedIds.has(nodeIdx)) return false;
  if (visitorType !== 'GROUP_FAMILY' && node.jenis === 'Anak-Anak') return false;
  if (visitorType === 'GROUP_FAMILY' && node.jenis === 'Dewasa') return false;
  const minH = node.minHeight && node.minHeight !== '-' ? parseInt(node.minHeight) : 0;
  if (minH > 0 && minHeight > 0 && minHeight < minH) return false;
  const openMin  = _parseTime(node.open);
  const closeMin = _parseTime(node.close);
  if (nowMinutes < openMin || nowMinutes >= closeMin) return false;
  const runtime = _parseDurasi(node.durasi);
  if (nowMinutes + walkTime + waitTime + runtime > closeMin - 5) return false;
  return true;
}

/* ══════════════════════════════════════════════
   TANDAI SELESAI — pengganti doneRiding() di agent.js
══════════════════════════════════════════════ */
function _onMarkVisited() {
  const idx = _getCardNodeIdx();
  if (idx < 0) return;

  _visited.add(idx);
  _currentNode = idx;
  _currentZone = NODE_ZONE_MAP[idx] || _currentZone;
  _ridesCount++;
  _history.push({ name: _nodes[idx].name, zone: _currentZone, skipped: false });

  window.toast?.('success', '✅', `Selesai naik ${_nodes[idx].name}!`);
  _runRekomendasi();
}

/* ══════════════════════════════════════════════
   LEWATI WAHANA — pengunjung tidak mau naik wahana ini
══════════════════════════════════════════════ */
function _onSkip() {
  const idx = _getCardNodeIdx();
  if (idx < 0) return;

  _skipped.add(idx);
  _history.push({ name: _nodes[idx].name, zone: _currentZone, skipped: true });

  window.toast?.('success', '⏭️', `Dilewati: ${_nodes[idx].name}`);
  _runRekomendasi();
}

/* ══════════════════════════════════════════════
   HELPER — ambil nodeIdx dari kartu yang sedang tampil
══════════════════════════════════════════════ */
function _getCardNodeIdx() {
  const name = document.getElementById('rek-ride-name')?.textContent;
  if (!name || name === '—') return -1;
  return _nodes.findIndex(n => n.name === name);
}

/* ══════════════════════════════════════════════
   RENDER: STATUS BAR (zona, wahana, sisa waktu)
══════════════════════════════════════════════ */
function _renderStatus() {
  const row = document.getElementById('rek-status-row');
  if (!row) return;
  row.style.display = _ticket ? 'grid' : 'none';

  const minLeft = Math.max(0, _closeMin - nowInMinutes());
  const h = Math.floor(minLeft / 60);
  const m = minLeft % 60;
  const zoneLbl = ZONE_LABELS[_currentZone]?.label || '—';

  document.getElementById('rek-s-rides').textContent = _ridesCount;
  document.getElementById('rek-s-zone').textContent  = `${_currentZone} · ${zoneLbl}`;
  document.getElementById('rek-s-time').textContent  = minLeft > 0 ? `${h}j ${m}m` : 'TUTUP';
}

/* ══════════════════════════════════════════════
   RENDER: KARTU REKOMENDASI
══════════════════════════════════════════════ */
function _renderCard(result, vType) {
  const card  = document.getElementById('rek-card');
  const empty = document.getElementById('rek-empty');
  if (!card || !empty) return;

  if (!result) {
    card.style.display  = 'none';
    empty.style.display = 'block';
    return;
  }

  card.style.display  = 'block';
  empty.style.display = 'none';

  const { node, zone, pwt, breakdown, reason } = result;
  const { walkTime, waitTime, popMod, indoorBonus, m1, m2, isDesperate } = breakdown;

  // Info utama
  document.getElementById('rek-ride-name').textContent = node.name;
  document.getElementById('rek-ride-zone').textContent =
    `Zona ${zone} · ${ZONE_LABELS[zone]?.label || ''} · ${node.jenis}`;
  document.getElementById('rek-ride-open').textContent = `${node.open} – ${node.close}`;

  // Metrik (label baris pertama berubah tergantung mode)
  const pwtLabel = document.getElementById('rek-m-pwt-lbl');
  if (_mode === 'fastest') {
    document.getElementById('rek-m-pwt').textContent = `${waitTime.toFixed(0)} mnt`;
    if (pwtLabel) pwtLabel.textContent = 'ANTRE SEKARANG';
  } else {
    document.getElementById('rek-m-pwt').textContent = pwt.toFixed(1);
    if (pwtLabel) pwtLabel.textContent = 'PWT (menit)';
  }
  document.getElementById('rek-m-walk').textContent  = `${walkTime.toFixed(1)} mnt`;
  document.getElementById('rek-m-queue').textContent = `${waitTime.toFixed(1)} mnt`;
  document.getElementById('rek-m-dur').textContent   = node.durasi || '—';

  // Badge fast track
  const ftBadge = document.getElementById('rek-ft-badge');
  if (ftBadge) ftBadge.style.display = node.fastTrack ? 'inline-block' : 'none';

  // Alasan routing
  const reasonEl = document.getElementById('rek-reason');
  if (_mode === 'fastest') {
    reasonEl.textContent = `⚡ Antrian terpendek saat ini — ${waitTime.toFixed(0)} menit estimasi`;
  } else {
    reasonEl.textContent = `🧭 ${formatReason(reason)}`;
  }

  // Breakdown formula — hanya tampil di mode HHR
  const formulaWrap = document.getElementById('rek-formula-wrap');
  if (_mode === 'fastest') {
    if (formulaWrap) formulaWrap.style.display = 'none';
  } else {
    if (formulaWrap) formulaWrap.style.display = 'block';
    let formula = '';
    if (isDesperate) {
      formula = `⚠️ MODE DARURAT (sisa ≤ 120 mnt)\n`
              + `PWT* = tAntre + 0.1·tJalan + δindoor\n`
              + `     = ${waitTime.toFixed(1)} + 0.1·${walkTime.toFixed(1)} + ${indoorBonus}\n`
              + `     = ${pwt.toFixed(2)} menit`;
    } else {
      formula = `PWT = m1·tJalan + m2·tAntre + δpop + δindoor\n`
              + `    = ${m1}·${walkTime.toFixed(1)} + ${m2}·${waitTime.toFixed(1)} + ${popMod.toFixed(1)} + ${indoorBonus}\n`
              + `    = ${pwt.toFixed(2)} menit`;
      if (indoorBonus < 0) formula += `\n    ← bonus indoor (wahana satu gedung)`;
      if (popMod < 0)      formula += `\n    ← bonus populer (antrian masih pendek)`;
      if (popMod > 0)      formula += `\n    ← penalti populer (antrian sudah panjang)`;
    }
    document.getElementById('rek-formula').textContent = formula;
  }
}

/* ══════════════════════════════════════════════
   RENDER: RIWAYAT KUNJUNGAN
══════════════════════════════════════════════ */
function _renderHistory() {
  const wrap = document.getElementById('rek-history');
  const list = document.getElementById('rek-history-list');
  if (!wrap || !list) return;

  if (!_history.length) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';

  list.innerHTML = _history.map((h, i) => `
    <div class="rek-h-item ${h.skipped ? 'rek-h-skip' : ''}">
      <span class="rek-h-num">${i + 1}</span>
      <span class="rek-h-name">${h.name}</span>
      <span class="rek-h-tag">${h.skipped ? 'DILEWATI' : `Zona ${h.zone}`}</span>
    </div>
  `).join('');
}

/* ══════════════════════════════════════════════
   INJECT HTML — panel rekomendasi di dalam .app
   setelah .map-section
══════════════════════════════════════════════ */
function _injectHTML() {
  if (document.getElementById('rek-section')) return;

  const html = `
  <div id="rek-section">

    <!-- Header -->
    <div class="section-hd">
      <div>
        <div class="section-title">🧭 REKOMENDASI WAHANA</div>
        <div class="section-sub">Rute optimal — Hybrid Hierarchical Routing + PWT</div>
      </div>
    </div>

    <!-- Badge bobot -->
    <div id="rek-badge" class="rek-badge" style="display:none">—</div>

    <!-- Info tiket kosong -->
    <div id="rek-ticket-info" class="rek-ticket-info" style="display:none"></div>

    <!-- Pilih tiket -->
    <div id="rek-ticket-wrap" class="fblock" style="display:none">
      <label class="fl">TIKET YANG DIPAKAI HARI INI</label>
      <select class="fi" id="rek-ticket-sel"
        onchange="window._onRekTicketSelect(this.value)">
        <option value="">-- Pilih tiket --</option>
      </select>
    </div>

    <!-- Status bar -->
    <div id="rek-status-row" class="rek-status-row" style="display:none">
      <div class="rek-stat">
        <div class="rek-stat-num" id="rek-s-rides">0</div>
        <div class="rek-stat-lbl">WAHANA DINIKMATI</div>
      </div>
      <div class="rek-stat">
        <div class="rek-stat-num" id="rek-s-zone">—</div>
        <div class="rek-stat-lbl">ZONA AKTIF</div>
      </div>
      <div class="rek-stat">
        <div class="rek-stat-num" id="rek-s-time">—</div>
        <div class="rek-stat-lbl">SISA WAKTU</div>
      </div>
    </div>

    <!-- Toggle mode -->
    <div class="rek-mode-tabs" id="rek-mode-tabs" style="display:none">
      <button class="rek-tab active" id="rek-tab-hhr"
        onclick="window._onRekMode('hhr')">
        🧭 RUTE OPTIMAL
      </button>
      <button class="rek-tab" id="rek-tab-fastest"
        onclick="window._onRekMode('fastest')">
        ⚡ ANTRIAN TERCEPAT
      </button>
    </div>

    <!-- Kartu rekomendasi -->
    <div id="rek-card" class="rek-card" style="display:none">
      <div class="rek-card-eye">// WAHANA BERIKUTNYA</div>
      <div class="rek-card-name" id="rek-ride-name">—</div>
      <div class="rek-card-meta">
        <span id="rek-ride-zone">—</span>
        &nbsp;·&nbsp;
        <span id="rek-ride-open">—</span>
        &nbsp;
        <span id="rek-ft-badge" class="rek-ft-badge" style="display:none">⚡ FAST TRACK</span>
      </div>

      <!-- Metrik PWT -->
      <div class="rek-metrics">
        <div class="rek-metric">
          <div class="rek-m-val" id="rek-m-pwt">—</div>
          <div class="rek-m-lbl" id="rek-m-pwt-lbl">PWT (menit)</div>
        </div>
        <div class="rek-metric">
          <div class="rek-m-val" id="rek-m-walk">—</div>
          <div class="rek-m-lbl">JALAN KAKI</div>
        </div>
        <div class="rek-metric">
          <div class="rek-m-val" id="rek-m-queue">—</div>
          <div class="rek-m-lbl">EST. ANTRE</div>
        </div>
        <div class="rek-metric">
          <div class="rek-m-val" id="rek-m-dur">—</div>
          <div class="rek-m-lbl">DURASI MAIN</div>
        </div>
      </div>

      <!-- Alasan routing -->
      <div id="rek-reason" class="rek-reason">—</div>

      <!-- Aksi -->
      <div class="rek-actions">
        <button class="btn-primary" onclick="window._onRekMarkVisited()">
          ✅ &nbsp;SUDAH NAIK
        </button>
        <button class="btn-ghost" onclick="window._onRekSkip()">
          ⏭️ &nbsp;LEWATI
        </button>
        <button class="btn-ghost" onclick="window._onRekRefresh()">
          🔄 &nbsp;REFRESH
        </button>
      </div>
    </div>

    <!-- Selesai semua -->
    <div id="rek-empty" class="empty-state" style="display:none">
      <div class="empty-icon">🎉</div>
      <div class="empty-title">SEMUA WAHANA SUDAH!</div>
      <div class="empty-desc">Tidak ada lagi wahana yang bisa dikunjungi dalam sisa waktu.</div>
    </div>

    <!-- Riwayat -->
    <div id="rek-history" class="rek-history" style="display:none">
      <div class="rek-h-title">📋 RIWAYAT HARI INI</div>
      <div id="rek-history-list"></div>
    </div>

  </div>`;

  // Sisipkan setelah .map-section
  const mapSection = document.querySelector('.map-section');
  if (mapSection) mapSection.insertAdjacentHTML('afterend', html);
  else document.querySelector('.app')?.insertAdjacentHTML('beforeend', html);

  // Expose handler ke window supaya bisa dipanggil dari onclick HTML
  window._onRekTicketSelect = _onTicketSelect;
  window._onRekMarkVisited  = _onMarkVisited;
  window._onRekSkip         = _onSkip;
  window._onRekRefresh      = () => { _runRekomendasi(); window.toast?.('success','🔄','Diperbarui!'); };
  window._onRekMode = (mode) => {
    _mode = mode;
    document.getElementById('rek-tab-hhr').classList.toggle('active', mode === 'hhr');
    document.getElementById('rek-tab-fastest').classList.toggle('active', mode === 'fastest');
    _runRekomendasi();
  };
}

/* ══════════════════════════════════════════════
   INJECT CSS — menyesuaikan style dashboard yang ada
══════════════════════════════════════════════ */
function _injectCSS() {
  if (document.getElementById('rek-css')) return;
  const s = document.createElement('style');
  s.id = 'rek-css';
  s.textContent = `
    #rek-section { margin-top: 52px; }

    .rek-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      letter-spacing: 0.07em;
      color: var(--cyan, #00e5ff);
      background: rgba(0,229,255,.06);
      border: 1px solid rgba(0,229,255,.2);
      border-radius: 20px;
      padding: 5px 14px;
      margin-bottom: 20px;
      display: inline-block;
    }

    .rek-status-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin: 20px 0;
    }
    .rek-stat {
      background: rgba(255,255,255,.03);
      border: 1px solid rgba(255,255,255,.07);
      border-radius: 12px;
      padding: 16px;
      text-align: center;
    }
    .rek-stat-num {
      font-family: 'Orbitron', monospace;
      font-size: 20px;
      font-weight: 700;
      color: var(--cyan, #00e5ff);
    }
    .rek-stat-lbl {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      color: var(--muted, #64748b);
      margin-top: 4px;
      letter-spacing: 0.08em;
    }

    .rek-card {
      background: linear-gradient(135deg, rgba(0,229,255,.04), rgba(255,77,109,.03));
      border: 1px solid rgba(0,229,255,.15);
      border-radius: 16px;
      padding: 26px;
      margin-bottom: 20px;
      position: relative;
      overflow: hidden;
    }
    .rek-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, var(--cyan, #00e5ff), transparent);
    }
    .rek-card-eye {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      letter-spacing: 0.14em;
      color: var(--cyan, #00e5ff);
      margin-bottom: 8px;
    }
    .rek-card-name {
      font-family: 'Orbitron', sans-serif;
      font-size: 24px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 6px;
    }
    .rek-card-meta {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: var(--muted, #64748b);
      margin-bottom: 22px;
    }
    .rek-ft-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      background: rgba(251,191,36,.15);
      color: #fbbf24;
      border: 1px solid rgba(251,191,36,.3);
      border-radius: 10px;
      padding: 2px 8px;
      letter-spacing: 0.06em;
    }

    .rek-metrics {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 20px;
    }
    @media (max-width: 600px) {
      .rek-metrics { grid-template-columns: repeat(2, 1fr); }
    }
    .rek-metric {
      background: rgba(0,0,0,.2);
      border-radius: 10px;
      padding: 12px;
      text-align: center;
    }
    .rek-m-val {
      font-family: 'Orbitron', monospace;
      font-size: 16px;
      font-weight: 700;
      color: var(--cyan, #00e5ff);
    }
    .rek-m-lbl {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8px;
      color: var(--muted, #64748b);
      margin-top: 4px;
      letter-spacing: 0.06em;
    }

    .rek-formula-wrap {
      background: rgba(0,0,0,.25);
      border-radius: 10px;
      padding: 14px 16px;
      margin-bottom: 14px;
    }
    .rek-formula-title {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      color: var(--muted, #64748b);
      letter-spacing: 0.1em;
      margin-bottom: 8px;
    }
    .rek-formula {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: rgba(255,255,255,.8);
      line-height: 1.8;
      margin: 0;
      white-space: pre-wrap;
    }

    .rek-mode-tabs {
      display: none;
      gap: 8px;
      margin-bottom: 16px;
    }
    .rek-tab {
      flex: 1;
      padding: 10px 14px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      letter-spacing: 0.08em;
      font-weight: 500;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,.1);
      background: rgba(255,255,255,.03);
      color: var(--muted, #64748b);
      cursor: pointer;
      transition: all .2s;
    }
    .rek-tab:hover {
      border-color: rgba(0,229,255,.3);
      color: rgba(255,255,255,.7);
    }
    .rek-tab.active {
      background: rgba(0,229,255,.1);
      border-color: rgba(0,229,255,.4);
      color: var(--cyan, #00e5ff);
    }

    .rek-ticket-info {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #fbbf24;
      background: rgba(251,191,36,.07);
      border: 1px solid rgba(251,191,36,.2);
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 14px;
    }

    .rek-reason {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: var(--muted, #64748b);
      margin-bottom: 20px;
    }
    .rek-actions { display: flex; gap: 10px; flex-wrap: wrap; }

    .rek-history {
      background: rgba(255,255,255,.02);
      border: 1px solid rgba(255,255,255,.06);
      border-radius: 12px;
      padding: 16px;
      margin-top: 16px;
    }
    .rek-h-title {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      letter-spacing: 0.1em;
      color: var(--muted, #64748b);
      margin-bottom: 10px;
    }
    .rek-h-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      background: rgba(255,255,255,.02);
      border-radius: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      margin-bottom: 4px;
    }
    .rek-h-item.rek-h-skip { opacity: .4; text-decoration: line-through; }
    .rek-h-num {
      width: 22px; height: 22px;
      border-radius: 50%;
      background: rgba(0,229,255,.12);
      color: var(--cyan, #00e5ff);
      display: flex; align-items: center; justify-content: center;
      font-size: 9px; font-weight: 700; flex-shrink: 0;
    }
    .rek-h-name { color: #fff; flex: 1; }
    .rek-h-tag {
      font-size: 9px;
      color: var(--muted, #64748b);
      letter-spacing: 0.06em;
    }
  `;
  document.head.appendChild(s);
}