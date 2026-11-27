import type { CSSProperties } from 'react'
import { getBudgetHealth } from '../utils/analytics'
import { formatRupiah } from '../utils/currency'
import { useChangeKey, useCountUp, useIncreaseKey } from '../utils/motion'
import {
  PixelCoinIcon,
  PixelHeartIcon,
  PixelResetIcon,
  PixelScaleIcon,
  PixelSkullIcon,
  PixelTargetIcon,
  PixelWarnIcon,
} from './PixelIcons'

interface BalanceCardsProps {
  totalIncome: number
  totalExpense: number
  budgetExpense?: number
  realBalance: number
  budgetLimit?: number
  onAdjustBalance?: () => void
  onOpenBudget?: () => void
  onResetExpense?: () => void
}

const COIN_SPARKS: ReadonlyArray<{ dx: string; dy: string; gold: boolean }> = [
  { dx: '-28px', dy: '-22px', gold: true },
  { dx: '-10px', dy: '-30px', gold: false },
  { dx: '12px', dy: '-26px', gold: true },
  { dx: '28px', dy: '-18px', gold: false },
  { dx: '-20px', dy: '14px', gold: false },
  { dx: '22px', dy: '12px', gold: true },
]

export default function BalanceCards({
  totalIncome,
  totalExpense,
  budgetExpense,
  realBalance,
  budgetLimit = 1500000,
  onAdjustBalance,
  onOpenBudget,
  onResetExpense,
}: BalanceCardsProps) {
  const shownIncome = useCountUp(totalIncome, 480)
  const shownExpense = useCountUp(totalExpense, 480)
  const shownBalance = useCountUp(realBalance, 680)

  const incomeKey = useChangeKey(totalIncome)
  const expenseKey = useChangeKey(totalExpense)
  const balanceKey = useChangeKey(realBalance)

  const effectiveExpense = budgetExpense !== undefined ? budgetExpense : totalExpense
  const incomeBoostKey = useIncreaseKey(realBalance)
  const expenseHitKey = useIncreaseKey(effectiveExpense)

  const health = getBudgetHealth(effectiveExpense, budgetLimit)
  const isOverBudget = health.status === 'over'
  const isNearLimit = health.status === 'critical'

  let barColor = 'bg-[var(--theme-income-fill)]'
  let statusColor = 'text-[var(--theme-income)]'

  if (health.status === 'over') {
    barColor = 'bg-[var(--theme-expense)]'
    statusColor = 'text-[var(--theme-expense-text)]'
  } else if (health.status === 'critical') {
    barColor = 'bg-orange-600'
    statusColor = 'text-orange-700'
  } else if (health.status === 'warning') {
    barColor = 'bg-[var(--theme-gold)]'
    statusColor = 'text-[var(--theme-gold-text)]'
  }

  return (
    <section className="flex flex-col gap-5">
      {/* 3 Kartu Ringkasan: hero kartrid 2-step diapit tile 1-step pemasukan & pengeluaran */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)_minmax(0,1fr)] lg:items-stretch">
        {/* Card 1: Total Uang Masuk */}
        <article className="pixel-notch order-2 flex flex-col justify-between gap-5 bg-[var(--theme-income-surface)] p-4 sm:p-5 lg:order-1">
          <div>
            <h3 className="flex items-center gap-2 font-retro text-label font-bold tracking-normal text-[var(--theme-text)]">
              <span
                aria-hidden="true"
                className="inline-block h-2.5 w-2.5 shrink-0 border border-[var(--theme-border)] bg-[var(--theme-income)]"
              />
              <span>UANG MASUK</span>
            </h3>
            <p className="mt-1 text-meta leading-normal text-[var(--theme-text-muted)]">
              Total masuk periode ini
            </p>
          </div>

          <p
            key={`income-${incomeKey}`}
            className={`break-words font-mono text-data font-bold tabular-nums text-[var(--theme-income)] sm:text-display ${
              incomeKey > 0 ? 'motion-pop' : ''
            }`}
          >
            {formatRupiah(shownIncome)}
          </p>
        </article>

        {/* Card 2: Sisa Saldo Kas — HERO CARTRIDGE dengan 2-step pixel curve & percikan koin */}
        <article className="pixel-hero-cartridge relative order-1 flex flex-col justify-between gap-5 overflow-hidden bg-[var(--theme-gold)] p-5 sm:p-6 lg:order-2">
          {/* Decorative Pixel Coin Watermark */}
          <span
            key={`coin-${balanceKey}`}
            className={`pointer-events-none absolute -bottom-3 -right-2 z-0 select-none opacity-15 ${
              balanceKey > 0 ? 'motion-coin' : ''
            }`}
            aria-hidden="true"
          >
            <PixelCoinIcon className="h-20 w-20 text-black" />
          </span>

          {/* Overdrive: Percikan piksel koin saat saldo bertambah */}
          {incomeBoostKey > 0 && (
            <div
              key={`sparks-${incomeBoostKey}`}
              aria-hidden="true"
              className="pointer-events-none absolute right-14 top-12 z-20"
            >
              {COIN_SPARKS.map((spark, i) => (
                <span
                  key={i}
                  style={
                    {
                      '--dx': spark.dx,
                      '--dy': spark.dy,
                      animationDelay: `${i * 25}ms`,
                    } as CSSProperties
                  }
                  className={`motion-spark absolute h-1.5 w-1.5 border border-[var(--theme-border)] ${
                    spark.gold ? 'bg-[var(--theme-card-gold)]' : 'bg-white'
                  }`}
                />
              ))}
            </div>
          )}

          <div className="relative z-10 flex items-start justify-between gap-2">
            <div>
              <h3 className="font-retro text-label font-bold tracking-normal text-black/80">
                SISA SALDO KAS
              </h3>
              <p className="mt-1 text-meta leading-normal text-black/75">
                Total kas riil seluruh riwayat
              </p>
            </div>
            {onAdjustBalance && (
              <button
                type="button"
                onClick={onAdjustBalance}
                className="pixel-button flex shrink-0 cursor-pointer items-center gap-1.5 bg-[var(--theme-card)] px-2.5 py-1 font-retro text-label font-bold tracking-normal text-[var(--theme-text)] hover:bg-[var(--theme-card-subtle)]"
                title="Atur / Sesuaikan Saldo Riil di Dompet"
              >
                <PixelScaleIcon className="h-3.5 w-3.5" />
                <span>ATUR SALDO</span>
              </button>
            )}
          </div>

          <p
            key={`balance-${balanceKey}`}
            className={`pixel-score-shadow relative z-10 break-words font-mono text-display-lg font-bold tabular-nums text-black sm:text-display-xl ${
              balanceKey > 0 ? 'motion-pop' : ''
            }`}
          >
            {formatRupiah(shownBalance)}
          </p>
        </article>

        {/* Card 3: Total Pengeluaran */}
        <article className="pixel-notch order-3 flex flex-col justify-between gap-5 bg-[var(--theme-expense-surface)] p-4 sm:p-5 lg:order-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="flex items-center gap-2 font-retro text-label font-bold tracking-normal text-[var(--theme-text)]">
                <span
                  aria-hidden="true"
                  className="inline-block h-2.5 w-2.5 shrink-0 border border-[var(--theme-border)] bg-[var(--theme-expense)]"
                />
                <span>PENGELUARAN</span>
              </h3>
              <p className="mt-1 text-meta leading-normal text-[var(--theme-text-muted)]">
                Total beban periode ini
              </p>
            </div>
            {onResetExpense && (
              <button
                type="button"
                onClick={onResetExpense}
                className="pixel-button flex shrink-0 cursor-pointer items-center gap-1.5 bg-[var(--theme-card)] px-2.5 py-1 font-retro text-label font-bold tracking-normal text-[var(--theme-text)] hover:bg-[var(--theme-card-subtle)]"
                title="Kelola atau Reset Pengeluaran Bulan Ini"
              >
                <PixelResetIcon className="h-3.5 w-3.5" />
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

      {/* Indikator RPG HP Bar (Berkurang 100% -> 0% seiring pengeluaran naik) */}
      <div className="pixel-curve flex flex-col gap-3.5 bg-[var(--theme-card)] p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {/* 3 Pip Hati RPG atau Tengkorak saat Over Budget */}
            <div className={`flex shrink-0 items-center gap-1 ${statusColor}`} aria-hidden="true">
              {isOverBudget ? (
                <PixelSkullIcon className="h-6 w-6" />
              ) : (
                [1, 2, 3].map((pip) => (
                  <PixelHeartIcon
                    key={pip}
                    filled={pip <= health.hearts}
                    className="h-5 w-5"
                  />
                ))
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-retro text-label font-bold tracking-normal text-[var(--theme-text-muted)]">
                  SISA HP BUDGET
                </h3>
                {onOpenBudget && (
                  <button
                    type="button"
                    onClick={onOpenBudget}
                    className="pixel-button flex cursor-pointer items-center gap-1 bg-[var(--theme-gold)] px-2.5 py-0.5 font-retro text-label font-bold tracking-normal text-black hover:bg-[var(--theme-gold-hover)]"
                    title="Ubah Batas Anggaran Bulanan"
                  >
                    <PixelTargetIcon className="h-3.5 w-3.5" />
                    <span>ATUR BUDGET</span>
                  </button>
                )}
              </div>
              <p className={`mt-1 font-retro text-meta font-bold leading-normal tracking-normal sm:text-body ${statusColor}`}>
                {health.statusLabel}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-1 sm:items-end">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-meta font-bold tracking-normal tabular-nums text-[var(--theme-text)] sm:text-body">
                {formatRupiah(effectiveExpense)} / {formatRupiah(health.activeBudget)}
              </span>
              {budgetExpense !== undefined && budgetExpense !== totalExpense && (
                <span
                  className="pixel-badge bg-[var(--theme-income-badge)] px-2 py-0.5 font-retro text-label tracking-normal text-[var(--theme-income)]"
                  title="Pengeluaran penyesuaian/koreksi saldo dikecualikan dari batas anggaran"
                >
                  Koreksi Dikecualikan
                </span>
              )}
            </div>
            <span className="font-mono text-label tracking-normal tabular-nums text-[var(--theme-text-muted)] sm:text-meta">
              {isOverBudget ? (
                <>
                  0% HP • Kelebihan {formatRupiah(Math.abs(health.remainingBudget))}
                </>
              ) : (
                <>
                  {health.remainingHpPercentage}% HP tersisa • Sisa{' '}
                  {formatRupiah(health.remainingBudget)}
                </>
              )}
            </span>
          </div>
        </div>

        {/* HP Bar Piksel 10-Segmen (Berkurang 100% -> 0%) */}
        <div
          key={expenseHitKey > 0 ? `hp-hit-${expenseHitKey}` : 'hp-rest'}
          role="progressbar"
          aria-label="Sisa HP anggaran bulanan"
          aria-valuenow={health.remainingHpPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          className={`pixel-meter relative h-5 w-full overflow-hidden p-0.5 ${
            isOverBudget ? 'bg-[var(--theme-expense-surface)]' : 'bg-[var(--theme-card-subtle)]'
          } ${expenseHitKey > 0 ? 'motion-hp-hit' : ''}`}
        >
          <div
            className={`pixel-bar-fill motion-health-fill h-full w-full ${barColor}`}
            style={{ transform: `scaleX(${health.remainingHpPercentage / 100})` }}
          />
          <div
            aria-hidden="true"
            className="pixel-gauge-grid pointer-events-none absolute inset-0"
          />
        </div>

        {/* Alert Banner Retro (tetap datar tanpa nested card) */}
        {isOverBudget && (
          <div
            role="alert"
            className="flex items-center gap-2.5 border-t border-[var(--theme-expense)] pt-2.5 text-meta text-[var(--theme-expense-text)]"
          >
            <PixelSkullIcon className="h-5 w-5 shrink-0" />
            <p className="font-sans font-medium leading-normal">
              <strong>STATUS KRITIS:</strong> Pengeluaran telah melampaui batas anggaran bulanan sebesar{' '}
              <span className="font-mono font-bold">
                {formatRupiah(Math.abs(health.remainingBudget))}
              </span>
              . Segera tinjau pos pengeluaran atau sesuaikan batas anggaranmu.
            </p>
          </div>
        )}

        {isNearLimit && (
          <div
            role="alert"
            className="flex items-center gap-2.5 border-t border-[var(--theme-gold)] pt-2.5 text-meta text-[var(--theme-gold-text)]"
          >
            <PixelWarnIcon className="h-5 w-5 shrink-0" />
            <p className="font-sans font-medium leading-normal">
              <strong>PERINGATAN ANGGARAN:</strong> HP budget tersisa{' '}
              <span className="font-mono font-bold">{health.remainingHpPercentage}%</span> (
              <span className="font-mono font-bold">{health.usedPercentage}%</span> terpakai). Sisa
              anggaran aman:{' '}
              <span className="font-mono font-bold">
                {formatRupiah(health.remainingBudget)}
              </span>
              .
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
