import { formatRupiah } from '../utils/currency'
import { useChangeKey, useCountUp } from '../utils/motion'

interface BalanceCardsProps {
  totalIncome: number   // Sesuai filter scope (Bulan ini / Semua)
  totalExpense: number  // Sesuai filter scope (Bulan ini / Semua)
  budgetExpense?: number // Pengeluaran yang dihitung untuk batas budget (setelah pengecualian jika aktif)
  realBalance: number   // FIX: Total sisa uang kas riil di dompet saat ini
  budgetLimit?: number  // Batas anggaran bulanan (Hari 11)
  onAdjustBalance?: () => void
  onOpenBudget?: () => void // Buka modal pengaturan budget (Hari 11)
  onResetExpense?: () => void // Buka modal reset/kelola pengeluaran bulan ini
}

export default function BalanceCards({
  totalIncome,
  totalExpense,
  budgetExpense,
  realBalance,
  budgetLimit = 2500000,
  onAdjustBalance,
  onOpenBudget,
  onResetExpense,
}: BalanceCardsProps) {
  // Papan skor: nilai bergulir dari angka lama, animasi hanya saat berubah
  const shownIncome = useCountUp(totalIncome, 480)
  const shownExpense = useCountUp(totalExpense, 480)
  const shownBalance = useCountUp(realBalance, 680)

  const incomeKey = useChangeKey(totalIncome)
  const expenseKey = useChangeKey(totalExpense)
  const balanceKey = useChangeKey(realBalance)

  // Kalkulasi Rasio HP / Pemakaian Anggaran Bulanan (Hari 11)
  const activeBudget = budgetLimit > 0 ? budgetLimit : 2500000
  const effectiveExpense = budgetExpense !== undefined ? budgetExpense : totalExpense
  const expensePercentage = Math.round((effectiveExpense / activeBudget) * 100)
  const remainingBudget = activeBudget - effectiveExpense
  const isOverBudget = remainingBudget < 0
  const isNearLimit = expensePercentage >= 80 && !isOverBudget

  // Status RPG Berdasarkan Persentase Pemakaian Anggaran
  let statusText = 'DOMPET SEHAT 💚'
  let barColor = 'bg-[var(--theme-income-fill)]'
  let statusColor = 'text-[var(--theme-income)]'

  if (isOverBudget) {
    statusText = 'OVER BUDGET! 💀'
    barColor = 'bg-red-600'
    statusColor = 'text-red-600'
  } else if (expensePercentage >= 80) {
    statusText = 'HAMPIR HABIS 🚨'
    barColor = 'bg-orange-500'
    statusColor = 'text-orange-600'
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
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-retro text-label font-bold tracking-[0.12em] text-[var(--theme-text)]">
                PENGELUARAN
              </p>
              <p className="mt-1 text-meta text-[var(--theme-text-muted)]">
                Total beban periode ini
              </p>
            </div>
            {onResetExpense && (
              <button
                type="button"
                onClick={onResetExpense}
                className="pixel-button shrink-0 flex items-center gap-1.5 border-2 border-black bg-white px-2.5 py-1 font-retro text-label font-bold text-black hover:bg-[var(--theme-card-subtle)] cursor-pointer shadow-[2px_2px_0px_#000]"
                title="Kelola atau Reset Pengeluaran Bulan Ini"
              >
                <span aria-hidden="true">🔄</span>
                <span>RESET</span>
              </button>
            )}
          </div>

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

      {/* Indikator RPG Health Bar Keuangan vs Batas Anggaran (Hari 11) */}
      <div className="pixel-box flex flex-col gap-3 bg-[var(--theme-card)] p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl leading-none" aria-hidden="true">
              ❤️
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-retro text-label font-bold tracking-[0.12em] text-[var(--theme-text-muted)]">
                  DAYA TAHAN KAS (EXP / HP BAR)
                </p>
                {onOpenBudget && (
                  <button
                    type="button"
                    onClick={onOpenBudget}
                    className="pixel-button cursor-pointer border border-black bg-[var(--theme-gold)] px-2 py-0.5 font-retro text-label font-bold text-black shadow-[1px_1px_0px_#000] hover:bg-[var(--theme-gold-hover)]"
                    title="Ubah Batas Anggaran Bulanan"
                  >
                    🎯 ATUR BUDGET
                  </button>
                )}
              </div>
              <p className={`mt-0.5 font-retro text-body font-bold ${statusColor}`}>
                {statusText}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-0.5 sm:items-end">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-mono text-meta font-bold tabular-nums text-[var(--theme-text)]">
                {formatRupiah(effectiveExpense)} / {formatRupiah(activeBudget)}
              </span>
              {budgetExpense !== undefined && budgetExpense !== totalExpense && (
                <span
                  className="border border-black bg-emerald-100 px-1 py-0.2 font-retro text-label text-emerald-800"
                  title="Pengeluaran penyesuaian/koreksi saldo dikecualikan dari batas anggaran"
                >
                  Koreksi Dikecualikan
                </span>
              )}
            </div>
            <span className="font-mono text-label tabular-nums text-[var(--theme-text-muted)]">
              {expensePercentage}% terpakai •{' '}
              {isOverBudget
                ? `Kelebihan ${formatRupiah(Math.abs(remainingBudget))}`
                : `Sisa ${formatRupiah(remainingBudget)}`}
            </span>
          </div>
        </div>

        {/* HP Bar Pixel */}
        <div className="h-4 w-full overflow-hidden border-2 border-[var(--theme-border)] bg-[var(--theme-card-subtle)] p-0.5">
          <div
            className={`h-full ${barColor} motion-health-fill`}
            style={{ transform: `scaleX(${Math.min(1, expensePercentage / 100)})` }}
          />
        </div>

        {/* Alert Banner Retro jika Over Budget atau Mendekati Batas */}
        {isOverBudget && (
          <div
            role="alert"
            className="flex items-center gap-2.5 border-2 border-red-600 bg-red-50 p-2.5 text-meta text-red-900"
          >
            <span className="shrink-0 text-lg leading-none" aria-hidden="true">
              💀
            </span>
            <p className="font-sans font-medium leading-tight">
              <strong>STATUS KRITIS:</strong> Pengeluaran telah melampaui batas anggaran bulanan sebesar{' '}
              <span className="font-mono font-bold text-red-700">
                {formatRupiah(Math.abs(remainingBudget))}
              </span>
              . Segera tinjau pos pengeluaran atau sesuaikan batas anggaranmu.
            </p>
          </div>
        )}

        {isNearLimit && (
          <div
            role="alert"
            className="flex items-center gap-2.5 border-2 border-amber-500 bg-amber-50 p-2.5 text-meta text-amber-900"
          >
            <span className="shrink-0 text-lg leading-none" aria-hidden="true">
              ⚠️
            </span>
            <p className="font-sans font-medium leading-tight">
              <strong>PERINGATAN ANGGARAN:</strong> Pengeluaran bulan ini sudah mencapai{' '}
              <span className="font-mono font-bold">{expensePercentage}%</span> dari batas. Sisa
              anggaran aman:{' '}
              <span className="font-mono font-bold text-amber-800">
                {formatRupiah(remainingBudget)}
              </span>
              .
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
