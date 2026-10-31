import type { Transaction } from '../types/finance'
import { formatRupiah } from '../utils/currency'
import { DAYS_OF_WEEK, MONTH_NAMES, type WeekInfo } from '../utils/date'

interface WeeklyTableProps {
    weekInfo: WeekInfo
    transactions: Transaction[]
    onEditTransaction: (tx: Transaction) => void
    onDeleteTransaction: (tx: Transaction) => void
}

export default function WeeklyTable({
    weekInfo,
    transactions,
    onEditTransaction,
    onDeleteTransaction,
}: WeeklyTableProps) {
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
        <section className="pixel-box flex flex-col gap-5 bg-[var(--theme-card)] p-4 sm:p-5">
            {/* Header Tabel Mingguan */}
            <div className="flex flex-col gap-2 border-b-2 border-[var(--theme-border-subtle)] pb-4 sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                    <h2 className="font-['Silkscreen'] text-sm font-bold text-[var(--theme-text)] sm:text-base">
                        Aktivitas Mingguan
                    </h2>
                    <p className="mt-0.5 font-mono text-[10px] text-[var(--theme-text-muted)]">
                        Pekan {weekInfo.weekNumber} · {weekInfo.label}
                    </p>
                </div>
                <span className="font-mono text-[10px] text-[var(--theme-text-muted)]">
                    {weeklyTransactionCount === 0
                        ? 'Belum ada transaksi'
                        : `${weeklyTransactionCount} transaksi`}
                </span>
            </div>

            {/* Grid 7 Kolom Hari (Minggu s/d Sabtu) */}
            <div className="grid grid-cols-1 divide-y-2 divide-[var(--theme-border)] overflow-hidden border-2 border-[var(--theme-border)] md:grid-cols-7 md:divide-x-2 md:divide-y-0">
                {daysData.map((day) => {
                    const hasTransactions = day.transactions.length > 0
                    const isWeekend = day.dayIndex === 0 || day.dayIndex === 6
                    const isHighestExpense =
                        maxDailyExpense > 0 && day.dayExpense === maxDailyExpense && day.dayExpense > 0

                    return (
                        <div
                            key={day.dayIndex}
                            className="flex min-w-0 flex-col justify-between bg-[var(--theme-card)] p-3"
                        >
                            {/* Header Kolom Hari */}
                            <div className="mb-2 flex items-baseline justify-between gap-2 border-b border-[var(--theme-border-subtle)] pb-2 md:block">
                                <span
                                    className={`font-['Silkscreen'] text-[11px] font-bold ${
                                        isWeekend
                                            ? 'text-[var(--theme-gold-text)]'
                                            : 'text-[var(--theme-text)]'
                                    }`}
                                >
                                    {day.dayName.toUpperCase()}
                                </span>
                                <span className="font-mono text-[10px] text-[var(--theme-text-muted)] md:mt-0.5 md:block">
                                    {day.dateLabel}
                                </span>
                            </div>

                            {/* Daftar Transaksi di Hari Tersebut */}
                            <div className="flex flex-1 flex-col gap-1">
                                {!hasTransactions ? (
                                    <div className="flex h-full min-h-[48px] items-center justify-center py-4 text-center font-mono text-[10px] text-[var(--theme-text-muted)] md:min-h-[80px]">
                                        Kosong
                                    </div>
                                ) : (
                                    day.transactions.map((tx) => (
                                        <div
                                            key={tx.id}
                                            className="flex flex-col gap-1 border-b border-[var(--theme-border-subtle)] py-1.5 last:border-b-0"
                                        >
                                            {/* Baris Judul + Tombol Aksi Mini (Ubah / Hapus) */}
                                            <div className="flex items-start justify-between gap-1">
                                                <span className="min-w-0 flex-1 truncate text-[11px] font-bold text-[var(--theme-text)]">
                                                    {tx.description || 'Tanpa keterangan'}
                                                </span>
                                                <div className="flex shrink-0 items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => onEditTransaction(tx)}
                                                        title="Ubah transaksi"
                                                        aria-label={`Ubah transaksi: ${tx.description}`}
                                                        className="cursor-pointer border border-[var(--theme-border)] bg-[var(--theme-card)] px-1 py-0.5 text-[10px] leading-none text-[var(--theme-text)] transition-colors hover:bg-[var(--theme-gold)] hover:text-black"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => onDeleteTransaction(tx)}
                                                        title="Hapus transaksi"
                                                        aria-label={`Hapus transaksi: ${tx.description}`}
                                                        className="cursor-pointer border border-[var(--theme-border)] bg-[var(--theme-card)] px-1 py-0.5 text-[10px] leading-none text-[var(--theme-text)] transition-colors hover:bg-[var(--theme-expense)] hover:text-white"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                            <span className="truncate font-mono text-[10px] text-[var(--theme-text-muted)]">
                                                {tx.category}
                                            </span>
                                            <span
                                                className={`mt-0.5 break-words font-['Silkscreen'] text-[10px] font-bold ${
                                                    tx.type === 'income'
                                                        ? 'text-[var(--theme-income)]'
                                                        : 'text-[var(--theme-expense)]'
                                                }`}
                                            >
                                                {tx.type === 'income' ? '+' : '-'} {formatRupiah(tx.amount)}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer Subtotal Harian */}
                            <div className="mt-2 flex flex-col gap-1 border-t-2 border-[var(--theme-border)] pt-2 font-mono text-[10px]">
                                {isHighestExpense && (
                                    <span className="mb-0.5 self-start border border-[var(--theme-border)] bg-[var(--theme-expense)] px-1.5 py-0.5 font-['Silkscreen'] text-[8px] font-bold leading-none text-white">
                                        🔥 TERTINGGI
                                    </span>
                                )}
                                <div className="flex items-baseline justify-between gap-1 text-[var(--theme-expense)]">
                                    <span className="text-[var(--theme-text-muted)]">Keluar</span>
                                    <span className="truncate font-bold">
                                        {day.dayExpense > 0 ? formatRupiah(day.dayExpense) : '—'}
                                    </span>
                                </div>
                                <div className="flex items-baseline justify-between gap-1 text-[var(--theme-income)]">
                                    <span className="text-[var(--theme-text-muted)]">Masuk</span>
                                    <span className="truncate font-bold">
                                        {day.dayIncome > 0 ? formatRupiah(day.dayIncome) : '—'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Akumulasi Total Mingguan */}
            <div className="border-t-2 border-[var(--theme-border-subtle)] pt-4">
                <p className="font-mono text-[10px] text-[var(--theme-text-muted)]">
                    Akumulasi mingguan
                </p>

                <div className="mt-3 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <div>
                        <span className="font-mono text-[10px] text-[var(--theme-text-muted)]">
                            Pemasukan
                        </span>
                        <p className="mt-1 break-words font-['Silkscreen'] text-xs font-bold text-[var(--theme-income)]">
                            + {formatRupiah(totalWeeklyIncome)}
                        </p>
                    </div>

                    <div>
                        <span className="font-mono text-[10px] text-[var(--theme-text-muted)]">
                            Pengeluaran
                        </span>
                        <p className="mt-1 break-words font-['Silkscreen'] text-xs font-bold text-[var(--theme-expense)]">
                            - {formatRupiah(totalWeeklyExpense)}
                        </p>
                    </div>

                    <div>
                        <span className="font-mono text-[10px] text-[var(--theme-text-muted)]">
                            Arus kas bersih {netWeeklyFlow >= 0 ? '(Surplus)' : '(Defisit)'}
                        </span>
                        <p
                            className={`mt-1 break-words font-['Silkscreen'] text-xs font-bold ${
                                netWeeklyFlow >= 0
                                    ? 'text-[var(--theme-income)]'
                                    : 'text-[var(--theme-expense)]'
                            }`}
                        >
                            {netWeeklyFlow >= 0 ? '+' : '-'} {formatRupiah(Math.abs(netWeeklyFlow))}
                        </p>
                    </div>

                    <div>
                        <span className="font-mono text-[10px] text-[var(--theme-text-muted)]">
                            Rata-rata harian
                        </span>
                        <p className="mt-1 break-words font-['Silkscreen'] text-xs font-bold text-[var(--theme-text)]">
                            {formatRupiah(avgDailyExpense)}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
