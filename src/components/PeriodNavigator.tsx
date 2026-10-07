import { MONTH_NAMES, type WeekInfo } from '../utils/date'

export type ViewScope = 'month' | 'all'

interface PeriodNavigatorProps {
    currentYear: number
    currentMonth: number
    selectedWeek: number
    weeks: WeekInfo[]
    viewScope: ViewScope
    onPrevMonth: () => void
    onNextMonth: () => void
    onSelectWeek: (weekNum: number) => void
    onToggleViewScope: (scope: ViewScope) => void
    onResetToday: () => void
}

export default function PeriodNavigator({
    currentYear,
    currentMonth,
    selectedWeek,
    weeks,
    viewScope,
    onPrevMonth,
    onNextMonth,
    onSelectWeek,
    onToggleViewScope,
    onResetToday,
}: PeriodNavigatorProps) {
    const activeWeekInfo = weeks.find((w) => w.weekNumber === selectedWeek)

    return (
        <section className="pixel-box bg-[#1f1e2c] p-4 flex flex-col gap-4">

            {/* 1. Baris Atas: Toggle Mode Saldo & Tombol Hari Ini */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b-2 border-[#3d3b52] pb-3">

                {/* Toggle Mode Saldo (Bulan Ini vs Semua Waktu) */}
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => onToggleViewScope('month')}
                        className={`px-3 py-1 text-xs font-['Silkscreen'] transition-all cursor-pointer ${viewScope === 'month'
                            ? 'bg-[#f4b41b] text-black font-bold'
                            : 'text-[#9c9bb0] hover:text-white'
                            }`}
                    >
                        📅 BULAN INI
                    </button>
                    <button
                        type="button"
                        onClick={() => onToggleViewScope('all')}
                        className={`px-3 py-1 text-xs font-['Silkscreen'] transition-all cursor-pointer ${viewScope === 'all'
                            ? 'bg-[#f4b41b] text-black font-bold'
                            : 'text-[#9c9bb0] hover:text-white'
                            }`}
                    >
                        🌐 SEMUA WAKTU
                    </button>
                </div>
                {/* Tombol Cepat Kembali ke Hari Ini */}
                <button
                    type="button"
                    onClick={onResetToday}
                    className="pixel-button bg-[#2a293b] hover:bg-[#38374d] text-[#c8c7d8] hover:text-white px-3 py-1 text-xs font-['Silkscreen'] cursor-pointer"
                >
                    ⚡ HARI INI
                </button>
            </div>
            {/* 2. Baris Tengah: Navigator Bulan & Tahun */}
            <div className="border-y-2 border-[#3d3b52] py-2.5 flex items-center justify-between">
                <button
                    type="button"
                    onClick={onPrevMonth}
                    className="pixel-button bg-[#1f1e2c] hover:bg-[#38374d] text-[#f4b41b] px-3 py-1 text-sm font-['Silkscreen'] cursor-pointer"
                    title="Bulan Sebelumnya"
                >
                    ◀
                </button>
                <div className="text-center">
                    <div className="font-['Silkscreen'] text-base md:text-lg text-white tracking-wider">
                        {MONTH_NAMES[currentMonth - 1]} {currentYear}
                    </div>
                    <div className="text-xs text-[#9c9bb0] font-mono">
                        {viewScope === 'month' ? 'Menampilkan data bulan ini' : 'Ringkasan saldo: Semua Riwayat'}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onNextMonth}
                    className="pixel-button bg-[#1f1e2c] hover:bg-[#38374d] text-[#f4b41b] px-3 py-1 text-sm font-['Silkscreen'] cursor-pointer"
                    title="Bulan Berikutnya"
                >
                    ▶
                </button>
            </div>
            {/* 3. Baris Bawah: Tab Pemilihan Minggu (Mgg 1, Mgg 2, dst.) */}
            <div className="flex flex-col gap-2">
                <div className="text-xs text-[#9c9bb0] font-mono flex items-center justify-between">
                    <span>Pilih Pekan (Minggu - Sabtu):</span>
                    {activeWeekInfo && (
                        <span className="text-[#f4b41b] font-bold text-xs">
                            {activeWeekInfo.label}
                        </span>
                    )}
                </div>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                    {weeks.map((w) => {
                        const isActive = w.weekNumber === selectedWeek
                        return (
                            <button
                                key={w.weekNumber}
                                type="button"
                                onClick={() => onSelectWeek(w.weekNumber)}
                                className={`py-2 px-1 text-center transition-all cursor-pointer flex flex-col items-center justify-center border-2 border-black ${isActive
                                    ? 'bg-[#f4b41b] text-black font-bold'
                                    : 'bg-[#252433] hover:bg-[#2e2d3f] text-[#c8c7d8]'
                                    }`}
                            >
                                <span className="font-['Silkscreen'] text-xs">
                                    MGG {w.weekNumber}
                                </span>
                                <span className={`text-xs font-mono truncate max-w-full ${isActive ? 'text-black font-semibold' : 'text-[#9c9bb0]'}`}>
                                    {w.label.split(' ')[0]}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
