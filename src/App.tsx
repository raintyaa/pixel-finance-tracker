import { useEffect, useMemo, useState } from 'react'
import BalanceCards from './components/BalanceCards'
import ConfirmDialog from './components/ConfirmDialog'
import PeriodNavigator, { type ViewScope } from './components/PeriodNavigator'
import TransactionModal from './components/TransactionModal'
import WeeklyTable from './components/WeeklyTable'
import type { Transaction } from './types/finance'
import { getTodayDateString, getWeeksInMonth } from './utils/date'
import { loadTransactions, saveTransactions } from './utils/storage'

export default function App() {
  // Lazy initial state: muat data tersimpan (atau data awal jika belum ada)
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadTransactions())
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  // Persistensi otomatis (Hari 10): simpan setiap kali daftar transaksi berubah
  useEffect(() => {
    saveTransactions(transactions)
  }, [transactions])

  // State Aksi Baris Tabel (Hari 9): Transaksi yang sedang diubah / akan dihapus
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null)

  // 1. State Periode Navigasi (Tahun, Bulan, Pekan, & Filter Saldo)
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth() + 1)
  const [selectedWeek, setSelectedWeek] = useState<number>(() => {
    const today = new Date()
    const currentWeeks = getWeeksInMonth(today.getFullYear(), today.getMonth() + 1)
    const todayIso = getTodayDateString()
    const match = currentWeeks.find((w) => todayIso >= w.startDate && todayIso <= w.endDate)
    return match ? match.weekNumber : 1
  })
  const [viewScope, setViewScope] = useState<ViewScope>('month') // 'month' atau 'all'

  // 2. Hitung Daftar Pekan untuk Bulan yang Aktif
  const weeks = useMemo(
    () => getWeeksInMonth(selectedYear, selectedMonth),
    [selectedYear, selectedMonth]
  )

  const activeWeekInfo = weeks.find((w) => w.weekNumber === selectedWeek) || weeks[0]

  // 3. Handler Navigasi Bulan & Reset Hari Ini
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedYear((y) => y - 1)
      setSelectedMonth(12)
    } else {
      setSelectedMonth((m) => m - 1)
    }
    setSelectedWeek(1)
  }

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedYear((y) => y + 1)
      setSelectedMonth(1)
    } else {
      setSelectedMonth((m) => m + 1)
    }
    setSelectedWeek(1)
  }

  const handleResetToday = () => {
    const today = new Date()
    const y = today.getFullYear()
    const m = today.getMonth() + 1
    setSelectedYear(y)
    setSelectedMonth(m)
    const currentWeeks = getWeeksInMonth(y, m)
    const todayIso = getTodayDateString()
    const match = currentWeeks.find((w) => todayIso >= w.startDate && todayIso <= w.endDate)
    setSelectedWeek(match ? match.weekNumber : 1)
  }

  // 3B. Handler Tambah Transaksi Baru (Hari 7: Form & Modal Input Cepat)
  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions((prev) => [newTx, ...prev])
    setIsModalOpen(false)
  }

  // 3C. Handler Ubah Transaksi (Hari 9) — pertahankan id, ganti data lama
  const handleUpdateTransaction = (updatedTx: Transaction) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === updatedTx.id ? updatedTx : tx))
    )
    setEditingTransaction(null)
  }

  // 3D. Handler Konfirmasi Hapus Transaksi (Hari 9) — buang transaksi terpilih
  const handleConfirmDelete = () => {
    if (!deletingTransaction) return
    setTransactions((prev) => prev.filter((tx) => tx.id !== deletingTransaction.id))
    setDeletingTransaction(null)
  }

  // 4A. Sisa Saldo Riil Keseluruhan (FIX: Total Kas Nyata, Tidak Berubah Saat Navigasi Bulan)
  const allTimeIncome = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((acc, tx) => acc + tx.amount, 0)

  const allTimeExpense = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((acc, tx) => acc + tx.amount, 0)

  const realBalance = allTimeIncome - allTimeExpense

  // 4B. Filter Uang Masuk & Pengeluaran Sesuai Scope (Bulan Ini vs Semua Waktu)
  const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`
  const scopedTransactions =
    viewScope === 'month'
      ? transactions.filter((tx) => tx.date.startsWith(monthPrefix))
      : transactions

  const totalIncome = scopedTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((acc, tx) => acc + tx.amount, 0)

  const totalExpense = scopedTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((acc, tx) => acc + tx.amount, 0)

  return (
    <div className="min-h-screen bg-[#1a1921] text-[#f4f4f0] flex flex-col items-center justify-center p-4 selection:bg-[#f4b41b] selection:text-black">
      {/* Lebar container disesuaikan (max-w-6xl) agar 7 kolom hari tampil lega */}
      <main className="w-full max-w-6xl flex flex-col gap-6 my-6">

        {/* Header Retro */}
        <header className="pixel-box bg-[#252433] p-6 text-center">
          <h1 className="font-['Silkscreen'] text-xl md:text-3xl text-[#f4b41b] tracking-wider mb-2 drop-shadow-[2px_2px_0px_#000]">
            PIXEL LEDGER
          </h1>
          <p className="text-sm text-[#c8c7d8]">
            Aplikasi Pencatat Keuangan Pribadi Bergaya Retro Pixel Art &amp; Tabel Mingguan
          </p>
          <div className="flex justify-center mt-3">
            <span
              className="inline-flex items-center gap-1.5 bg-[#1f1e2c] border-2 border-black px-2.5 py-1 font-['Silkscreen'] text-[10px] tracking-wider text-[#38b764]"
              title="Data tersimpan otomatis di browser ini dan tetap aman saat offline"
            >
              💾 TERSIMPAN LOKAL
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="pixel-button bg-[#f4b41b] hover:bg-[#ffcf4d] text-black font-['Silkscreen'] text-xs px-4 py-2.5 mt-4 cursor-pointer"
          >
            + CATAT TRANSAKSI
          </button>
        </header>

        {/* 1. Komponen Navigator Periode */}
        <PeriodNavigator
          currentYear={selectedYear}
          currentMonth={selectedMonth}
          selectedWeek={selectedWeek}
          weeks={weeks}
          viewScope={viewScope}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onSelectWeek={(w) => setSelectedWeek(w)}
          onToggleViewScope={(s) => setViewScope(s)}
          onResetToday={handleResetToday}
        />

        {/* 2. Kartu Saldo (3 Kartu Bersih: Uang Masuk, Pengeluaran, Sisa Saldo FIX) */}
        <BalanceCards
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          realBalance={realBalance}
        />

        {/* 3. Tampilan Utama Tabel Mingguan (7 Kolom Hari: Minggu s/d Sabtu) */}
        {activeWeekInfo && (
          <WeeklyTable
            weekInfo={activeWeekInfo}
            transactions={transactions}
            onEditTransaction={(tx) => setEditingTransaction(tx)}
            onDeleteTransaction={(tx) => setDeletingTransaction(tx)}
          />
        )}

        <footer className="text-center text-xs text-[#9c9bb0] font-mono mt-2">
          Hari 10 Selesai: Persistensi Data Lokal (LocalStorage) ✅
        </footer>
      </main>

      {/* Modal Input Transaksi Cepat (Mode Tambah) */}
      {isModalOpen && (
        <TransactionModal
          onSubmit={handleAddTransaction}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {/* Modal Ubah Transaksi (Mode Edit — Hari 9) */}
      {editingTransaction && (
        <TransactionModal
          initialData={editingTransaction}
          onSubmit={handleUpdateTransaction}
          onClose={() => setEditingTransaction(null)}
        />
      )}

      {/* Dialog Konfirmasi Hapus (Hari 9) */}
      <ConfirmDialog
        transaction={deletingTransaction}
        isOpen={deletingTransaction !== null}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingTransaction(null)}
      />
    </div>
  )
}
