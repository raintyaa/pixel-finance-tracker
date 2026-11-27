import type { Transaction } from '../types/finance'
import { isActiveExpense } from '../utils/analytics'
import { formatRupiah } from '../utils/currency'
import { DAYS_OF_WEEK, MONTH_NAMES, getTodayDateString, type WeekInfo } from '../utils/date'
import {
  PixelEditIcon,
  PixelFlameIcon,
  PixelPlusIcon,
  PixelTrashIcon,
} from './PixelIcons'

interface WeeklyTableProps {
  weekInfo: WeekInfo
  transactions: Transaction[]
  // Transaksi yang baru dicatat/diubah — barisnya diberi cap emas sekali
  highlightId?: string | null
  highlightTick?: number
  onEditTransaction: (tx: Transaction) => void
  onDeleteTransaction: (tx: Transaction) => void
  onQuickAddDate?: (dateIso: string) => void
}

export default function WeeklyTable({
  weekInfo,
  transactions,
  highlightId,
  highlightTick,
  onEditTransaction,
  onDeleteTransaction,
  onQuickAddDate,
}: WeeklyTableProps) {
  const todayIso = getTodayDateString()

  // Menghitung tanggal kalender untuk ke-7 hari (Indeks 0 = Minggu s/d 6 = Sabtu)
  const daysData = DAYS_OF_WEEK.map((dayName, dayIndex) => {
    const [year, month, day] = weekInfo.startDate.split('-').map(Number)
    const currentDayDate = new Date(year, month - 1, day + dayIndex)

    const dateIso = `${currentDayDate.getFullYear()}-${String(
      currentDayDate.getMonth() + 1
    ).padStart(2, '0')}-${String(currentDayDate.getDate()).padStart(2, '0')}`

    const dateLabel = `${currentDayDate.getDate()} ${MONTH_NAMES[
      currentDayDate.getMonth()
    ].slice(0, 3)}`

    const dayTransactions = transactions.filter((tx) => tx.date === dateIso)

    const dayIncome = dayTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const dayExpense = dayTransactions
      .filter(isActiveExpense)
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      dayName,
      dayIndex,
      dateIso,
      dateLabel,
      transactions: dayTransactions,
      dayIncome,
      dayExpense,
    }
  })

  const totalWeeklyExpense = daysData.reduce((acc, d) => acc + d.dayExpense, 0)
  const totalWeeklyIncome = daysData.reduce((acc, d) => acc + d.dayIncome, 0)
  const netWeeklyFlow = totalWeeklyIncome - totalWeeklyExpense
  const avgDailyExpense = Math.round(totalWeeklyExpense / 7)
  const maxDailyExpense = daysData.reduce((max, d) => Math.max(max, d.dayExpense), 0)
  const weeklyTransactionCount = daysData.reduce((acc, d) => acc + d.transactions.length, 0)

  return (
    <section className="pixel-curve flex min-w-0 flex-col overflow-hidden bg-[var(--theme-card)]">
      {/* Header Cartridge Tabel Mingguan */}
      <div className="flex flex-col gap-2 border-b-2 border-[var(--theme-border)] bg-[var(--theme-card-subtle)]/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h2 className="font-retro text-data font-bold text-[var(--theme-text)] sm:text-display">
            <span
              className="mr-2 inline-block h-2.5 w-2.5 border border-[var(--theme-border)] bg-[var(--theme-gold)] align-middle"
              aria-hidden="true"
            />
            Aktivitas Mingguan
          </h2>
          <p className="mt-1 font-sans text-meta leading-normal text-[var(--theme-text-muted)]">
            Pekan{' '}
            <span className="font-mono font-bold tabular-nums text-[var(--theme-gold-text)]">
              {weekInfo.weekNumber}
            </span>{' '}
            · {weekInfo.label}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-sans text-meta text-[var(--theme-text-muted)]">
            {weeklyTransactionCount === 0 ? (
              'Belum ada transaksi'
            ) : (
              <>
                <span className="font-mono font-bold tabular-nums text-[var(--theme-text)]">
                  {weeklyTransactionCount}
                </span>{' '}
                transaksi
              </>
            )}
          </span>
          <span className="hidden items-center gap-1 sm:inline-flex" aria-hidden="true">
            <span className="h-1.5 w-1.5 bg-[var(--theme-border)]/45" />
            <span className="h-1.5 w-1.5 bg-[var(--theme-border)]/45" />
            <span className="h-1.5 w-1.5 bg-[var(--theme-border)]/45" />
          </span>
        </div>
      </div>

      {/* Grid 7 Kolom Hari (Minggu s/d Sabtu) */}
      <div className="grid grid-cols-1 divide-y-2 divide-[var(--theme-border)] border-b-2 border-[var(--theme-border)] md:grid-cols-7 md:divide-x-2 md:divide-y-0">
        {daysData.map((day) => {
          const hasTransactions = day.transactions.length > 0
          const isWeekend = day.dayIndex === 0 || day.dayIndex === 6
          const isToday = day.dateIso === todayIso
          const isTinted = isWeekend || isToday
          const isHighestExpense =
            maxDailyExpense > 0 && day.dayExpense === maxDailyExpense && day.dayExpense > 0

          return (
            <div
              key={day.dayIndex}
              style={{ animationDelay: `${day.dayIndex * 28}ms` }}
              className={`group/day motion-rise-in flex min-w-0 flex-col transition-colors ${
                isTinted
                  ? 'tinted-surface bg-[var(--theme-gold-surface)]'
                  : 'bg-[var(--theme-card)]'
              }`}
            >
              {isToday && (
                <div
                  aria-hidden="true"
                  className="h-2 w-full border-b-2 border-[var(--theme-border)] bg-[var(--theme-gold)]"
                />
              )}

              <div
                className={`flex flex-1 flex-col justify-between ${
                  hasTransactions ? 'p-3.5' : 'px-3.5 py-2.5 md:p-3.5'
                }`}
              >
                {/* Header Kolom Hari */}
                <div
                  className={`flex items-center justify-between gap-2 md:block ${
                    hasTransactions
                      ? 'mb-2.5 border-b border-[var(--theme-border-subtle)] pb-2'
                      : 'md:mb-2.5 md:border-b md:border-[var(--theme-border-subtle)] md:pb-2'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className={`font-retro text-label font-bold tracking-normal xl:text-meta ${
                        isWeekend ? 'text-[var(--theme-gold-text)]' : 'text-[var(--theme-text)]'
                      }`}
                    >
                      {day.dayName.toUpperCase()}
                    </span>

                    {/* Quick-Add cepat (+) pada header kolom hari yang sudah terisi */}
                    {hasTransactions && onQuickAddDate && (
                      <button
                        type="button"
                        onClick={() => onQuickAddDate(day.dateIso)}
                        title={`Catat transaksi pada ${day.dayName}, ${day.dateLabel}`}
                        aria-label={`Catat transaksi pada ${day.dayName}, ${day.dateLabel}`}
                        className="pixel-badge inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center bg-[var(--theme-card)] text-[var(--theme-text)] transition-[opacity,background-color] hover:bg-[var(--theme-gold)] hover:text-black md:opacity-0 md:group-hover/day:opacity-100 md:group-focus-within/day:opacity-100"
                      >
                        <PixelPlusIcon className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 md:mt-0.5 md:flex-col md:items-start md:gap-1">
                    <span className="whitespace-nowrap font-mono text-label tabular-nums text-[var(--theme-text-muted)] xl:text-meta">
                      {day.dateLabel}
                    </span>
                    {isToday && (
                      <span className="pixel-badge whitespace-nowrap bg-[var(--theme-gold)] px-1.5 py-0.5 font-retro text-label font-bold leading-none tracking-normal text-black">
                        HARI INI
                      </span>
                    )}
                  </div>

                  {/* Mobile-only strip cepat pada hari kosong (mengurangi scroll jauh) */}
                  {!hasTransactions && onQuickAddDate && (
                    <button
                      type="button"
                      onClick={() => onQuickAddDate(day.dateIso)}
                      className="inline-flex shrink-0 cursor-pointer items-center gap-1 border border-dashed border-[var(--theme-border-subtle)] px-2.5 py-1 font-sans text-label font-medium tracking-normal text-[var(--theme-text-muted)] hover:border-[var(--theme-border)] hover:bg-[var(--theme-card)] hover:text-[var(--theme-text)] md:hidden"
                    >
                      <PixelPlusIcon className="h-3 w-3" />
                      <span>Catat</span>
                    </button>
                  )}
                </div>

                {/* Daftar Transaksi di Hari Tersebut */}
                {hasTransactions ? (
                  <div className="flex flex-1 flex-col gap-1">
                    {day.transactions.map((tx) => (
                      <div
                        key={tx.id === highlightId ? `${tx.id}-${highlightTick ?? 0}` : tx.id}
                        className={`group/tx flex flex-col gap-1 border-b border-[var(--theme-border-subtle)] py-1.5 last:border-b-0 ${
                          tx.id === highlightId ? 'motion-stamp' : ''
                        }`}
                      >
                        {/* Baris Judul + Tombol Aksi Mini (Ubah / Hapus — tampil penuh di mobile, reveal saat hover di desktop) */}
                        <div className="flex items-start justify-between gap-1.5">
                          <span className="min-w-0 flex-1 break-words font-sans text-meta font-bold leading-snug text-[var(--theme-text)]">
                            {tx.description || 'Tanpa keterangan'}
                          </span>
                          <div className="flex shrink-0 items-center gap-1.5 pt-0.5 transition-opacity md:opacity-0 md:group-hover/tx:opacity-100 md:group-focus-within/tx:opacity-100">
                            <button
                              type="button"
                              onClick={() => onEditTransaction(tx)}
                              title="Ubah transaksi"
                              aria-label={`Ubah transaksi: ${tx.description || tx.category}`}
                              className="pixel-badge cursor-pointer bg-[var(--theme-card)] p-1 leading-none text-[var(--theme-text)] transition-colors hover:bg-[var(--theme-gold)] hover:text-black"
                            >
                              <PixelEditIcon className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteTransaction(tx)}
                              title="Hapus transaksi"
                              aria-label={`Hapus transaksi: ${tx.description || tx.category}`}
                              className="pixel-badge cursor-pointer bg-[var(--theme-card)] p-1 leading-none text-[var(--theme-text)] transition-colors hover:bg-[var(--theme-expense)] hover:text-white"
                            >
                              <PixelTrashIcon className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="break-words font-sans text-label leading-normal tracking-normal text-[var(--theme-text-muted)]">
                            {tx.category}
                          </span>
                          {tx.isClosedToBalance && (
                            <span className="pixel-badge bg-[var(--theme-card-subtle)] px-1.5 py-0.5 font-retro text-label font-bold leading-none text-[var(--theme-text-muted)]">
                              DIBUKUKAN
                            </span>
                          )}
                          {tx.isAdjustmentExpense === false && (
                            <span className="pixel-badge bg-[var(--theme-gold-badge)] px-1.5 py-0.5 font-retro text-label font-bold leading-none text-[var(--theme-gold-text)]">
                              TRANSFER/SALDO
                            </span>
                          )}
                        </div>
                        <span
                          className={`mt-0.5 break-words font-mono text-meta font-bold tabular-nums ${
                            tx.type === 'income'
                              ? 'text-[var(--theme-income)]'
                              : tx.isClosedToBalance
                              ? 'text-[var(--theme-text-muted)] line-through'
                              : tx.isAdjustmentExpense === false
                              ? 'text-[var(--theme-text-muted)]'
                              : 'text-[var(--theme-expense-text)]'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : '-'} {formatRupiah(tx.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="hidden min-h-[84px] flex-1 items-center justify-center py-3 md:flex">
                    {onQuickAddDate ? (
                      <button
                        type="button"
                        onClick={() => onQuickAddDate(day.dateIso)}
                        title={`Catat transaksi pada ${day.dayName}, ${day.dateLabel}`}
                        className="inline-flex cursor-pointer items-center gap-1 border border-dashed border-[var(--theme-border-subtle)] px-2.5 py-1.5 font-sans text-meta font-medium tracking-normal text-[var(--theme-text-muted)] transition-colors hover:border-[var(--theme-border)] hover:bg-[var(--theme-card)] hover:text-[var(--theme-text)]"
                      >
                        <PixelPlusIcon className="h-3.5 w-3.5" />
                        <span>Catat</span>
                      </button>
                    ) : (
                      <span className="font-sans text-meta text-[var(--theme-text-muted)]">
                        —
                      </span>
                    )}
                  </div>
                )}

                {/* Footer Subtotal Harian — hanya tampil jika ada transaksi di hari ini */}
                {hasTransactions && (
                  <div className="mt-2.5 flex flex-col gap-1 border-t-2 border-[var(--theme-border)] pt-2 font-sans text-meta">
                    {isHighestExpense && (
                      <span className="pixel-badge mb-0.5 inline-flex items-center gap-1 self-start bg-[var(--theme-expense)] px-1.5 py-0.5 font-retro text-label font-bold leading-none tracking-normal text-white">
                        <PixelFlameIcon className="h-3 w-3" />
                        <span>TERTINGGI</span>
                      </span>
                    )}
                    {day.dayExpense > 0 && (
                      <div className="flex items-baseline justify-between gap-1 text-[var(--theme-expense-text)]">
                        <span className="text-[var(--theme-text-muted)]">Keluar</span>
                        <span className="break-words text-right font-mono font-bold tabular-nums">
                          {formatRupiah(day.dayExpense)}
                        </span>
                      </div>
                    )}
                    {day.dayIncome > 0 && (
                      <div className="flex items-baseline justify-between gap-1 text-[var(--theme-income)]">
                        <span className="text-[var(--theme-text-muted)]">Masuk</span>
                        <span className="break-words text-right font-mono font-bold tabular-nums">
                          +{formatRupiah(day.dayIncome)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Akumulasi Total Mingguan */}
      <div
        className="motion-rise-in bg-[var(--theme-card-subtle)]/55 p-4 sm:p-5"
        style={{ animationDelay: '196ms' }}
      >
        <p className="font-retro text-label font-bold tracking-normal text-[var(--theme-text-muted)]">
          AKUMULASI MINGGUAN
        </p>

        <div className="mt-3 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div>
            <span className="font-sans text-meta tracking-normal text-[var(--theme-text-muted)]">
              Pemasukan
            </span>
            <p className="mt-1 break-words font-mono text-body font-bold tabular-nums text-[var(--theme-income)] sm:text-data">
              + {formatRupiah(totalWeeklyIncome)}
            </p>
          </div>

          <div>
            <span className="font-sans text-meta tracking-normal text-[var(--theme-text-muted)]">
              Pengeluaran
            </span>
            <p className="mt-1 break-words font-mono text-body font-bold tabular-nums text-[var(--theme-expense-text)] sm:text-data">
              - {formatRupiah(totalWeeklyExpense)}
            </p>
          </div>

          <div>
            <span className="font-sans text-meta tracking-normal text-[var(--theme-text-muted)]">
              Arus kas bersih {netWeeklyFlow >= 0 ? '(Surplus)' : '(Defisit)'}
            </span>
            <p
              className={`mt-1 break-words font-mono text-body font-bold tabular-nums sm:text-data ${
                netWeeklyFlow >= 0
                  ? 'text-[var(--theme-income)]'
                  : 'text-[var(--theme-expense-text)]'
              }`}
            >
              {netWeeklyFlow >= 0 ? '+' : '-'} {formatRupiah(Math.abs(netWeeklyFlow))}
            </p>
          </div>

          <div>
            <span className="font-sans text-meta tracking-normal text-[var(--theme-text-muted)]">
              Rata-rata harian
            </span>
            <p className="mt-1 break-words font-mono text-body font-bold tabular-nums text-[var(--theme-text)] sm:text-data">
              {formatRupiah(avgDailyExpense)}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
