import { describe, expect, it } from 'vitest'
import type { Transaction } from '../types/finance'
import {
  filterTransactions,
  getCategoryBreakdown,
  getDayOfWeekBreakdown,
  isActiveExpense,
} from '../utils/analytics'

const mockTxs: Transaction[] = [
  {
    id: 'tx-1',
    type: 'income',
    amount: 1500000,
    description: 'Uang Saku November',
    category: 'Uang Saku',
    date: '2026-11-01',
    dayOfWeek: 0,
  },
  {
    id: 'tx-2',
    type: 'expense',
    amount: 50000,
    description: 'Beli Beras',
    category: 'Makanan & Minuman',
    date: '2026-11-01',
    dayOfWeek: 0,
  },
  {
    id: 'tx-3',
    type: 'expense',
    amount: 25000,
    description: 'Beli Kopi',
    category: 'Makanan & Minuman',
    date: '2026-11-02',
    dayOfWeek: 1,
  },
  {
    id: 'tx-4',
    type: 'expense',
    amount: 25000,
    description: 'Bensin Motor',
    category: 'Transportasi',
    date: '2026-11-03',
    dayOfWeek: 2,
  },
  {
    id: 'tx-5',
    type: 'expense',
    amount: 6500,
    description: 'Biaya Admin Transfer',
    category: 'Biaya Admin',
    date: '2026-11-04',
    dayOfWeek: 3,
    isAdjustmentExpense: true,
  },
  {
    id: 'tx-6',
    type: 'expense',
    amount: 500000,
    description: 'Transfer ke DANA',
    category: 'Penyesuaian Saldo',
    date: '2026-11-04',
    dayOfWeek: 3,
    isAdjustmentExpense: false,
  },
  {
    id: 'tx-7',
    type: 'expense',
    amount: 100000,
    description: 'Pengeluaran Lama Direset',
    category: 'Belanja',
    date: '2026-11-01',
    dayOfWeek: 0,
    isClosedToBalance: true,
  },
]

describe('analytics & history helpers', () => {
  describe('isActiveExpense', () => {
    it('returns true for regular expenses and admin fees', () => {
      expect(isActiveExpense(mockTxs[1])).toBe(true)
      expect(isActiveExpense(mockTxs[4])).toBe(true)
    })

    it('returns false for income, non-expense adjustments, and closed expenses', () => {
      expect(isActiveExpense(mockTxs[0])).toBe(false) // income
      expect(isActiveExpense(mockTxs[5])).toBe(false) // isAdjustmentExpense: false
      expect(isActiveExpense(mockTxs[6])).toBe(false) // isClosedToBalance: true
    })
  })

  describe('getCategoryBreakdown', () => {
    it('aggregates active expenses by category sorted descending', () => {
      const breakdown = getCategoryBreakdown(mockTxs)
      // Total active expense = 50.000 + 25.000 + 25.000 + 6.500 = 106.500
      expect(breakdown.length).toBe(3)
      expect(breakdown[0].category).toBe('Makanan & Minuman')
      expect(breakdown[0].total).toBe(75000)
      expect(breakdown[0].count).toBe(2)
      expect(breakdown[0].percentage).toBe(Math.round((75000 / 106500) * 100))

      expect(breakdown[1].category).toBe('Transportasi')
      expect(breakdown[1].total).toBe(25000)

      expect(breakdown[2].category).toBe('Biaya Admin')
      expect(breakdown[2].total).toBe(6500)
    })

    it('returns empty array when no active expenses exist', () => {
      expect(getCategoryBreakdown([mockTxs[0], mockTxs[5], mockTxs[6]])).toEqual([])
    })
  })

  describe('getDayOfWeekBreakdown', () => {
    it('returns 7 day slots summing active expenses and marking the highest day', () => {
      const days = getDayOfWeekBreakdown(mockTxs)
      expect(days.length).toBe(7)
      expect(days[0].dayName).toBe('Minggu')
      expect(days[0].total).toBe(50000)
      expect(days[0].isHighest).toBe(true)

      expect(days[1].dayName).toBe('Senin')
      expect(days[1].total).toBe(25000)
      expect(days[1].isHighest).toBe(false)

      expect(days[3].dayName).toBe('Rabu')
      expect(days[3].total).toBe(6500) // only admin fee, transfer excluded

      expect(days[6].dayName).toBe('Sabtu')
      expect(days[6].total).toBe(0)
    })
  })

  describe('filterTransactions', () => {
    it('sorts results newest date first by default', () => {
      const res = filterTransactions(mockTxs, {
        query: '',
        type: 'all',
        category: 'all',
        includeArchived: true,
      })
      expect(res.length).toBe(7)
      expect(res[0].date).toBe('2026-11-04')
      expect(res[res.length - 1].date).toBe('2026-11-01')
    })

    it('filters by query across description and category case-insensitively', () => {
      const res = filterTransactions(mockTxs, {
        query: 'kopi',
        type: 'all',
        category: 'all',
        includeArchived: true,
      })
      expect(res.length).toBe(1)
      expect(res[0].id).toBe('tx-3')

      const byCat = filterTransactions(mockTxs, {
        query: 'transportasi',
        type: 'all',
        category: 'all',
        includeArchived: true,
      })
      expect(byCat.length).toBe(1)
      expect(byCat[0].id).toBe('tx-4')
    })

    it('filters by transaction type and category', () => {
      const incomes = filterTransactions(mockTxs, {
        query: '',
        type: 'income',
        category: 'all',
        includeArchived: true,
      })
      expect(incomes.length).toBe(1)
      expect(incomes[0].id).toBe('tx-1')

      const food = filterTransactions(mockTxs, {
        query: '',
        type: 'expense',
        category: 'Makanan & Minuman',
        includeArchived: true,
      })
      expect(food.length).toBe(2)
    })

    it('hides closed and non-expense adjustments when includeArchived is false', () => {
      const activeOnly = filterTransactions(mockTxs, {
        query: '',
        type: 'all',
        category: 'all',
        includeArchived: false,
      })
      expect(activeOnly.map((t) => t.id)).not.toContain('tx-6')
      expect(activeOnly.map((t) => t.id)).not.toContain('tx-7')
      expect(activeOnly.length).toBe(5)
    })
  })
})
