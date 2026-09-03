import { useState } from 'react'

export default function App() {
  const [coins, setCoins] = useState(100000)

  return (
    <div className="min-h-screen bg-[#1a1921] text-[#f4f4f0] flex flex-col items-center justify-center p-4 selection:bg-[#f4b41b] selection:text-black">
      {/* Container Utama */}
      <main className="w-full max-w-2xl flex flex-col gap-6">
        
        {/* Header Retro */}
        <header className="pixel-box bg-[#252433] p-6 text-center">
          <div className="inline-block bg-[#f4b41b] text-black px-3 py-1 font-['Silkscreen'] text-xs uppercase mb-3 pixel-box-sm">
            Fase Inisialisasi
          </div>
          <h1 className="font-['Silkscreen'] text-xl md:text-2xl text-[#f4b41b] tracking-wider mb-2 drop-shadow-[2px_2px_0px_#000]">
            🎮 PIXEL LEDGER
          </h1>
          <p className="text-sm md:text-base text-gray-300">
            Aplikasi Pencatat Keuangan Pribadi Bergaya Retro Pixel Art & Tabel Mingguan
          </p>
        </header>

        {/* Kotak Dialog RPG / Status Proyek */}
        <section className="pixel-box bg-[#1f1e2c] p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b-2 border-[#3d3b52] pb-3">
            <span className="font-['Silkscreen'] text-xs text-[#38b764]">
              STATUS: HARI 2 SUKSES
            </span>
            <span className="text-xs bg-[#38b764] text-black px-2 py-0.5 font-bold">
              ONLINE
            </span>
          </div>

          <div className="flex flex-col gap-2 text-sm leading-relaxed">
            <p className="text-[#a09fae]">
              🧙‍♂️ <span className="text-white font-semibold">Tuan Pengelola Keuangan:</span>
            </p>
            <p className="bg-[#2a293b] p-3 border-2 border-black text-[#f4f4f0] font-mono text-xs md:text-sm">
              &quot;Selamat datang di Pixel Ledger! Fondasi <b>Vite</b>, <b>React 19</b>, <b>TypeScript</b>, dan <b>Tailwind CSS</b> bertema Aseprite retro telah terpasang dengan kokoh. Siap mencatat setiap koin emas Anda!&quot;
            </p>
          </div>

          {/* Mini Preview Kartu Keuangan */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="pixel-box-sm bg-[#252433] p-3">
              <div className="text-xs text-gray-400 mb-1">🪙 Saldo Kas</div>
              <div className="font-['Silkscreen'] text-xs text-[#f4b41b]">
                Rp {coins.toLocaleString('id-ID')}
              </div>
            </div>
            <div className="pixel-box-sm bg-[#252433] p-3">
              <div className="text-xs text-gray-400 mb-1">📈 Pemasukan</div>
              <div className="font-['Silkscreen'] text-xs text-[#38b764]">
                Rp 0
              </div>
            </div>
            <div className="pixel-box-sm bg-[#252433] p-3">
              <div className="text-xs text-gray-400 mb-1">📉 Pengeluaran</div>
              <div className="font-['Silkscreen'] text-xs text-[#e43b44]">
                Rp 0
              </div>
            </div>
          </div>

          {/* Tombol Interaktif Uji Coba */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t-2 border-[#3d3b52]">
            <span className="text-xs text-gray-400">
              Uji coba responsivitas tombol retro:
            </span>
            <button
              type="button"
              onClick={() => setCoins((prev) => prev + 25000)}
              className="pixel-button bg-[#f4b41b] text-black font-['Silkscreen'] text-[10px] px-4 py-2 hover:bg-[#ffd700] cursor-pointer"
            >
              + TAMBAH 25K KOIN
            </button>
          </div>
        </section>

        {/* Footer info roadmap */}
        <footer className="text-center text-xs text-gray-500 font-mono">
          Roadmap Berikutnya (Hari 3): Model Data Transaksi & Format Rupiah 📅
        </footer>
      </main>
    </div>
  )
}
