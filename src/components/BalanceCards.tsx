import { formatRupiah } from '../utils/currency'

interface BalanceCardsProps {
  totalIncome: number   // Sesuai filter scope (Bulan ini / Semua)
  totalExpense: number  // Sesuai filter scope (Bulan ini / Semua)
  realBalance: number   // FIX: Total sisa uang kas riil di dompet saat ini
}

export default function BalanceCards({
  totalIncome,
  totalExpense,
  realBalance,
}: BalanceCardsProps) {
  // Kalkulasi Rasio HP / Daya Tahan Keuangan periode ini
  const expensePercentage =
    totalIncome > 0
      ? Math.min(100, Math.round((totalExpense / totalIncome) * 100))
      : totalExpense > 0
      ? 100
      : 0

  // Status RPG Berdasarkan Persentase Pengeluaran
  let statusText = 'DOMPET SEHAT 💚'
  let barColor = 'bg-[#38b764]' // Hijau

  if (expensePercentage >= 80) {
    statusText = 'STATUS KRITIS! 🚨'
    barColor = 'bg-[#e43b44]' // Merah
  } else if (expensePercentage >= 50) {
    statusText = 'MULAI MENIPIS ⚠️'
    barColor = 'bg-[#f4b41b]' // Kuning
  }

  return (
    <section className="flex flex-col gap-3">
      {/* 3 Kartu Ringkasan: Bersih, Jelas, & Minimalis */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Card 1: Total Uang Masuk */}
        <div className="pixel-box-sm bg-[#252433] p-4 flex flex-col justify-between">
          <div className="text-xs text-gray-400 mb-1 flex items-center justify-between">
            <span>🪙 Uang Masuk</span>
            <span className="text-[10px] text-[#38b764] font-bold">+IN</span>
          </div>
          <div className="font-['Silkscreen'] text-sm text-[#38b764]">
            {formatRupiah(totalIncome)}
          </div>
        </div>

        {/* Card 2: Total Pengeluaran */}
        <div className="pixel-box-sm bg-[#252433] p-4 flex flex-col justify-between">
          <div className="text-xs text-gray-400 mb-1 flex items-center justify-between">
            <span>📉 Pengeluaran</span>
            <span className="text-[10px] text-[#e43b44] font-bold">-OUT</span>
          </div>
          <div className="font-['Silkscreen'] text-sm text-[#e43b44]">
            {formatRupiah(totalExpense)}
          </div>
        </div>

        {/* Card 3: Sisa Saldo Dompet Riil (FIX Seluruh Riwayat) */}
        <div className="pixel-box-sm bg-[#2a273f] border-[#f4b41b] p-4 flex flex-col justify-between">
          <div className="text-xs text-gray-300 mb-1 flex items-center justify-between">
            <span className="text-[#f4b41b] font-bold">💰 Sisa Saldo</span>
            <span className="text-[10px] bg-[#f4b41b] text-black px-1 font-bold">TOTAL KAS</span>
          </div>
          <div className="font-['Silkscreen'] text-sm text-[#f4b41b]">
            {formatRupiah(realBalance)}
          </div>
        </div>
      </div>

      {/* Indikator RPG Health Bar Keuangan */}
      <div className="pixel-box-sm bg-[#1f1e2c] p-3 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400 flex items-center gap-1.5">
            ❤️ <span className="font-mono text-[11px]">Daya Tahan Kas:</span>
            <span className="font-['Silkscreen'] text-[10px] text-white">
              {statusText}
            </span>
          </span>
          <span className="font-['Silkscreen'] text-[10px] text-gray-300">
            {expensePercentage}% TERPAKAI
          </span>
        </div>

        {/* HP Bar Pixel */}
        <div className="w-full h-3 bg-[#131219] border-2 border-black p-0.5">
          <div
            className={`h-full ${barColor} transition-all duration-300`}
            style={{ width: `${expensePercentage}%` }}
          />
        </div>
      </div>
    </section>
  )
}