import { useMemo, useState } from 'react'
import BalanceCards from './components/BalanceCards'
import PeriodNavigator, { type ViewScope } from './components/PeriodNavigator'
import TransactionModal from './components/TransactionModal'
import WeeklyTable from './components/WeeklyTable'
import { INITIAL_TRANSACTIONS } from './data/initialData'
import type { Transaction } from './types/finance'
import { getWeeksInMonth } from './utils/date'

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  // 1. State Periode Navigasi (Tahun, Bulan, Pekan, & Filter Saldo)
  const [selectedYear, setSelectedYear] = useState<number>(2026)
  const [selectedMonth, setSelectedMonth] = useState<number>(9) // 9 = September
  const [selectedWeek, setSelectedWeek] = useState<number>(2)   // Default: Minggu ke-2 (ada data uji coba)
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
    setSelectedYear(2026)
    setSelectedMonth(9)
    setSelectedWeek(2)
  }

  // 3B. Handler Tambah Transaksi Baru (Hari 7: Form & Modal Input Cepat)
  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions((prev) => [newTx, ...prev])
    setIsModalOpen(false)
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
      {/* Lebar container disesuaikan (max-w-5xl) agar 7 kolom hari tampil lega */}
      <main className="w-full max-w-5xl flex flex-col gap-6 my-6">

        {/* Header Retro */}
        <header className="pixel-box bg-[#252433] p-6 text-center">
          <div className="inline-block bg-[#f4b41b] text-black px-3 py-1 font-['Silkscreen'] text-xs uppercase mb-3 pixel-box-sm">
            Fase 4: Tabel Mingguan 7 Kolom
          </div>
          <h1 className="font-['Silkscreen'] text-xl md:text-3xl text-[#f4b41b] tracking-wider mb-2 drop-shadow-[2px_2px_0px_#000]">
            🎮 PIXEL LEDGER
          </h1>
          <p className="text-sm text-gray-300">
            Aplikasi Pencatat Keuangan Pribadi Bergaya Retro Pixel Art & Tabel Mingguan
          </p>
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
          />
        )}

        <footer className="text-center text-xs text-gray-500 font-mono mt-2">
          Target Berikutnya (Hari 9): Fitur Aksi Baris Tabel (Edit & Hapus Transaksi) ⚙️
        </footer>
      </main>

      {/* Modal Input Transaksi Cepat */}
      {isModalOpen && (
        <TransactionModal
          onSubmit={handleAddTransaction}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  )
}