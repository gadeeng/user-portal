/**
 * routing.js — Hybrid Hierarchical Routing + Personalized Waiting Time (PWT)
 * VERSI SINKRON dengan agent.js (MCF ITB 2026 — Tim Sayang Lomba Sayaangg)
 *
 * Semua konstanta, formula, dan kondisi di sini IDENTIK dengan agent.js
 * agar rekomendasi di dashboard berperilaku sama dengan simulasi.
 */

/* ══════════════════════════════════════════════════════
   1. BOBOT PER TIPE PENGUNJUNG
   Sumber: agent.js → setThemeAndPreferences()
══════════════════════════════════════════════════════ */

export const VISITOR_WEIGHTS = {
  // Priority (Fast Track) — tidak peduli antrian, pilih yang terdekat
  SOLO_PRIORITY:  { m1: 0.8, m2: 0.2, limit: 60, label: 'Solo Fast Track' },
  GROUP_PRIORITY: { m1: 0.8, m2: 0.2, limit: 60, label: 'Grup Fast Track' },

  // Family — lumayan malas jalan jauh, tapi hindari antrian gila
  GROUP_FAMILY:   { m1: 0.5, m2: 0.5, limit: 30, label: 'Grup Family'     },

  // Grup — FOKUS cari antrian sepi
  GROUP:          { m1: 0.2, m2: 0.8, limit: 40, label: 'Grup Reguler'    },

  // Solo — SANGAT FOKUS antrian sepi (strategi paling efisien)
  // Catatan: SOLO juga pakai Global Search (sama seperti priority)
  SOLO:           { m1: 0.1, m2: 0.9, limit: 50, label: 'Solo Reguler'    },
};

/** Map paket tiket → tipe pengunjung */
export const PAKET_TO_VISITOR = {
  SOLO:           'SOLO',
  SOLO_PRIORITY:  'SOLO_PRIORITY',
  GROUP:          'GROUP',
  GROUP_PRIORITY: 'GROUP_PRIORITY',
  GROUP_FAMILY:   'GROUP_FAMILY',
};

/* ══════════════════════════════════════════════════════
   2. DEFINISI ZONA (integer 1-4, searah jarum jam)
   Sumber: agent.js baris 182 → this.currentZone = Math.floor(Math.random() * 4) + 1
══════════════════════════════════════════════════════ */

export const ZONE_LABELS = {
  1: { label: 'Zona Barat',      color: '#22d3ee' },
  2: { label: 'Zona Tengah',     color: '#a78bfa' },
  3: { label: 'Zona Timur Laut', color: '#fb923c' },
  4: { label: 'Zona Tenggara',   color: '#4ade80' },
};

/**
 * Pemetaan nodeIdx → zona (1-4) berdasarkan koordinat NODES di map.js
 * Zona 1 (Barat, x < 0.2):             4,5,6,8,9,11,14
 * Zona 2 (Tengah, 0.2 ≤ x < 0.5):     1,2,7,10,12,13,17,25,29,30
 * Zona 3 (Timur Laut, x≥0.5, y<0.5):  3,16,18,19,20,21,22,23,24,26
 * Zona 4 (Tenggara, x≥0.5, y≥0.5):    27,28,31,32,33
 */
export const NODE_ZONE_MAP = {
  4:1, 5:1, 6:1, 8:1, 9:1, 11:1, 14:1,
  1:2, 2:2, 7:2, 10:2, 12:2, 13:2, 17:2, 25:2, 29:2, 30:2,
  3:3, 16:3, 18:3, 19:3, 20:3, 21:3, 22:3, 23:3, 24:3, 26:3,
  27:4, 28:4, 31:4, 32:4, 33:4,
};

/* ══════════════════════════════════════════════════════
   3. WAHANA INDOOR & POPULER
   Sumber: agent.js baris 240, 251
══════════════════════════════════════════════════════ */

/**
 * Wahana indoor (pakai rideName simulasi)
 * agent.js baris 240: indoorRides = ["Ride 7", "Ride 10", "Ride 12"]
 * = Ice Age (7), Kontiki (10), Dream Playground (12)
 */
export const INDOOR_RIDE_NAMES = new Set(['Ride 7', 'Ride 10', 'Ride 12']);

/**
 * Indoor berbasis nama NODES (untuk dashboard yang pakai node.name)
 */
export const INDOOR_NODE_NAMES = new Set([
  'Ice Age Arctic Adv.', 'Kontiki', 'Dream Playground',
]);

/** queueId wahana populer dari Firebase */
export const POPULAR_QUEUE_IDS = new Set([
  'halilintar', 'tornado', 'hysteria', 'kora-kora', 'arung-jeram',
  'baling-baling', 'niagara', 'ice-age', 'rumah-hantu', 'zig-zag',
]);

/* ══════════════════════════════════════════════════════
   4. FLOYD-WARSHALL
   Skala: agent.js baris 223 → walkTime = walkDist / 100
   walkDist = jarak Euclidean dalam unit canvas (MAP_W=1280, MAP_H=640)
══════════════════════════════════════════════════════ */

const MAP_W = 1280;
const MAP_H = 640;

function euclideanCanvas(a, b) {
  const dx = (b.x - a.x) * MAP_W;
  const dy = (b.y - a.y) * MAP_H;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Build matriks jarak Floyd-Warshall.
 * dist[i][j] = walkDist (unit canvas). Untuk walkTime: dist[i][j] / 100
 */
export function buildDistMatrix(nodes, conns) {
  const N   = nodes.length;
  const INF = 1e9;

  const dist = Array.from({ length: N }, () => new Float64Array(N).fill(INF));
  for (let i = 0; i < N; i++) dist[i][i] = 0;

  for (const [a, b] of conns) {
    const d = euclideanCanvas(nodes[a], nodes[b]);
    if (d < dist[a][b]) { dist[a][b] = d; dist[b][a] = d; }
  }

  for (let k = 0; k < N; k++) {
    for (let i = 0; i < N; i++) {
      if (dist[i][k] === INF) continue;
      for (let j = 0; j < N; j++) {
        const via = dist[i][k] + dist[k][j];
        if (via < dist[i][j]) dist[i][j] = via;
      }
    }
  }

  return dist;
}

/* ══════════════════════════════════════════════════════
   5. ESTIMASI WAKTU ANTREAN
   Sumber: agent.js → getTrueWaitTime()
══════════════════════════════════════════════════════ */

/**
 * @param {number} queueCount   - jumlah orang dalam antrian
 * @param {number} cap          - kapasitas wahana per siklus
 * @param {number} runtime      - durasi wahana (menit)
 * @param {number} turnover     - bongkar muat (menit), default 2
 * @param {boolean} isContinuous
 * @param {number} interval     - interval dispatch untuk continuous (menit)
 */
export function estimateQueueTime(queueCount, cap, runtime, turnover = 2, isContinuous = false, interval = 1) {
  if (!queueCount || queueCount <= 0) return 0;
  const c = cap || 10;
  if (isContinuous) return Math.ceil(queueCount / c) * interval;
  return Math.ceil(queueCount / c) * ((runtime || 5) + turnover);
}

/* ══════════════════════════════════════════════════════
   6. PERHITUNGAN PWT
   Sumber: agent.js baris 241-268 (SINKRON PENUH)
══════════════════════════════════════════════════════ */

/**
 * Hitung PWT untuk satu wahana.
 *
 * IndoorBonus:
 *   -200 HANYA jika curNode indoor DAN target indoor (agent.js baris 244-246)
 *   (bukan flat -3 seperti versi lama)
 *
 * PopMod (dinamis, agent.js baris 250-256):
 *   popular + waitTime ≤ 30  → -5  (bonus: antrian pendek)
 *   popular + waitTime > 45  → +(waitTime-45)*0.5  (penalti: antrian panjang)
 *   popular + 30 < wait ≤ 45 → 0
 *
 * Mode darurat (agent.js baris 259):
 *   sisa ≤ 120 mnt DAN ridesCount < 2
 */
export function calcPWT(opts) {
  const {
    walkTime,
    waitTime,
    isPopular      = false,
    curNodeIndoor  = false,
    targetIndoor   = false,
    visitorType    = 'SOLO',
    minutesLeft    = 480,
    ridesCount     = 0,
  } = opts;

  const w = VISITOR_WEIGHTS[visitorType] || VISITOR_WEIGHTS.SOLO;

  // Indoor bonus (agent.js baris 244-246)
  const indoorBonus = (curNodeIndoor && targetIndoor) ? -200 : 0;

  // Popularity modifier dinamis (agent.js baris 250-256)
  let popMod = 0;
  if (isPopular) {
    if (waitTime <= 30)       popMod = -5;
    else if (waitTime > 45)   popMod = (waitTime - 45) * 0.5;
  }

  // Mode panik (agent.js baris 259)
  const isDesperate = minutesLeft <= 120 && ridesCount < 2;

  const pwt = isDesperate
    ? waitTime + (walkTime * 0.1) + indoorBonus
    : (w.m1 * walkTime) + (w.m2 * waitTime) + popMod + indoorBonus;

  return {
    pwt,
    breakdown: { walkTime, waitTime, popMod, indoorBonus, m1: w.m1, m2: w.m2, isDesperate },
  };
}

/* ══════════════════════════════════════════════════════
   7. FILTER KELAYAKAN
   Sumber: agent.js baris 203-235
══════════════════════════════════════════════════════ */

export function parseTime(s) {
  if (!s || s === '-') return 0;
  const [h, m] = s.replace(':', '.').split('.').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function parseDurasi(s) {
  if (!s || s === '-') return 0;
  const match = String(s).match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

export function isEligible(opts) {
  const { node, nodeIdx, visitedIds, minHeight,
          minutesLeft, nowMinutes, visitorType, walkTime, waitTime } = opts;

  if (node.type !== 'ride') return false;
  if (visitedIds.has(nodeIdx)) return false;

  // Filter kategori (agent.js baris 208-209)
  if (visitorType !== 'GROUP_FAMILY' && node.jenis === 'Anak-Anak') return false;
  if (visitorType === 'GROUP_FAMILY' && node.jenis === 'Dewasa') return false;

  // Filter tinggi badan (agent.js baris 210)
  const minH = node.minHeight && node.minHeight !== '-' ? parseInt(node.minHeight) : 0;
  if (minH > 0 && minHeight > 0 && minHeight < minH) return false;

  // Wahana harus buka (agent.js baris 211)
  const openMin  = parseTime(node.open);
  const closeMin = parseTime(node.close);
  if (nowMinutes < openMin || nowMinutes >= closeMin) return false;

  // Cek cukup waktu sebelum wahana tutup (agent.js baris 232-235)
  const runtime = parseDurasi(node.durasi);
  const expectedFinish = nowMinutes + walkTime + waitTime + runtime;
  if (expectedFinish > closeMin - 5) return false;

  return true;
}

/* ══════════════════════════════════════════════════════
   8. HYBRID HIERARCHICAL ROUTING — FUNGSI UTAMA
   Sumber: agent.js → nextDestination() baris 178-315
══════════════════════════════════════════════════════ */

/**
 * Rekomendasikan wahana berikutnya.
 * Return null jika tidak ada kandidat (→ saatnya pulang).
 *
 * @param {Object} opts
 * @param {Array}          opts.nodes
 * @param {Float64Array[]} opts.dist         - dari buildDistMatrix()
 * @param {number}         opts.currentNode  - indeks node posisi saat ini
 * @param {number}         opts.currentZone  - zona aktif saat ini (1-4)
 * @param {Set}            opts.visitedIds
 * @param {Object}         opts.qData        - Firebase queue { [queueId]: count }
 * @param {Object}         opts.wtData       - Firebase walkthrough { [queueId]: {in,out} }
 * @param {string}         opts.visitorType
 * @param {number}         opts.minutesLeft  - sisa waktu (menit)
 * @param {number}         opts.nowMinutes   - jam sekarang dalam menit
 * @param {number}         opts.minHeight    - tinggi minimum (cm)
 * @param {number}         opts.ridesCount   - wahana yang sudah dinikmati
 * @param {boolean}        opts.isPriority   - apakah tipe priority/fast track
 *
 * @returns {{ nodeIdx, node, zone, pwt, breakdown, reason, nextZone } | null}
 */
export function recommendNextRide(opts) {
  const {
    nodes,
    dist,
    currentNode  = 0,
    currentZone  = 1,
    visitedIds   = new Set(),
    qData        = {},
    wtData       = {},
    visitorType  = 'SOLO',
    minutesLeft  = 480,
    nowMinutes   = 600,
    minHeight    = 0,
    ridesCount   = 0,
    isPriority   = false,
  } = opts;

  const w = VISITOR_WEIGHTS[visitorType] || VISITOR_WEIGHTS.SOLO;

  // agent.js baris 196: SOLO + Priority → Global Search
  const isGlobalSearch = (visitorType === 'SOLO' || isPriority);
  const maxLoop        = isGlobalSearch ? 1 : 4;
  const pwtThreshold   = w.limit + 10;                 // agent.js baris 183
  const maxTolerance   = isPriority ? 90 : 75;         // agent.js baris 271

  const curNodeName   = nodes[currentNode]?.name || '';
  const curNodeIndoor = INDOOR_NODE_NAMES.has(curNodeName);

  function getQ(node) {
    if (!node.queueId) return 0;
    if (node.walkthrough) {
      const wt = wtData[node.queueId] || { in: 0, out: 0 };
      return Math.max(0, (wt.in || 0) - (wt.out || 0));
    }
    return qData[node.queueId] || 0;
  }

  function scoreNode(nodeIdx) {
    const node     = nodes[nodeIdx];
    if (!node) return null;

    const walkDist = dist[currentNode]?.[nodeIdx] ?? 1e9;
    const walkTime = walkDist / 100;   // agent.js baris 223

    const q        = getQ(node);
    const runtime  = parseDurasi(node.durasi);
    const waitTime = estimateQueueTime(q, node.cap, runtime);

    if (!isEligible({ node, nodeIdx, visitedIds, minHeight,
                      minutesLeft, nowMinutes, visitorType,
                      walkTime, waitTime })) return null;

    const targetIndoor = INDOOR_NODE_NAMES.has(node.name || '');
    const isPopular    = POPULAR_QUEUE_IDS.has(node.queueId || '');

    const { pwt, breakdown } = calcPWT({
      walkTime, waitTime, isPopular,
      curNodeIndoor, targetIndoor,
      visitorType, minutesLeft, ridesCount,
    });

    return { nodeIdx, node, pwt, breakdown, zone: NODE_ZONE_MAP[nodeIdx] || 1 };
  }

  let activeZone    = currentZone;
  let zonesChecked  = 0;
  let fallbackRides = [];
  let targetFound   = null;

  while (zonesChecked < maxLoop && !targetFound) {
    const validCandidates = [];

    const candidates = nodes
      .map((_, i) => i)
      .filter(i => {
        if (nodes[i].type !== 'ride') return false;
        if (!isGlobalSearch && (NODE_ZONE_MAP[i] || 1) !== activeZone) return false;
        return true;
      });

    for (const idx of candidates) {
      const score = scoreNode(idx);
      if (!score) continue;

      const { waitTime, indoorBonus } = score.breakdown;

      // Fallback list (agent.js baris 274-276)
      if (waitTime <= maxTolerance || indoorBonus < 0) {
        fallbackRides.push(score);
      }

      // Kandidat utama (agent.js baris 280-282)
      if (score.pwt <= pwtThreshold && waitTime <= w.limit + 15) {
        validCandidates.push(score);
      }
    }

    if (validCandidates.length > 0) {
      validCandidates.sort((a, b) => a.pwt - b.pwt);
      targetFound = {
        ...validCandidates[0],
        reason: isGlobalSearch
          ? (isPriority ? 'global-priority' : 'global-solo')
          : (zonesChecked === 0 ? 'same-zone' : `clockwise-${activeZone}`),
        nextZone: activeZone,
      };
    } else {
      if (!isGlobalSearch) activeZone = (activeZone % 4) + 1; // agent.js baris 293
      zonesChecked++;
    }
  }

  if (targetFound) return targetFound;

  // Fallback global (agent.js baris 300-308)
  if (fallbackRides.length > 0) {
    fallbackRides.sort((a, b) => a.pwt - b.pwt);
    return { ...fallbackRides[0], reason: 'fallback', nextZone: activeZone };
  }

  return null;
}

/* ══════════════════════════════════════════════════════
   9. UTILITAS
══════════════════════════════════════════════════════ */

export function nowInMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

export function minutesToHHMM(m) {
  const h = Math.floor(m / 60), mn = Math.round(m % 60);
  return `${String(h).padStart(2,'0')}.${String(mn).padStart(2,'0')}`;
}

export function formatReason(reason) {
  if (reason === 'global-priority') return '⚡ Fast Track — Global Search';
  if (reason === 'global-solo')     return '🏃 Solo — Global Search';
  if (reason === 'same-zone')       return '📍 Zona Aktif';
  if (reason === 'fallback')        return '🔄 Fallback (Toleransi Longgar)';
  const z = parseInt(reason?.replace('clockwise-', ''));
  return ZONE_LABELS[z] ? `🔄 Loncat → ${ZONE_LABELS[z].label}` : reason;
}