// 1. Tipe Transaksi: Pengeluaran (expense) atau Uang Masuk / Pemasukan (income)
export type TransactionType = 'expense' | 'income'

// 2. Definisi Kategori
export interface Category {
    id: string
    name: string
    icon: string // Simbol / representasi ikon pixel (misal: 🍔, 🚗, 💰)
    type: TransactionType
}

// 3. Model Utama Transaksi Harian
export interface Transaction {
    id: string
    type: TransactionType
    amount: number // Nominal uang (contoh: 25000)
    description: string // Keterangan transaksi (contoh: "Makan siang nasi padang")
    category: string // Nama atau ID kategori
    date: string // Format ISO "YYYY-MM-DD"
    dayOfWeek: number // 0 = Minggu, 1 = Senin, 2 = Selasa, ..., 6 = Sabtu
    isClosedToBalance?: boolean // Ditutup buku / di-reset dari pengeluaran bulanan tanpa mengubah saldo kas riil
    isAdjustmentExpense?: boolean // Apakah penyesuaian saldo dihitung sebagai beban pengeluaran bulanan
}

// 4. Model Navigasi Periode Mingguan (Bulan & Minggu ke-N)
export interface WeekPeriod {
    year: number // Contoh: 2026
    month: number // 1 - 12 (Januari - Desember)
    weekNumber: number // 1 - 5 (Minggu ke-1 s/d Minggu ke-5)
    startDate: string // Tanggal awal minggu (Hari Minggu)
    endDate: string // Tanggal akhir minggu (Hari Sabtu)
}

// 5. Model Ringkasan Keuangan Mingguan
export interface WeeklySummary {
    totalIncome: number
    totalExpense: number
    netBalance: number // Saldo bersih (Pemasukan - Pengeluaran)
}

// 6. Model Batas Budget Bulanan (Hari 11)
export interface BudgetConfig {
    monthlyLimit: number // Batas pengeluaran bulanan dalam Rupiah (contoh: 2500000)
    categoryLimits?: Record<string, number> // Batas opsional per kategori
    excludeAdjustmentsFromBudget?: boolean // Abaikan Penyesuaian Saldo dari perhitungan HP Bar Budget
}

// 7. Model Cadangan Data Eksternal (Hari 12)
export interface BackupData {
    version: string
    exportedAt: string
    appName: string
    transactions: Transaction[]
    budget?: BudgetConfig
}