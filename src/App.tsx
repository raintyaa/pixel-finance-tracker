import { useMemo, useState } from 'react'
import BalanceCards from './components/BalanceCards'
import PeriodNavigator, { type ViewScope } from './components/PeriodNavigator'
import { INITIAL_TRANSACTIONS } from './data/initialData'
import type { Transaction } from './types/finance'
import { formatRupiah } from './utils/currency'
import { formatDateIndo, getDayName, getWeeksInMonth } from './utils/date'

export default function App() {
  const [transactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS)

  // 1. State Periode Navigasi (Tahun, Bulan, Pekan, & Filter Saldo)
  const [selectedYear, setSelectedYear] = useState<number>(2026)
  const [selectedMonth, setSelectedMonth] = useState<number>(9) // 9 = September
  const [selectedWeek, setSelectedWeek] = useState<number>(2)   // Default: Minggu ke-2
  const [viewScope, setViewScope] = useState<ViewScope>('month') // 'month' atau 'all'

  // 2. Hitung Daftar Pekan untuk Bulan yang Aktif
  const weeks = useMemo(
    () => getWeeksInMonth(selectedYear, selectedMonth),
    [selectedYear, selectedMonth]
  )

  const activeWeekInfo = weeks.find((w) => w.weekNumber === selectedWeek) || weeks[0]

  // 3. Handler Navigasi Bulan & Reset
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

  // 5. Filter Transaksi Khusus Pekan yang Sedang Dipilih (Minggu s/d Sabtu)
  const weeklyTransactions = transactions.filter((tx) => {
    if (!activeWeekInfo) return false
    return tx.date >= activeWeekInfo.startDate && tx.date <= activeWeekInfo.endDate
  })

  return (
    <div className="min-h-screen bg-[#1a1921] text-[#f4f4f0] flex flex-col items-center justify-center p-4 selection:bg-[#f4b41b] selection:text-black">
      <main className="w-full max-w-3xl flex flex-col gap-6">
        
        {/* Header Retro */}
        <header className="pixel-box bg-[#252433] p-6 text-center">
          <div className="inline-block bg-[#f4b41b] text-black px-3 py-1 font-['Silkscreen'] text-xs uppercase mb-3 pixel-box-sm">
            Fase 3: Navigator Periode & Filter Saldo
          </div>
          <h1 className="font-['Silkscreen'] text-xl md:text-2xl text-[#f4b41b] tracking-wider mb-2 drop-shadow-[2px_2px_0px_#000]">
            🎮 PIXEL LEDGER
          </h1>
          <p className="text-sm text-gray-300">
            Aplikasi Pencatat Keuangan Pribadi Bergaya Retro Pixel Art & Tabel Mingguan
          </p>
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

        {/* 2. Kartu Saldo (Uang Masuk & Keluar Dinamis, Sisa Saldo FIX Total Kas Riil) */}
        <BalanceCards
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          realBalance={realBalance}
        />

        {/* 3. Daftar Transaksi Terfilter Sesuai Pekan yang Dipilih */}
        <section className="pixel-box bg-[#1f1e2c] p-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#3d3b52] pb-3">
            <div>
              <span className="font-['Silkscreen'] text-xs text-[#38b764]">
                PEKAN AKTIF: MINGGU KE-{selectedWeek}
              </span>
              <div className="text-[11px] text-gray-400 font-mono">
                Rentang: {activeWeekInfo?.label} (Minggu s/d Sabtu)
              </div>
            </div>
            <span className="text-xs bg-[#38b764] text-black px-2 py-0.5 font-bold self-start sm:self-auto">
              {weeklyTransactions.length} DATA PEKAN INI
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {weeklyTransactions.length === 0 ? (
              <div className="text-center py-6 text-gray-500 font-mono text-xs border-2 border-dashed border-[#3d3b52] p-4">
                Tidak ada transaksi tercatat di pekan ini.
              </div>
            ) : (
              weeklyTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="pixel-box-sm bg-[#2a293b] p-3 flex items-center justify-between text-xs"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#3d3b52] text-yellow-400 px-1.5 py-0.5 font-['Silkscreen'] text-[10px]">
                        {getDayName(tx.dayOfWeek)}
                      </span>
                      <span className="font-bold text-white">{tx.description}</span>
                    </div>
                    <span className="text-gray-400 text-[11px]">
                      {formatDateIndo(tx.date)} • {tx.category}
                    </span>
                  </div>

                  <div
                    className={`font-['Silkscreen'] text-xs ${
                      tx.type === 'income' ? 'text-[#38b764]' : 'text-[#e43b44]'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'} {formatRupiah(tx.amount)}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <footer className="text-center text-xs text-gray-500 font-mono">
          Target Berikutnya (Hari 6): Tampilan Grid Tabel Mingguan (Minggu - Sabtu) 📊
        </footer>
      </main>
    </div>
  )
}