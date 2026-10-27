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
  let barColor = 'bg-[var(--theme-income)]'

  if (expensePercentage >= 80) {
    statusText = 'STATUS KRITIS! 🚨'
    barColor = 'bg-[var(--theme-expense)]'
  } else if (expensePercentage >= 50) {
    statusText = 'MULAI MENIPIS ⚠️'
    barColor = 'bg-[var(--theme-gold)]'
  }

  return (
    <section className="flex flex-col gap-3">
      {/* 3 Kartu Ringkasan: Bersih, Jelas, & Minimalis */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

        {/* Card 1: Total Uang Masuk */}
        <div className="pixel-box-sm bg-[var(--theme-card)] p-4 flex flex-col justify-between">
          <div className="text-xs text-[var(--theme-text-muted)] mb-1 flex items-center justify-between">
            <span>🪙 Uang Masuk</span>
            <span className="text-[11px] bg-[var(--theme-income-badge)] text-[var(--theme-income)] border border-[var(--theme-border)] px-1.5 py-0.5 font-bold font-['Silkscreen']">
              +IN
            </span>
          </div>
          <div className="font-['Silkscreen'] text-sm text-[var(--theme-income)] font-bold">
            {formatRupiah(totalIncome)}
          </div>
        </div>

        {/* Card 2: Total Pengeluaran */}
        <div className="pixel-box-sm bg-[var(--theme-card)] p-4 flex flex-col justify-between">
          <div className="text-xs text-[var(--theme-text-muted)] mb-1 flex items-center justify-between">
            <span>📉 Pengeluaran</span>
            <span className="text-[11px] bg-[var(--theme-expense-badge)] text-[var(--theme-expense)] border border-[var(--theme-border)] px-1.5 py-0.5 font-bold font-['Silkscreen']">
              -OUT
            </span>
          </div>
          <div className="font-['Silkscreen'] text-sm text-[var(--theme-expense)] font-bold">
            {formatRupiah(totalExpense)}
          </div>
        </div>

        {/* Card 3: Sisa Saldo Dompet Riil (FIX Seluruh Riwayat) */}
        <div className="pixel-box-sm bg-[var(--theme-card-gold)] p-4 flex flex-col justify-between">
          <div className="text-xs text-[var(--theme-gold-text)] mb-1 flex items-center justify-between">
            <span className="font-bold">💰 Sisa Saldo</span>
            <span className="text-[11px] bg-[var(--theme-gold)] text-black border border-[var(--theme-border)] px-1.5 py-0.5 font-bold font-['Silkscreen']">
              TOTAL KAS
            </span>
          </div>
          <div className="font-['Silkscreen'] text-sm text-[var(--theme-gold-text)] font-bold">
            {formatRupiah(realBalance)}
          </div>
        </div>
      </div>

      {/* Indikator RPG Health Bar Keuangan */}
      <div className="bg-[var(--theme-card)] border-2 border-[var(--theme-border)] p-3 flex flex-col gap-1.5 shadow-[2px_2px_0px_var(--theme-shadow)]">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--theme-text-muted)] flex items-center gap-1.5">
            ❤️ <span className="font-mono text-xs">Daya Tahan Kas:</span>
            <span className="font-['Silkscreen'] text-xs text-[var(--theme-text)] font-bold">
              {statusText}
            </span>
          </span>
          <span className="font-['Silkscreen'] text-xs text-[var(--theme-text-muted)] font-bold">
            {expensePercentage}% TERPAKAI
          </span>
        </div>

        {/* HP Bar Pixel */}
        <div className="w-full h-3 bg-[var(--theme-card-subtle)] border-2 border-[var(--theme-border)] p-0.5">
          <div
            className={`h-full ${barColor} transition-all duration-300`}
            style={{ width: `${expensePercentage}%` }}
          />
        </div>
      </div>
    </section>
  )
}
