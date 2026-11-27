import { useMemo } from 'react'
import type { Transaction } from '../types/finance'
import {
  getCategoryBreakdown,
  getDayOfWeekBreakdown,
  isActiveExpense,
} from '../utils/analytics'
import { formatRupiah } from '../utils/currency'
import { MONTH_NAMES } from '../utils/date'
import type { ViewScope } from './PeriodNavigator'
import {
  PixelArrowIcon,
  PixelCalendarIcon,
  PixelChartIcon,
  PixelFlameIcon,
  PixelGlobeIcon,
} from './PixelIcons'

interface AnalyticsViewProps {
  transactions: Transaction[]
  budgetLimit: number
  selectedYear: number
  selectedMonth: number
  viewScope: ViewScope
  onPrevMonth: () => void
  onNextMonth: () => void
  onToggleViewScope: (scope: ViewScope) => void
}

export default function AnalyticsView({
  transactions,
  budgetLimit,
  selectedYear,
  selectedMonth,
  viewScope,
  onPrevMonth,
  onNextMonth,
  onToggleViewScope,
}: AnalyticsViewProps) {
  const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`
  const periodLabel =
    viewScope === 'month'
      ? `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`
      : 'Semua Riwayat'

  const scopedTransactions = useMemo(
    () =>
      viewScope === 'month'
        ? transactions.filter((tx) => tx.date.startsWith(monthPrefix))
        : transactions,
    [transactions, viewScope, monthPrefix]
  )

  const totalIncome = useMemo(
    () =>
      scopedTransactions
        .filter((tx) => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0),
    [scopedTransactions]
  )

  const activeExpenses = useMemo(
    () => scopedTransactions.filter(isActiveExpense),
    [scopedTransactions]
  )

  const totalExpense = useMemo(
    () => activeExpenses.reduce((sum, tx) => sum + tx.amount, 0),
    [activeExpenses]
  )

  const netFlow = totalIncome - totalExpense
  const savingsRate =
    totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : null

  const uniqueExpenseDays = useMemo(() => {
    const dates = new Set(activeExpenses.map((tx) => tx.date))
    return dates.size
  }, [activeExpenses])

  const avgPerActiveDay =
    uniqueExpenseDays > 0 ? Math.round(totalExpense / uniqueExpenseDays) : 0

  const categoryBreakdown = useMemo(
    () => getCategoryBreakdown(scopedTransactions),
    [scopedTransactions]
  )

  const dayBreakdown = useMemo(
    () => getDayOfWeekBreakdown(scopedTransactions),
    [scopedTransactions]
  )

  const maxDayTotal = useMemo(
    () => dayBreakdown.reduce((max, d) => Math.max(max, d.total), 0),
    [dayBreakdown]
  )

  const topCategory = categoryBreakdown[0] ?? null
  const budgetUsagePct =
    budgetLimit > 0 ? Math.round((totalExpense / budgetLimit) * 100) : 0

  return (
    <div className="flex flex-col gap-7">
      {/* Header Bagian Analisis & Pengendali Periode */}
      <section
        aria-labelledby="analytics-heading"
        className="flex flex-col gap-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2
              id="analytics-heading"
              className="font-retro text-display font-bold text-[var(--theme-text)] sm:text-2xl"
            >
              <span
                className="mr-2 inline-block h-2.5 w-2.5 border border-[var(--theme-border)] bg-[var(--theme-gold)] align-middle"
                aria-hidden="true"
              />
              Analisis Keuangan
            </h2>
            <p className="mt-1 font-sans text-meta leading-normal text-[var(--theme-text-muted)]">
              Ringkasan distribusi pengeluaran dan pola transaksi untuk periode{' '}
              <strong className="text-[var(--theme-text)]">{periodLabel}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Switch Bulan Ini vs Semua Waktu */}
            <div
              className="pixel-segment inline-flex divide-x-2 divide-[var(--theme-border)]"
              role="group"
              aria-label="Filter periode analisis"
            >
              <button
                type="button"
                onClick={() => onToggleViewScope('month')}
                aria-pressed={viewScope === 'month'}
                className={`inline-flex cursor-pointer items-center gap-1.5 px-3 py-1.5 font-retro text-label font-bold tracking-normal transition-colors ${
                  viewScope === 'month'
                    ? 'bg-[var(--theme-gold)] text-black'
                    : 'bg-[var(--theme-card)] text-[var(--theme-text-muted)] hover:bg-[var(--theme-card-subtle)] hover:text-[var(--theme-text)]'
                }`}
              >
                <PixelCalendarIcon className="h-3.5 w-3.5" />
                <span>BULAN INI</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleViewScope('all')}
                aria-pressed={viewScope === 'all'}
                className={`inline-flex cursor-pointer items-center gap-1.5 px-3 py-1.5 font-retro text-label font-bold tracking-normal transition-colors ${
                  viewScope === 'all'
                    ? 'bg-[var(--theme-gold)] text-black'
                    : 'bg-[var(--theme-card)] text-[var(--theme-text-muted)] hover:bg-[var(--theme-card-subtle)] hover:text-[var(--theme-text)]'
                }`}
              >
                <PixelGlobeIcon className="h-3.5 w-3.5" />
                <span>SEMUA WAKTU</span>
              </button>
            </div>

            {viewScope === 'month' && (
              <div className="inline-flex items-center gap-2">
                <button
                  type="button"
                  onClick={onPrevMonth}
                  aria-label="Bulan sebelumnya"
                  title="Bulan sebelumnya"
                  className="pixel-button flex h-8 w-8 cursor-pointer items-center justify-center bg-[var(--theme-card)] font-retro text-meta font-bold text-[var(--theme-gold-text)] hover:bg-[var(--theme-card-gold)]"
                >
                  <PixelArrowIcon direction="left" className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-[104px] text-center font-retro text-label font-bold tracking-normal text-[var(--theme-text)]">
                  {MONTH_NAMES[selectedMonth - 1].slice(0, 3).toUpperCase()} {selectedYear}
                </span>
                <button
                  type="button"
                  onClick={onNextMonth}
                  aria-label="Bulan berikutnya"
                  title="Bulan berikutnya"
                  className="pixel-button flex h-8 w-8 cursor-pointer items-center justify-center bg-[var(--theme-card)] font-retro text-meta font-bold text-[var(--theme-gold-text)] hover:bg-[var(--theme-card-gold)]"
                >
                  <PixelArrowIcon direction="right" className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3 Kartu Statistik Kunci */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Kartu 1: Arus Kas Bersih */}
          <article className="pixel-notch flex flex-col justify-between gap-3 bg-[var(--theme-card)] p-4 sm:p-5">
            <div>
              <h3 className="font-retro text-label font-bold tracking-normal text-[var(--theme-text-muted)]">
                ARUS KAS BERSIH
              </h3>
              <p
                className={`mt-2 break-words font-mono text-display font-bold tabular-nums ${
                  netFlow >= 0 ? 'text-[var(--theme-income)]' : 'text-[var(--theme-expense-text)]'
                }`}
              >
                {netFlow >= 0 ? '+' : '-'} {formatRupiah(Math.abs(netFlow))}
              </p>
            </div>
            <p className="border-t border-[var(--theme-border-subtle)] pt-2 font-sans text-meta leading-normal text-[var(--theme-text-muted)]">
              {savingsRate !== null ? (
                <>
                  Rasio simpan:{' '}
                  <strong className="font-mono tabular-nums text-[var(--theme-text)]">
                    {savingsRate}%
                  </strong>{' '}
                  dari pemasukan
                </>
              ) : (
                'Belum ada pemasukan tercatat di periode ini.'
              )}
            </p>
          </article>

          {/* Kartu 2: Rata-rata Harian */}
          <article className="pixel-notch flex flex-col justify-between gap-3 bg-[var(--theme-card)] p-4 sm:p-5">
            <div>
              <h3 className="font-retro text-label font-bold tracking-normal text-[var(--theme-text-muted)]">
                RATA-RATA / HARI AKTIF
              </h3>
              <p className="mt-2 break-words font-mono text-display font-bold tabular-nums text-[var(--theme-text)]">
                {formatRupiah(avgPerActiveDay)}
              </p>
            </div>
            <p className="border-t border-[var(--theme-border-subtle)] pt-2 font-sans text-meta leading-normal text-[var(--theme-text-muted)]">
              {uniqueExpenseDays > 0 ? (
                <>
                  Tersebar di{' '}
                  <strong className="font-mono tabular-nums text-[var(--theme-text)]">
                    {uniqueExpenseDays} hari
                  </strong>{' '}
                  ({activeExpenses.length} transaksi keluar)
                </>
              ) : (
                'Belum ada transaksi pengeluaran aktif.'
              )}
            </p>
          </article>

          {/* Kartu 3: Pos Pengeluaran Terbesar */}
          <article className="pixel-notch flex flex-col justify-between gap-3 bg-[var(--theme-gold-surface)] p-4 sm:p-5">
            <div>
              <h3 className="font-retro text-label font-bold tracking-normal text-[var(--theme-gold-text)]">
                POS PENGELUARAN TERBESAR
              </h3>
              {topCategory ? (
                <div className="mt-2">
                  <p className="truncate font-sans text-body font-bold text-[var(--theme-text)]">
                    <span className="mr-1.5" aria-hidden="true">
                      {topCategory.icon}
                    </span>
                    {topCategory.category}
                  </p>
                  <p className="mt-0.5 font-mono text-data font-bold tabular-nums text-[var(--theme-expense-text)]">
                    {formatRupiah(topCategory.total)}
                  </p>
                </div>
              ) : (
                <p className="mt-2 font-mono text-data font-bold text-[var(--theme-text-muted)]">
                  —
                </p>
              )}
            </div>
            <p className="border-t border-[var(--theme-border-subtle-warm)] pt-2 font-sans text-meta leading-normal text-[var(--theme-text-muted-warm)]">
              {topCategory ? (
                <>
                  Menyerap{' '}
                  <strong className="font-mono tabular-nums text-[var(--theme-text)]">
                    {topCategory.percentage}%
                  </strong>{' '}
                  total beban ({budgetUsagePct}% dari batas budget)
                </>
              ) : (
                'Catat pengeluaran untuk melihat kategori dominan.'
              )}
            </p>
          </article>
        </div>
      </section>

      {/* Grid Utama: Distribusi Kategori & Pola Hari */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Panel 1: Distribusi Pengeluaran per Kategori */}
        <article className="pixel-curve flex flex-col bg-[var(--theme-card)] p-4 sm:p-5">
          <div className="flex items-baseline justify-between gap-2 border-b-2 border-[var(--theme-border-subtle)] pb-3">
            <div>
              <h3 className="font-retro text-data font-bold tracking-normal text-[var(--theme-text)]">
                DISTRIBUSI KATEGORI
              </h3>
              <p className="mt-0.5 font-sans text-meta leading-normal text-[var(--theme-text-muted)]">
                Urutan dari pos pengeluaran paling besar
              </p>
            </div>
            <span className="shrink-0 font-mono text-meta font-bold tabular-nums text-[var(--theme-expense-text)]">
              {formatRupiah(totalExpense)}
            </span>
          </div>

          {categoryBreakdown.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
              <PixelChartIcon className="h-8 w-8 text-[var(--theme-text-muted)]" />
              <p className="mt-2 font-sans text-body font-bold text-[var(--theme-text)]">
                Belum ada data pengeluaran aktif
              </p>
              <p className="mt-1 max-w-xs font-sans text-meta leading-normal text-[var(--theme-text-muted)]">
                Transaksi pengeluaran pada periode {periodLabel} akan otomatis dikelompokkan per
                kategori di sini.
              </p>
            </div>
          ) : (
            <div
              key={`cat-${periodLabel}`}
              className="mt-2 flex flex-col divide-y divide-[var(--theme-border-subtle)]"
            >
              {categoryBreakdown.map((item, index) => (
                <div key={item.category} className="flex flex-col gap-1.5 py-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="text-base leading-none" aria-hidden="true">
                        {item.icon}
                      </span>
                      <span className="truncate font-sans text-body font-bold text-[var(--theme-text)]">
                        {item.category}
                      </span>
                      <span className="shrink-0 font-mono text-label tracking-normal text-[var(--theme-text-muted)]">
                        ({item.count}x)
                      </span>
                    </div>
                    <div className="flex shrink-0 items-baseline gap-2">
                      <span className="font-mono text-label font-bold tracking-normal tabular-nums text-[var(--theme-text-muted)]">
                        {item.percentage}%
                      </span>
                      <span className="font-mono text-body font-bold tabular-nums text-[var(--theme-expense-text)]">
                        {formatRupiah(item.total)}
                      </span>
                    </div>
                  </div>

                  {/* Bar Persentase Piksel 10-Segmen */}
                  <div
                    role="progressbar"
                    aria-label={`Porsi pengeluaran kategori ${item.category}`}
                    aria-valuenow={item.percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="pixel-meter relative h-4 w-full overflow-hidden bg-[var(--theme-card-subtle)] p-0.5"
                  >
                    <div
                      className="h-full"
                      style={{ width: `${Math.max(4, item.percentage)}%` }}
                    >
                      <div
                        className={`pixel-bar-fill motion-bar-grow h-full w-full ${
                          index === 0 ? 'bg-[var(--theme-expense)]' : 'bg-[var(--theme-gold)]'
                        }`}
                        style={{ animationDelay: `${Math.min(index * 40, 240)}ms` }}
                      />
                    </div>
                    <div
                      aria-hidden="true"
                      className="pixel-gauge-grid pointer-events-none absolute inset-0"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        {/* Panel 2: Pola Pengeluaran per Hari (Minggu - Sabtu) */}
        <article className="pixel-curve flex flex-col bg-[var(--theme-card)] p-4 sm:p-5">
          <div className="flex items-baseline justify-between gap-2 border-b-2 border-[var(--theme-border-subtle)] pb-3">
            <div>
              <h3 className="font-retro text-data font-bold tracking-normal text-[var(--theme-text)]">
                POLA BELANJA HARIAN
              </h3>
              <p className="mt-0.5 font-sans text-meta leading-normal text-[var(--theme-text-muted)]">
                Akumulasi pengeluaran per hari (Minggu s/d Sabtu)
              </p>
            </div>
            <span className="shrink-0 font-mono text-label tracking-normal text-[var(--theme-text-muted)]">
              7 Hari
            </span>
          </div>

          <div
            key={`days-${periodLabel}`}
            className="mt-3 flex flex-1 flex-col justify-between gap-3"
          >
            {dayBreakdown.map((day, index) => {
              const widthPct =
                maxDayTotal > 0 ? Math.round((day.total / maxDayTotal) * 100) : 0

              return (
                <div key={day.dayIndex} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-16 font-retro text-label font-bold tracking-normal ${
                          day.isHighest
                            ? 'text-[var(--theme-expense-text)]'
                            : 'text-[var(--theme-text)]'
                        }`}
                      >
                        {day.dayName.toUpperCase()}
                      </span>
                      {day.isHighest && (
                        <span className="pixel-badge inline-flex items-center gap-1 bg-[var(--theme-expense)] px-1.5 py-0.5 font-retro text-label font-bold leading-none tracking-normal text-white">
                          <PixelFlameIcon className="h-3 w-3" />
                          <span>TERTINGGI</span>
                        </span>
                      )}
                    </div>
                    <span
                      className={`font-mono text-meta font-bold tabular-nums ${
                        day.total > 0
                          ? 'text-[var(--theme-text)]'
                          : 'text-[var(--theme-text-muted)]'
                      }`}
                    >
                      {formatRupiah(day.total)}
                    </span>
                  </div>

                  <div
                    role="progressbar"
                    aria-label={`Pengeluaran hari ${day.dayName}`}
                    aria-valuenow={widthPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="pixel-meter relative h-4 w-full overflow-hidden bg-[var(--theme-card-subtle)] p-0.5"
                  >
                    {day.total > 0 && (
                      <div
                        className="h-full"
                        style={{ width: `${Math.max(4, widthPct)}%` }}
                      >
                        <div
                          className={`pixel-bar-fill motion-bar-grow h-full w-full ${
                            day.isHighest ? 'bg-[var(--theme-expense)]' : 'bg-[var(--theme-gold)]'
                          }`}
                          style={{ animationDelay: `${Math.min(index * 40, 240)}ms` }}
                        />
                      </div>
                    )}
                    <div
                      aria-hidden="true"
                      className="pixel-gauge-grid pointer-events-none absolute inset-0"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </article>
      </section>
    </div>
  )
}
