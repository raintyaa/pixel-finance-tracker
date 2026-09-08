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