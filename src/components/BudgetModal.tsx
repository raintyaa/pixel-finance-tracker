import { useState } from 'react'
import { formatRupiah } from '../utils/currency'
import { useExitAnimation } from '../utils/motion'

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
        } pixel-box flex max-h-[90vh] w-full max-w-md flex-col gap-4 overflow-y-auto border-3 border-[var(--theme-border)] bg-[var(--theme-card)] p-5 shadow-[6px_6px_0px_var(--theme-shadow)]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b-2 border-[var(--theme-border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none" aria-hidden="true">
              🎯
            </span>
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
            className="pixel-button cursor-pointer bg-[var(--theme-card-subtle)] px-2 py-1 font-retro text-meta text-[var(--theme-text)] hover:bg-[var(--theme-card)]"
            title="Tutup dialog"
          >
            ✕
          </button>
        </div>

        <p className="font-sans text-meta text-[var(--theme-text-muted)] leading-relaxed">
          Tentukan batas maksimal pengeluaran bulananmu. Pixel Ledger akan memantau rasio HP / status
          anggaran dan menampilkan peringatan jika pengeluaran mulai kritis.
        </p>

        {/* Ringkasan Realita Bulan Ini */}
        <div className="pixel-box flex flex-col gap-2 border border-black bg-[var(--theme-card-subtle)] p-3">
          <div className="flex justify-between items-center text-meta">
            <span className="font-sans text-[var(--theme-text-muted)]">Pengeluaran Bulan Ini:</span>
            <span className="font-mono font-bold text-[var(--theme-expense-text)]">
              {formatRupiah(currentMonthExpense)}
            </span>
          </div>
          <div className="flex justify-between items-center text-meta">
            <span className="font-sans text-[var(--theme-text-muted)]">Batas Saat Ini:</span>
            <span className="font-mono font-bold text-[var(--theme-text)]">
              {formatRupiah(currentBudget)}
            </span>
          </div>
        </div>

        {/* Form Set Budget */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
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
              className="pixel-input w-full border-2 border-black bg-white px-3 py-2.5 font-mono text-body font-bold text-black focus:outline-none"
              autoFocus
            />

            {/* Preset Cepat RPG */}
            <div className="mt-1 flex flex-wrap gap-1.5">
              {PRESET_LIMITS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setLimitInput(String(preset))
                    setError('')
                  }}
                  className={`pixel-button cursor-pointer border border-black px-2 py-1 font-retro text-label font-bold transition-all ${
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
              className={`pixel-box border-2 p-3 ${
                previewRatio >= 100
                  ? 'border-red-600 bg-red-50 text-red-900'
                  : previewRatio >= 80
                  ? 'border-amber-600 bg-amber-50 text-amber-900'
                  : 'border-[var(--theme-border)] bg-[var(--theme-card-subtle)] text-[var(--theme-text)]'
              }`}
            >
              <div className="flex justify-between items-center text-meta">
                <span className="font-retro text-label font-bold">PREVIEW RASIO:</span>
                <span className="font-mono font-bold">{previewRatio}% terpakai</span>
              </div>
              <div className="mt-1 flex justify-between items-center text-meta">
                <span className="font-sans">
                  {previewRemaining >= 0 ? 'Sisa Anggaran:' : 'Kelebihan (Over):'}
                </span>
                <span
                  className={`font-mono font-bold ${
                    previewRemaining < 0 ? 'text-red-600' : 'text-emerald-700'
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
            <p className="font-sans text-meta font-bold text-red-600" role="alert">
              ⚠️ {error}
            </p>
          )}

          {/* Tombol Aksi */}
          <div className="mt-2 flex gap-2">
            <button
              type="submit"
              className="pixel-button flex-1 cursor-pointer border-2 border-black bg-[var(--theme-gold)] py-2.5 font-retro text-meta font-bold text-black hover:bg-[var(--theme-gold-hover)]"
            >
              SIMPAN BATAS BUDGET
            </button>
            <button
              type="button"
              onClick={requestClose}
              className="pixel-button cursor-pointer border-2 border-black bg-[var(--theme-card-subtle)] px-4 py-2.5 font-retro text-meta font-bold text-[var(--theme-text)] hover:bg-[var(--theme-card)]"
            >
              BATAL
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
