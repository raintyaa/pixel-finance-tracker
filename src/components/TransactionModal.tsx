import { useState } from 'react'
import { DEFAULT_CATEGORIES } from '../data/initialData'
import type { Transaction, TransactionType } from '../types/finance'
import { getDayOfWeekFromDate, getTodayDateString } from '../utils/date'

interface TransactionModalProps {
  onSubmit: (newTx: Transaction) => void
  onClose: () => void
  // Jika diisi → mode edit (Ubah Transaksi); jika null/undefined → mode tambah
  initialData?: Transaction | null
}

export default function TransactionModal({ onSubmit, onClose, initialData }: TransactionModalProps) {
  const isEditMode = Boolean(initialData)

  const [type, setType] = useState<TransactionType>(initialData?.type ?? 'expense')
  const [amount, setAmount] = useState<string>(initialData ? String(initialData.amount) : '')
  const [category, setCategory] = useState<string>(
    initialData?.category ??
      DEFAULT_CATEGORIES.find((c) => c.type === 'expense')?.name ??
      ''
  )
  const [date, setDate] = useState<string>(initialData?.date ?? getTodayDateString())
  const [description, setDescription] = useState<string>(initialData?.description ?? '')
  const [error, setError] = useState<string>('')

  const filteredCategories = DEFAULT_CATEGORIES.filter((c) => c.type === type)

  const handleSelectType = (t: TransactionType) => {
    setType(t)
    setError('')
    const first = DEFAULT_CATEGORIES.find((c) => c.type === t)
    setCategory(first?.name ?? '')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsedAmount = Number(amount)
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Nominal harus berupa angka lebih dari 0.')
      return
    }
    if (!category) {
      setError('Pilih kategori terlebih dahulu.')
      return
    }
    if (!date) {
      setError('Tanggal tidak boleh kosong.')
      return
    }

    const newTx: Transaction = {
      // Mode edit mempertahankan id asli; mode tambah membuat id baru
      id: initialData?.id ?? `tx-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      type,
      amount: parsedAmount,
      description: description.trim(),
      category,
      date,
      // dayOfWeek selalu dihitung ulang dari tanggal terbaru
      dayOfWeek: getDayOfWeekFromDate(date),
    }

    onSubmit(newTx)
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="pixel-box bg-[var(--theme-card)] border-3 border-[var(--theme-border)] shadow-[6px_6px_0px_var(--theme-shadow)] w-full max-w-md p-5 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Judul Modal */}
        <div className="flex items-center justify-between border-b-2 border-[var(--theme-border-subtle)] pb-3">
          <h2 className="font-retro text-data text-[var(--theme-gold-text)] tracking-normal font-bold">
            {isEditMode ? '✏️ UBAH TRANSAKSI' : '📝 CATAT TRANSAKSI'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="pixel-button bg-[var(--theme-card-subtle)] hover:bg-[var(--theme-card)] text-[var(--theme-text)] px-2 py-1 text-meta font-retro cursor-pointer"
            title="Tutup"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Toggle Tipe Transaksi */}
          <div className="grid grid-cols-2 gap-2 bg-[var(--theme-card-subtle)] p-1 border-2 border-[var(--theme-border)]">
            <button
              type="button"
              onClick={() => handleSelectType('expense')}
              className={`px-3 py-2 text-label font-retro tracking-normal transition-all cursor-pointer font-bold ${
                type === 'expense'
                  ? 'bg-[var(--theme-expense)] text-white pixel-box-sm shadow-none'
                  : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
              }`}
            >
              💸 Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => handleSelectType('income')}
              className={`px-3 py-2 text-label font-retro tracking-normal transition-all cursor-pointer font-bold ${
                type === 'income'
                  ? 'bg-[var(--theme-income)] text-white pixel-box-sm shadow-none'
                  : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
              }`}
            >
              💰 Pemasukan
            </button>
          </div>

          {/* Nominal */}
          <label className="flex flex-col gap-1">
            <span className="font-retro text-label tracking-normal text-[var(--theme-text)] font-bold">
              NOMINAL (Rp)
            </span>
            <input
              type="number"
              min={1}
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="cth: 25000"
              className="bg-[var(--theme-card)] border-2 border-[var(--theme-border)] px-3 py-2 text-body text-[var(--theme-text)] font-pixel outline-none focus:border-[var(--theme-gold)] placeholder:text-[var(--theme-text-muted)]"
            />
          </label>

          {/* Kategori */}
          <label className="flex flex-col gap-1">
            <span className="font-retro text-label tracking-normal text-[var(--theme-text)] font-bold">
              KATEGORI
            </span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-[var(--theme-card)] border-2 border-[var(--theme-border)] px-3 py-2 text-body text-[var(--theme-text)] font-pixel outline-none focus:border-[var(--theme-gold)] cursor-pointer"
            >
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.name} className="bg-[var(--theme-card)] text-[var(--theme-text)]">
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </label>

          {/* Tanggal */}
          <label className="flex flex-col gap-1">
            <span className="font-retro text-label tracking-normal text-[var(--theme-text)] font-bold">
              TANGGAL
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-[var(--theme-card)] border-2 border-[var(--theme-border)] px-3 py-2 text-body text-[var(--theme-text)] font-pixel outline-none focus:border-[var(--theme-gold)] cursor-pointer"
            />
          </label>

          {/* Keterangan */}
          <label className="flex flex-col gap-1">
            <span className="font-retro text-label tracking-normal text-[var(--theme-text)] font-bold">
              KETERANGAN
            </span>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="cth: Makan siang nasi padang"
              className="bg-[var(--theme-card)] border-2 border-[var(--theme-border)] px-3 py-2 text-body text-[var(--theme-text)] font-pixel outline-none focus:border-[var(--theme-gold)] placeholder:text-[var(--theme-text-muted)]"
            />
          </label>

          {error && (
            <p className="text-meta font-pixel text-[var(--theme-expense-text)] bg-[var(--theme-expense-badge)] border-2 border-[var(--theme-expense)] px-3 py-2">
              ⚠️ {error}
            </p>
          )}

          {/* Tombol Aksi */}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="pixel-button flex-1 bg-[var(--theme-gold)] hover:bg-[var(--theme-gold-hover)] text-black font-retro text-meta px-3 py-2.5 cursor-pointer font-bold"
            >
              {isEditMode ? '💾 Simpan Perubahan' : '💾 Simpan Transaksi'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="pixel-button bg-[var(--theme-card-subtle)] hover:bg-[var(--theme-card)] text-[var(--theme-text)] font-retro text-meta px-4 py-2.5 cursor-pointer font-bold"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
