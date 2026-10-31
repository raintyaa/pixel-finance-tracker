import type { Transaction } from '../types/finance'
import { formatRupiah } from '../utils/currency'
import { useExitAnimation } from '../utils/motion'

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
      {/* Satu-satunya box container (border 2px, tanpa nested card) */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className={`${
          closing ? 'motion-crt-off' : 'motion-crt'
        } bg-[var(--theme-card)] border-2 border-[var(--theme-border)] shadow-[4px_4px_0px_var(--theme-shadow)] w-full max-w-sm p-5 flex flex-col gap-4`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Judul */}
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none">🗑️</span>
          <h2
            id="confirm-dialog-title"
            className="font-retro text-data text-[var(--theme-expense-text)] tracking-normal font-bold"
          >
            HAPUS TRANSAKSI?
          </h2>
        </div>

        <p className="text-body text-[var(--theme-text-muted)] font-pixel">
          Data yang dihapus tidak dapat dikembalikan. Periksa kembali rincian di bawah ini.
        </p>

        {/* Rincian transaksi — baris pemisah, bukan kartu bersarang */}
        <div className="border-y-2 border-[var(--theme-border-subtle)] divide-y-2 divide-[var(--theme-border-subtle)]">
          <div className="flex items-baseline justify-between gap-3 py-2">
            <span className="text-label tracking-normal text-[var(--theme-text-muted)] font-pixel shrink-0">Deskripsi</span>
            <span className="text-meta text-[var(--theme-text)] font-bold text-right break-words">
              {transaction.description || 'Tanpa keterangan'}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-3 py-2">
            <span className="text-label tracking-normal text-[var(--theme-text-muted)] font-pixel shrink-0">Kategori</span>
            <span className="text-meta text-[var(--theme-text-muted)] text-right break-words">
              {transaction.category}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-3 py-2">
            <span className="text-label tracking-normal text-[var(--theme-text-muted)] font-pixel shrink-0">Nominal</span>
            <span
              className={`font-retro text-body tabular-nums text-right font-bold ${
                isIncome ? 'text-[var(--theme-income)]' : 'text-[var(--theme-expense-text)]'
              }`}
            >
              {isIncome ? '+' : '-'} {formatRupiah(transaction.amount)}
            </span>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className="pixel-button flex-1 bg-[var(--theme-expense)] hover:opacity-90 text-white font-retro text-meta px-3 py-2.5 cursor-pointer font-bold"
          >
            YA, HAPUS
          </button>
          <button
            type="button"
            onClick={requestClose}
            className="pixel-button bg-[var(--theme-card-subtle)] hover:bg-[var(--theme-card)] text-[var(--theme-text)] font-retro text-meta px-4 py-2.5 cursor-pointer font-bold"
          >
            BATAL
          </button>
        </div>
      </div>
    </div>
  )
}
