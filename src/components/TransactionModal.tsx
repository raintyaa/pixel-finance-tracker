import { useState } from 'react'
import { DEFAULT_CATEGORIES } from '../data/initialData'
import type { Transaction, TransactionType } from '../types/finance'
import { getDayOfWeekFromDate, getTodayDateString } from '../utils/date'

interface TransactionModalProps {
  onSubmit: (newTx: Transaction) => void
  onClose: () => void
}

export default function TransactionModal({ onSubmit, onClose }: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState<string>('')
  const [category, setCategory] = useState<string>(DEFAULT_CATEGORIES.find((c) => c.type === 'expense')?.name ?? '')
  const [date, setDate] = useState<string>(getTodayDateString())
  const [description, setDescription] = useState<string>('')
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
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      type,
      amount: parsedAmount,
      description: description.trim(),
      category,
      date,
      dayOfWeek: getDayOfWeekFromDate(date),
    }

    onSubmit(newTx)
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="pixel-box bg-[#1f1e2c] border-3 border-black w-full max-w-md p-5 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Judul Modal */}
        <div className="flex items-center justify-between border-b-2 border-[#3d3b52] pb-3">
          <h2 className="font-['Silkscreen'] text-sm md:text-base text-[#f4b41b] tracking-wider">
            📝 CATAT TRANSAKSI
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="pixel-button bg-[#2a293b] hover:bg-[#38374d] text-gray-300 hover:text-white px-2 py-1 text-xs font-['Silkscreen'] cursor-pointer"
            title="Tutup"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Toggle Tipe Transaksi */}
          <div className="grid grid-cols-2 gap-2 bg-[#131219] p-1 border-2 border-black">
            <button
              type="button"
              onClick={() => handleSelectType('expense')}
              className={`px-3 py-2 text-[11px] font-['Silkscreen'] transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-[#e43b44] text-white font-bold pixel-box-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              💸 Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => handleSelectType('income')}
              className={`px-3 py-2 text-[11px] font-['Silkscreen'] transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-[#38b764] text-white font-bold pixel-box-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              💰 Pemasukan
            </button>
          </div>

          {/* Nominal */}
          <label className="flex flex-col gap-1">
            <span className="font-['Silkscreen'] text-[11px] text-gray-300">NOMINAL (Rp)</span>
            <input
              type="number"
              min={1}
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="cth: 25000"
              className="bg-[#131219] border-2 border-black px-3 py-2 text-sm text-white font-mono outline-none focus:border-[#f4b41b] placeholder:text-gray-600"
            />
          </label>

          {/* Kategori */}
          <label className="flex flex-col gap-1">
            <span className="font-['Silkscreen'] text-[11px] text-gray-300">KATEGORI</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-[#131219] border-2 border-black px-3 py-2 text-sm text-white font-mono outline-none focus:border-[#f4b41b] cursor-pointer"
            >
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </label>

          {/* Tanggal */}
          <label className="flex flex-col gap-1">
            <span className="font-['Silkscreen'] text-[11px] text-gray-300">TANGGAL</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-[#131219] border-2 border-black px-3 py-2 text-sm text-white font-mono outline-none focus:border-[#f4b41b] cursor-pointer"
            />
          </label>

          {/* Keterangan */}
          <label className="flex flex-col gap-1">
            <span className="font-['Silkscreen'] text-[11px] text-gray-300">KETERANGAN</span>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="cth: Makan siang nasi padang"
              className="bg-[#131219] border-2 border-black px-3 py-2 text-sm text-white font-mono outline-none focus:border-[#f4b41b] placeholder:text-gray-600"
            />
          </label>

          {error && (
            <p className="text-xs font-mono text-[#e43b44] bg-[#e43b44]/10 border-2 border-[#e43b44] px-3 py-2">
              ⚠️ {error}
            </p>
          )}

          {/* Tombol Aksi */}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="pixel-button flex-1 bg-[#f4b41b] hover:bg-[#ffcf4d] text-black font-['Silkscreen'] text-xs px-3 py-2.5 cursor-pointer"
            >
              💾 Simpan Transaksi
            </button>
            <button
              type="button"
              onClick={onClose}
              className="pixel-button bg-[#2a293b] hover:bg-[#38374d] text-gray-300 hover:text-white font-['Silkscreen'] text-xs px-4 py-2.5 cursor-pointer"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
