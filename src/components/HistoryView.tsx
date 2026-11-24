import { useMemo, useState } from 'react'
import { DEFAULT_CATEGORIES } from '../data/initialData'
import type { Transaction, TransactionType } from '../types/finance'
import { filterTransactions, getCategoryIcon, isActiveExpense } from '../utils/analytics'
import { formatRupiah } from '../utils/currency'
import { formatDateIndo, getDayName } from '../utils/date'

interface HistoryViewProps {
  transactions: Transaction[]
  onEditTransaction: (tx: Transaction) => void
  onDeleteTransaction: (tx: Transaction) => void
  onOpenNewTransaction: () => void
}

export default function HistoryView({
  transactions,
  onEditTransaction,
  onDeleteTransaction,
  onOpenNewTransaction,
}: HistoryViewProps) {
  const [query, setQuery] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [includeArchived, setIncludeArchived] = useState<boolean>(true)

  const categoryOptions = useMemo(() => {
    const names = new Set<string>(DEFAULT_CATEGORIES.map((c) => c.name))
    for (const tx of transactions) {
      if (tx.category) names.add(tx.category)
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b, 'id-ID'))
  }, [transactions])

  const filtered = useMemo(
    () =>
      filterTransactions(transactions, {
        query,
        type: typeFilter,
        category: categoryFilter,
        includeArchived,
      }),
    [transactions, query, typeFilter, categoryFilter, includeArchived]
  )

  const filteredIncome = useMemo(
    () =>
      filtered
        .filter((tx) => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0),
    [filtered]
  )

  const filteredExpense = useMemo(
    () => filtered.filter(isActiveExpense).reduce((sum, tx) => sum + tx.amount, 0),
    [filtered]
  )

  const hasActiveFilters =
    query.trim() !== '' ||
    typeFilter !== 'all' ||
    categoryFilter !== 'all' ||
    !includeArchived

  const handleResetFilters = () => {
    setQuery('')
    setTypeFilter('all')
    setCategoryFilter('all')
    setIncludeArchived(true)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Riwayat */}
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2
            id="history-heading"
            className="font-retro text-display font-bold text-black sm:text-2xl"
          >
            <span
              className="mr-2 inline-block h-2.5 w-2.5 border-2 border-black bg-[var(--theme-gold)] align-middle"
              aria-hidden="true"
            />
            Riwayat Transaksi
          </h2>
          <p className="mt-1 font-sans text-meta leading-normal text-[var(--theme-text-muted)]">
            Telusuri, cari, dan kelola seluruh catatan keuangan lintas bulan.
          </p>
        </div>
        <span className="font-mono text-meta tabular-nums text-[var(--theme-text-muted)]">
          Total tersimpan: <strong className="text-[var(--theme-text)]">{transactions.length}</strong>
        </span>
      </div>

      {/* Panel Filter & Pencarian */}
      <section
        aria-label="Filter riwayat transaksi"
        className="pixel-box flex flex-col gap-4 bg-[var(--theme-card)] p-4 sm:p-5"
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {/* Kolom Pencarian */}
          <label className="flex flex-col gap-1">
            <span className="font-retro text-label font-bold tracking-normal text-[var(--theme-text)]">
              CARI KETERANGAN / KATEGORI
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="cth: kopi, beras, bensin, biaya admin..."
              className="w-full border-2 border-[var(--theme-border)] bg-[var(--theme-card)] px-3 py-2 font-sans text-body text-[var(--theme-text)] outline-none placeholder:text-[var(--theme-text-muted)] focus:border-[var(--theme-gold)]"
            />
          </label>

          {/* Dropdown Kategori */}
          <label className="flex flex-col gap-1">
            <span className="font-retro text-label font-bold tracking-normal text-[var(--theme-text)]">
              KATEGORI
            </span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full cursor-pointer border-2 border-[var(--theme-border)] bg-[var(--theme-card)] px-3 py-2 font-sans text-body text-[var(--theme-text)] outline-none focus:border-[var(--theme-gold)]"
            >
              <option value="all">Semua Kategori</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {getCategoryIcon(cat)} {cat}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Filter Tipe & Toggle Arsip */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className="inline-flex divide-x-2 divide-black border-2 border-black"
            role="group"
            aria-label="Filter tipe transaksi"
          >
            {(
              [
                { value: 'all', label: 'SEMUA' },
                { value: 'expense', label: '💸 PENGELUARAN' },
                { value: 'income', label: '💰 PEMASUKAN' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                aria-pressed={typeFilter === opt.value}
                onClick={() => setTypeFilter(opt.value)}
                className={`cursor-pointer px-3 py-1.5 font-sans text-label font-bold tracking-normal transition-colors ${
                  typeFilter === opt.value
                    ? 'bg-[var(--theme-gold)] text-black'
                    : 'bg-[var(--theme-card)] text-[var(--theme-text-muted)] hover:bg-[var(--theme-card-subtle)] hover:text-black'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <label className="flex cursor-pointer items-center gap-2 font-sans text-meta text-[var(--theme-text)]">
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={(e) => setIncludeArchived(e.target.checked)}
              className="h-4 w-4 cursor-pointer accent-[var(--theme-gold)]"
            />
            <span>Tampilkan transaksi dibukukan &amp; transfer kas</span>
          </label>
        </div>

        {/* Ringkasan Hasil Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-[var(--theme-border-subtle)] pt-3 font-sans text-meta">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="text-[var(--theme-text-muted)]">
              Menampilkan{' '}
              <strong className="font-mono tabular-nums text-[var(--theme-text)]">
                {filtered.length}
              </strong>{' '}
              transaksi
            </span>
            <span className="font-mono font-bold tabular-nums text-[var(--theme-income)]">
              Masuk: +{formatRupiah(filteredIncome)}
            </span>
            <span className="font-mono font-bold tabular-nums text-[var(--theme-expense-text)]">
              Keluar aktif: -{formatRupiah(filteredExpense)}
            </span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="pixel-button cursor-pointer bg-[var(--theme-card-subtle)] px-2.5 py-1 font-retro text-label font-bold tracking-normal text-[var(--theme-text)] hover:bg-[var(--theme-card)]"
            >
              RESET FILTER
            </button>
          )}
        </div>
      </section>

      {/* Daftar Transaksi */}
      <section
        aria-labelledby="history-heading"
        className="pixel-box flex flex-col overflow-hidden bg-[var(--theme-card)]"
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <span className="text-3xl" aria-hidden="true">
              🗂️
            </span>
            <p className="mt-2 font-sans text-body font-bold text-[var(--theme-text)]">
              {transactions.length === 0
                ? 'Belum ada transaksi tersimpan'
                : 'Tidak ada transaksi yang cocok dengan filter'}
            </p>
            <p className="mt-1 max-w-sm font-sans text-meta leading-normal text-[var(--theme-text-muted)]">
              {transactions.length === 0
                ? 'Mulai catat pemasukan atau pengeluaran pertamamu agar riwayat muncul di sini.'
                : 'Coba ubah kata kunci pencarian, kategori, atau reset filter untuk melihat semua catatan.'}
            </p>
            <div className="mt-4">
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="pixel-button cursor-pointer bg-[var(--theme-gold)] px-4 py-2 font-retro text-label font-bold tracking-normal text-black hover:bg-[var(--theme-gold-hover)]"
                >
                  TAMPILKAN SEMUA TRANSAKSI
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenNewTransaction}
                  className="pixel-button cursor-pointer bg-[var(--theme-gold)] px-4 py-2 font-retro text-label font-bold tracking-normal text-black hover:bg-[var(--theme-gold-hover)]"
                >
                  + CATAT TRANSAKSI
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[var(--theme-border-subtle)]">
            {filtered.map((tx) => {
              const isIncome = tx.type === 'income'
              const isClosed = Boolean(tx.isClosedToBalance)
              const isNonExpenseAdjust = tx.isAdjustmentExpense === false

              return (
                <div
                  key={tx.id}
                  className={`flex flex-col gap-2 px-4 py-3.5 transition-colors hover:bg-[var(--theme-card-subtle)] sm:flex-row sm:items-center sm:justify-between sm:px-5 ${
                    isClosed ? 'opacity-65' : ''
                  }`}
                >
                  {/* Kiri: Tanggal, Keterangan, Kategori & Status */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-label tracking-normal tabular-nums text-[var(--theme-text-muted)]">
                        {getDayName(tx.dayOfWeek)}, {formatDateIndo(tx.date)}
                      </span>
                      <span className="border border-zinc-400 bg-[var(--theme-card-subtle)] px-1.5 py-0.5 font-sans text-label tracking-normal text-[var(--theme-text)]">
                        {getCategoryIcon(tx.category)} {tx.category}
                      </span>
                      {isClosed && (
                        <span className="border border-[var(--theme-border)] bg-zinc-200 px-1.5 py-0.5 font-retro text-[10px] font-bold tracking-normal text-zinc-700">
                          DIBUKUKAN
                        </span>
                      )}
                      {isNonExpenseAdjust && (
                        <span className="border border-[var(--theme-border)] bg-amber-100 px-1.5 py-0.5 font-retro text-[10px] font-bold tracking-normal text-amber-800">
                          TRANSFER/SALDO
                        </span>
                      )}
                    </div>

                    <p className="mt-1 break-words font-sans text-body font-bold text-[var(--theme-text)]">
                      {tx.description || 'Tanpa keterangan'}
                    </p>
                  </div>

                  {/* Kanan: Nominal + Aksi Ubah/Hapus */}
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <span
                      className={`font-mono text-body font-bold tabular-nums sm:text-data ${
                        isIncome
                          ? 'text-[var(--theme-income)]'
                          : isClosed
                          ? 'text-[var(--theme-text-muted)] line-through'
                          : isNonExpenseAdjust
                          ? 'text-zinc-600'
                          : 'text-[var(--theme-expense-text)]'
                      }`}
                    >
                      {isIncome ? '+' : '-'} {formatRupiah(tx.amount)}
                    </span>

                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEditTransaction(tx)}
                        title="Ubah transaksi"
                        aria-label={`Ubah transaksi: ${tx.description || tx.category}`}
                        className="pixel-button cursor-pointer bg-[var(--theme-card)] px-2 py-1 text-meta leading-none text-[var(--theme-text)] hover:bg-[var(--theme-gold)] hover:text-black"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteTransaction(tx)}
                        title="Hapus transaksi"
                        aria-label={`Hapus transaksi: ${tx.description || tx.category}`}
                        className="pixel-button cursor-pointer bg-[var(--theme-card)] px-2 py-1 text-meta leading-none text-[var(--theme-text)] hover:bg-[var(--theme-expense)] hover:text-white"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
