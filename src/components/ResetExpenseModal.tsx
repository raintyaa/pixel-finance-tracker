import { useState } from 'react'
import type { Transaction } from '../types/finance'
import { formatRupiah } from '../utils/currency'
import { useExitAnimation } from '../utils/motion'

interface ResetExpenseModalProps {
  monthName: string
  expenses: Transaction[]
  totalExpense: number
  excludeAdjustments: boolean
  onToggleExcludeAdjustments: (enabled: boolean) => void
  onDeleteSingleExpense: (id: string) => void
  onResetAllMonthExpenses: () => void
  onClose: () => void
}

export default function ResetExpenseModal({
  monthName,
  expenses,
  totalExpense,
  excludeAdjustments,
  onToggleExcludeAdjustments,
  onDeleteSingleExpense,
  onResetAllMonthExpenses,
  onClose,
}: ResetExpenseModalProps) {
  const { closing, requestClose } = useExitAnimation(onClose)
  const [confirmResetAll, setConfirmResetAll] = useState(false)

  const handleExecuteResetAll = () => {
    onResetAllMonthExpenses()
    setConfirmResetAll(false)
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
        aria-labelledby="reset-expense-title"
        className={`${
          closing ? 'motion-crt-off' : 'motion-crt'
        } pixel-box flex max-h-[92vh] w-full max-w-lg flex-col gap-4 overflow-y-auto border-3 border-[var(--theme-border)] bg-[var(--theme-card)] p-5 shadow-[6px_6px_0px_var(--theme-shadow)]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b-2 border-[var(--theme-border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none" aria-hidden="true">
              🔄
            </span>
            <div>
              <h2
                id="reset-expense-title"
                className="font-retro text-data font-bold tracking-normal text-[var(--theme-gold-text)]"
              >
                KELOLA & RESET PENGELUARAN
              </h2>
              <p className="font-sans text-label text-[var(--theme-text-muted)]">
                Periode Aktif: {monthName}
              </p>
            </div>
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

        {/* Ringkasan Pengeluaran Bulan Ini */}
        <div className="pixel-box flex items-center justify-between border border-black bg-[var(--theme-expense-surface)] p-3">
          <div>
            <p className="font-retro text-label font-bold tracking-wider text-[var(--theme-text-muted)]">
              TOTAL PENGELUARAN BULAN INI
            </p>
            <p className="mt-0.5 font-mono text-display font-bold tabular-nums text-[var(--theme-expense-text)]">
              {formatRupiah(totalExpense)}
            </p>
          </div>
          <div className="text-right">
            <span className="border border-black bg-white px-2 py-1 font-retro text-label font-bold text-black shadow-[1px_1px_0px_#000]">
              {expenses.length} Transaksi
            </span>
          </div>
        </div>

        {/* Sakelar Pintar: Abaikan Penyesuaian Saldo / Darurat dari Budget */}
        <div className="pixel-box border-2 border-black bg-[var(--theme-card-subtle)] p-3.5">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={excludeAdjustments}
              onChange={(e) => onToggleExcludeAdjustments(e.target.checked)}
              className="mt-0.5 h-4 w-4 cursor-pointer accent-[var(--theme-gold)]"
            />
            <div className="min-w-0">
              <span className="font-retro text-label font-bold text-[var(--theme-text)]">
                Abaikan Penyesuaian Saldo dari Batas Budget
              </span>
              <p className="mt-0.5 font-sans text-meta text-[var(--theme-text-muted)] leading-relaxed">
                Jika diaktifkan, pengeluaran akibat koreksi saldo fisik/bank tidak akan dihitung ke
                dalam HP Bar anggaran bulanan sehingga status dompet tidak langsung jebol.
              </p>
            </div>
          </label>
        </div>

        {/* Opsi Aksi Cepat: Reset Total ke Rp 0 */}
        <div className="pixel-box border-2 border-red-500 bg-red-50 p-3.5 text-red-900">
          {!confirmResetAll ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-retro text-label font-bold text-red-800">
                  RESET SEMUA PENGELUARAN KE RP 0
                </p>
                <p className="font-sans text-meta text-red-700">
                  Hapus seluruh {expenses.length} catatan pengeluaran bulan {monthName}.
                </p>
              </div>
              <button
                type="button"
                disabled={expenses.length === 0}
                onClick={() => setConfirmResetAll(true)}
                className="pixel-button shrink-0 cursor-pointer border border-black bg-red-600 px-3 py-2 font-retro text-label font-bold text-white shadow-[2px_2px_0px_#000] hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                🗑️ RESET KE RP 0
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <p className="font-sans text-meta font-bold text-red-900">
                ⚠️ PERHATIAN: Seluruh {expenses.length} transaksi pengeluaran bulan ini akan
                dihapus permanen. Saldo kas riilmu akan bertambah kembali sebesar{' '}
                <span className="font-mono">{formatRupiah(totalExpense)}</span>. Lanjutkan?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleExecuteResetAll}
                  className="pixel-button cursor-pointer border border-black bg-red-700 px-3 py-1.5 font-retro text-label font-bold text-white shadow-[2px_2px_0px_#000] hover:bg-red-800"
                >
                  YA, RESET KE 0 SEKARANG
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmResetAll(false)}
                  className="pixel-button cursor-pointer border border-black bg-white px-3 py-1.5 font-retro text-label font-bold text-black shadow-[1px_1px_0px_#000] hover:bg-zinc-100"
                >
                  BATAL
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Daftar Transaksi Pengeluaran Bulan Ini (Hapus Spesifik / Parsial) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="font-retro text-label font-bold tracking-wide text-[var(--theme-text-muted)]">
              DAFTAR PENGELUARAN BULAN INI
            </p>
            <span className="font-sans text-meta text-[var(--theme-text-muted)]">
              (Hapus transaksi penyebab over budget di bawah)
            </span>
          </div>

          <div className="pixel-box max-h-56 divide-y-2 divide-[var(--theme-border-subtle)] overflow-y-auto border-2 border-black bg-white">
            {expenses.length === 0 ? (
              <p className="p-4 text-center font-sans text-meta text-[var(--theme-text-muted)]">
                Tidak ada transaksi pengeluaran tercatat di bulan ini.
              </p>
            ) : (
              expenses.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between gap-3 p-2.5 hover:bg-[var(--theme-card-subtle)]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-label text-[var(--theme-text-muted)]">
                        {tx.date}
                      </span>
                      <span className="border border-black bg-zinc-100 px-1 py-0.2 font-retro text-label text-zinc-700">
                        {tx.category}
                      </span>
                    </div>
                    <p className="truncate font-sans text-body font-medium text-black">
                      {tx.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-body font-bold tabular-nums text-[var(--theme-expense-text)]">
                      {formatRupiah(tx.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onDeleteSingleExpense(tx.id)}
                      className="pixel-button cursor-pointer border border-black bg-white px-2 py-1 text-label text-red-600 shadow-[1px_1px_0px_#000] hover:bg-red-50 hover:text-red-700"
                      title={`Hapus transaksi "${tx.description}"`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Modal */}
        <div className="mt-1 flex justify-end border-t-2 border-[var(--theme-border-subtle)] pt-3">
          <button
            type="button"
            onClick={requestClose}
            className="pixel-button cursor-pointer border-2 border-black bg-[var(--theme-gold)] px-5 py-2 font-retro text-meta font-bold text-black shadow-[2px_2px_0px_#000] hover:bg-[var(--theme-gold-hover)]"
          >
            SELESAI
          </button>
        </div>
      </div>
    </div>
  )
}
