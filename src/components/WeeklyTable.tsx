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

    return (
        <section className="pixel-box bg-[#1f1e2c] p-4 flex flex-col gap-4">
            {/* Header Tabel Mingguan */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#3d3b52] pb-3">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-['Silkscreen'] text-sm text-[#f4b41b]">
                            📊 TABEL PEKAN KE-{weekInfo.weekNumber}
                        </span>
                        <span className="text-[10px] bg-[#3d3b52] text-gray-200 px-2 py-0.5 font-mono">
                            {weekInfo.label}
                        </span>
                    </div>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                        Pencatatan pengeluaran harian dari Minggu sampai Sabtu
                    </p>
                </div>

                {/* Ringkasan Akumulasi Pekan Ini */}
                <div className="flex items-center gap-2 text-xs font-mono self-start sm:self-auto">
                    {totalWeeklyIncome > 0 && (
                        <span className="text-[#38b764] bg-[#131219] px-2 py-1 border border-black font-['Silkscreen'] text-[10px]">
                            + {formatRupiah(totalWeeklyIncome)}
                        </span>
                    )}
                    <span className="text-[#e43b44] bg-[#131219] px-2 py-1 border border-black font-['Silkscreen'] text-[10px]">
                        - {formatRupiah(totalWeeklyExpense)}
                    </span>
                </div>
            </div>

            {/* Grid 7 Kolom Hari (Minggu s/d Sabtu) */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-2 overflow-x-auto">
                {daysData.map((day) => {
                    const hasTransactions = day.transactions.length > 0
                    const isWeekend = day.dayIndex === 0 || day.dayIndex === 6 // Minggu atau Sabtu

                    return (
                        <div
                            key={day.dayIndex}
                            className={`flex flex-col justify-between pixel-box-sm min-h-[220px] p-2.5 transition-all ${hasTransactions
                                    ? 'bg-[#252433] border-[#3d3b52]'
                                    : 'bg-[#1a1921] opacity-85 hover:opacity-100'
                                }`}
                        >
                            {/* Header Kolom Hari */}
                            <div className="border-b border-[#3d3b52] pb-1.5 mb-2">
                                <div className="flex items-center justify-between">
                                    <span
                                        className={`font-['Silkscreen'] text-[11px] font-bold ${isWeekend ? 'text-[#f4b41b]' : 'text-gray-200'
                                            }`}
                                    >
                                        {day.dayName.toUpperCase()}
                                    </span>
                                    {hasTransactions && (
                                        <span className="w-1.5 h-1.5 bg-[#38b764] rounded-full animate-pulse" />
                                    )}
                                </div>
                                <div className="text-[10px] text-gray-400 font-mono">
                                    {day.dateLabel}
                                </div>
                            </div>

                            {/* Daftar Transaksi di Hari Tersebut */}
                            <div className="flex-1 flex flex-col gap-1.5">
                                {!hasTransactions ? (
                                    <div className="h-full flex items-center justify-center text-center text-gray-600 font-mono text-[10px] py-4">
                                        - Kosong -
                                    </div>
                                ) : (
                                    day.transactions.map((tx) => (
                                        <div
                                            key={tx.id}
                                            className="bg-[#131219] border border-black p-1.5 flex flex-col gap-0.5 text-[11px]"
                                        >
                                            <span className="font-bold text-white truncate text-[10px]">
                                                {tx.description}
                                            </span>
                                            <span className="text-gray-400 text-[9px] truncate">
                                                {tx.category}
                                            </span>
                                            <span
                                                className={`font-['Silkscreen'] text-[9px] mt-0.5 ${tx.type === 'income'
                                                        ? 'text-[#38b764]'
                                                        : 'text-[#e43b44]'
                                                    }`}
                                            >
                                                {tx.type === 'income' ? '+' : '-'} {formatRupiah(tx.amount)}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer Subtotal Harian */}
                            {hasTransactions && (
                                <div className="border-t border-[#3d3b52] pt-1.5 mt-2 flex flex-col text-[9px] font-mono">
                                    {day.dayExpense > 0 && (
                                        <div className="flex justify-between text-[#e43b44]">
                                            <span>Keluar:</span>
                                            <span className="font-['Silkscreen']">
                                                {formatRupiah(day.dayExpense)}
                                            </span>
                                        </div>
                                    )}
                                    {day.dayIncome > 0 && (
                                        <div className="flex justify-between text-[#38b764]">
                                            <span>Masuk:</span>
                                            <span className="font-['Silkscreen']">
                                                {formatRupiah(day.dayIncome)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </section>
    )
}