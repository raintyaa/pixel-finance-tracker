import { useState } from 'react'
import { DEFAULT_CATEGORIES } from '../data/initialData'
import type { Transaction, TransactionType } from '../types/finance'
import { getDayOfWeekFromDate, getTodayDateString } from '../utils/date'
import { useExitAnimation } from '../utils/motion'
import {
  PixelCloseIcon,
  PixelCoinIcon,
  PixelEditIcon,
  PixelHistoryIcon,
  PixelResetIcon,
  PixelSaveIcon,
  PixelWarnIcon,
} from './PixelIcons'

interface TransactionModalProps {
  onSubmit: (newTx: Transaction) => void
  onClose: () => void
  // Jika diisi -> mode edit (Ubah Transaksi); jika null/undefined -> mode tambah
  initialData?: Transaction | null
  // Tanggal awal opsional saat pengguna mengklik sel hari tertentu di tabel mingguan
  defaultDate?: string | null
}

export default function TransactionModal({
  onSubmit,
  onClose,
  initialData,
  defaultDate,
}: TransactionModalProps) {
  const isEditMode = Boolean(initialData)
  const { closing, requestClose } = useExitAnimation(onClose)

  const [type, setType] = useState<TransactionType>(initialData?.type ?? 'expense')
  const [amount, setAmount] = useState<string>(initialData ? String(initialData.amount) : '')
  const [category, setCategory] = useState<string>(
    initialData?.category ??
      DEFAULT_CATEGORIES.find((c) => c.type === 'expense')?.name ??
      ''
  )
  const [date, setDate] = useState<string>(
    initialData?.date ?? defaultDate ?? getTodayDateString()
  )
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
      className={`${closing ? 'motion-backdrop-out' : 'motion-backdrop'} fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4 z-50`}
      onClick={requestClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`${
          closing ? 'motion-crt-off' : 'motion-crt'
        } pixel-modal-frame flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden bg-[var(--theme-card)]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
          {/* Judul Modal */}
          <div className="flex items-center justify-between border-b-2 border-[var(--theme-border-subtle)] pb-3">
            <h2 className="flex items-center gap-2 font-retro text-data font-bold tracking-normal text-[var(--theme-gold-text)]">
              {isEditMode ? (
                <>
                  <PixelEditIcon className="h-4 w-4" />
                  <span>UBAH TRANSAKSI</span>
                </>
              ) : (
                <>
                  <PixelHistoryIcon className="h-4 w-4" />
                  <span>CATAT TRANSAKSI</span>
                </>
              )}
            </h2>
            <button
              type="button"
              onClick={requestClose}
              aria-label="Tutup dialog"
              className="pixel-button flex h-8 w-8 cursor-pointer items-center justify-center bg-[var(--theme-card-subtle)] text-[var(--theme-text)] hover:bg-[var(--theme-card)]"
              title="Tutup"
            >
              <PixelCloseIcon className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Toggle Tipe Transaksi */}
            <div
              role="group"
              aria-label="Tipe transaksi"
              className="grid grid-cols-2 gap-3"
            >
              <button
                type="button"
                aria-pressed={type === 'expense'}
                onClick={() => handleSelectType('expense')}
                className={`pixel-button flex cursor-pointer items-center justify-center gap-1.5 px-3 py-2 font-retro text-label font-bold tracking-normal transition-colors ${
                  type === 'expense'
                    ? 'bg-[var(--theme-expense)] text-white'
                    : 'bg-[var(--theme-card-subtle)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
                }`}
              >
                <PixelResetIcon className="h-3.5 w-3.5" />
                <span>Pengeluaran</span>
              </button>
              <button
                type="button"
                aria-pressed={type === 'income'}
                onClick={() => handleSelectType('income')}
                className={`pixel-button flex cursor-pointer items-center justify-center gap-1.5 px-3 py-2 font-retro text-label font-bold tracking-normal transition-colors ${
                  type === 'income'
                    ? 'bg-[var(--theme-income)] text-white'
                    : 'bg-[var(--theme-card-subtle)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
                }`}
              >
                <PixelCoinIcon className="h-3.5 w-3.5" />
                <span>Pemasukan</span>
              </button>
            </div>

            {/* Nominal */}
            <label className="flex flex-col gap-1.5">
              <span className="font-retro text-label font-bold tracking-normal text-[var(--theme-text)]">
                NOMINAL (Rp)
              </span>
              <input
                type="number"
                min={1}
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="cth: 25000"
                className="pixel-input bg-[var(--theme-card)] px-3 py-2 font-mono text-data font-bold tabular-nums text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)]"
              />
            </label>

            {/* Kategori */}
            <label className="flex flex-col gap-1.5">
              <span className="font-retro text-label font-bold tracking-normal text-[var(--theme-text)]">
                KATEGORI
              </span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="pixel-input cursor-pointer bg-[var(--theme-card)] px-3 py-2 font-sans text-body text-[var(--theme-text)]"
              >
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.name} className="bg-[var(--theme-card)] text-[var(--theme-text)]">
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </label>

            {/* Tanggal */}
            <label className="flex flex-col gap-1.5">
              <span className="font-retro text-label font-bold tracking-normal text-[var(--theme-text)]">
                TANGGAL
              </span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="pixel-input cursor-pointer bg-[var(--theme-card)] px-3 py-2 font-mono text-body tabular-nums text-[var(--theme-text)]"
              />
            </label>

            {/* Keterangan */}
            <label className="flex flex-col gap-1.5">
              <span className="font-retro text-label font-bold tracking-normal text-[var(--theme-text)]">
                KETERANGAN
              </span>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="cth: Makan siang nasi padang"
                className="pixel-input bg-[var(--theme-card)] px-3 py-2 font-sans text-body text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)]"
              />
            </label>

            {error && (
              <p className="flex items-center gap-2 border-y-2 border-[var(--theme-expense)] bg-[var(--theme-expense-badge)] px-3 py-2 font-sans text-meta leading-normal text-[var(--theme-expense-text)]">
                <PixelWarnIcon className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </p>
            )}

            {/* Tombol Aksi */}
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                className="pixel-button flex flex-1 cursor-pointer items-center justify-center gap-1.5 bg-[var(--theme-gold)] px-3 py-2.5 font-retro text-meta font-bold text-black hover:bg-[var(--theme-gold-hover)]"
              >
                <PixelSaveIcon className="h-4 w-4" />
                <span>{isEditMode ? 'Simpan Perubahan' : 'Simpan Transaksi'}</span>
              </button>
              <button
                type="button"
                onClick={requestClose}
                className="pixel-button cursor-pointer bg-[var(--theme-card-subtle)] px-4 py-2.5 font-retro text-meta font-bold text-[var(--theme-text)] hover:bg-[var(--theme-card)]"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
