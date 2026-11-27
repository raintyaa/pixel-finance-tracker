import { DEFAULT_CATEGORIES } from '../data/initialData'
import type { Transaction, TransactionType } from '../types/finance'
import { DAYS_OF_WEEK } from './date'

export interface CategoryStat {
  category: string
  icon: string
  total: number
  count: number
  percentage: number
}

export interface DayStat {
  dayIndex: number
  dayName: string
  total: number
  count: number
  isHighest: boolean
}

export interface HistoryFilters {
  query: string
  type: 'all' | TransactionType
  category: string
  includeArchived: boolean
}

/**
 * Menentukan apakah sebuah transaksi dihitung sebagai beban pengeluaran aktif
 * (mengecualikan transaksi pemasukan, transaksi yang sudah dibukukan/reset,
 * dan penyesuaian saldo non-beban).
 */
export function isActiveExpense(tx: Transaction): boolean {
  return tx.type === 'expense' && !tx.isClosedToBalance && tx.isAdjustmentExpense !== false
}

/**
 * Menentukan apakah sebuah transaksi memotong batas budget bulanan.
 * - Transaksi penyesuaian yang secara eksplisit dicentang sebagai pengeluaran (isAdjustmentExpense === true)
 *   wajib masuk perhitungan budget.
 * - Transaksi 'Penyesuaian Saldo' lama (isAdjustmentExpense === undefined) mengikuti flag legacy excludeLegacyAdjustments.
 */
export function isBudgetExpense(
  tx: Transaction,
  excludeLegacyAdjustments = true
): boolean {
  if (!isActiveExpense(tx)) return false
  if (tx.isAdjustmentExpense === true) return true
  if (excludeLegacyAdjustments && tx.category === 'Penyesuaian Saldo') return false
  return true
}

/**
 * Mencari ikon kategori berdasarkan nama kategori dari daftar baku.
 */
export function getCategoryIcon(categoryName: string): string {
  const found = DEFAULT_CATEGORIES.find((c) => c.name === categoryName)
  return found ? found.icon : '📦'
}

/**
 * Mengelompokkan beban pengeluaran aktif per kategori, diurutkan dari nominal terbesar.
 */
export function getCategoryBreakdown(transactions: Transaction[]): CategoryStat[] {
  const activeExpenses = transactions.filter(isActiveExpense)
  const grandTotal = activeExpenses.reduce((sum, tx) => sum + tx.amount, 0)

  if (grandTotal === 0) return []

  const grouped = new Map<string, { total: number; count: number }>()

  for (const tx of activeExpenses) {
    const key = tx.category || 'Lain-lain'
    const current = grouped.get(key) ?? { total: 0, count: 0 }
    current.total += tx.amount
    current.count += 1
    grouped.set(key, current)
  }

  return Array.from(grouped.entries())
    .map(([category, { total, count }]) => ({
      category,
      icon: getCategoryIcon(category),
      total,
      count,
      percentage: Math.round((total / grandTotal) * 100),
    }))
    .sort((a, b) => b.total - a.total)
}

/**
 * Menghitung pola pengeluaran aktif berdasarkan hari dalam sepekan (Minggu s/d Sabtu).
 */
export function getDayOfWeekBreakdown(transactions: Transaction[]): DayStat[] {
  const totals = Array.from({ length: 7 }, () => ({ total: 0, count: 0 }))

  for (const tx of transactions) {
    if (!isActiveExpense(tx)) continue
    const idx = tx.dayOfWeek >= 0 && tx.dayOfWeek <= 6 ? tx.dayOfWeek : 0
    totals[idx].total += tx.amount
    totals[idx].count += 1
  }

  const maxTotal = totals.reduce((max, item) => Math.max(max, item.total), 0)

  return DAYS_OF_WEEK.map((dayName, dayIndex) => ({
    dayIndex,
    dayName,
    total: totals[dayIndex].total,
    count: totals[dayIndex].count,
    isHighest: maxTotal > 0 && totals[dayIndex].total === maxTotal,
  }))
}

/**
 * Menyaring dan mengurutkan riwayat transaksi berdasarkan pencarian, tipe, kategori, dan arsip.
 */
export function filterTransactions(
  transactions: Transaction[],
  filters: HistoryFilters
): Transaction[] {
  const normalizedQuery = filters.query.trim().toLowerCase()

  return transactions
    .filter((tx) => {
      if (filters.type !== 'all' && tx.type !== filters.type) {
        return false
      }

      if (filters.category !== 'all' && tx.category !== filters.category) {
        return false
      }

      if (!filters.includeArchived && (tx.isClosedToBalance || tx.isAdjustmentExpense === false)) {
        return false
      }

      if (normalizedQuery) {
        const desc = (tx.description || '').toLowerCase()
        const cat = (tx.category || '').toLowerCase()
        if (!desc.includes(normalizedQuery) && !cat.includes(normalizedQuery)) {
          return false
        }
      }

      return true
    })
    .sort((a, b) => b.date.localeCompare(a.date))
}

export type BudgetStatusLevel = 'healthy' | 'warning' | 'critical' | 'over'

export interface BudgetHealth {
  activeBudget: number
  remainingBudget: number
  usedPercentage: number
  remainingHpPercentage: number
  status: BudgetStatusLevel
  statusLabel: string
  hearts: 0 | 1 | 2 | 3
}

/**
 * Menghitung daya tahan HP anggaran (100% -> 0% seiring kenaikan pengeluaran).
 */
export function getBudgetHealth(expense: number, limit: number): BudgetHealth {
  const activeBudget = limit > 0 ? limit : 1500000
  const remainingBudget = activeBudget - expense
  const usedPercentage = Math.round((expense / activeBudget) * 100)
  const remainingHpPercentage = Math.max(
    0,
    Math.min(100, Math.round((remainingBudget / activeBudget) * 100))
  )

  if (remainingBudget < 0) {
    return {
      activeBudget,
      remainingBudget,
      usedPercentage,
      remainingHpPercentage: 0,
      status: 'over',
      statusLabel: 'OVER BUDGET!',
      hearts: 0,
    }
  }

  if (remainingHpPercentage <= 20) {
    return {
      activeBudget,
      remainingBudget,
      usedPercentage,
      remainingHpPercentage,
      status: 'critical',
      statusLabel: 'HAMPIR HABIS',
      hearts: 1,
    }
  }

  if (remainingHpPercentage <= 50) {
    return {
      activeBudget,
      remainingBudget,
      usedPercentage,
      remainingHpPercentage,
      status: 'warning',
      statusLabel: 'MULAI MENIPIS',
      hearts: 2,
    }
  }

  return {
    activeBudget,
    remainingBudget,
    usedPercentage,
    remainingHpPercentage,
    status: 'healthy',
    statusLabel: 'DOMPET SEHAT',
    hearts: 3,
  }
}
