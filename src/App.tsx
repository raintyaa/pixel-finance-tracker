import { useEffect, useMemo, useState } from 'react'
import AdjustBalanceModal from './components/AdjustBalanceModal'
import AnalyticsView from './components/AnalyticsView'
import BalanceCards from './components/BalanceCards'
import BackupModal from './components/BackupModal'
import BudgetModal from './components/BudgetModal'
import ConfirmDialog from './components/ConfirmDialog'
import HistoryView from './components/HistoryView'
import PeriodNavigator, { type ViewScope } from './components/PeriodNavigator'
import {
  PixelCalendarIcon,
  PixelGlobeIcon,
  PixelPlusIcon,
} from './components/PixelIcons'
import PixelToast, { type ToastItem } from './components/PixelToast'
import ResetExpenseModal from './components/ResetExpenseModal'
import Sidebar, { type ActiveTab } from './components/Sidebar'
import TransactionModal from './components/TransactionModal'
import WeeklyTable from './components/WeeklyTable'
import type { BudgetConfig, Transaction } from './types/finance'
import { isActiveExpense, isBudgetExpense } from './utils/analytics'
import { formatRupiah } from './utils/currency'
import {
  formatDateIndo,
  getDayName,
  getDayOfWeekFromDate,
  getTodayDateString,
  getWeeksInMonth,
  MONTH_NAMES,
} from './utils/date'
import { runViewTransition } from './utils/motion'
import {
  loadBudget,
  loadTheme,
  loadTransactions,
  resetTransactionsToDefault,
  saveBudget,
  saveTheme,
  saveTransactions,
  type ThemeId,
} from './utils/storage'

const TAB_LABELS: Record<ActiveTab, string> = {
  dashboard: 'Dashboard',
  analytics: 'Analisis',
  history: 'Riwayat Transaksi',
}

export default function App() {
  // Lazy initial state: muat data tersimpan (atau data awal jika belum ada)
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadTransactions())
  const [budget, setBudget] = useState<BudgetConfig>(() => loadBudget())
  const [theme, setTheme] = useState<ThemeId>(() => loadTheme())
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [quickAddDate, setQuickAddDate] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastItem | null>(null)
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState<boolean>(false)
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState<boolean>(false)
  const [isResetExpenseModalOpen, setIsResetExpenseModalOpen] = useState<boolean>(false)
  const [isBackupModalOpen, setIsBackupModalOpen] = useState<boolean>(false)

  // Persistensi otomatis (Hari 10): simpan setiap kali daftar transaksi berubah
  useEffect(() => {
    saveTransactions(transactions)
  }, [transactions])

  // Auto-dismiss toast piksel setelah 4,5 detik
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 4500)
    return () => window.clearTimeout(timer)
  }, [toast])

  const handleChangeTheme = (nextTheme: ThemeId) => {
    setTheme(nextTheme)
    saveTheme(nextTheme)
  }

  const handleSelectTab = (nextTab: ActiveTab) => {
    if (nextTab === activeTab) return
    runViewTransition(() => setActiveTab(nextTab))
  }

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

  const jumpToDate = (isoDate: string) => {
    const [y, m] = isoDate.split('-').map(Number)
    if (!y || !m) return
    const targetWeeks = getWeeksInMonth(y, m)
    const match = targetWeeks.find((w) => isoDate >= w.startDate && isoDate <= w.endDate)
    setSelectedYear(y)
    setSelectedMonth(m)
    setSelectedWeek(match ? match.weekNumber : 1)
    runViewTransition(() => setActiveTab('dashboard'))
    setToast(null)
  }

  // 3B. Handler Tambah Transaksi Baru (Hari 7: Form & Modal Input Cepat)
  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions((prev) => [newTx, ...prev])
    setHighlight({ id: newTx.id, tick: Date.now() })
    setSaveTick((tick) => tick + 1)
    setIsModalOpen(false)
    setQuickAddDate(null)

    const isOutsideActiveWeek =
      !activeWeekInfo ||
      newTx.date < activeWeekInfo.startDate ||
      newTx.date > activeWeekInfo.endDate ||
      activeTab !== 'dashboard'

    setToast({
      id: Date.now(),
      variant: 'success',
      message: `Tercatat · ${newTx.type === 'income' ? '+' : '-'}${formatRupiah(newTx.amount)}`,
      actionLabel: isOutsideActiveWeek ? 'LIHAT PEKAN' : undefined,
      onAction: isOutsideActiveWeek ? () => jumpToDate(newTx.date) : undefined,
    })
  }

  // 3C. Handler Ubah Transaksi (Hari 9) — pertahankan id, ganti data lama
  const handleUpdateTransaction = (updatedTx: Transaction) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === updatedTx.id ? updatedTx : tx))
    )
    setHighlight({ id: updatedTx.id, tick: Date.now() })
    setSaveTick((tick) => tick + 1)
    setEditingTransaction(null)
    setToast({
      id: Date.now(),
      variant: 'success',
      message: 'Transaksi diperbarui',
    })
  }

  // 3D. Handler Konfirmasi Hapus Transaksi (Hari 9) — buang transaksi terpilih dengan opsi Undo
  const handleConfirmDelete = () => {
    if (!deletingTransaction) return
    const removed = deletingTransaction
    setTransactions((prev) => prev.filter((tx) => tx.id !== removed.id))
    setSaveTick((tick) => tick + 1)
    setDeletingTransaction(null)
    setToast({
      id: Date.now(),
      variant: 'delete',
      message: 'Transaksi dihapus',
      actionLabel: 'URUNGKAN',
      onAction: () => {
        setTransactions((prev) => [removed, ...prev])
        setSaveTick((tick) => tick + 1)
        setToast(null)
      },
    })
  }

  // 3E. Handler Atur / Rekonsiliasi Saldo Riil
  const handleAdjustBalance = (newTxs: Transaction[]) => {
    setTransactions((prev) => [...newTxs, ...prev])
    if (newTxs.length > 0) {
      setHighlight({ id: newTxs[0].id, tick: Date.now() })
    }
    setSaveTick((tick) => tick + 1)
    setIsAdjustModalOpen(false)
  }

  const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`

  // 3F. Handler Simpan Batas Budget Bulanan (Hari 11)
  const handleSaveBudget = (newLimit: number) => {
    const updated: BudgetConfig = {
      ...budget,
      monthlyLimit: newLimit,
    }
    setBudget(updated)
    saveBudget(updated)
    setSaveTick((tick) => tick + 1)
  }

  // 3G. Handler Kelola & Reset Pengeluaran Bulan Ini
  const handleResetExpenseKeepBalance = () => {
    setTransactions((prev) =>
      prev.map((tx) =>
        tx.type === 'expense' && tx.date.startsWith(monthPrefix)
          ? { ...tx, isClosedToBalance: true }
          : tx
      )
    )
    setSaveTick((t) => t + 1)
  }

  const handleDeleteSingleExpense = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id))
    setSaveTick((t) => t + 1)
  }

  const handleResetAllMonthExpenses = () => {
    setTransactions((prev) =>
      prev.filter((tx) => !(tx.type === 'expense' && tx.date.startsWith(monthPrefix)))
    )
    setSaveTick((t) => t + 1)
  }

  // 3H. Handler Pulihkan Data & Reset Pabrik (Hari 12)
  const handleRestoreData = (
    restoredTransactions: Transaction[],
    restoredBudget?: BudgetConfig
  ) => {
    setTransactions(restoredTransactions)
    if (restoredBudget) {
      setBudget(restoredBudget)
      saveBudget(restoredBudget)
    }
    setSaveTick((t) => t + 1)
  }

  const handleResetToDefault = () => {
    resetTransactionsToDefault()
    setTransactions(loadTransactions())
    const defaultBudget = { monthlyLimit: 1500000, excludeAdjustmentsFromBudget: true }
    setBudget(defaultBudget)
    saveBudget(defaultBudget)
    setSaveTick((t) => t + 1)
  }

  // 4A. Sisa Saldo Riil Keseluruhan (Total Kas Nyata, Tidak Berubah Saat Navigasi Bulan)
  const allTimeIncome = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((acc, tx) => acc + tx.amount, 0)

  const allTimeExpense = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((acc, tx) => acc + tx.amount, 0)

  const realBalance = allTimeIncome - allTimeExpense

  // 4B. Filter Uang Masuk & Pengeluaran Sesuai Scope (Bulan Ini vs Semua Waktu)
  const scopedTransactions =
    viewScope === 'month'
      ? transactions.filter((tx) => tx.date.startsWith(monthPrefix))
      : transactions

  const totalIncome = scopedTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((acc, tx) => acc + tx.amount, 0)

  const totalExpense = scopedTransactions
    .filter(isActiveExpense)
    .reduce((acc, tx) => acc + tx.amount, 0)

  // Seluruh daftar pengeluaran aktif bulan aktif untuk modal kelola & reset pengeluaran
  const monthlyExpenses = useMemo(
    () => transactions.filter((tx) => tx.date.startsWith(monthPrefix) && isActiveExpense(tx)),
    [transactions, monthPrefix]
  )

  // Pengeluaran yang dibebankan ke batas budget (menghormati opsi eksplisit isAdjustmentExpense === true)
  const budgetExpense = useMemo(() => {
    const excludeLegacy = budget.excludeAdjustmentsFromBudget ?? true
    return scopedTransactions
      .filter((tx) => isBudgetExpense(tx, excludeLegacy))
      .reduce((acc, tx) => acc + tx.amount, 0)
  }, [scopedTransactions, budget.excludeAdjustmentsFromBudget])

  const todayIso = getTodayDateString()
  const todayLabel = `${getDayName(getDayOfWeekFromDate(todayIso))}, ${formatDateIndo(todayIso)}`

  return (
    <div
      data-theme={theme}
      className="ledger-canvas min-h-screen text-[var(--theme-text)] selection:bg-[var(--theme-gold)] selection:text-black"
    >
      <div className="flex min-h-screen flex-col lg:flex-row">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onOpenBudget={() => setIsBudgetModalOpen(true)}
          onOpenBackup={() => setIsBackupModalOpen(true)}
          theme={theme}
          onChangeTheme={handleChangeTheme}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top Header ringkas: tanggal hari ini, status penyimpanan, CTA utama */}
          <header className="z-30 border-b-2 border-[var(--theme-border)] bg-[var(--theme-card)] shadow-[0_4px_14px_-6px_var(--theme-ambient-shadow-sm)] lg:sticky lg:top-0">
            <h1 className="sr-only">{TAB_LABELS[activeTab]} Pixel Ledger</h1>
            <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 font-sans text-meta text-[var(--theme-text-muted)]">
                <span className="font-retro text-label font-bold tracking-normal text-[var(--theme-gold-text)]">
                  {TAB_LABELS[activeTab].toUpperCase()}
                </span>
                <span aria-hidden="true">·</span>
                <span>{todayLabel}</span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span
                  className="pixel-badge inline-flex items-center gap-2 bg-[var(--theme-card-subtle)] px-3 py-1.5 font-retro text-label font-bold tracking-normal text-[var(--theme-text)]"
                  title="Data tersimpan otomatis di browser ini dan tetap aman saat offline"
                >
                  <span
                    key={saveTick}
                    className="motion-save-beat h-2 w-2 border border-[var(--theme-border)] bg-[var(--theme-income)]"
                  />
                  TERSIMPAN LOKAL
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setQuickAddDate(null)
                    setIsModalOpen(true)
                  }}
                  className="pixel-button inline-flex cursor-pointer items-center gap-1.5 bg-[var(--theme-gold)] px-4 py-2 font-retro text-meta font-bold text-black hover:bg-[var(--theme-gold-hover)]"
                >
                  <PixelPlusIcon className="h-3.5 w-3.5" />
                  <span>CATAT TRANSAKSI</span>
                </button>
              </div>
            </div>
          </header>

          <main className="main-stage mx-auto flex w-full min-w-0 max-w-[1440px] flex-1 flex-col gap-7 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {activeTab === 'dashboard' && (
              <>
                {/* Section Overview: header + scope toggle langsung di atas 3 kartu saldo */}
                <section aria-labelledby="overview-heading" className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-baseline gap-2.5">
                      <h2
                        id="overview-heading"
                        className="font-retro text-display font-bold text-[var(--theme-text)] sm:text-2xl"
                      >
                        <span
                          className="mr-2 inline-block h-2.5 w-2.5 border border-[var(--theme-border)] bg-[var(--theme-gold)] align-middle"
                          aria-hidden="true"
                        />
                        Ringkasan Saldo
                      </h2>
                      <p className="font-sans text-meta text-[var(--theme-text-muted)]">
                        {viewScope === 'month'
                          ? `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`
                          : 'Semua riwayat'}
                      </p>
                    </div>

                    <div
                      className="pixel-segment inline-flex divide-x-2 divide-[var(--theme-border)]"
                      role="group"
                      aria-label="Filter cakupan ringkasan saldo"
                    >
                      <button
                        type="button"
                        onClick={() => setViewScope('month')}
                        aria-pressed={viewScope === 'month'}
                        className={`inline-flex cursor-pointer items-center gap-1.5 px-3 py-1.5 font-retro text-label font-bold tracking-normal transition-colors ${
                          viewScope === 'month'
                            ? 'bg-[var(--theme-gold)] text-black'
                            : 'bg-[var(--theme-card)] text-[var(--theme-text-muted)] hover:bg-[var(--theme-card-subtle)] hover:text-[var(--theme-text)]'
                        }`}
                      >
                        <PixelCalendarIcon className="h-3.5 w-3.5" />
                        <span>BULAN INI</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewScope('all')}
                        aria-pressed={viewScope === 'all'}
                        className={`inline-flex cursor-pointer items-center gap-1.5 px-3 py-1.5 font-retro text-label font-bold tracking-normal transition-colors ${
                          viewScope === 'all'
                            ? 'bg-[var(--theme-gold)] text-black'
                            : 'bg-[var(--theme-card)] text-[var(--theme-text-muted)] hover:bg-[var(--theme-card-subtle)] hover:text-[var(--theme-text)]'
                        }`}
                      >
                        <PixelGlobeIcon className="h-3.5 w-3.5" />
                        <span>SEMUA WAKTU</span>
                      </button>
                    </div>
                  </div>

                  <BalanceCards
                    totalIncome={totalIncome}
                    totalExpense={totalExpense}
                    budgetExpense={budgetExpense}
                    realBalance={realBalance}
                    budgetLimit={budget.monthlyLimit}
                    onAdjustBalance={() => setIsAdjustModalOpen(true)}
                    onOpenBudget={() => setIsBudgetModalOpen(true)}
                    onResetExpense={() => setIsResetExpenseModalOpen(true)}
                  />
                </section>

                {/* Section Navigator Periode */}
                <PeriodNavigator
                  currentYear={selectedYear}
                  currentMonth={selectedMonth}
                  selectedWeek={selectedWeek}
                  weeks={weeks}
                  monthDirection={monthDirection}
                  onPrevMonth={handlePrevMonth}
                  onNextMonth={handleNextMonth}
                  onSelectWeek={(w) => setSelectedWeek(w)}
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
                    onQuickAddDate={(dateIso) => {
                      setQuickAddDate(dateIso)
                      setIsModalOpen(true)
                    }}
                  />
                )}
              </>
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView
                transactions={transactions}
                budgetLimit={budget.monthlyLimit}
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                viewScope={viewScope}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onToggleViewScope={(s) => setViewScope(s)}
              />
            )}

            {activeTab === 'history' && (
              <HistoryView
                transactions={transactions}
                onEditTransaction={(tx) => setEditingTransaction(tx)}
                onDeleteTransaction={(tx) => setDeletingTransaction(tx)}
                onOpenNewTransaction={() => {
                  setQuickAddDate(null)
                  setIsModalOpen(true)
                }}
              />
            )}
          </main>
        </div>
      </div>

      {/* Modal Atur / Koreksi Saldo Riil */}
      {isAdjustModalOpen && (
        <AdjustBalanceModal
          currentBalance={realBalance}
          onSubmit={handleAdjustBalance}
          onClose={() => setIsAdjustModalOpen(false)}
        />
      )}

      {/* Modal Batas Budget Bulanan (Hari 11) */}
      {isBudgetModalOpen && (
        <BudgetModal
          currentBudget={budget.monthlyLimit}
          currentMonthExpense={budgetExpense}
          onSubmit={handleSaveBudget}
          onClose={() => setIsBudgetModalOpen(false)}
        />
      )}

      {/* Modal Pencadangan & Pemulihan Data (Hari 12) */}
      {isBackupModalOpen && (
        <BackupModal
          transactions={transactions}
          budget={budget}
          onRestoreData={handleRestoreData}
          onResetToDefault={handleResetToDefault}
          onClose={() => setIsBackupModalOpen(false)}
        />
      )}

      {/* Modal Kelola & Reset Pengeluaran Bulan Ini */}
      {isResetExpenseModalOpen && (
        <ResetExpenseModal
          monthName={`${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`}
          expenses={monthlyExpenses}
          totalExpense={totalExpense}
          onResetExpenseKeepBalance={handleResetExpenseKeepBalance}
          onDeleteSingleExpense={handleDeleteSingleExpense}
          onResetAllMonthExpenses={handleResetAllMonthExpenses}
          onClose={() => setIsResetExpenseModalOpen(false)}
        />
      )}

      {/* Modal Input Transaksi Cepat (Mode Tambah) */}
      {isModalOpen && (
        <TransactionModal
          defaultDate={quickAddDate}
          onSubmit={handleAddTransaction}
          onClose={() => {
            setIsModalOpen(false)
            setQuickAddDate(null)
          }}
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

      {/* Toast Umpan Balik Aksi */}
      {toast && <PixelToast toast={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
}
