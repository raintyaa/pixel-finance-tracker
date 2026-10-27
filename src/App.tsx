import { useEffect, useMemo, useState } from 'react'
import BalanceCards from './components/BalanceCards'
import ConfirmDialog from './components/ConfirmDialog'
import PeriodNavigator, { type ViewScope } from './components/PeriodNavigator'
import TransactionModal from './components/TransactionModal'
import WeeklyTable from './components/WeeklyTable'
import type { Transaction } from './types/finance'
import { getTodayDateString, getWeeksInMonth } from './utils/date'
import { loadTransactions, saveTransactions } from './utils/storage'

export type ThemePalette = 'neo-gold' | 'warm-paper' | 'cyber-arcade'

export default function App() {
  // 0. State Tema Tampilan (Default: Opsi 1 Clean Neo-Gold)
  const [theme, setTheme] = useState<ThemePalette>(() => {
    try {
      const saved = localStorage.getItem('pixel_ledger_theme')
      if (saved === 'neo-gold' || saved === 'warm-paper' || saved === 'cyber-arcade') {
        return saved
      }
    } catch {
      // fallback jika localStorage tidak tersedia
    }
    return 'neo-gold'
  })

  useEffect(() => {
    try {
      localStorage.setItem('pixel_ledger_theme', theme)
    } catch {
      // ignore
    }
  }, [theme])

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
    <div
      data-theme={theme}
      className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] flex flex-col items-center justify-center p-4 selection:bg-[var(--theme-gold)] selection:text-black transition-colors duration-200"
    >
      {/* Lebar container disesuaikan (max-w-6xl) agar 7 kolom hari tampil lega */}
      <main className="w-full max-w-6xl flex flex-col gap-6 my-6">

        {/* Bar Pemilih Palet Tema (Opsi 1, Opsi 2, Opsi 3) */}
        <section className="bg-[var(--theme-card)] border-2 border-[var(--theme-border)] p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[2px_2px_0px_var(--theme-shadow)]">
          <div className="flex items-center gap-2">
            <span className="text-base">🎨</span>
            <span className="font-['Silkscreen'] text-xs text-[var(--theme-gold-text)] font-bold tracking-wider">
              PALET WARNA:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-['Silkscreen']">
            <button
              type="button"
              onClick={() => setTheme('neo-gold')}
              className={`pixel-button px-3 py-1 cursor-pointer font-bold ${
                theme === 'neo-gold'
                  ? 'bg-[var(--theme-gold)] text-black'
                  : 'bg-[var(--theme-card-subtle)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
              }`}
            >
              🌟 1. Clean Neo-Gold
            </button>
            <button
              type="button"
              onClick={() => setTheme('warm-paper')}
              className={`pixel-button px-3 py-1 cursor-pointer font-bold ${
                theme === 'warm-paper'
                  ? 'bg-[var(--theme-gold)] text-black'
                  : 'bg-[var(--theme-card-subtle)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
              }`}
            >
              📜 2. Warm Paper
            </button>
            <button
              type="button"
              onClick={() => setTheme('cyber-arcade')}
              className={`pixel-button px-3 py-1 cursor-pointer font-bold ${
                theme === 'cyber-arcade'
                  ? 'bg-[var(--theme-gold)] text-black'
                  : 'bg-[var(--theme-card-subtle)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
              }`}
            >
              ⚡ 3. Cyber Arcade
            </button>
          </div>
        </section>

        {/* Header Retro Minimalis */}
        <header className="pixel-box bg-[var(--theme-card)] p-6 text-center">
          <h1 className="font-['Silkscreen'] text-xl md:text-3xl text-[var(--theme-gold-text)] tracking-wider mb-2 drop-shadow-[1px_1px_0px_var(--theme-shadow)] font-bold">
            PIXEL LEDGER
          </h1>
          <p className="text-sm text-[var(--theme-text-muted)]">
            Aplikasi Pencatat Keuangan Pribadi Bergaya Retro Pixel Art &amp; Tabel Mingguan
          </p>
          <div className="flex justify-center mt-3">
            <span
              className="inline-flex items-center gap-1.5 bg-[var(--theme-gold-badge)] border-2 border-[var(--theme-border)] px-2.5 py-1 font-['Silkscreen'] text-[10px] tracking-wider text-[var(--theme-gold-text)] font-bold"
              title="Data tersimpan otomatis di browser ini dan tetap aman saat offline"
            >
              💾 TERSIMPAN LOKAL
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="pixel-button bg-[var(--theme-gold)] hover:bg-[var(--theme-gold-hover)] text-black font-['Silkscreen'] text-xs px-4 py-2.5 mt-4 cursor-pointer font-bold"
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

        <footer className="text-center text-xs text-[var(--theme-text-muted)] font-mono mt-2">
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
