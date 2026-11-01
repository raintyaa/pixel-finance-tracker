import type { Transaction } from '../types/finance'
import { formatRupiah } from '../utils/currency'
import { DAYS_OF_WEEK, MONTH_NAMES, getTodayDateString, type WeekInfo } from '../utils/date'

interface WeeklyTableProps {
    weekInfo: WeekInfo
    transactions: Transaction[]
    // Transaksi yang baru dicatat/diubah — barisnya diberi cap emas sekali
    highlightId?: string | null
    highlightTick?: number
    onEditTransaction: (tx: Transaction) => void
    onDeleteTransaction: (tx: Transaction) => void
}

export default function WeeklyTable({
    weekInfo,
    transactions,
    highlightId,
    highlightTick,
    onEditTransaction,
    onDeleteTransaction,
}: WeeklyTableProps) {
    const todayIso = getTodayDateString()

    // Menghitung tanggal kalender untuk ke-7 hari (Indeks 0 = Minggu s/d 6 = Sabtu)
    const daysData = DAYS_OF_WEEK.map((dayName, dayIndex) => {
        // Tanggal spesifik hari ini
        const [year, month, day] = weekInfo.startDate.split('-').map(Number)
        const currentDayDate = new Date(year, month - 1, day + dayIndex)

        const dateIso = `${currentDayDate.getFullYear()}-${String(
            currentDayDate.getMonth() + 1
        ).padStart(2, '0')}-${String(currentDayDate.getDate()).padStart(2, '0')}`

        const dateLabel = `${currentDayDate.getDate()} ${MONTH_NAMES[
            currentDayDate.getMonth()
        ].slice(0, 3)}`

        // Filter transaksi yang jatuh pada tanggal hari ini
        const dayTransactions = transactions.filter((tx) => tx.date === dateIso)

        // Subtotal pemasukan & pengeluaran hari ini
        const dayIncome = dayTransactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0)

        const dayExpense = dayTransactions
            .filter((t) => t.type === 'expense')
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

    // Akumulasi Total Mingguan
    const totalWeeklyExpense = daysData.reduce((acc, d) => acc + d.dayExpense, 0)
    const totalWeeklyIncome = daysData.reduce((acc, d) => acc + d.dayIncome, 0)
    const netWeeklyFlow = totalWeeklyIncome - totalWeeklyExpense
    const avgDailyExpense = Math.round(totalWeeklyExpense / 7)
    const maxDailyExpense = daysData.reduce((max, d) => Math.max(max, d.dayExpense), 0)
    const weeklyTransactionCount = daysData.reduce((acc, d) => acc + d.transactions.length, 0)

    return (
        <section className="pixel-box flex min-w-0 flex-col gap-5 bg-[var(--theme-card)] p-4 sm:p-5">
            {/* Header Tabel Mingguan */}
            <div className="flex flex-col gap-2 border-b-2 border-[var(--theme-border-subtle)] pb-4 sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                    <h2 className="font-retro text-data font-bold text-[var(--theme-text)] sm:text-display">
                        <span
                            className="mr-2 inline-block h-2 w-2 border-2 border-black bg-[var(--theme-gold)] align-middle"
                            aria-hidden="true"
                        />
                        Aktivitas Mingguan
                    </h2>
                    <p className="mt-0.5 font-sans text-meta text-[var(--theme-text-muted)]">
                        Pekan <span className="font-mono font-bold tabular-nums text-[var(--theme-gold-text)]">{weekInfo.weekNumber}</span> ·{' '}
                        {weekInfo.label}
                    </p>
                </div>
                <span className="font-sans text-meta text-[var(--theme-text-muted)]">
                    {weeklyTransactionCount === 0
                        ? 'Belum ada transaksi'
                        : <><span className="font-mono tabular-nums">{weeklyTransactionCount}</span> transaksi</>}
                </span>
            </div>

            {/* Grid 7 Kolom Hari (Minggu s/d Sabtu) */}
            <div className="grid grid-cols-1 divide-y-2 divide-[var(--theme-border)] overflow-hidden border-2 border-[var(--theme-border)] md:grid-cols-7 md:divide-x-2 md:divide-y-0">
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
                            className={`motion-rise-in flex min-w-0 flex-col justify-between p-3 ${
                                isTinted
                                    ? 'tinted-surface bg-[var(--theme-gold-surface)]'
                                    : 'bg-[var(--theme-card)]'
                            } ${isToday ? 'shadow-[inset_0_0_0_2px_var(--theme-gold)]' : ''}`}
                        >
                            {/* Header Kolom Hari */}
                            <div className="mb-2 flex items-center justify-between gap-2 border-b border-[var(--theme-border-subtle)] pb-2 md:block">
                                <span
                                    className={`font-retro text-meta font-bold tracking-normal ${
                                        isWeekend
                                            ? 'text-[var(--theme-gold-text)]'
                                            : 'text-[var(--theme-text)]'
                                    }`}
                                >
                                    {day.dayName.toUpperCase()}
                                </span>
                                <div className="flex items-center gap-1.5 md:mt-0.5 md:flex-col md:items-start md:gap-1">
                                    <span className="whitespace-nowrap font-mono text-meta tabular-nums text-[var(--theme-text-muted)]">
                                        {day.dateLabel}
                                    </span>
                                    {isToday && (
                                        <span className="whitespace-nowrap border border-[var(--theme-border)] bg-[var(--theme-gold)] px-1 py-0.5 font-retro text-label font-bold leading-none tracking-normal text-black">
                                            HARI INI
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Daftar Transaksi di Hari Tersebut */}
                            <div className="flex flex-1 flex-col gap-1">
                                {!hasTransactions ? (
                                    <div className="flex h-full min-h-[48px] items-center justify-center py-4 text-center font-sans text-meta text-[var(--theme-text-muted)] md:min-h-[80px]">
                                        Kosong
                                    </div>
                                ) : (
                                    day.transactions.map((tx) => (
                                        <div
                                            key={
                                                tx.id === highlightId
                                                    ? `${tx.id}-${highlightTick ?? 0}`
                                                    : tx.id
                                            }
                                            className={`flex flex-col gap-1 border-b border-[var(--theme-border-subtle)] py-1.5 last:border-b-0 ${
                                                tx.id === highlightId ? 'motion-stamp' : ''
                                            }`}
                                        >
                                            {/* Baris Judul + Tombol Aksi Mini (Ubah / Hapus) */}
                                            <div className="flex items-start justify-between gap-1">
                                                <span className="min-w-0 flex-1 truncate text-meta font-bold text-[var(--theme-text)]">
                                                    {tx.description || 'Tanpa keterangan'}
                                                </span>
                                                <div className="flex shrink-0 items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => onEditTransaction(tx)}
                                                        title="Ubah transaksi"
                                                        aria-label={`Ubah transaksi: ${tx.description}`}
                                                        className="cursor-pointer border border-[var(--theme-border)] bg-[var(--theme-card)] px-1 py-0.5 text-meta leading-none text-[var(--theme-text)] transition-colors hover:bg-[var(--theme-gold)] hover:text-black"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => onDeleteTransaction(tx)}
                                                        title="Hapus transaksi"
                                                        aria-label={`Hapus transaksi: ${tx.description}`}
                                                        className="cursor-pointer border border-[var(--theme-border)] bg-[var(--theme-card)] px-1 py-0.5 text-meta leading-none text-[var(--theme-text)] transition-colors hover:bg-[var(--theme-expense)] hover:text-white"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                            <span className="truncate font-sans text-label tracking-normal text-[var(--theme-text-muted)]">
                                                {tx.category}
                                            </span>
                                            <span
                                                className={`mt-0.5 break-words font-mono text-meta font-bold tabular-nums ${
                                                    tx.type === 'income'
                                                        ? 'text-[var(--theme-income)]'
                                                        : 'text-[var(--theme-expense-text)]'
                                                }`}
                                            >
                                                {tx.type === 'income' ? '+' : '-'} {formatRupiah(tx.amount)}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer Subtotal Harian */}
                            <div className="mt-2 flex flex-col gap-1 border-t-2 border-[var(--theme-border)] pt-2 font-sans text-meta">
                                {isHighestExpense && (
                                    <span className="mb-0.5 self-start border border-[var(--theme-border)] bg-[var(--theme-expense)] px-1.5 py-0.5 font-retro text-label font-bold leading-none tracking-normal text-white">
                                        🔥 TERTINGGI
                                    </span>
                                )}
                                <div className="flex items-baseline justify-between gap-1 text-[var(--theme-expense-text)]">
                                    <span className="text-[var(--theme-text-muted)]">Keluar</span>
                                    <span className="truncate font-mono font-bold tabular-nums">
                                        {day.dayExpense > 0 ? formatRupiah(day.dayExpense) : '—'}
                                    </span>
                                </div>
                                <div className="flex items-baseline justify-between gap-1 text-[var(--theme-income)]">
                                    <span className="text-[var(--theme-text-muted)]">Masuk</span>
                                    <span className="truncate font-mono font-bold tabular-nums">
                                        {day.dayIncome > 0 ? formatRupiah(day.dayIncome) : '—'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Akumulasi Total Mingguan */}
            <div
                className="motion-rise-in border-t-2 border-[var(--theme-border-subtle)] pt-4"
                style={{ animationDelay: '196ms' }}
            >
                <p className="font-sans text-meta text-[var(--theme-text-muted)]">
                    Akumulasi mingguan
                </p>

                <div className="mt-3 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <div>
                        <span className="font-sans text-label tracking-normal text-[var(--theme-text-muted)]">
                            Pemasukan
                        </span>
                        <p className="mt-1 break-words font-mono text-body font-bold tabular-nums text-[var(--theme-income)]">
                            + {formatRupiah(totalWeeklyIncome)}
                        </p>
                    </div>

                    <div>
                        <span className="font-sans text-label tracking-normal text-[var(--theme-text-muted)]">
                            Pengeluaran
                        </span>
                        <p className="mt-1 break-words font-mono text-body font-bold tabular-nums text-[var(--theme-expense-text)]">
                            - {formatRupiah(totalWeeklyExpense)}
                        </p>
                    </div>

                    <div>
                        <span className="font-sans text-label tracking-normal text-[var(--theme-text-muted)]">
                            Arus kas bersih {netWeeklyFlow >= 0 ? '(Surplus)' : '(Defisit)'}
                        </span>
                        <p
                            className={`mt-1 break-words font-mono text-body font-bold tabular-nums ${
                                netWeeklyFlow >= 0
                                    ? 'text-[var(--theme-income)]'
                                    : 'text-[var(--theme-expense-text)]'
                            }`}
                        >
                            {netWeeklyFlow >= 0 ? '+' : '-'} {formatRupiah(Math.abs(netWeeklyFlow))}
                        </p>
                    </div>

                    <div>
                        <span className="font-sans text-label tracking-normal text-[var(--theme-text-muted)]">
                            Rata-rata harian
                        </span>
                        <p className="mt-1 break-words font-mono text-body font-bold tabular-nums text-[var(--theme-text)]">
                            {formatRupiah(avgDailyExpense)}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
