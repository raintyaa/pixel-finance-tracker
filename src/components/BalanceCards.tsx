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
  let statusColor = 'text-[var(--theme-income)]'

  if (expensePercentage >= 80) {
    statusText = 'STATUS KRITIS! 🚨'
    barColor = 'bg-[var(--theme-expense)]'
    statusColor = 'text-[var(--theme-expense)]'
  } else if (expensePercentage >= 50) {
    statusText = 'MULAI MENIPIS ⚠️'
    barColor = 'bg-[var(--theme-gold)]'
    statusColor = 'text-[var(--theme-gold-text)]'
  }

  return (
    <section className="flex flex-col gap-3">
      {/* 3 Kartu Ringkasan: hero saldo diapit pemasukan & pengeluaran */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)_minmax(0,1fr)] lg:items-stretch">

        {/* Card 1: Total Uang Masuk */}
        <article className="pixel-box order-2 flex flex-col justify-between gap-5 bg-[var(--theme-card)] p-4 sm:p-5 lg:order-1">
          <p className="font-['Silkscreen'] text-[10px] font-bold tracking-[0.16em] text-[var(--theme-text-muted)]">
            UANG MASUK
          </p>

          <p className="break-words font-['Silkscreen'] text-base font-bold text-[var(--theme-income)] sm:text-lg">
            {formatRupiah(totalIncome)}
          </p>
        </article>

        {/* Card 2: Sisa Saldo Kas — HERO CARD dengan aksen emas */}
        <article className="pixel-box relative order-1 flex flex-col justify-between gap-5 overflow-hidden bg-[var(--theme-gold)] p-5 sm:p-6 lg:order-2">
          <span
            className="pointer-events-none absolute -right-3 -top-5 select-none text-8xl opacity-20"
            aria-hidden="true"
          >
            🪙
          </span>

          <div className="relative">
            <p className="font-['Silkscreen'] text-[10px] font-bold tracking-[0.16em] text-black/70">
              SISA SALDO KAS
            </p>
            <p className="mt-1 text-xs text-black/70">
              Total kas riil seluruh riwayat
            </p>
          </div>

          <p className="relative break-words font-['Silkscreen'] text-2xl font-bold text-black sm:text-3xl">
            {formatRupiah(realBalance)}
          </p>
        </article>

        {/* Card 3: Total Pengeluaran */}
        <article className="pixel-box order-3 flex flex-col justify-between gap-5 bg-[var(--theme-card)] p-4 sm:p-5 lg:order-3">
          <p className="font-['Silkscreen'] text-[10px] font-bold tracking-[0.16em] text-[var(--theme-text-muted)]">
            PENGELUARAN
          </p>

          <p className="break-words font-['Silkscreen'] text-base font-bold text-[var(--theme-expense)] sm:text-lg">
            {formatRupiah(totalExpense)}
          </p>
        </article>
      </div>

      {/* Indikator RPG Health Bar Keuangan — menyatu dengan ringkasan saldo */}
      <div className="pixel-box bg-[var(--theme-card)] p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm leading-none" aria-hidden="true">
              ❤️
            </span>
            <div>
              <p className="font-['Silkscreen'] text-[10px] font-bold tracking-[0.16em] text-[var(--theme-text-muted)]">
                DAYA TAHAN KAS
              </p>
              <p className={`mt-0.5 font-['Silkscreen'] text-xs font-bold ${statusColor}`}>
                {statusText}
              </p>
            </div>
          </div>

          <span className="font-mono text-[11px] text-[var(--theme-text-muted)]">
            {expensePercentage}% terpakai
          </span>
        </div>

        {/* HP Bar Pixel */}
        <div className="mt-3 h-4 w-full border-2 border-[var(--theme-border)] bg-[var(--theme-card-subtle)] p-0.5">
          <div
            className={`h-full ${barColor} transition-all duration-300`}
            style={{ width: `${expensePercentage}%` }}
          />
        </div>
      </div>
    </section>
  )
}
