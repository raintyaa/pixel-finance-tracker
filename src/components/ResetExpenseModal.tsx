import { useState } from 'react'
import type { Transaction } from '../types/finance'
import { formatRupiah } from '../utils/currency'
import { useExitAnimation } from '../utils/motion'

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
              <p className="font-sans text-label tracking-normal text-[var(--theme-text-muted)]">
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

        {/* Ringkasan Pengeluaran Bulan Ini — strip datar tanpa nested card */}
        <div className="flex items-center justify-between border-y-2 border-[var(--theme-border-subtle)] bg-[var(--theme-expense-surface)] px-3.5 py-3">
          <div>
            <h3 className="font-retro text-label font-bold tracking-normal text-[var(--theme-text-muted)]">
              TOTAL PENGELUARAN BULAN INI
            </h3>
            <p className="mt-0.5 font-mono text-display font-bold tabular-nums text-[var(--theme-expense-text)]">
              {formatRupiah(totalExpense)}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <span className="inline-block whitespace-nowrap border border-black bg-white px-2.5 py-1 font-retro text-label font-bold tracking-normal text-black">
              {expenses.length} Transaksi Aktif
            </span>
          </div>
        </div>

        {/* Opsi 1 (Fitur Utama): Reset Pengeluaran ke Rp 0 & Kunci Saldo (Poin 2) */}
        <div className="border-y-2 border-emerald-300 bg-emerald-50 px-3.5 py-3 text-emerald-950">
          {!confirmKeepBalance ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-base" aria-hidden="true">
                    🔒
                  </span>
                  <h3 className="font-retro text-label font-bold tracking-normal text-emerald-900">
                    RESET KE RP 0 (SALDO TETAP)
                  </h3>
                </div>
                <p className="mt-1 font-sans text-meta leading-normal text-emerald-800">
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
                className="pixel-button shrink-0 cursor-pointer border-2 border-black bg-[var(--theme-gold)] px-3 py-2 font-retro text-label font-bold tracking-normal text-black shadow-[2px_2px_0px_#000] hover:bg-[var(--theme-gold-hover)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                🔒 RESET (SALDO TETAP)
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <p className="font-sans text-meta font-bold leading-normal text-emerald-900">
                🔒 Konfirmasi: Seluruh pengeluaran bulan ini ({formatRupiah(totalExpense)}) akan
                dibukukan/diarsipkan. Angka pengeluaran menjadi Rp 0, sementara sisa saldo kas tidak
                akan berubah. Lanjutkan?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleExecuteKeepBalance}
                  className="pixel-button cursor-pointer border-2 border-black bg-emerald-600 px-3 py-1.5 font-retro text-label font-bold tracking-normal text-white shadow-[2px_2px_0px_#000] hover:bg-emerald-700"
                >
                  YA, RESET KE 0 (SALDO TETAP)
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmKeepBalance(false)}
                  className="pixel-button cursor-pointer border border-black bg-white px-3 py-1.5 font-retro text-label font-bold tracking-normal text-black shadow-[1px_1px_0px_#000] hover:bg-zinc-100"
                >
                  BATAL
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Opsi 2: Hapus Seluruh Transaksi Pengeluaran (Kembalikan Saldo) */}
        <div className="border-y-2 border-[var(--theme-border-subtle)] bg-zinc-50 px-3.5 py-3 text-zinc-900">
          {!confirmDeleteAll ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-retro text-label font-bold tracking-normal text-zinc-800">
                  HAPUS SELURUH TRANSAKSI (SALDO BERTAMBAH)
                </h3>
                <p className="mt-1 font-sans text-meta leading-normal text-zinc-600">
                  Membatalkan seluruh transaksi pengeluaran. Uang kas akan bertambah kembali sebesar{' '}
                  {formatRupiah(totalExpense)}.
                </p>
              </div>
              <button
                type="button"
                disabled={expenses.length === 0}
                onClick={() => {
                  setConfirmDeleteAll(true)
                  setConfirmKeepBalance(false)
                }}
                className="pixel-button shrink-0 cursor-pointer border border-black bg-white px-3 py-1.5 font-retro text-label font-bold tracking-normal text-red-600 shadow-[1px_1px_0px_#000] hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                🗑️ HAPUS SEMUA
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <p className="font-sans text-meta font-bold leading-normal text-red-900">
                ⚠️ PERHATIAN: Transaksi pengeluaran akan dihapus permanen dan saldo kasmu akan
                bertambah kembali sebesar {formatRupiah(totalExpense)}. Lanjutkan?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleExecuteDeleteAll}
                  className="pixel-button cursor-pointer border border-black bg-red-600 px-3 py-1.5 font-retro text-label font-bold tracking-normal text-white shadow-[2px_2px_0px_#000] hover:bg-red-700"
                >
                  YA, HAPUS & KEMBALIKAN SALDO
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteAll(false)}
                  className="pixel-button cursor-pointer border border-black bg-white px-3 py-1.5 font-retro text-label font-bold tracking-normal text-black shadow-[1px_1px_0px_#000] hover:bg-zinc-100"
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

          <div className="max-h-48 divide-y divide-[var(--theme-border-subtle)] overflow-y-auto border-y-2 border-[var(--theme-border-subtle)] bg-white">
            {expenses.length === 0 ? (
              <p className="p-4 text-center font-sans text-meta text-[var(--theme-text-muted)]">
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
                      <span className="font-mono text-label tracking-normal text-[var(--theme-text-muted)]">
                        {tx.date}
                      </span>
                      <span className="border border-zinc-400 bg-zinc-100 px-1.5 py-0.5 font-retro text-label tracking-normal text-zinc-700">
                        {tx.category}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate font-sans text-body font-medium text-black">
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
