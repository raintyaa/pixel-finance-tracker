import { useState } from 'react'
import { formatRupiah } from '../utils/currency'
import { useExitAnimation } from '../utils/motion'
import {
  PixelCloseIcon,
  PixelSaveIcon,
  PixelTargetIcon,
  PixelWarnIcon,
} from './PixelIcons'

interface BudgetModalProps {
  currentBudget: number
  currentMonthExpense: number
  onSubmit: (newLimit: number) => void
  onClose: () => void
}

const PRESET_LIMITS = [1000000, 2000000, 3000000, 5000000]

export default function BudgetModal({
  currentBudget,
  currentMonthExpense,
  onSubmit,
  onClose,
}: BudgetModalProps) {
  const { closing, requestClose } = useExitAnimation(onClose)
  const [limitInput, setLimitInput] = useState<string>(String(currentBudget))
  const [error, setError] = useState<string>('')

  const parsedLimit = limitInput.trim() === '' ? 0 : Number(limitInput)
  const isValidNumber = !isNaN(parsedLimit) && parsedLimit > 0

  // Preview rasio & sisa anggaran
  const previewRatio = isValidNumber ? Math.round((currentMonthExpense / parsedLimit) * 100) : 0
  const previewRemaining = isValidNumber ? parsedLimit - currentMonthExpense : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      setError('Masukkan nominal batas anggaran yang valid (lebih dari 0).')
      return
    }

    onSubmit(parsedLimit)
    requestClose()
  }

  return (
    <div
      className={`${
        closing ? 'motion-backdrop-out' : 'motion-backdrop'
      } fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]`}
      onClick={requestClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="budget-modal-title"
        className={`${
          closing ? 'motion-crt-off' : 'motion-crt'
        } pixel-modal-frame flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden bg-[var(--theme-card)]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
          {/* Header Modal */}
          <div className="flex items-center justify-between border-b-2 border-[var(--theme-border-subtle)] pb-3">
            <div className="flex items-center gap-2">
              <PixelTargetIcon className="h-5 w-5 text-[var(--theme-gold-text)]" />
              <h2
                id="budget-modal-title"
                className="font-retro text-data font-bold tracking-normal text-[var(--theme-gold-text)]"
              >
                BATAS BUDGET BULANAN
              </h2>
            </div>
            <button
              type="button"
              onClick={requestClose}
              aria-label="Tutup dialog"
              className="pixel-button flex h-8 w-8 cursor-pointer items-center justify-center bg-[var(--theme-card-subtle)] text-[var(--theme-text)] hover:bg-[var(--theme-card)]"
              title="Tutup dialog"
            >
              <PixelCloseIcon className="h-4 w-4" />
            </button>
          </div>

          <p className="font-sans text-meta leading-normal text-[var(--theme-text-muted)]">
            Tentukan batas maksimal pengeluaran bulananmu. Pixel Ledger akan memantau rasio HP /
            status anggaran dan menampilkan peringatan jika pengeluaran mulai kritis.
          </p>

          {/* Ringkasan Realita Bulan Ini — baris pemisah datar tanpa background box */}
          <div className="flex flex-col gap-2 border-b-2 border-[var(--theme-border-subtle)] pb-3">
            <div className="flex items-center justify-between text-meta">
              <span className="font-sans text-[var(--theme-text-muted)]">Pengeluaran Bulan Ini:</span>
              <span className="font-mono font-bold tabular-nums text-[var(--theme-expense-text)]">
                {formatRupiah(currentMonthExpense)}
              </span>
            </div>
            <div className="flex items-center justify-between text-meta">
              <span className="font-sans text-[var(--theme-text-muted)]">Batas Saat Ini:</span>
              <span className="font-mono font-bold tabular-nums text-[var(--theme-text)]">
                {formatRupiah(currentBudget)}
              </span>
            </div>
          </div>

          {/* Form Set Budget */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="budget-limit-input"
                className="font-retro text-label font-bold tracking-normal text-[var(--theme-text)]"
              >
                BATAS ANGGARAN BARU (RP)
              </label>
              <input
                id="budget-limit-input"
                type="number"
                step="10000"
                min="10000"
                value={limitInput}
                onChange={(e) => {
                  setLimitInput(e.target.value)
                  setError('')
                }}
                placeholder="cth: 2500000"
                className="pixel-input w-full bg-[var(--theme-card)] px-3 py-2.5 font-mono text-data font-bold tabular-nums text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)]"
                autoFocus
              />

              {/* Preset Cepat RPG */}
              <div className="mt-1 flex flex-wrap gap-2">
                {PRESET_LIMITS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setLimitInput(String(preset))
                      setError('')
                    }}
                    className={`pixel-button cursor-pointer px-2.5 py-1 font-retro text-label font-bold ${
                      parsedLimit === preset
                        ? 'bg-[var(--theme-gold)] text-black'
                        : 'bg-[var(--theme-card-subtle)] text-[var(--theme-text)] hover:bg-[var(--theme-card)]'
                    }`}
                  >
                    {formatRupiah(preset)}
                  </button>
                ))}
              </div>
            </div>

            {/* Real-time Preview Kalkulasi */}
            {isValidNumber && (
              <div
                className={`border-t-2 pt-3 ${
                  previewRatio >= 100
                    ? 'border-[var(--theme-expense)] text-[var(--theme-expense-text)]'
                    : previewRatio >= 80
                    ? 'border-[var(--theme-gold)] text-[var(--theme-gold-text)]'
                    : 'border-[var(--theme-border-subtle)] text-[var(--theme-text)]'
                }`}
              >
                <div className="flex items-center justify-between text-meta">
                  <span className="font-retro text-label font-bold tracking-normal">PREVIEW RASIO:</span>
                  <span className="font-mono font-bold tabular-nums">{previewRatio}% terpakai</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-meta">
                  <span className="font-sans">
                    {previewRemaining >= 0 ? 'Sisa Anggaran:' : 'Kelebihan (Over):'}
                  </span>
                  <span
                    className={`font-mono font-bold tabular-nums ${
                      previewRemaining < 0
                        ? 'text-[var(--theme-expense-text)]'
                        : 'text-[var(--theme-income)]'
                    }`}
                  >
                    {previewRemaining >= 0
                      ? formatRupiah(previewRemaining)
                      : `- ${formatRupiah(Math.abs(previewRemaining))}`}
                  </span>
                </div>
              </div>
            )}

            {error && (
              <p
                className="flex items-center gap-2 border-y-2 border-[var(--theme-expense)] bg-[var(--theme-expense-badge)] px-3 py-2 font-sans text-meta font-bold leading-normal text-[var(--theme-expense-text)]"
                role="alert"
              >
                <PixelWarnIcon className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </p>
            )}

            {/* Tombol Aksi */}
            <div className="mt-1 flex gap-3">
              <button
                type="submit"
                className="pixel-button flex flex-1 cursor-pointer items-center justify-center gap-1.5 bg-[var(--theme-gold)] py-2.5 font-retro text-meta font-bold text-black hover:bg-[var(--theme-gold-hover)]"
              >
                <PixelSaveIcon className="h-4 w-4" />
                <span>SIMPAN BATAS BUDGET</span>
              </button>
              <button
                type="button"
                onClick={requestClose}
                className="pixel-button cursor-pointer bg-[var(--theme-card-subtle)] px-4 py-2.5 font-retro text-meta font-bold text-[var(--theme-text)] hover:bg-[var(--theme-card)]"
              >
                BATAL
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
