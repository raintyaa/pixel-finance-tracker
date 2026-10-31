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

function formatWeekRange(week: WeekInfo): string {
    const startDay = Number(week.startDate.slice(8, 10))
    const endDay = Number(week.endDate.slice(8, 10))
    const startMonth = MONTH_NAMES[Number(week.startDate.slice(5, 7)) - 1].slice(0, 3)
    const endMonth = MONTH_NAMES[Number(week.endDate.slice(5, 7)) - 1].slice(0, 3)

    return startMonth === endMonth
        ? `${startDay}–${endDay} ${startMonth}`
        : `${startDay} ${startMonth}–${endDay} ${endMonth}`
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
        <section className="pixel-box flex flex-col gap-4 bg-[var(--theme-card)] p-4 sm:p-5">

            {/* 1. Baris Atas: Label Periode, Toggle Scope, Tombol Hari Ini */}
            <div className="flex flex-col gap-3 border-b-2 border-[var(--theme-border-subtle)] pb-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-2.5">
                    <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-black bg-[var(--theme-gold-badge)] text-sm"
                        aria-hidden="true"
                    >
                        🗓️
                    </span>
                    <div>
                        <p className="font-['Silkscreen'] text-[9px] font-bold tracking-[0.16em] text-[var(--theme-gold-text)]">
                            NAVIGATOR PERIODE
                        </p>
                        <p className="mt-0.5 text-[11px] text-[var(--theme-text-muted)]">
                            Pilih bulan, pekan, dan cakupan saldo.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Toggle Mode Saldo (Bulan Ini vs Semua Waktu) */}
                    <div className="flex items-center gap-1 border-2 border-black bg-[var(--theme-card-subtle)] p-1">
                        <button
                            type="button"
                            onClick={() => onToggleViewScope('month')}
                            aria-pressed={viewScope === 'month'}
                            className={`px-2.5 py-1 font-['Silkscreen'] text-[9px] font-bold tracking-wide transition-all cursor-pointer ${
                                viewScope === 'month'
                                    ? 'bg-[var(--theme-gold)] text-black shadow-[2px_2px_0px_#000]'
                                    : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
                            }`}
                        >
                            📅 BULAN INI
                        </button>
                        <button
                            type="button"
                            onClick={() => onToggleViewScope('all')}
                            aria-pressed={viewScope === 'all'}
                            className={`px-2.5 py-1 font-['Silkscreen'] text-[9px] font-bold tracking-wide transition-all cursor-pointer ${
                                viewScope === 'all'
                                    ? 'bg-[var(--theme-gold)] text-black shadow-[2px_2px_0px_#000]'
                                    : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
                            }`}
                        >
                            🌐 SEMUA WAKTU
                        </button>
                    </div>

                    {/* Tombol Cepat Kembali ke Hari Ini */}
                    <button
                        type="button"
                        onClick={onResetToday}
                        className="pixel-button cursor-pointer bg-[var(--theme-card)] px-3 py-1.5 font-['Silkscreen'] text-[9px] font-bold text-[var(--theme-text)] hover:bg-[var(--theme-card-gold)]"
                    >
                        ⚡ HARI INI
                    </button>
                </div>
            </div>

            {/* 2. Baris Tengah: Navigator Bulan & Tahun */}
            <div className="flex items-center justify-between gap-3 border-b-2 border-[var(--theme-border-subtle)] pb-4">
                <button
                    type="button"
                    onClick={onPrevMonth}
                    className="pixel-button flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center bg-[var(--theme-card)] font-['Silkscreen'] text-sm font-bold text-[var(--theme-gold-text)] hover:bg-[var(--theme-card-gold)]"
                    title="Bulan Sebelumnya"
                    aria-label="Bulan sebelumnya"
                >
                    ◀
                </button>

                <div className="min-w-0 text-center">
                    <div className="truncate font-['Silkscreen'] text-base font-bold tracking-wide text-[var(--theme-text)] md:text-xl">
                        {MONTH_NAMES[currentMonth - 1]}{' '}
                        <span className="text-[var(--theme-gold-text)]">{currentYear}</span>
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] text-[var(--theme-text-muted)]">
                        {activeWeekInfo ? `Pekan aktif: ${activeWeekInfo.label}` : 'Pilih pekan'}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onNextMonth}
                    className="pixel-button flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center bg-[var(--theme-card)] font-['Silkscreen'] text-sm font-bold text-[var(--theme-gold-text)] hover:bg-[var(--theme-card-gold)]"
                    title="Bulan Berikutnya"
                    aria-label="Bulan berikutnya"
                >
                    ▶
                </button>
            </div>

            {/* 3. Baris Bawah: Tab Pemilihan Minggu (Mgg 1, Mgg 2, dst.) */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between font-mono text-[10px] text-[var(--theme-text-muted)]">
                    <span>PILIH PEKAN · MINGGU–SABTU</span>
                    <span className="hidden sm:inline">
                        {viewScope === 'month' ? 'Data bulan ini' : 'Ringkasan semua riwayat'}
                    </span>
                </div>

                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                    {weeks.map((w) => {
                        const isActive = w.weekNumber === selectedWeek
                        return (
                            <button
                                key={w.weekNumber}
                                type="button"
                                onClick={() => onSelectWeek(w.weekNumber)}
                                aria-pressed={isActive}
                                className={`flex min-h-[52px] flex-col items-center justify-center gap-0.5 border-2 border-[var(--theme-border)] px-1 py-2 text-center transition-all cursor-pointer ${
                                    isActive
                                        ? 'bg-[var(--theme-gold)] font-bold text-black shadow-[2px_2px_0px_var(--theme-shadow)]'
                                        : 'bg-[var(--theme-card-subtle)] text-[var(--theme-text-muted)] hover:bg-[var(--theme-card)] hover:text-[var(--theme-text)]'
                                }`}
                            >
                                <span className="font-['Silkscreen'] text-[10px]">
                                    MGG {w.weekNumber}
                                </span>
                                <span
                                    className={`max-w-full truncate font-mono text-[10px] ${
                                        isActive ? 'font-bold text-black' : 'text-[var(--theme-text-muted)]'
                                    }`}
                                >
                                    {formatWeekRange(w)}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
