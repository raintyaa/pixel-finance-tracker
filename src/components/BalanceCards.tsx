import { formatRupiah } from '../utils/currency'
import { useChangeKey, useCountUp } from '../utils/motion'

interface BalanceCardsProps {
  totalIncome: number   // Sesuai filter scope (Bulan ini / Semua)
  totalExpense: number  // Sesuai filter scope (Bulan ini / Semua)
  realBalance: number   // FIX: Total sisa uang kas riil di dompet saat ini
  onAdjustBalance?: () => void
}

export default function BalanceCards({
  totalIncome,
  totalExpense,
  realBalance,
  onAdjustBalance,
}: BalanceCardsProps) {
  // Papan skor: nilai bergulir dari angka lama, animasi hanya saat berubah
  const shownIncome = useCountUp(totalIncome, 480)
  const shownExpense = useCountUp(totalExpense, 480)
  const shownBalance = useCountUp(realBalance, 680)

  const incomeKey = useChangeKey(totalIncome)
  const expenseKey = useChangeKey(totalExpense)
  const balanceKey = useChangeKey(realBalance)

  // Kalkulasi Rasio HP / Daya Tahan Keuangan periode ini
  const expensePercentage =
    totalIncome > 0
      ? Math.min(100, Math.round((totalExpense / totalIncome) * 100))
      : totalExpense > 0
      ? 100
      : 0

  // Status RPG Berdasarkan Persentase Pengeluaran
  let statusText = 'DOMPET SEHAT 💚'
  let barColor = 'bg-[var(--theme-income-fill)]'
  let statusColor = 'text-[var(--theme-income)]'

  if (expensePercentage >= 80) {
    statusText = 'STATUS KRITIS! 🚨'
    barColor = 'bg-[var(--theme-expense)]'
    statusColor = 'text-[var(--theme-expense-text)]'
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
        <article className="pixel-box order-2 flex flex-col justify-between gap-5 bg-[var(--theme-income-surface)] p-4 sm:p-5 lg:order-1">
          <p className="font-retro text-label font-bold tracking-[0.12em] text-[var(--theme-text)]">
            UANG MASUK
          </p>

          <p
            key={`income-${incomeKey}`}
            className={`break-words font-mono text-data font-bold tabular-nums text-[var(--theme-income)] sm:text-display ${
              incomeKey > 0 ? 'motion-pop' : ''
            }`}
          >
            {formatRupiah(shownIncome)}
          </p>
        </article>

        {/* Card 2: Sisa Saldo Kas — HERO CARD dengan aksen emas */}
        <article className="pixel-box relative order-1 flex flex-col justify-between gap-5 overflow-hidden bg-[var(--theme-gold)] p-5 sm:p-6 lg:order-2">
          {/* Decorative Coin — diposisikan di kanan bawah agar tidak menutupi tombol ATUR SALDO di kanan atas */}
          <span
            key={`coin-${balanceKey}`}
            className={`pointer-events-none absolute -bottom-4 -right-2 select-none text-7xl opacity-15 z-0 ${
              balanceKey > 0 ? 'motion-coin' : ''
            }`}
            aria-hidden="true"
          >
            🪙
          </span>

          <div className="relative z-10 flex items-start justify-between gap-2">
            <div>
              <p className="font-retro text-label font-bold tracking-[0.12em] text-black/70">
                SISA SALDO KAS
              </p>
              <p className="mt-1 text-meta text-black/70">
                Total kas riil seluruh riwayat
              </p>
            </div>
            {onAdjustBalance && (
              <button
                type="button"
                onClick={onAdjustBalance}
                className="pixel-button shrink-0 flex items-center gap-1.5 border-2 border-black bg-white px-2.5 py-1 font-retro text-label font-bold text-black hover:bg-[var(--theme-card-subtle)] cursor-pointer shadow-[2px_2px_0px_#000]"
                title="Atur / Sesuaikan Saldo Riil di Dompet"
              >
                <span aria-hidden="true">⚖️</span>
                <span>ATUR SALDO</span>
              </button>
            )}
          </div>

          <p
            key={`balance-${balanceKey}`}
            className={`relative z-10 break-words font-mono text-display-lg font-bold tabular-nums text-black sm:text-display-xl ${
              balanceKey > 0 ? 'motion-pop' : ''
            }`}
          >
            {formatRupiah(shownBalance)}
          </p>
        </article>

        {/* Card 3: Total Pengeluaran */}
        <article className="pixel-box order-3 flex flex-col justify-between gap-5 bg-[var(--theme-expense-surface)] p-4 sm:p-5 lg:order-3">
          <p className="font-retro text-label font-bold tracking-[0.12em] text-[var(--theme-text)]">
            PENGELUARAN
          </p>

          <p
            key={`expense-${expenseKey}`}
            className={`break-words font-mono text-data font-bold tabular-nums text-[var(--theme-expense-text)] sm:text-display ${
              expenseKey > 0 ? 'motion-pop' : ''
            }`}
          >
            {formatRupiah(shownExpense)}
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
              <p className="font-retro text-label font-bold tracking-[0.12em] text-[var(--theme-text-muted)]">
                DAYA TAHAN KAS
              </p>
              <p className={`mt-0.5 font-retro text-body font-bold ${statusColor}`}>
                {statusText}
              </p>
            </div>
          </div>

          <span className="font-mono text-meta tabular-nums text-[var(--theme-text-muted)]">
            {expensePercentage}% terpakai
          </span>
        </div>

        {/* HP Bar Pixel */}
        <div className="mt-3 h-4 w-full border-2 border-[var(--theme-border)] bg-[var(--theme-card-subtle)] p-0.5">
          <div
            className={`h-full ${barColor} motion-health-fill`}
            style={{ transform: `scaleX(${expensePercentage / 100})` }}
          />
        </div>
      </div>
    </section>
  )
}
