import { useState } from 'react'
import { INITIAL_TRANSACTIONS } from './data/initialData'
import type { Transaction } from './types/finance'
import { formatRupiah } from './utils/currency'
import { formatDateIndo, getDayName } from './utils/date'

export default function App() {
  const [transactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS)

  // 1. Kalkulasi Otomatis Saldo dari Model Data
  const totalIncome = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((acc, tx) => acc + tx.amount, 0)

  const totalExpense = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((acc, tx) => acc + tx.amount, 0)

  const currentBalance = totalIncome - totalExpense

  return (
    <div className="min-h-screen bg-[#1a1921] text-[#f4f4f0] flex flex-col items-center justify-center p-4 selection:bg-[#f4b41b] selection:text-black">
      <main className="w-full max-w-2xl flex flex-col gap-6">

        {/* Header Retro */}
        <header className="pixel-box bg-[#252433] p-6 text-center">
          <div className="inline-block bg-[#f4b41b] text-black px-3 py-1 font-['Silkscreen'] text-xs uppercase mb-3 pixel-box-sm">
            Fase 1: Model Data & Utilitas
          </div>
          <h1 className="font-['Silkscreen'] text-xl md:text-2xl text-[#f4b41b] tracking-wider mb-2 drop-shadow-[2px_2px_0px_#000]">
            🎮 PIXEL LEDGER
          </h1>
          <p className="text-sm text-gray-300">
            Aplikasi Pencatat Keuangan Pribadi Bergaya Retro Pixel Art & Tabel Mingguan
          </p>
        </header>

        {/* Ringkasan Saldo (Menggunakan Utilitas formatRupiah) */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="pixel-box-sm bg-[#252433] p-4">
            <div className="text-xs text-gray-400 mb-1">🪙 Saldo Kas Berjalan</div>
            <div className="font-['Silkscreen'] text-sm text-[#f4b41b]">
              {formatRupiah(currentBalance)}
            </div>
          </div>
          <div className="pixel-box-sm bg-[#252433] p-4">
            <div className="text-xs text-gray-400 mb-1">📈 Total Uang Masuk</div>
            <div className="font-['Silkscreen'] text-sm text-[#38b764]">
              {formatRupiah(totalIncome)}
            </div>
          </div>
          <div className="pixel-box-sm bg-[#252433] p-4">
            <div className="text-xs text-gray-400 mb-1">📉 Total Pengeluaran</div>
            <div className="font-['Silkscreen'] text-sm text-[#e43b44]">
              {formatRupiah(totalExpense)}
            </div>
          </div>
        </section>

        {/* Daftar Transaksi Uji Coba Hari 3 */}
        <section className="pixel-box bg-[#1f1e2c] p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b-2 border-[#3d3b52] pb-3">
            <span className="font-['Silkscreen'] text-xs text-[#38b764]">
              STATUS: MODEL DATA & FORMAT RUPIAH AKTIF
            </span>
            <span className="text-xs bg-[#38b764] text-black px-2 py-0.5 font-bold">
              {transactions.length} DATA
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-xs text-gray-400 mb-1">
              Verifikasi Transaksi (Kolom Hari & Tanggal Otomatis):
            </div>
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="pixel-box-sm bg-[#2a293b] p-3 flex items-center justify-between text-xs"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#3d3b52] text-yellow-400 px-1.5 py-0.5 font-['Silkscreen'] text-[10px]">
                      {getDayName(tx.dayOfWeek)}
                    </span>
                    <span className="font-bold text-white">{tx.description}</span>
                  </div>
                  <span className="text-gray-400 text-[11px]">
                    {formatDateIndo(tx.date)} • {tx.category}
                  </span>
                </div>

                <div
                  className={`font-['Silkscreen'] text-xs ${tx.type === 'income' ? 'text-[#38b764]' : 'text-[#e43b44]'
                    }`}
                >
                  {tx.type === 'income' ? '+' : '-'} {formatRupiah(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="text-center text-xs text-gray-500 font-mono">
          Target Berikutnya (Hari 4): Komponen Card Ringkasan Saldo RPG 📊
        </footer>
      </main>
    </div>
  )
}