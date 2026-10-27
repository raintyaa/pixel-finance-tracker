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
        <section className="pixel-box bg-[var(--theme-card)] p-4 flex flex-col gap-4">

            {/* 1. Baris Atas: Toggle Mode Saldo & Tombol Hari Ini */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b-2 border-[var(--theme-border-subtle)] pb-3">

                {/* Toggle Mode Saldo (Bulan Ini vs Semua Waktu) */}
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => onToggleViewScope('month')}
                        className={`px-3 py-1 text-xs font-['Silkscreen'] border-2 border-[var(--theme-border)] transition-all cursor-pointer ${
                            viewScope === 'month'
                                ? 'bg-[var(--theme-gold)] text-black font-bold shadow-[2px_2px_0px_var(--theme-shadow)]'
                                : 'bg-[var(--theme-card-subtle)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
                        }`}
                    >
                        📅 BULAN INI
                    </button>
                    <button
                        type="button"
                        onClick={() => onToggleViewScope('all')}
                        className={`px-3 py-1 text-xs font-['Silkscreen'] border-2 border-[var(--theme-border)] transition-all cursor-pointer ${
                            viewScope === 'all'
                                ? 'bg-[var(--theme-gold)] text-black font-bold shadow-[2px_2px_0px_var(--theme-shadow)]'
                                : 'bg-[var(--theme-card-subtle)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
                        }`}
                    >
                        🌐 SEMUA WAKTU
                    </button>
                </div>

                {/* Tombol Cepat Kembali ke Hari Ini */}
                <button
                    type="button"
                    onClick={onResetToday}
                    className="pixel-button bg-[var(--theme-card-subtle)] hover:bg-[var(--theme-card)] text-[var(--theme-text)] px-3 py-1 text-xs font-['Silkscreen'] cursor-pointer font-bold"
                >
                    ⚡ HARI INI
                </button>
            </div>

            {/* 2. Baris Tengah: Navigator Bulan & Tahun */}
            <div className="border-y-2 border-[var(--theme-border-subtle)] py-2.5 flex items-center justify-between">
                <button
                    type="button"
                    onClick={onPrevMonth}
                    className="pixel-button bg-[var(--theme-card)] hover:bg-[var(--theme-card-gold)] text-[var(--theme-gold-text)] px-3 py-1 text-sm font-['Silkscreen'] cursor-pointer font-bold"
                    title="Bulan Sebelumnya"
                >
                    ◀
                </button>
                <div className="text-center">
                    <div className="font-['Silkscreen'] text-base md:text-lg text-[var(--theme-text)] tracking-wider font-bold">
                        {MONTH_NAMES[currentMonth - 1]} {currentYear}
                    </div>
                    <div className="text-xs text-[var(--theme-text-muted)] font-mono">
                        {viewScope === 'month' ? 'Menampilkan data bulan ini' : 'Ringkasan saldo: Semua Riwayat'}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onNextMonth}
                    className="pixel-button bg-[var(--theme-card)] hover:bg-[var(--theme-card-gold)] text-[var(--theme-gold-text)] px-3 py-1 text-sm font-['Silkscreen'] cursor-pointer font-bold"
                    title="Bulan Berikutnya"
                >
                    ▶
                </button>
            </div>

            {/* 3. Baris Bawah: Tab Pemilihan Minggu (Mgg 1, Mgg 2, dst.) */}
            <div className="flex flex-col gap-2">
                <div className="text-xs text-[var(--theme-text-muted)] font-mono flex items-center justify-between">
                    <span>Pilih Pekan (Minggu - Sabtu):</span>
                    {activeWeekInfo && (
                        <span className="text-[var(--theme-gold-text)] font-bold text-xs">
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
                                className={`py-2 px-1 text-center transition-all cursor-pointer flex flex-col items-center justify-center border-2 border-[var(--theme-border)] ${
                                    isActive
                                        ? 'bg-[var(--theme-gold)] text-black font-bold shadow-[2px_2px_0px_var(--theme-shadow)]'
                                        : 'bg-[var(--theme-card-subtle)] hover:bg-[var(--theme-card)] text-[var(--theme-text-muted)]'
                                }`}
                            >
                                <span className="font-['Silkscreen'] text-xs">
                                    MGG {w.weekNumber}
                                </span>
                                <span className={`text-xs font-mono truncate max-w-full ${
                                    isActive ? 'text-black font-bold' : 'text-[var(--theme-text-muted)]'
                                }`}>
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
