import { describe, expect, it } from 'vitest'
import {
  DAYS_OF_WEEK,
  formatDateIndo,
  getDayName,
  getDayOfWeekFromDate,
  getWeeksInMonth,
  MONTH_NAMES,
} from '../utils/date'

describe('date utilities', () => {
  describe('constants & day name helpers', () => {
    it('has 7 days of the week starting from Minggu to Sabtu', () => {
      expect(DAYS_OF_WEEK.length).toBe(7)
      expect(DAYS_OF_WEEK[0]).toBe('Minggu')
      expect(DAYS_OF_WEEK[6]).toBe('Sabtu')
    })

    it('has 12 months with correct Indonesian names', () => {
      expect(MONTH_NAMES.length).toBe(12)
      expect(MONTH_NAMES[0]).toBe('Januari')
      expect(MONTH_NAMES[10]).toBe('November')
      expect(MONTH_NAMES[11]).toBe('Desember')
    })

    it('returns correct day name from day index', () => {
      expect(getDayName(0)).toBe('Minggu')
      expect(getDayName(1)).toBe('Senin')
      expect(getDayName(5)).toBe('Jumat')
      expect(getDayName(6)).toBe('Sabtu')
      expect(getDayName(99)).toBe('Minggu') // fallback
    })
  })

  describe('getDayOfWeekFromDate', () => {
    it('correctly identifies Sunday as 0', () => {
      // 1 November 2026 adalah hari Minggu
      expect(getDayOfWeekFromDate('2026-11-01')).toBe(0)
    })

    it('correctly identifies Monday as 1', () => {
      // 2 November 2026 adalah hari Senin
      expect(getDayOfWeekFromDate('2026-11-02')).toBe(1)
    })

    it('correctly identifies Saturday as 6', () => {
      // 21 November 2026 adalah hari Sabtu
      expect(getDayOfWeekFromDate('2026-11-21')).toBe(6)
    })
  })

  describe('formatDateIndo', () => {
    it('formats ISO dates into readable Indonesian format', () => {
      expect(formatDateIndo('2026-11-01')).toBe('1 November 2026')
      expect(formatDateIndo('2026-10-31')).toBe('31 Oktober 2026')
      expect(formatDateIndo('2026-08-17')).toBe('17 Agustus 2026')
    })

    it('returns input as-is for malformed string', () => {
      expect(formatDateIndo('')).toBe('')
      expect(formatDateIndo('invalid-date')).toBe('invalid-date')
    })
  })

  describe('getWeeksInMonth', () => {
    it('generates sequential 7-day week slots for November 2026', () => {
      const weeks = getWeeksInMonth(2026, 11)
      expect(weeks.length).toBeGreaterThanOrEqual(4)

      weeks.forEach((w, idx) => {
        expect(w.weekNumber).toBe(idx + 1)
        expect(w.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(w.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(w.label.length).toBeGreaterThan(0)
      })

      // Minggu pertama November 2026: 1 Nov 2026 (Minggu) s/d 7 Nov 2026 (Sabtu)
      expect(weeks[0].startDate).toBe('2026-11-01')
      expect(weeks[0].endDate).toBe('2026-11-07')
    })

    it('handles February in non-leap year (2026) and leap year (2024)', () => {
      const feb2026Weeks = getWeeksInMonth(2026, 2)
      expect(feb2026Weeks.length).toBeGreaterThanOrEqual(4)

      const feb2024Weeks = getWeeksInMonth(2024, 2)
      expect(feb2024Weeks.length).toBeGreaterThanOrEqual(4)
    })
  })
})
