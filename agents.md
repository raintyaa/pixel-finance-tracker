# Pixel Ledger — Agent Guidelines & Project Context

Dokumen ini adalah acuan baku (**ground truth**) bagi seluruh AI Agent yang bekerja pada repositori **Pixel Ledger**. Seluruh aturan, keahlian (*skills*), dan perkakas (*tools*) yang tercantum di sini wajib dipatuhi selama pengembangan proyek.

---

## 📌 1. Konteks Proyek (Project Context)

- **Nama Proyek**: Pixel Ledger (Retro Finance Tracker)
- **Pemilik / Developer**: raintyaa (`zaki.rakha.bahy@gmail.com`)
- **Tujuan**: Aplikasi pencatatan dan pelacakan keuangan pribadi dengan estetika retro pixel art (*Aseprite / Pico-8 / Endesga 32 theme*), berorientasi *offline-first* dengan performa tinggi dan nol kehilangan data (*zero data loss*).
- **Tech Stack**:
  - **Framework**: React 19 + TypeScript + Vite
  - **Styling**: Tailwind CSS v4 + Lucide React
  - **Tipografi**: Google Fonts (`Silkscreen` untuk judul/header retro, `JetBrains Mono` untuk angka tabular dan mata uang, font sistem sans-serif untuk teks panjang/keterangan)
  - **Penyimpanan Data**: Browser LocalStorage (*offline-first*) dengan sistem snapshot darurat di `src/utils/storage.ts`
  - **Server Port**: `5173` (dikunci melalui `strictPort: true` di `vite.config.ts` guna mencegah *port drift* yang memisahkan LocalStorage browser)

### Fitur Utama & Roadmap:
1. **Ringkasan Saldo**: Total Uang Masuk, Sisa Saldo Kas (saldo riil berjalan), dan Total Pengeluaran.
2. **Atur Saldo Riil**: Penyesuaian saldo fisik/bank dengan pencatatan selisih otomatis.
3. **Daya Tahan Kas (Cash Runway)**: Indikator bar ala HP/Mana game retro yang menghitung sisa hari kas bertahan berdasarkan rerata pengeluaran harian.
4. **Tabel Ledger Mingguan**: Layout 7 kolom (Minggu s/d Sabtu) dengan subtotal harian dan mingguan.
5. **Navigator Periode**: Navigasi antar-bulan dan minggu dinamis.
6. **Batas Budget (Hari 11)**: Pengaturan batas pengeluaran bulanan/kategori dan peringatan status visual.
7. **Pencadangan Data / Export-Import JSON (Hari 12)**: Fitur unduh dan pulihkan data.
8. **Unit & Logic Testing (Hari 13)**: Pengujian unit perhitungan saldo dan utilitas tanggal.

---

## 🎯 2. Strategi Context Budget Limiting

Alih-alih menyalin seluruh pustaka global yang berisi puluhan *rules* dan *skills* yang tidak relevan (seperti bioinformatika, GCP BigQuery, Android native, atau Flutter), repositori ini hanya mengadopsi elemen yang secara langsung menunjang pengembangan web frontend retro, integritas Git/GitHub, dan kualitas kode Pixel Ledger.

Seluruh file acuan lokal telah disalin ke dalam direktori `agents/` (dan disinkronkan dengan `.agents/`) agar dapat langsung dibaca tanpa perlu berpindah ke direktori konfigurasi global.

---

## 📜 3. Rules yang Diadopsi (Acuan Baku Aturan)

Tiga *rules* utama berikut wajib diacu dan ditaati pada setiap sesi kerja:

### 1. `git-github-workflow.md` (`agents/rules/git-github-workflow.md`)
- **Conventional Commits**: Selalu gunakan format commit semantik standar:
  - `feat:`: Fitur baru aplikasi
  - `fix:`: Perbaikan bug atau galat
  - `docs:`: Pembaruan dokumentasi
  - `style:`: Penyesuaian formatting, layout pixel, atau styling tanpa ubah logika
  - `refactor:`: Restrukturisasi kode tanpa mengubah fungsionalitas
  - `test:`: Penambahan atau perbaikan unit test
  - `chore:`: Konfigurasi build, dependensi, atau perkakas
- **Verifikasi Sebelum Commit**: Jangan pernah melakukan commit terhadap kode yang belum diuji atau gagal build/lint.
- **Feature Branching**: Gunakan branch terpisah untuk fitur kompleks sebelum digabungkan (*merge*) kembali ke `main`.
- **Rutinitas Push**: Sinkronkan perubahan ke remote `origin main` setelah verifikasi berhasil.

### 2. `ponytail.md` (`agents/rules/ponytail.md`)
- **Pragmatic Senior Dev Mindset**: Mengutamakan kode yang ringkas, esensial, dan efisien. Kode terbaik adalah kode yang tidak perlu ditulis (*YAGNI*).
- **Tangga Eksekusi (Execution Ladder)**:
  1. Apakah fitur ini benar-benar dibutuhkan? (*YAGNI*)
  2. Apakah helper atau utilitas serupa sudah ada di codebase? Gunakan kembali (misal: `src/utils/currency.ts`, `src/utils/date.ts`).
  3. Apakah JavaScript/TypeScript standar sudah menyediakannya?
  4. Hanya tulis kode baru dengan *diff* paling minimal dan terarah (*minimum working diff*).
- **Root-Cause Fixing**: Perbaiki akar masalah pada fungsi utama bersama, bukan sekadar menambal gejala di satu komponen pemanggil.

### 3. `no-ai-slop.md` (`agents/rules/no-ai-slop.md`)
- **Gaya Komunikasi Otentik & Lugas**: Hindari kata-kata klise khas AI (*delve, tapestry, robust, game-changer, multifaceted*, dll.).
- **Kaidah Bahasa Indonesia Baku (PUEBI/KBBI)**:
  - Gunakan kata baku: *praktik* (bukan praktek), *analisis* (bukan analisa), *efektif* (bukan efektip), *respons* (bukan respon), *risiko* (bukan resiko).
  - Istilah teknis komputer/web yang sudah umum dipertahankan dalam bentuk aslinya dan dicetak miring (*italic*): *throughput*, *routing*, *endpoint*, *localStorage*, *state*, *props*, *hook*, *render*. Dilarang memaksakan terjemahan yang terdengar kaku.

---

## 🛠️ 4. Skills yang Diadopsi (Keahlian Spesifik)

Empat *skills* lokal berikut berada di `agents/skills/` dan siap dipanggil:

### 1. `impeccable` (`agents/skills/impeccable/`)
- Digunakan untuk audit dan preservasi desain antarmuka retro pixel art.
- Menjaga konsistensi tipografi (`typeset`), kontras warna, ritme spasial (*spacing*), dan mencegah *anti-patterns* (misal: teks terpotong / *content overflowing container*, elemen tertutup / *occluded elements*, dan penumpukan kartu / *nested cards*).

### 2. `verify-before-done` (`agents/skills/verify-before-done/`)
- Mewajibkan eksekusi verifikasi konkret sebelum menyatakan pekerjaan selesai.
- Wajib menjalankan:
  1. `npm run lint` (ESLint check)
  2. `npm run build` (TypeScript compilation & Vite bundle check)
- Dilarang mengasumsikan keberhasilan tanpa memeriksa *exit code* dan *output* riil dari terminal.

### 3. `systematic-debugging` (`agents/skills/systematic-debugging/`)
- Protokol 4 fase investigasi saat menemukan bug atau ketidaksesuaian perilaku:
  1. *Investigate*: Identifikasi input pemicu dan pelacakan alur data.
  2. *Analyze*: Temukan titik anomali logika atau *state mutation*.
  3. *Hypothesize*: Formulasikan hipotesis penyebab akar masalah.
  4. *Resolve*: Terapkan perbaikan terarah dan verifikasi ulang.

### 4. `test-driven-development` (`agents/skills/test-driven-development/`)
- Disiplin *Red-Green-Refactor* untuk modul logika krusial (terutama kalkulasi saldo, batas anggaran bulanan, dan estimasi daya tahan kas).
- Memastikan logika finansial terlindungi dari regresi di masa depan.

---

## 🔧 5. Perkakas yang Digunakan (Tools)

1. **`run_command`**: Menjalankan perintah terminal lokal PowerShell untuk mengelola dependency (`npm`), menjalankan linter, compiler, build, serta perintah Git.
2. **File Tools (`read_file`, `write_file`, `edit_file`)**: Membaca dan memodifikasi file proyek secara aman, presisi, dan terisolasi.
3. **GitHub MCP (`@modelcontextprotocol/server-github`)**: Mengelola repository, issue, pull request, dan integrasi GitHub secara terprogram.

---

## 📁 6. Peta Direktori Agen Lokal

```text
Finance Tracker/
├── agents.md                             # Dokumen konteks & panduan utama (file ini)
└── agents/                               # Folder lokal rules & skills (junction ke .agents/)
    ├── rules/
    │   ├── git-github-workflow.md        # Standar Git & Conventional Commits
    │   ├── ponytail.md                   # Panduan developer pragmatis & minimalis
    │   └── no-ai-slop.md                 # Standar bahasa baku & anti klise AI
    └── skills/
        ├── impeccable/                   # Skill audit desain & tipografi UI
        ├── verify-before-done/           # Skill verifikasi build & linter
        ├── systematic-debugging/         # Skill investigasi akar masalah
        └── test-driven-development/      # Skill TDD & pembuatan unit test
```

---

*Setiap perubahan mendasar pada arsitektur atau aturan kerja proyek ini wajib dicatatkan kembali ke dalam dokumen `agents.md`.*
