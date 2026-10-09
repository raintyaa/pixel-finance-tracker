import type { Transaction } from '../types/finance'
import { formatRupiah } from '../utils/currency'
import { DAYS_OF_WEEK, MONTH_NAMES, type WeekInfo } from '../utils/date'

interface WeeklyTableProps {
    weekInfo: WeekInfo
    transactions: Transaction[]
}

export default function WeeklyTable({ weekInfo, transactions }: WeeklyTableProps) {
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

    return (
        <section className="pixel-box bg-[#1f1e2c] p-4 flex flex-col gap-4">
            {/* Header Tabel Mingguan */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#3d3b52] pb-3">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-['Silkscreen'] text-sm text-[#f4b41b]">
                            📊 TABEL PEKAN KE-{weekInfo.weekNumber}
                        </span>
                        <span className="text-xs bg-[#3d3b52] text-[#c8c7d8] px-2 py-0.5 font-mono">
                            {weekInfo.label}
                        </span>
                    </div>
                    <p className="text-xs text-[#9c9bb0] font-mono mt-0.5">
                        Pencatatan pengeluaran harian dari Minggu sampai Sabtu
                    </p>
                </div>
            </div>

            {/* Grid 7 Kolom Hari (Minggu s/d Sabtu) — Unified Retro Grid */}
            <div className="grid grid-cols-1 md:grid-cols-7 border-2 border-black divide-y-2 md:divide-y-0 md:divide-x-2 divide-black overflow-x-auto">
                {daysData.map((day) => {
                    const hasTransactions = day.transactions.length > 0
                    const isWeekend = day.dayIndex === 0 || day.dayIndex === 6 // Minggu atau Sabtu
                    const isHighestExpense =
                        maxDailyExpense > 0 && day.dayExpense === maxDailyExpense && day.dayExpense > 0

                    return (
                        <div
                            key={day.dayIndex}
                            className={`flex flex-col justify-between min-h-[220px] p-2.5 ${hasTransactions
                                    ? 'bg-[#252433]'
                                    : 'bg-[#1a1921]'
                                }`}
                        >
                            {/* Header Kolom Hari */}
                            <div className="border-b border-[#3d3b52] pb-1.5 mb-2">
                                <div className="flex items-center justify-between">
                                    <span
                                        className={`font-['Silkscreen'] text-xs font-bold ${isWeekend ? 'text-[#f4b41b]' : 'text-white'
                                            }`}
                                    >
                                        {day.dayName.toUpperCase()}
                                    </span>
                                    {hasTransactions && (
                                        <span className="w-2 h-2 bg-[#38b764] border border-black" />
                                    )}
                                </div>
                                <div className="text-xs text-[#9c9bb0] font-mono">
                                    {day.dateLabel}
                                </div>
                            </div>

                            {/* Daftar Transaksi di Hari Tersebut */}
                            <div className="flex-1 flex flex-col gap-1.5">
                                {!hasTransactions ? (
                                    <div className="h-full flex items-center justify-center text-center text-[#9c9bb0] font-mono text-xs py-4">
                                        - Kosong -
                                    </div>
                                ) : (
                                    day.transactions.map((tx) => (
                                        <div
                                            key={tx.id}
                                            className="border-b border-[#3d3b52] py-1.5 last:border-b-0 flex flex-col gap-0.5"
                                        >
                                            <span className="font-bold text-white truncate text-xs">
                                                {tx.description}
                                            </span>
                                            <span className="text-[#c8c7d8] text-xs truncate">
                                                {tx.category}
                                            </span>
                                            <span
                                                className={`font-['Silkscreen'] text-xs mt-0.5 ${tx.type === 'income'
                                                        ? 'text-[#38b764]'
                                                        : 'text-[#ff5c67]'
                                                    }`}
                                            >
                                                {tx.type === 'income' ? '+' : '-'} {formatRupiah(tx.amount)}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer Subtotal Harian — selalu tampil konsisten */}
                            <div className="border-t-2 border-black pt-1.5 mt-2 flex flex-col gap-1 text-xs font-mono">
                                {isHighestExpense && (
                                    <span className="self-start bg-[#ff5c67] text-black font-['Silkscreen'] text-[10px] px-1.5 py-0.5 border border-black leading-none mb-0.5">
                                        🔥 TERTINGGI
                                    </span>
                                )}
                                <div className="flex justify-between items-baseline gap-1 text-[#ff5c67] text-[11px]">
                                    <span className="text-[#9c9bb0]">Keluar:</span>
                                    <span className="font-mono font-bold text-xs truncate">
                                        {day.dayExpense > 0 ? formatRupiah(day.dayExpense) : 'Rp 0'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-baseline gap-1 text-[#38b764] text-[11px]">
                                    <span className="text-[#9c9bb0]">Masuk:</span>
                                    <span className="font-mono font-bold text-xs truncate">
                                        {day.dayIncome > 0 ? formatRupiah(day.dayIncome) : '—'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Baris Akumulasi Total Mingguan (Weekly Summary Footer) */}
            <div className="border-t-2 border-[#3d3b52] pt-3">
                <div className="font-['Silkscreen'] text-xs text-[#f4b41b] mb-2">
                    🧾 TOTAL AKUMULASI MINGGUAN
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="flex flex-col gap-1">
                        <span className="font-mono text-xs text-[#9c9bb0]">Total Pemasukan</span>
                        <span className="font-['Silkscreen'] text-xs text-[#38b764]">
                            + {formatRupiah(totalWeeklyIncome)}
                        </span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="font-mono text-xs text-[#9c9bb0]">Total Pengeluaran</span>
                        <span className="font-['Silkscreen'] text-xs text-[#ff5c67]">
                            - {formatRupiah(totalWeeklyExpense)}
                        </span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="font-mono text-xs text-[#9c9bb0]">
                            Arus Kas Bersih {netWeeklyFlow >= 0 ? '(Surplus)' : '(Defisit)'}
                        </span>
                        <span
                            className={`font-['Silkscreen'] text-xs ${netWeeklyFlow >= 0 ? 'text-[#38b764]' : 'text-[#ff5c67]'}`}
                        >
                            {netWeeklyFlow >= 0 ? '+' : '-'} {formatRupiah(Math.abs(netWeeklyFlow))}
                        </span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="font-mono text-xs text-[#9c9bb0]">Rata-rata Pengeluaran Harian</span>
                        <span className="font-['Silkscreen'] text-xs text-white">
                            {formatRupiah(avgDailyExpense)}
                        </span>
                    </div>
                </div>
            </div>
        </section>
    )
}
