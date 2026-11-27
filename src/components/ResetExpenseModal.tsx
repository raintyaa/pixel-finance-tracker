import { useState } from 'react'
import type { Transaction } from '../types/finance'
import { formatRupiah } from '../utils/currency'
import { useExitAnimation } from '../utils/motion'
import {
  PixelCloseIcon,
  PixelLockIcon,
  PixelResetIcon,
  PixelTrashIcon,
  PixelWarnIcon,
} from './PixelIcons'

interface ResetExpenseModalProps {
  monthName: string
  expenses: Transaction[]
  totalExpense: number
  onResetExpenseKeepBalance: () => void
  onDeleteSingleExpense: (id: string) => void
  onResetAllMonthExpenses: () => void
  onClose: () => void
}

export default function ResetExpenseModal({
  monthName,
  expenses,
  totalExpense,
  onResetExpenseKeepBalance,
  onDeleteSingleExpense,
  onResetAllMonthExpenses,
  onClose,
}: ResetExpenseModalProps) {
  const { closing, requestClose } = useExitAnimation(onClose)
  const [confirmKeepBalance, setConfirmKeepBalance] = useState(false)
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false)

  const handleExecuteKeepBalance = () => {
    onResetExpenseKeepBalance()
    setConfirmKeepBalance(false)
    requestClose()
  }

  const handleExecuteDeleteAll = () => {
    onResetAllMonthExpenses()
    setConfirmDeleteAll(false)
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
        } pixel-modal-frame flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden bg-[var(--theme-card)]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
          {/* Header Modal */}
          <div className="flex items-center justify-between border-b-2 border-[var(--theme-border-subtle)] pb-3">
            <div className="flex items-center gap-2.5">
              <PixelResetIcon className="h-5 w-5 text-[var(--theme-gold-text)]" />
              <div>
                <h2
                  id="reset-expense-title"
                  className="font-retro text-data font-bold tracking-normal text-[var(--theme-gold-text)]"
                >
                  KELOLA &amp; RESET PENGELUARAN
                </h2>
                <p className="font-sans text-label leading-normal tracking-normal text-[var(--theme-text-muted)]">
                  Periode Aktif: {monthName}
                </p>
              </div>
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

          {/* Ringkasan Pengeluaran Bulan Ini — baris pemisah datar tanpa background box */}
          <div className="flex items-center justify-between border-b-2 border-[var(--theme-border-subtle)] pb-3.5">
            <div>
              <h3 className="font-retro text-label font-bold tracking-normal text-[var(--theme-text-muted)]">
                TOTAL PENGELUARAN BULAN INI
              </h3>
              <p className="mt-0.5 font-mono text-display font-bold tabular-nums text-[var(--theme-expense-text)]">
                {formatRupiah(totalExpense)}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <span className="pixel-badge inline-block whitespace-nowrap bg-[var(--theme-card-subtle)] px-2.5 py-1 font-retro text-label font-bold tracking-normal text-[var(--theme-text)]">
                {expenses.length} Transaksi Aktif
              </span>
            </div>
          </div>

          {/* Opsi 1 (Fitur Utama): Reset Pengeluaran ke Rp 0 & Kunci Saldo (Poin 2) */}
          <div className="border-b-2 border-[var(--theme-border-subtle)] pb-3.5 text-[var(--theme-text)]">
            {!confirmKeepBalance ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[var(--theme-income)]">
                    <PixelLockIcon className="h-4 w-4 shrink-0" />
                    <h3 className="font-retro text-label font-bold tracking-normal">
                      RESET KE RP 0 (SALDO TETAP)
                    </h3>
                  </div>
                  <p className="mt-1 font-sans text-meta leading-normal text-[var(--theme-text-muted)]">
                    Pengeluaran bulan ini direset ke <strong>Rp 0</strong>. Saldo kas riilmu{' '}
                    <strong>tetap utuh dan tidak bertambah</strong>.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={expenses.length === 0}
                  onClick={() => {
                    setConfirmKeepBalance(true)
                    setConfirmDeleteAll(false)
                  }}
                  className="pixel-button flex shrink-0 cursor-pointer items-center gap-1.5 bg-[var(--theme-gold)] px-3 py-2 font-retro text-label font-bold tracking-normal text-black hover:bg-[var(--theme-gold-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <PixelLockIcon className="h-3.5 w-3.5" />
                  <span>RESET (SALDO TETAP)</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <p className="flex items-start gap-2 font-sans text-meta font-bold leading-normal text-[var(--theme-income)]">
                  <PixelLockIcon className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Konfirmasi: Seluruh pengeluaran bulan ini ({formatRupiah(totalExpense)}) akan
                    dibukukan/diarsipkan. Angka pengeluaran menjadi Rp 0, sementara sisa saldo kas
                    tidak akan berubah. Lanjutkan?
                  </span>
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleExecuteKeepBalance}
                    className="pixel-button cursor-pointer bg-[var(--theme-income)] px-3 py-1.5 font-retro text-label font-bold tracking-normal text-white hover:opacity-90"
                  >
                    YA, RESET KE 0 (SALDO TETAP)
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmKeepBalance(false)}
                    className="pixel-button cursor-pointer bg-[var(--theme-card-subtle)] px-3 py-1.5 font-retro text-label font-bold tracking-normal text-[var(--theme-text)] hover:bg-[var(--theme-card)]"
                  >
                    BATAL
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Opsi 2: Hapus Seluruh Transaksi Pengeluaran (Kembalikan Saldo) */}
          <div className="border-b-2 border-[var(--theme-border-subtle)] pb-3.5 text-[var(--theme-text)]">
            {!confirmDeleteAll ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-retro text-label font-bold tracking-normal text-[var(--theme-text)]">
                    HAPUS SELURUH TRANSAKSI (SALDO BERTAMBAH)
                  </h3>
                  <p className="mt-1 font-sans text-meta leading-normal text-[var(--theme-text-muted)]">
                    Membatalkan seluruh transaksi pengeluaran. Uang kas akan bertambah kembali
                    sebesar {formatRupiah(totalExpense)}.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={expenses.length === 0}
                  onClick={() => {
                    setConfirmDeleteAll(true)
                    setConfirmKeepBalance(false)
                  }}
                  className="pixel-button flex shrink-0 cursor-pointer items-center gap-1.5 bg-[var(--theme-card)] px-3 py-1.5 font-retro text-label font-bold tracking-normal text-[var(--theme-expense-text)] hover:bg-[var(--theme-expense-badge)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <PixelTrashIcon className="h-3.5 w-3.5" />
                  <span>HAPUS SEMUA</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <p className="flex items-start gap-2 font-sans text-meta font-bold leading-normal text-[var(--theme-expense-text)]">
                  <PixelWarnIcon className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    PERHATIAN: Transaksi pengeluaran akan dihapus permanen dan saldo kasmu akan
                    bertambah kembali sebesar {formatRupiah(totalExpense)}. Lanjutkan?
                  </span>
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleExecuteDeleteAll}
                    className="pixel-button cursor-pointer bg-[var(--theme-expense)] px-3 py-1.5 font-retro text-label font-bold tracking-normal text-white hover:opacity-90"
                  >
                    YA, HAPUS &amp; KEMBALIKAN SALDO
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteAll(false)}
                    className="pixel-button cursor-pointer bg-[var(--theme-card-subtle)] px-3 py-1.5 font-retro text-label font-bold tracking-normal text-[var(--theme-text)] hover:bg-[var(--theme-card)]"
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
              <h3 className="font-retro text-label font-bold tracking-normal text-[var(--theme-text-muted)]">
                DAFTAR TRANSAKSI BULAN INI
              </h3>
              <span className="font-sans text-meta text-[var(--theme-text-muted)]">
                (Bisa hapus item tertentu saja)
              </span>
            </div>

            <div className="max-h-48 divide-y divide-[var(--theme-border-subtle)] overflow-y-auto">
              {expenses.length === 0 ? (
                <p className="p-4 text-center font-sans text-meta leading-normal text-[var(--theme-text-muted)]">
                  Tidak ada transaksi pengeluaran tercatat di bulan ini.
                </p>
              ) : (
                expenses.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between gap-3 px-2 py-2.5 hover:bg-[var(--theme-card-subtle)]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-label tracking-normal tabular-nums text-[var(--theme-text-muted)]">
                          {tx.date}
                        </span>
                        <span className="bg-[var(--theme-card-subtle)] px-1.5 py-0.5 font-sans text-label tracking-normal text-[var(--theme-text)]">
                          {tx.category}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate font-sans text-body font-medium leading-normal text-[var(--theme-text)]">
                        {tx.description || 'Tanpa keterangan'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-body font-bold tabular-nums text-[var(--theme-expense-text)]">
                        {formatRupiah(tx.amount)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeleteSingleExpense(tx.id)}
                        className="pixel-button flex cursor-pointer items-center justify-center bg-[var(--theme-card)] p-1.5 text-[var(--theme-expense-text)] hover:bg-[var(--theme-expense)] hover:text-white"
                        aria-label={`Hapus transaksi: ${tx.description || tx.category}`}
                        title={`Hapus transaksi "${tx.description}"`}
                      >
                        <PixelTrashIcon className="h-3.5 w-3.5" />
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
              className="pixel-button cursor-pointer bg-[var(--theme-gold)] px-5 py-2 font-retro text-meta font-bold text-black hover:bg-[var(--theme-gold-hover)]"
            >
              SELESAI
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
