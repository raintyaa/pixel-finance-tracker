# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Pengguna utama (harian):** Pemilik proyek (`raintyaa`) yang mencatat arus kas harian dan merekonsiliasi saldo kas riil secara rutin dari peramban *desktop* maupun *mobile*.
- **Pengguna sekunder (publik & portofolio):** Pengguna umum di Indonesia—terutama mahasiswa dan pekerja muda—yang membutuhkan pencatat keuangan harian cepat tanpa kewajiban membuat akun atau masuk (*login*), sekaligus audiens penilai proyek portofolio.

## Product Purpose

**Pixel Ledger** adalah aplikasi web pencatat keuangan pribadi (*Personal Finance Tracker*) berorientasi *offline-first*. Aplikasi ini memungkinkan pengguna mencatat pemasukan dan pengeluaran harian dengan cepat, menjaga keakuratan saldo kas riil berjalan (*running balance*), memantau batas anggaran bulanan secara langsung, serta membaca pola belanja mingguan dan bulanan tanpa ketergantungan pada server eksternal.

Keberhasilan produk diukur dari kecepatan pencatatan harian, nol kehilangan data lokal (*zero data loss*), kejelasan posisi saldo riil dibandingkan batas anggaran, serta kemudahan memindai kebiasaan pengeluaran per pekan dalam satu layar.

## Positioning

Pixel Ledger memposisikan **tabel *ledger* 7 kolom mingguan (Minggu–Sabtu)** sebagai pusat pengalaman utama—bukan sekadar daftar kronologis transaksi vertikal—sehingga pengguna dapat melihat distribusi belanja harian, hari terboros, dan akumulasi surplus/defisit satu pekan dalam sekali pandang, sepenuhnya lokal di peramban tanpa akun atau server.

## Operating Context

- **Ritual harian:** Mencatat pengeluaran atau pemasukan cepat langsung dari tanggal berjalan maupun sel hari tertentu pada tabel mingguan, dengan umpan balik *toast* (`Urungkan` saat menghapus dan `Lihat Pekan` bila tanggal berada di luar pekan aktif).
- **Ritual mingguan & bulanan:** Berpindah antar-bulan dan pekan (5–6 pekan adaptif + tombol lompat `Hari Ini`), meninjau distribusi kategori dan pola belanja per hari di tab Analisis, serta menelusuri atau memfilter transaksi lintas bulan di tab Riwayat Transaksi.
- **Rekonsiliasi & tutup buku:** Menyelaraskan saldo dompet/rekening fisik melalui *Atur Saldo Riil* (dengan pilihan apakah selisih memotong batas anggaran bulanan dan pencatatan biaya admin transfer terpisah), serta mengarsipkan pengeluaran bulan berjalan ke Rp 0 sambil menjaga saldo kas riil tetap utuh.
- **Pencadangan manual:** Mengunduh cadangan penuh JSON atau tabel CSV, memulihkan data dari berkas JSON tervalidasi, dan melindungi data lokal melalui *snapshot* darurat di `localStorage`.
- **Lingkungan pengembangan:** Server lokal Vite dikunci pada `http://localhost:5173` (`strictPort: true`) agar asal (*origin*) penyimpanan `localStorage` tidak terpecah akibat perpindahan port.

## Capabilities and Constraints

- **Kapabilitas aktif:**
  - Ringkasan Saldo (*Bulan Ini* vs *Semua Waktu*) dengan kalkulasi Sisa Saldo Kas riil lintas seluruh riwayat.
  - Indikator batas anggaran bulanan (menyusut dari `100%` ke `0%` seiring naiknya pengeluaran bulanan).
  - Navigator Periode bulanan & mingguan serta Tabel Ledger 7 kolom (Minggu–Sabtu) dengan *quick-add* per hari, ubah/hapus transaksi, dan akumulasi mingguan.
  - Halaman Analisis (arus kas bersih, rasio simpan, rata-rata per hari aktif, pos terbesar, distribusi kategori, pola belanja harian) dan Riwayat Transaksi (pencarian, filter tipe, kategori, dan status arsip/transfer).
  - Modal Atur Saldo Riil, Batas Budget, Kelola & Reset Pengeluaran, dan Pencadangan/Pemulihan JSON & CSV.
- **Batasan permanen terkonfirmasi:**
  - Tetap **100% *offline-first*** tanpa *backend* maupun kewajiban *login* (data tersimpan di peramban lokal).
  - Bahasa antarmuka **Bahasa Indonesia (`id-ID`)** dengan mata uang **Rupiah (`Rp`)**.
  - Menjaga integritas data (*zero data loss*) melalui persistensi otomatis, validasi impor, dan konfirmasi/pembatalan pada aksi destruktif.
- **Keputusan terbuka (belum dikunci):**
  - Dukungan **multi-dompet / multi-rekening** dan kemampuan pemasangan **PWA (*Progressive Web App*)** terbuka untuk pengembangan mendatang.
  - Sinkronisasi *cloud* dan dukungan multi-mata uang saat ini tidak masuk cakupan aktif.

## Brand Commitments

- **Nama produk:** Pixel Ledger (dikembangkan oleh `raintyaa` / Muhammad Zaki Rakha Bahy).
- **Suara & bahasa:** Bahasa Indonesia baku sesuai PUEBI/KBBI, lugas, ringkas, dan jelas pada label aksi, peringatan anggaran, serta pemulihan galat.
- **Identitas merek:** Karakter retro *pixel-art* merupakan komitmen identitas produk yang dipertahankan secara konsisten (spesifikasi sistem visual dicatat terpisah pada `DESIGN.md`).

## Evidence on Hand

- Aplikasi web React + TypeScript + Vite aktif yang dapat dijalankan lokal lewat `npm run dev` pada `http://localhost:5173`.
- Rangkaian pengujian unit terverifikasi di `src/__tests__/` (kalkulasi saldo, anggaran, analitik, tanggal, format mata uang, dan validasi cadangan).
- Dokumentasi repositori di `README.md` dan panduan agen di `AGENTS.md`.
- **Yang belum tersedia (jangan dikarang):** belum ada testimoni pengguna eksternal, metrik adopsi publik, studi kasus, atau tautan domain produksi resmi.

## Product Principles

1. **Pemindaian Mingguan sebagai Jangkar Utama** — Struktur 7 kolom (Minggu–Sabtu) selalu diprioritaskan agar pola belanja harian dan mingguan terbaca sekilas.
2. **Kejujuran Saldo Kas Riil** — Saldo kas selalu mencerminkan uang nyata secara akurat; transfer kas, koreksi saldo, dan tutup buku bulanan dipisahkan dengan jelas dari beban anggaran.
3. **Offline-First & Nol Kehilangan Data** — Semua fungsi inti bekerja penuh tanpa jaringan atau akun, disertai cadangan JSON/CSV yang dapat dipulihkan dan pengaman pada tindakan hapus/reset.
4. **Cepat, Ringkas, dan Jelas** — Pencatatan transaksi harian, rekonsiliasi saldo, dan penelusuran riwayat harus minim hambatan dan langsung dapat dipakai baik oleh pemilik maupun pengguna publik baru.

## Accessibility & Inclusion

- Memenuhi kontras baca standar **WCAG AA** (minimal 4.5:1 untuk teks isi dan 3:1 untuk teks besar) pada seluruh variasi tema.
- Mendukung penuh navigasi papan ketik (`:focus-visible`, penutupan laci/dialog, label ARIA untuk kontrol dan indikator progres `role="progressbar"`).
- Menghormati preferensi sistem `prefers-reduced-motion: reduce` dan menjaga kenyamanan pakai lintas ukuran layar *desktop* serta *mobile*.
