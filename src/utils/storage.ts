import { INITIAL_TRANSACTIONS } from '../data/initialData'
import type { Transaction } from '../types/finance'

/**
 * Utilitas persistensi data transaksi di LocalStorage.
 * Menggunakan Web Storage API bawaan browser tanpa dependensi tambahan.
 */
export const STORAGE_KEY = 'pixel_ledger_transactions_v2'

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
    if (!raw) return INITIAL_TRANSACTIONS

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
