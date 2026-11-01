import { MONTH_NAMES, type WeekInfo } from '../utils/date'

export type ViewScope = 'month' | 'all'

interface PeriodNavigatorProps {
    currentYear: number
    currentMonth: number
    selectedWeek: number
    weeks: WeekInfo[]
    viewScope: ViewScope
    // Arah navigasi bulan terakhir — menentukan arah geser label ('null' = muat awal)
    monthDirection: 'prev' | 'next' | null
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
    monthDirection,
    onPrevMonth,
    onNextMonth,
    onSelectWeek,
    onToggleViewScope,
    onResetToday,
}: PeriodNavigatorProps) {
    return (
        <section
            aria-label="Navigator periode"
            className="pixel-box flex min-w-0 flex-col gap-4 bg-[var(--theme-card)] p-4 sm:p-5"
        >
            {/* 1. Filter scope saldo & kembali ke hari ini */}
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1 border-2 border-black bg-[var(--theme-card-subtle)] p-1">
                    <button
                        type="button"
                        onClick={() => onToggleViewScope('month')}
                        aria-pressed={viewScope === 'month'}
                        className={`px-2.5 py-1 font-retro text-label font-bold tracking-normal transition-all cursor-pointer ${
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
                        className={`px-2.5 py-1 font-retro text-label font-bold tracking-normal transition-all cursor-pointer ${
                            viewScope === 'all'
                                ? 'bg-[var(--theme-gold)] text-black shadow-[2px_2px_0px_#000]'
                                : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
                        }`}
                    >
                        🌐 SEMUA WAKTU
                    </button>
                </div>

                <button
                    type="button"
                    onClick={onResetToday}
                    className="pixel-button cursor-pointer bg-[var(--theme-gold-surface)] px-3 py-1.5 font-retro text-label font-bold tracking-normal text-[var(--theme-gold-text)] hover:bg-[var(--theme-gold-badge)]"
                >
                    ⚡ HARI INI
                </button>
            </div>

            {/* 2. Navigator bulan & tahun */}
            <div className="flex items-center justify-between gap-3 border-y-2 border-[var(--theme-border-subtle)] py-3">
                <button
                    type="button"
                    onClick={onPrevMonth}
                    className="pixel-button flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center bg-[var(--theme-card)] font-retro text-body font-bold text-[var(--theme-gold-text)] hover:bg-[var(--theme-card-gold)]"
                    title="Bulan Sebelumnya"
                    aria-label="Bulan sebelumnya"
                >
                    ◀
                </button>

                <div className="min-w-0 text-center">
                    <div
                        key={`${currentYear}-${currentMonth}`}
                        className={`truncate font-retro text-display font-bold tracking-wide text-[var(--theme-text)] md:text-2xl ${
                            monthDirection === 'prev'
                                ? 'motion-page-prev'
                                : monthDirection === 'next'
                                  ? 'motion-page-next'
                                  : ''
                        }`}
                    >
                        {MONTH_NAMES[currentMonth - 1]}{' '}
                        <span className="text-[var(--theme-gold-text)]">{currentYear}</span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onNextMonth}
                    className="pixel-button flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center bg-[var(--theme-card)] font-retro text-body font-bold text-[var(--theme-gold-text)] hover:bg-[var(--theme-card-gold)]"
                    title="Bulan Berikutnya"
                    aria-label="Bulan berikutnya"
                >
                    ▶
                </button>
            </div>

            {/* 3. Pilihan pekan (Mgg 1–5) */}
            <div className="grid min-w-0 grid-cols-5 gap-1.5 sm:gap-2">
                {weeks.map((w) => {
                    const isActive = w.weekNumber === selectedWeek
                    return (
                        <button
                            key={w.weekNumber}
                            type="button"
                            onClick={() => onSelectWeek(w.weekNumber)}
                            aria-pressed={isActive}
                            className={`flex min-h-[52px] min-w-0 flex-col items-center justify-center gap-0.5 border-2 border-[var(--theme-border)] px-1 py-2 text-center transition-all cursor-pointer ${
                                isActive
                                    ? 'bg-[var(--theme-gold)] font-bold text-black shadow-[2px_2px_0px_var(--theme-shadow)]'
                                    : 'bg-[var(--theme-card-subtle)] text-[var(--theme-text-muted)] hover:bg-[var(--theme-card)] hover:text-[var(--theme-text)]'
                            }`}
                        >
                            <span className="font-retro text-label tracking-normal">
                                MGG {w.weekNumber}
                            </span>
                            <span
                                className={`max-w-full truncate font-mono text-meta tabular-nums ${
                                    isActive ? 'font-bold text-black' : 'text-[var(--theme-text-muted)]'
                                }`}
                            >
                                {formatWeekRange(w)}
                            </span>
                        </button>
                    )
                })}
            </div>
        </section>
    )
}
