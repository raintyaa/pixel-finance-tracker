import { useState } from 'react'
import type { Transaction } from '../types/finance'
import { formatRupiah } from '../utils/currency'
import { getDayOfWeekFromDate, getTodayDateString } from '../utils/date'
import { useExitAnimation } from '../utils/motion'

interface AdjustBalanceModalProps {
  currentBalance: number
  onSubmit: (newTx: Transaction) => void
  onClose: () => void
}

export default function AdjustBalanceModal({
  currentBalance,
  onSubmit,
  onClose,
}: AdjustBalanceModalProps) {
  const { closing, requestClose } = useExitAnimation(onClose)

  const [targetBalance, setTargetBalance] = useState<string>('')
  const [date, setDate] = useState<string>(getTodayDateString())
  const [customNote, setCustomNote] = useState<string>('')
  const [error, setError] = useState<string>('')

  const parsedTarget = targetBalance.trim() === '' ? null : Number(targetBalance)
  const difference = parsedTarget !== null && !isNaN(parsedTarget) ? parsedTarget - currentBalance : null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (parsedTarget === null || isNaN(parsedTarget)) {
      setError('Masukkan nominal saldo riil yang valid.')
      return
    }

    if (parsedTarget < 0) {
      setError('Nominal saldo riil tidak boleh bernilai negatif.')
      return
    }

    if (difference === null || difference === 0) {
      setError('Nominal yang dimasukkan sama dengan saldo saat ini. Tidak ada penyesuaian yang perlu dicatat.')
      return
    }

    if (!date) {
      setError('Tanggal tidak boleh kosong.')
      return
    }

    const isExpense = difference < 0
    const finalAmount = Math.abs(difference)
    const defaultDescription = isExpense
      ? 'Penyesuaian Saldo (Pengeluaran tak tercatat)'
      : 'Penyesuaian Saldo (Pemasukan tambahan / Koreksi)'

    const newTx: Transaction = {
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      type: isExpense ? 'expense' : 'income',
      amount: finalAmount,
      description: customNote.trim() || defaultDescription,
      category: 'Penyesuaian Saldo',
      date,
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
        aria-labelledby="adjust-balance-title"
        className={`${
          closing ? 'motion-crt-off' : 'motion-crt'
        } pixel-box bg-[var(--theme-card)] border-3 border-[var(--theme-border)] shadow-[6px_6px_0px_var(--theme-shadow)] w-full max-w-md p-5 flex flex-col gap-4 max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Judul Modal */}
        <div className="flex items-center justify-between border-b-2 border-[var(--theme-border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none" aria-hidden="true">
              ⚖️
            </span>
            <h2
              id="adjust-balance-title"
              className="font-retro text-data text-[var(--theme-gold-text)] tracking-normal font-bold"
            >
              ATUR SALDO RIIL
            </h2>
          </div>
          <button
            type="button"
            onClick={requestClose}
            className="pixel-button bg-[var(--theme-card-subtle)] hover:bg-[var(--theme-card)] text-[var(--theme-text)] px-2 py-1 text-meta font-retro cursor-pointer"
            title="Tutup"
          >
            ✕
          </button>
        </div>

        <p className="text-body text-[var(--theme-text-muted)] font-pixel leading-relaxed">
          Gunakan fitur ini jika saldo di dompet/rekening riilmu berbeda dengan aplikasi (misal lupa mencatat pengeluaran jajan).
        </p>

        {/* Info Saldo Tercatat Saat Ini */}
        <div className="border-2 border-[var(--theme-border)] bg-[var(--theme-card-subtle)] p-3 flex items-center justify-between">
          <span className="font-pixel text-label tracking-normal text-[var(--theme-text-muted)]">
            Saldo Tercatat di Aplikasi:
          </span>
          <span className="font-retro text-data font-bold tabular-nums text-black">
            {formatRupiah(currentBalance)}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Input Saldo Nyata */}
          <label className="flex flex-col gap-1">
            <span className="font-retro text-label tracking-normal text-[var(--theme-text)] font-bold">
              SALDO RIIL DI DOMPET / BANK SAAT INI (Rp)
            </span>
            <input
              type="number"
              min={0}
              step="any"
              autoFocus
              value={targetBalance}
              onChange={(e) => {
                setTargetBalance(e.target.value)
                setError('')
              }}
              placeholder={`cth: ${Math.max(0, currentBalance - 25000)}`}
              className="bg-[var(--theme-card)] border-2 border-[var(--theme-border)] px-3 py-2 text-data font-bold text-[var(--theme-text)] font-pixel outline-none focus:border-[var(--theme-gold)] placeholder:text-[var(--theme-text-muted)]"
            />
          </label>

          {/* Pratinjau Selisih Otomatis */}
          {difference !== null && (
            <div
              className={`border-2 border-[var(--theme-border)] p-3 flex flex-col gap-1 ${
                difference < 0
                  ? 'bg-[var(--theme-expense-surface)] text-[var(--theme-expense-text)]'
                  : difference > 0
                  ? 'bg-[var(--theme-income-surface)] text-[var(--theme-income)]'
                  : 'bg-[var(--theme-card-subtle)] text-[var(--theme-text-muted)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-pixel text-label tracking-normal font-bold">
                  {difference < 0
                    ? '🔻 Selisih Berkurang (Pengeluaran)'
                    : difference > 0
                    ? '🔺 Selisih Bertambah (Pemasukan)'
                    : '⚖️ Tidak Ada Selisih'}
                </span>
                <span className="font-retro text-body font-bold tabular-nums">
                  {difference > 0 ? '+' : ''}
                  {formatRupiah(difference)}
                </span>
              </div>
              <p className="font-pixel text-meta leading-tight mt-0.5 opacity-90">
                {difference < 0
                  ? `Aplikasi akan otomatis mencatat pengeluaran sebesar ${formatRupiah(Math.abs(difference))} agar saldo menjadi pas.`
                  : difference > 0
                  ? `Aplikasi akan otomatis mencatat pemasukan sebesar ${formatRupiah(difference)} agar saldo menjadi pas.`
                  : 'Nominal sama dengan saldo yang tercatat saat ini.'}
              </p>
            </div>
          )}

          {/* Keterangan Tambahan (Opsional) */}
          <label className="flex flex-col gap-1">
            <span className="font-retro text-label tracking-normal text-[var(--theme-text)] font-bold">
              KETERANGAN / ALASAN (OPSIONAL)
            </span>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder={
                difference !== null && difference < 0
                  ? 'cth: Lupa catat kopi dan parkir'
                  : 'cth: Penyesuaian kas bulanan'
              }
              className="bg-[var(--theme-card)] border-2 border-[var(--theme-border)] px-3 py-2 text-body text-[var(--theme-text)] font-pixel outline-none focus:border-[var(--theme-gold)] placeholder:text-[var(--theme-text-muted)]"
            />
          </label>

          {/* Tanggal Penyesuaian */}
          <label className="flex flex-col gap-1">
            <span className="font-retro text-label tracking-normal text-[var(--theme-text)] font-bold">
              TANGGAL PENCATATAN
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-[var(--theme-card)] border-2 border-[var(--theme-border)] px-3 py-2 text-body text-[var(--theme-text)] font-pixel outline-none focus:border-[var(--theme-gold)] cursor-pointer"
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
              disabled={difference === null || difference === 0}
              className={`pixel-button flex-1 px-3 py-2.5 font-retro text-meta font-bold cursor-pointer ${
                difference === null || difference === 0
                  ? 'bg-[var(--theme-card-subtle)] text-[var(--theme-text-muted)] cursor-not-allowed opacity-60'
                  : 'bg-[var(--theme-gold)] hover:bg-[var(--theme-gold-hover)] text-black'
              }`}
            >
              💾 Simpan Saldo Baru
            </button>
            <button
              type="button"
              onClick={requestClose}
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
