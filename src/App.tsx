import { useEffect, useMemo, useState } from 'react'
import BalanceCards from './components/BalanceCards'
import ConfirmDialog from './components/ConfirmDialog'
import PeriodNavigator, { type ViewScope } from './components/PeriodNavigator'
import Sidebar from './components/Sidebar'
import TransactionModal from './components/TransactionModal'
import WeeklyTable from './components/WeeklyTable'
import type { Transaction } from './types/finance'
import { getTodayDateString, getWeeksInMonth, MONTH_NAMES } from './utils/date'
import { loadTransactions, saveTransactions } from './utils/storage'

export default function App() {
  // Lazy initial state: muat data tersimpan (atau data awal jika belum ada)
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadTransactions())
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  // Persistensi otomatis (Hari 10): simpan setiap kali daftar transaksi berubah
  useEffect(() => {
    saveTransactions(transactions)
  }, [transactions])

  // Denyut indikator "TERSIMPAN LOKAL" — dipicu dari aksi pengguna yang menulis data
  const [saveTick, setSaveTick] = useState<number>(0)

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

  // Arah navigasi bulan & transaksi yang baru disentuh (untuk animasi gerak)
  const [monthDirection, setMonthDirection] = useState<'prev' | 'next' | null>(null)
  const [highlight, setHighlight] = useState<{ id: string; tick: number } | null>(null)

  // 2. Hitung Daftar Pekan untuk Bulan yang Aktif
  const weeks = useMemo(
    () => getWeeksInMonth(selectedYear, selectedMonth),
    [selectedYear, selectedMonth]
  )

  const activeWeekInfo = weeks.find((w) => w.weekNumber === selectedWeek) || weeks[0]

  // 3. Handler Navigasi Bulan & Reset Hari Ini
  const handlePrevMonth = () => {
    setMonthDirection('prev')
    if (selectedMonth === 1) {
      setSelectedYear((y) => y - 1)
      setSelectedMonth(12)
    } else {
      setSelectedMonth((m) => m - 1)
    }
    setSelectedWeek(1)
  }

  const handleNextMonth = () => {
    setMonthDirection('next')
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
    setHighlight({ id: newTx.id, tick: Date.now() })
    setSaveTick((tick) => tick + 1)
    setIsModalOpen(false)
  }

  // 3C. Handler Ubah Transaksi (Hari 9) — pertahankan id, ganti data lama
  const handleUpdateTransaction = (updatedTx: Transaction) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === updatedTx.id ? updatedTx : tx))
    )
    setHighlight({ id: updatedTx.id, tick: Date.now() })
    setSaveTick((tick) => tick + 1)
    setEditingTransaction(null)
  }

  // 3D. Handler Konfirmasi Hapus Transaksi (Hari 9) — buang transaksi terpilih
  const handleConfirmDelete = () => {
    if (!deletingTransaction) return
    setTransactions((prev) => prev.filter((tx) => tx.id !== deletingTransaction.id))
    setSaveTick((tick) => tick + 1)
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
      data-theme="neo-gold"
      className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] selection:bg-[var(--theme-gold)] selection:text-black"
    >
      <div className="flex min-h-screen flex-col lg:flex-row">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top Header: breadcrumb, status penyimpanan, aksi utama */}
          <header className="z-30 border-b-2 border-black bg-white lg:sticky lg:top-0">
            <h1 className="sr-only">Dashboard Pixel Ledger</h1>
            <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
              <nav aria-label="Breadcrumb" className="font-pixel text-meta text-[var(--theme-text-muted)]">
                <ol className="flex items-center gap-1.5">
                  <li className="font-bold text-[var(--theme-gold-text)]">Pixel Ledger</li>
                  <li aria-hidden="true" className="text-[#d4d4d8]">
                    &gt;
                  </li>
                  <li className="font-bold text-[var(--theme-text)]">Dashboard</li>
                </ol>
              </nav>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 border-2 border-black bg-[var(--theme-card-subtle)] px-2.5 py-1.5 font-retro text-label font-bold tracking-normal text-[var(--theme-text)]"
                  title="Data tersimpan otomatis di browser ini dan tetap aman saat offline"
                >
                  <span
                    key={saveTick}
                    className="motion-save-beat h-2 w-2 border border-black bg-[var(--theme-income)]"
                  />
                  TERSIMPAN LOKAL
                </span>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="pixel-button cursor-pointer bg-[var(--theme-gold)] px-4 py-2.5 font-retro text-meta font-bold text-black hover:bg-[var(--theme-gold-hover)]"
                >
                  + CATAT TRANSAKSI
                </button>
              </div>
            </div>
          </header>

          <main className="mx-auto flex w-full min-w-0 max-w-[1440px] flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {/* Section Overview: 3 kartu saldo + health bar */}
            <section aria-labelledby="overview-heading" className="flex flex-col gap-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2
                  id="overview-heading"
                  className="font-retro text-display font-bold text-black sm:text-2xl"
                >
                  <span
                    className="mr-2 inline-block h-2.5 w-2.5 border-2 border-black bg-[var(--theme-gold)] align-middle"
                    aria-hidden="true"
                  />
                  Ringkasan Saldo
                </h2>
                <p className="font-pixel text-meta text-[var(--theme-text-muted)]">
                  {viewScope === 'month'
                    ? `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`
                    : 'Semua riwayat'}
                </p>
              </div>

              <BalanceCards
                totalIncome={totalIncome}
                totalExpense={totalExpense}
                realBalance={realBalance}
              />
            </section>

            {/* Section Navigator Periode */}
            <PeriodNavigator
              currentYear={selectedYear}
              currentMonth={selectedMonth}
              selectedWeek={selectedWeek}
              weeks={weeks}
              viewScope={viewScope}
              monthDirection={monthDirection}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onSelectWeek={(w) => setSelectedWeek(w)}
              onToggleViewScope={(s) => setViewScope(s)}
              onResetToday={handleResetToday}
            />

            {/* Section Tabel Mingguan (7 Kolom Hari: Minggu s/d Sabtu) */}
            {activeWeekInfo && (
              <WeeklyTable
                key={activeWeekInfo.startDate}
                weekInfo={activeWeekInfo}
                transactions={transactions}
                highlightId={highlight?.id ?? null}
                highlightTick={highlight?.tick}
                onEditTransaction={(tx) => setEditingTransaction(tx)}
                onDeleteTransaction={(tx) => setDeletingTransaction(tx)}
              />
            )}
          </main>
        </div>
      </div>

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
