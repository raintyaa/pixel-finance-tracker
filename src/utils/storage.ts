import { INITIAL_TRANSACTIONS } from '../data/initialData'
import type { BudgetConfig, Transaction } from '../types/finance'

/**
 * Utilitas persistensi data transaksi dan batas budget di LocalStorage.
 * Menggunakan Web Storage API bawaan browser tanpa dependensi tambahan.
 */
export const STORAGE_KEY = 'pixel_ledger_transactions_v2'
export const STORAGE_BACKUP_KEY = 'pixel_ledger_transactions_backup'
export const STORAGE_BUDGET_KEY = 'pixel_ledger_budget_v1'

export const DEFAULT_BUDGET: BudgetConfig = {
  monthlyLimit: 2500000,
  excludeAdjustmentsFromBudget: true,
}

/** Cek ketersediaan LocalStorage (mis. private browsing / SSR) tanpa melempar error. */
function getStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

/**
 * Membaca transaksi dari LocalStorage.
 * Jika data kosong, rusak, atau gagal di-parse, gunakan data awal sebagai fallback aman.
 */
export function loadTransactions(): Transaction[] {
  const storage = getStorage()
  if (!storage) return INITIAL_TRANSACTIONS

  try {
    // Bersihkan data contoh versi lama jika ada
    if (storage.getItem('pixel_ledger_transactions_v1')) {
      storage.removeItem('pixel_ledger_transactions_v1')
    }

    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) {
      // Fallback ke snapshot cadangan jika ada
      const backup = storage.getItem(STORAGE_BACKUP_KEY)
      if (backup) {
        const parsedBackup: unknown = JSON.parse(backup)
        if (Array.isArray(parsedBackup) && parsedBackup.length > 0) {
          storage.setItem(STORAGE_KEY, backup)
          return parsedBackup as Transaction[]
        }
      }
      return INITIAL_TRANSACTIONS
    }

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return INITIAL_TRANSACTIONS

    return parsed as Transaction[]
  } catch (error) {
    console.warn('Gagal membaca transaksi dari LocalStorage:', error)
    return INITIAL_TRANSACTIONS
  }
}

/**
 * Menyimpan seluruh transaksi ke LocalStorage sebagai JSON string.
 * Error seperti quota exceeded atau private browsing ditangani agar aplikasi tetap berjalan.
 */
export function saveTransactions(transactions: Transaction[]): void {
  const storage = getStorage()
  if (!storage) return

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(transactions))
    if (transactions.length > 0) {
      storage.setItem(STORAGE_BACKUP_KEY, JSON.stringify(transactions))
    }
  } catch (error) {
    console.warn('Gagal menyimpan transaksi ke LocalStorage:', error)
  }
}

/**
 * Menghapus data transaksi dari LocalStorage.
 * Data awal akan dimuat kembali pada pembacaan berikutnya.
 */
export function resetTransactionsToDefault(): void {
  const storage = getStorage()
  if (!storage) return

  try {
    storage.removeItem(STORAGE_KEY)
    storage.removeItem('pixel_ledger_transactions_v1')
  } catch (error) {
    console.warn('Gagal mereset transaksi di LocalStorage:', error)
  }
}

/**
 * Membaca batas budget dari LocalStorage.
 * Mengembalikan konfigurasi default jika belum pernah disetel atau terjadi kegagalan parse.
 */
export function loadBudget(): BudgetConfig {
  const storage = getStorage()
  if (!storage) return DEFAULT_BUDGET

  try {
    const raw = storage.getItem(STORAGE_BUDGET_KEY)
    if (!raw) return DEFAULT_BUDGET

    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return DEFAULT_BUDGET

    const candidate = parsed as Partial<BudgetConfig>
    const monthlyLimit =
      typeof candidate.monthlyLimit === 'number' && candidate.monthlyLimit >= 0
        ? candidate.monthlyLimit
        : DEFAULT_BUDGET.monthlyLimit

    const excludeAdjustmentsFromBudget =
      typeof candidate.excludeAdjustmentsFromBudget === 'boolean'
        ? candidate.excludeAdjustmentsFromBudget
        : DEFAULT_BUDGET.excludeAdjustmentsFromBudget

    return {
      monthlyLimit,
      categoryLimits: candidate.categoryLimits,
      excludeAdjustmentsFromBudget,
    }
  } catch (error) {
    console.warn('Gagal membaca batas budget dari LocalStorage:', error)
    return DEFAULT_BUDGET
  }
}

/**
 * Menyimpan batas budget ke LocalStorage.
 */
export function saveBudget(budget: BudgetConfig): void {
  const storage = getStorage()
  if (!storage) return

  try {
    storage.setItem(STORAGE_BUDGET_KEY, JSON.stringify(budget))
  } catch (error) {
    console.warn('Gagal menyimpan batas budget ke LocalStorage:', error)
  }
}
