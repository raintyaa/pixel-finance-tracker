import type { Transaction } from '../types/finance'
import { formatRupiah } from '../utils/currency'
import { useExitAnimation } from '../utils/motion'
import { PixelTrashIcon } from './PixelIcons'

interface ConfirmDialogProps {
  transaction: Transaction | null
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  transaction,
  isOpen,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { closing, requestClose } = useExitAnimation(onCancel)

  // Tidak ada transaksi terpilih atau dialog ditutup → jangan render apa pun
  if (!isOpen || !transaction) return null

  const isIncome = transaction.type === 'income'

  return (
    <div
      className={`${closing ? 'motion-backdrop-out' : 'motion-backdrop'} fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4 z-50`}
      onClick={requestClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className={`${
          closing ? 'motion-crt-off' : 'motion-crt'
        } pixel-modal-frame flex max-h-[90vh] w-full max-w-sm flex-col overflow-hidden bg-[var(--theme-card)]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
          {/* Judul */}
          <div className="flex items-center gap-2">
            <PixelTrashIcon className="h-5 w-5 text-[var(--theme-expense-text)]" />
            <h2
              id="confirm-dialog-title"
              className="font-retro text-data font-bold tracking-normal text-[var(--theme-expense-text)]"
            >
              HAPUS TRANSAKSI?
            </h2>
          </div>

          <p className="font-sans text-body leading-normal text-[var(--theme-text-muted)]">
            Data yang dihapus tidak dapat dikembalikan. Periksa kembali rincian di bawah ini.
          </p>

          {/* Rincian transaksi — baris pemisah, bukan kartu bersarang */}
          <div className="divide-y-2 divide-[var(--theme-border-subtle)] border-y-2 border-[var(--theme-border-subtle)]">
            <div className="flex items-baseline justify-between gap-3 py-2">
              <span className="shrink-0 font-sans text-label tracking-normal text-[var(--theme-text-muted)]">
                Deskripsi
              </span>
              <span className="break-words text-right font-sans text-meta font-bold text-[var(--theme-text)]">
                {transaction.description || 'Tanpa keterangan'}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-3 py-2">
              <span className="shrink-0 font-sans text-label tracking-normal text-[var(--theme-text-muted)]">
                Kategori
              </span>
              <span className="break-words text-right font-sans text-meta text-[var(--theme-text-muted)]">
                {transaction.category}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-3 py-2">
              <span className="shrink-0 font-sans text-label tracking-normal text-[var(--theme-text-muted)]">
                Nominal
              </span>
              <span
                className={`text-right font-mono text-body font-bold tabular-nums ${
                  isIncome ? 'text-[var(--theme-income)]' : 'text-[var(--theme-expense-text)]'
                }`}
              >
                {isIncome ? '+' : '-'} {formatRupiah(transaction.amount)}
              </span>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onConfirm}
              className="pixel-button flex-1 cursor-pointer bg-[var(--theme-expense)] px-3 py-2.5 font-retro text-meta font-bold text-white hover:opacity-90"
            >
              YA, HAPUS
            </button>
            <button
              type="button"
              onClick={requestClose}
              className="pixel-button cursor-pointer bg-[var(--theme-card-subtle)] px-4 py-2.5 font-retro text-meta font-bold text-[var(--theme-text)] hover:bg-[var(--theme-card)]"
            >
              BATAL
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
