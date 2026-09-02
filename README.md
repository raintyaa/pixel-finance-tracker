# 🎮 Pixel Ledger - Pixel Art Personal Finance Tracker & Weekly Ledger Table

![React](https://img.shields.io/badge/framework-React%2019-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/build-Vite-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/styling-TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white)
![Theme](https://img.shields.io/badge/theme-Aseprite%20Pixel%20Art-FF69B4)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)
![Status](https://img.shields.io/badge/status-In%20Development-orange.svg)

**Pixel Ledger** adalah aplikasi pencatat keuangan pribadi harian (*Personal Finance Tracker*) yang memadukan estetika visual retro **Pixel Art ala Aseprite / RPG 8-Bit** dengan kejelasan dan kemudahan visualisasi **Tabel Mingguan (Weekly Ledger)**. 

Aplikasi ini dirancang dengan alur kerja tabel mingguan, navigasi periode dinamis per bulan & pekan, serta pencatatan saldo pemasukan dan pengeluaran secara terstruktur, rapi, dan aman (*offline-first*).

---

## 🌟 Fitur Utama

* 🪙 **Pencatatan Saldo Akurat**: Memantau saldo awal, total arus kas masuk/keluar, dan kalkulasi sisa saldo berjalan (*running balance*) secara otomatis.
* 📉 **Pencatatan Pengeluaran Harian & Detail**: Input pengeluaran lengkap dengan kategori, nominal uang, tanggal transaksi, dan catatan/keterangan detail.
* 📈 **Pencatatan Pemasukan (Income)**: Mencatat setiap pemasukan uang yang diterima untuk memperbarui saldo kas secara *real-time*.
* 📊 **Tampilan Tabel Mingguan (Minggu - Sabtu)**:
  * Layout tabel dengan 7 kolom hari kerja & akhir pekan (**Minggu, Senin, Selasa, Rabu, Kamis, Jumat, Sabtu**).
  * Baris data dinamis untuk setiap transaksi di hari terkait.
  * **Baris Total Mingguan**: Ringkasan akumulasi pengeluaran dan pemasukan di akhir kolom/tabel.
* 🧭 **Navigator Periode Dinamis**: Navigator untuk berpindah antar bulan dan minggu ke-berapa (misal: *September 2026 - Minggu 1, Minggu 2, dst.*), sehingga riwayat keuangan terkelompok rapi per minggu.
* 🎨 **Aseprite Pixel Art Aesthetic**:
  * Palet warna retro khas pixel art (*Pico-8 / Endesga 32*).
  * Tipografi pixel yang tajam dan nyaman dibaca (*Pixelify Sans / Monospace Pixel*).
  * Frame kotak dialog RPG, tombol berpiksel tebal, dan indikator budget ala HP/Mana bar.
* 🔒 **Offline-First & Zero Data Loss**: Seluruh data tersimpan aman secara lokal di browser (LocalStorage / IndexedDB) tanpa ketergantungan server luar.

---

## 📂 Struktur Proyek

```text
Finance Tracker/
├── .agents/              # Konfigurasi & rules agent developer (local only)
├── .gitignore            # Daftar file yang diabaikan oleh Git
├── README.md             # Dokumentasi lengkap proyek & roadmap
├── package.json          # Manajemen dependensi & script proyek
├── index.html            # Entry point HTML dengan font & asset pixel
├── vite.config.ts        # Konfigurasi Vite bundler
├── tailwind.config.js    # Konfigurasi tema warna & styling pixel
└── src/
    ├── main.tsx          # Inisialisasi React DOM
    ├── App.tsx           # Layout utama & state controller
    ├── types/            # Definisi TypeScript untuk transaksi & periode
    ├── components/       # Komponen UI (Header, Table, Cards, Navigator)
    ├── hooks/            # Logika state & kalkulasi saldo
    └── utils/            # Utilitas tanggal, format Rupiah, & storage
```

---

## 💻 Cara Memasang & Menjalankan Lokal

### 1. Prasyarat
* [Node.js](https://nodejs.org/) (versi 18 LTS atau lebih baru).
* [Git](https://git-scm.com/).

### 2. Instalasi
```bash
# Clone repositori ini
git clone https://github.com/raintyaa/pixel-finance-tracker.git
cd pixel-finance-tracker

# Install seluruh dependencies
npm install
```

### 3. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka browser di `http://localhost:5173` untuk melihat aplikasi berjalan.

### 4. Build untuk Produksi
```bash
npm run build
```

---

## 🗓️ Milestone & Roadmap Pengerjaan

Roadmap ini dirancang terstruktur per hari untuk mendukung rutinitas kontribusi (*daily contribution streak*) di GitHub:

* [x] **Hari 1**: Setup project, inisialisasi Git repository, konfigurasi `.gitignore`, penulisan `README.md`, dan perancangan roadmap pengerjaan.
* [ ] **Hari 2**: Setup fondasi Vite + React + TypeScript + Tailwind CSS serta integrasi tema/font retro Pixel Art.
* [ ] **Hari 3**: Perancangan model data TypeScript (Transaksi, Kategori, Periode Pekanan) & utilitas kalkulasi format Rupiah.
* [ ] **Hari 4**: Komponen Card Ringkasan Saldo (Saldo Awal, Total Pemasukan, Total Pengeluaran, & Sisa Saldo Berjalan).
* [ ] **Hari 5**: Komponen Navigator Periode (Pilihan Bulan & Minggu ke-1 s/d Minggu ke-5 dengan State Controller).
* [ ] **Hari 6**: Tampilan Utama Tabel Mingguan (Grid 7 Kolom Hari: Minggu - Sabtu).
* [ ] **Hari 7**: Form & Modal Input Transaksi Cepat (Pemasukan / Pengeluaran, Kategori, Nominal, & Catatan).
* [ ] **Hari 8**: Kalkulasi Otomatis Total Pengeluaran Harian & Baris Total Akumulasi Mingguan.
* [ ] **Hari 9**: Fitur Aksi Baris Tabel (Edit Data, Hapus Transaksi, & Konfirmasi Dialog RPG).
* [ ] **Hari 10**: Mekanisme Persistensi Data Lokal (LocalStorage / IndexedDB) & pencegahan kehilangan data (*zero data loss*).
* [ ] **Hari 11**: Indikator Visual Budget (HP / EXP Bar Pengeluaran vs Batas Anggaran).
* [ ] **Hari 12**: Fitur Export & Import Data (Format CSV & Backup JSON).
* [ ] **Hari 13**: Unit Test / Self-Check Logic Suite untuk akurasi kalkulasi matematika saldo dan formula mingguan.
* [ ] **Hari 14**: Polishing UI/UX Pixel Art, Efek Suara 8-Bit (opsional), Responsivitas Mobile/Desktop, & Release v1.0.

---

## 👨‍💻 Pengembang

Dikembangkan oleh **raintyaa** ([Muhammad Zaki Rakha Bahy](https://github.com/raintyaa))
