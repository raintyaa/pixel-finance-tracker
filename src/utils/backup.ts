import type { BackupData, BudgetConfig, Transaction } from '../types/finance'
import { DAYS_OF_WEEK, getTodayDateString } from './date'

/**
 * Utilitas untuk mengunduh string konten ke perangkat pengguna
 * menggunakan Blob dan URL Object bawaan browser (tanpa dependensi luar).
 */
export function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Mengekspor seluruh data transaksi dan batas budget ke file JSON cadangan.
 */
export function exportToJson(transactions: Transaction[], budget?: BudgetConfig): void {
  const todayIso = getTodayDateString()
  const backupPayload: BackupData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    appName: 'Pixel Ledger',
    transactions,
    budget,
  }

  const jsonContent = JSON.stringify(backupPayload, null, 2)
  const filename = `pixel-ledger-backup-${todayIso}.json`
  downloadFile(filename, jsonContent, 'application/json;charset=utf-8')
}

/**
 * Helper untuk mengamankan nilai string di CSV agar tidak merusak format.
 */
function escapeCsv(value: string | number | boolean | undefined | null): string {
  if (value === undefined || value === null) return '""'
  const str = String(value).replace(/"/g, '""')
  return `"${str}"`
}

/**
 * Mengekspor riwayat transaksi ke format tabular CSV (didukung Excel dan Google Sheets).
 * Menyertakan BOM (Byte Order Mark) UTF-8 agar karakter tidak berantakan saat dibuka di Windows Excel.
 */
export function exportToCsv(transactions: Transaction[]): void {
  const todayIso = getTodayDateString()
  const headers = [
    'ID Transaksi',
    'Tanggal',
    'Hari',
    'Tipe',
    'Kategori',
    'Keterangan',
    'Nominal (Rp)',
    'Status Buku',
  ]

  const rows = transactions.map((tx) => {
    const dayName = DAYS_OF_WEEK[tx.dayOfWeek] || '-'
    const typeLabel = tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'
    let statusLabel = 'Normal'
    if (tx.isClosedToBalance) {
      statusLabel = 'Dibukukan (Reset)'
    } else if (tx.isAdjustmentExpense === false) {
      statusLabel = 'Koreksi Saldo / Transfer'
    }

    return [
      escapeCsv(tx.id),
      escapeCsv(tx.date),
      escapeCsv(dayName),
      escapeCsv(typeLabel),
      escapeCsv(tx.category),
      escapeCsv(tx.description),
      tx.amount,
      escapeCsv(statusLabel),
    ].join(',')
  })

  // Tambahkan \uFEFF (UTF-8 BOM) untuk kompatibilitas Microsoft Excel
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n')
  const filename = `pixel-ledger-rekap-${todayIso}.csv`
  downloadFile(filename, csvContent, 'text/csv;charset=utf-8;')
}

export interface ParseResult {
  valid: boolean
  error?: string
  data?: BackupData
}

/**
 * Memvalidasi dan mem-parse file JSON cadangan untuk mencegah data korup atau skema tidak cocok.
 */
export function validateAndParseBackupJson(rawJson: string): ParseResult {
  try {
    const parsed: unknown = JSON.parse(rawJson)

    if (!parsed || typeof parsed !== 'object') {
      return { valid: false, error: 'Format berkas tidak valid (bukan objek JSON).' }
    }

    const payload = parsed as Record<string, unknown>

    // Cek apakah ada field transactions berupa array
    let txList: unknown = payload.transactions
    // Fallback toleran jika user mengimpor array langsung dari file transaksi mentah
    if (Array.isArray(payload) && !txList) {
      txList = payload
    }

    if (!Array.isArray(txList)) {
      return {
        valid: false,
        error: 'Berkas tidak memuat daftar transaksi yang valid (field "transactions" tidak ditemukan).',
      }
    }

    // Validasi setiap item transaksi
    const validatedTransactions: Transaction[] = []
    for (let i = 0; i < txList.length; i++) {
      const item = txList[i]
      if (!item || typeof item !== 'object') {
        return { valid: false, error: `Transaksi pada indeks #${i + 1} bukan objek yang valid.` }
      }

      const tx = item as Partial<Transaction>

      if (!tx.id || typeof tx.id !== 'string') {
        return { valid: false, error: `Transaksi pada indeks #${i + 1} tidak memiliki ID yang valid.` }
      }

      if (tx.type !== 'income' && tx.type !== 'expense') {
        return {
          valid: false,
          error: `Transaksi "${tx.description || tx.id}" memiliki tipe yang tidak valid (harus "income" atau "expense").`,
        }
      }

      const amount = Number(tx.amount)
      if (isNaN(amount) || amount < 0) {
        return {
          valid: false,
          error: `Transaksi "${tx.description || tx.id}" memiliki nominal yang tidak valid.`,
        }
      }

      if (!tx.date || typeof tx.date !== 'string') {
        return {
          valid: false,
          error: `Transaksi "${tx.description || tx.id}" tidak memiliki tanggal yang valid.`,
        }
      }

      validatedTransactions.push({
        id: String(tx.id),
        type: tx.type,
        amount,
        description: String(tx.description || ''),
        category: String(tx.category || 'Lain-lain'),
        date: tx.date,
        dayOfWeek: typeof tx.dayOfWeek === 'number' ? tx.dayOfWeek : 0,
        isClosedToBalance: Boolean(tx.isClosedToBalance),
        isAdjustmentExpense:
          tx.isAdjustmentExpense !== undefined ? Boolean(tx.isAdjustmentExpense) : undefined,
      })
    }

    let validatedBudget: BudgetConfig | undefined = undefined
    if (payload.budget && typeof payload.budget === 'object') {
      const b = payload.budget as Partial<BudgetConfig>
      if (typeof b.monthlyLimit === 'number' && b.monthlyLimit > 0) {
        validatedBudget = {
          monthlyLimit: b.monthlyLimit,
          excludeAdjustmentsFromBudget:
            b.excludeAdjustmentsFromBudget !== undefined
              ? Boolean(b.excludeAdjustmentsFromBudget)
              : true,
          categoryLimits: b.categoryLimits,
        }
      }
    }

    return {
      valid: true,
      data: {
        version: typeof payload.version === 'string' ? payload.version : '1.0',
        exportedAt: typeof payload.exportedAt === 'string' ? payload.exportedAt : new Date().toISOString(),
        appName: typeof payload.appName === 'string' ? payload.appName : 'Pixel Ledger',
        transactions: validatedTransactions,
        budget: validatedBudget,
      },
    }
  } catch (err) {
    return {
      valid: false,
      error: `Gagal membaca berkas JSON: ${err instanceof Error ? err.message : 'Format rusak'}`,
    }
  }
}
