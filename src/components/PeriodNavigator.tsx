import { MONTH_NAMES, type WeekInfo } from '../utils/date'
import { PixelArrowIcon, PixelBoltIcon } from './PixelIcons'

export type ViewScope = 'month' | 'all'

interface PeriodNavigatorProps {
  currentYear: number
  currentMonth: number
  selectedWeek: number
  weeks: WeekInfo[]
  monthDirection: 'prev' | 'next' | null
  onPrevMonth: () => void
  onNextMonth: () => void
  onSelectWeek: (weekNum: number) => void
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
  monthDirection,
  onPrevMonth,
  onNextMonth,
  onSelectWeek,
  onResetToday,
}: PeriodNavigatorProps) {
  return (
    <section
      aria-label="Navigator periode"
      className="pixel-curve flex min-w-0 flex-col gap-4 bg-[var(--theme-card)] p-4 sm:p-5"
    >
      {/* Baris 1: Navigator bulan & tahun + lompat ke hari ini */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center justify-between gap-2 sm:justify-start sm:gap-3">
          <button
            type="button"
            onClick={onPrevMonth}
            className="pixel-button flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center bg-[var(--theme-card)] font-retro text-body font-bold text-[var(--theme-gold-text)] hover:bg-[var(--theme-card-gold)]"
            title="Bulan Sebelumnya"
            aria-label="Bulan sebelumnya"
          >
            <PixelArrowIcon direction="left" className="h-4 w-4" />
          </button>

          <div className="min-w-0 text-center sm:min-w-[200px]">
            <div
              key={`${currentYear}-${currentMonth}`}
              className={`truncate font-retro text-display font-bold tracking-normal text-[var(--theme-text)] sm:text-2xl ${
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
            <PixelArrowIcon direction="right" className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={onResetToday}
          className="pixel-button flex shrink-0 cursor-pointer items-center gap-1.5 bg-[var(--theme-gold-surface)] px-3 py-1.5 font-retro text-label font-bold tracking-normal text-[var(--theme-gold-text)] hover:bg-[var(--theme-gold-badge)]"
        >
          <PixelBoltIcon className="h-3.5 w-3.5" />
          <span>HARI INI</span>
        </button>
      </div>

      {/* Baris 2: Pilihan pekan berbentuk pil piksel 1-step */}
      <div className="grid min-w-0 grid-cols-2 gap-2.5 border-t-2 border-[var(--theme-border-subtle)] pt-3.5 sm:grid-cols-3 md:grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
        {weeks.map((w) => {
          const isActive = w.weekNumber === selectedWeek
          return (
            <button
              key={w.weekNumber}
              type="button"
              onClick={() => onSelectWeek(w.weekNumber)}
              aria-pressed={isActive}
              className={`flex min-h-[54px] min-w-0 cursor-pointer flex-col items-center justify-center gap-0.5 px-2.5 py-2 text-center ${
                isActive
                  ? 'pixel-pill-active bg-[var(--theme-gold)] font-bold text-black'
                  : 'pixel-pill bg-[var(--theme-card-subtle)] text-[var(--theme-text-muted)] hover:bg-[var(--theme-card)] hover:text-[var(--theme-text)]'
              }`}
            >
              <span className="font-retro text-label font-bold tracking-normal">
                MGG <span className="font-mono tabular-nums">{w.weekNumber}</span>
              </span>
              <span
                className={`max-w-full break-words text-center font-mono text-meta leading-normal tabular-nums ${
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
