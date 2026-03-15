# 🎢 DUFAN — Dunia Fantasi Ancol

> Platform ticketing & informasi wahana digital untuk DUFAN Ancol — dibangun dengan HTML, CSS, JavaScript vanilla, dan Firebase Realtime Database.

**🌐 Live Demo:** [projectdufan.vercel.app](https://projectdufan.vercel.app)

---

## 📌 Deskripsi Project

DUFAN Web Platform adalah aplikasi web yang mensimulasikan sistem ticketing dan manajemen kunjungan Taman Impian Jaya Ancol (DUFAN). Platform ini memungkinkan pengunjung untuk membeli tiket secara digital, memantau status antrian wahana secara *realtime*, dan mengelola tiket kunjungan mereka — semua tanpa perlu instalasi aplikasi.

Project ini dibangun sebagai bagian dari kompetisi/lomba dengan tema pengembangan sistem informasi taman hiburan modern.

---

## ✨ Fitur Utama

### 🎟️ Ticketing Digital
- Pembelian tiket online dengan berbagai pilihan paket (Solo, Solo Priority, Group, Group Priority, Family)
- QR Code tiket digital yang di-generate otomatis pasca pembelian
- Filter tiket berdasarkan status: Valid, Terpakai, Kadaluarsa, Fast Track
- Sistem autentikasi pengguna via Firebase Authentication

### 🗺️ Peta Wahana Live
- Peta interaktif berbasis HTML Canvas dengan **34 node wahana** DUFAN
- Status antrian realtime tiap wahana (Normal / Ramai / Padat) langsung dari Firebase
- Estimasi waktu tunggu berdasarkan kapasitas dan durasi wahana
- Animasi visual: bintang berkelip, lampu festoon, spinning ring saat wahana berjalan
- Tooltip detail saat hover: jam buka/tutup, fast track, tinggi minimum, jenis, durasi

### 🎠 Direktori Wahana
- Katalog 32 wahana dengan filter berdasarkan kategori (Dewasa, Anak-Anak, Umum, Fast Track)
- Pencarian wahana secara live
- Informasi lengkap per wahana

### 📊 Dashboard Pengunjung
- Statistik tiket personal (Total, Valid, Fast Track, Terpakai)
- Riwayat tiket dengan tab filter
- Peta wahana terintegrasi via iframe
- Animasi background carnival night (bintang, festoon lights, Ferris wheel silhouette)

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
|---|---|
| **Frontend** | HTML5, CSS3 (Vanilla), JavaScript (ES6+) |
| **Rendering** | HTML Canvas API (peta interaktif & background animasi) |
| **Backend / Database** | Firebase Realtime Database |
| **Auth** | Firebase Authentication |
| **Deployment** | Vercel |
| **QR Code** | [qrcodejs](https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js) |
| **Fonts** | Google Fonts — Fredoka One, Nunito, Space Mono |

---

## 📁 Struktur Project

```
projectdufan/
├── index.html              # Landing page
├── attractions.html        # Direktori & filter wahana
├── tickets.html            # Halaman harga & paket tiket
├── login.html              # Autentikasi pengguna
├── dashboard.html          # Dashboard pengunjung
├── map.html                # Peta wahana (wrapper)
├── mapUser.html            # Peta wahana (canvas — dimuat via iframe)
│
├── css/
│   ├── style.css           # Global styles — landing page
│   ├── dashboard.css       # Dashboard styles
│   └── map.css             # Peta wahana styles
│
└── js/
    ├── script.js           # Landing page logic
    ├── hero-scene.js       # Animasi hero canvas
    ├── observer.js         # Scroll reveal animations
    ├── canvas.js           # Dashboard background canvas
    ├── map.js              # Logika peta wahana (nodes, Firebase, canvas draw)
    └── inlineMap.js        # Bridge iframe ↔ dashboard
```

---

## 🎨 Design System

Theme: **Carnival Maximalism** — terinspirasi dari suasana malam taman hiburan.

| Token | Value | Keterangan |
|---|---|---|
| `--orange` | `#FF6B2B` | Warna utama / aksen |
| `--yellow` | `#FFD60A` | Highlight / gold |
| `--pink` | `#FF4785` | Aksen sekunder |
| `--dark` | `#1E1040` | Background utama (deep purple) |
| `--dark2` | `#2D1B69` | Background sekunder |
| `--cream` | `#FFFBEF` | Surface / card background |
| `--green` | `#22C55E` | Status normal / valid |

**Font Stack:**
- `Fredoka One` — display / heading
- `Nunito` — body text
- `Space Mono` — label / monospace

---

## 🔥 Firebase Structure

```
root/
├── users/
│   └── {uid}/
│       ├── name
│       ├── email
│       └── tickets/
│           └── {ticketId}/
│               ├── package
│               ├── visitDate
│               ├── qty
│               ├── fastTrack
│               ├── status         # "valid" | "used" | "expired"
│               └── purchasedAt
│
├── queue/
│   └── {wahanaId}                 # jumlah antrian (integer)
│
├── walkthrough/
│   └── {wahanaId}/
│       ├── in
│       └── out
│
└── running/
    └── {wahanaId}/
        ├── until                  # timestamp (ms) selesai berjalan
        └── durasi                 # menit
```

---

## 🚀 Cara Menjalankan Lokal

Project ini adalah static web — tidak perlu build step.

1. Clone repository:
   ```bash
   git clone https://github.com/username/projectdufan.git
   cd projectdufan
   ```

2. Jalankan dengan live server (misal VS Code Live Server, atau):
   ```bash
   npx serve .
   ```

3. Buka `http://localhost:3000` di browser.

> **Catatan:** Firebase config sudah tertanam di HTML. Untuk deployment mandiri, ganti config di `mapUser.html` dan file Firebase-related lainnya dengan project Firebase milikmu sendiri.

---

## 👥 Tim

**Tim Sayang Lomba Sayangg** — © 2026