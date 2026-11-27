import { useState } from 'react'
import type { Transaction } from '../types/finance'
import { formatRupiah } from '../utils/currency'
import { getDayOfWeekFromDate, getTodayDateString } from '../utils/date'
import { useExitAnimation } from '../utils/motion'
import {
  PixelCheckIcon,
  PixelCloseIcon,
  PixelSaveIcon,
  PixelScaleIcon,
  PixelTrendIcon,
  PixelWarnIcon,
} from './PixelIcons'

interface AdjustBalanceModalProps {
  currentBalance: number
  onSubmit: (newTxs: Transaction[]) => void
  onClose: () => void
}

const ADMIN_FEE_PRESETS = [2500, 6500, 7500]

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

  // Opsi penetapan beban pengeluaran (Poin 1)
  const [treatAsExpense, setTreatAsExpense] = useState<boolean>(false)

  // Opsi biaya admin transfer (Poin 1)
  const [hasAdminFee, setHasAdminFee] = useState<boolean>(false)
  const [adminFeeAmount, setAdminFeeAmount] = useState<string>('6500')
  const [adminFeeNote, setAdminFeeNote] = useState<string>('Biaya Admin Transfer')

  const parsedTarget = targetBalance.trim() === '' ? null : Number(targetBalance)
  const difference =
    parsedTarget !== null && !isNaN(parsedTarget) ? parsedTarget - currentBalance : null

  const parsedAdminFee = hasAdminFee && adminFeeAmount.trim() !== '' ? Number(adminFeeAmount) : 0

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
      setError(
        'Nominal yang dimasukkan sama dengan saldo saat ini. Tidak ada penyesuaian yang perlu dicatat.'
      )
      return
    }

    if (hasAdminFee && (isNaN(parsedAdminFee) || parsedAdminFee <= 0)) {
      setError('Masukkan nominal biaya admin yang valid atau hilangkan centang biaya admin.')
      return
    }

    if (!date) {
      setError('Tanggal tidak boleh kosong.')
      return
    }

    const generatedTxs: Transaction[] = []
    const now = Date.now()

    if (difference < 0) {
      const totalDecrease = Math.abs(difference)

      if (hasAdminFee && parsedAdminFee > 0) {
        const actualAdminFee = Math.min(parsedAdminFee, totalDecrease)
        const remainingDecrease = totalDecrease - actualAdminFee

        // 1. Transaksi Biaya Admin (PASTI dihitung sebagai Pengeluaran Riil)
        generatedTxs.push({
          id: `tx-${now}-admin-fee`,
          type: 'expense',
          amount: actualAdminFee,
          description: adminFeeNote.trim() || 'Biaya Admin Transfer',
          category: 'Biaya Admin',
          date,
          dayOfWeek: getDayOfWeekFromDate(date),
          isAdjustmentExpense: true,
        })

        // 2. Transaksi Sisa Penyesuaian Saldo (Bisa dipilih apakah Beban atau Bukan)
        if (remainingDecrease > 0) {
          generatedTxs.push({
            id: `tx-${now}-adjust-bal`,
            type: 'expense',
            amount: remainingDecrease,
            description:
              customNote.trim() ||
              (treatAsExpense
                ? 'Penyesuaian Saldo (Pengeluaran tak tercatat)'
                : 'Transfer / Penyesuaian Kas'),
            category: 'Penyesuaian Saldo',
            date,
            dayOfWeek: getDayOfWeekFromDate(date),
            isAdjustmentExpense: treatAsExpense,
          })
        }
      } else {
        // Tanpa Biaya Admin
        generatedTxs.push({
          id: `tx-${now}-${Math.floor(Math.random() * 100000)}`,
          type: 'expense',
          amount: totalDecrease,
          description:
            customNote.trim() ||
            (treatAsExpense
              ? 'Penyesuaian Saldo (Pengeluaran tak tercatat)'
              : 'Transfer / Penyesuaian Kas'),
          category: 'Penyesuaian Saldo',
          date,
          dayOfWeek: getDayOfWeekFromDate(date),
          isAdjustmentExpense: treatAsExpense,
        })
      }
    } else {
      // Saldo Bertambah (Pemasukan)
      generatedTxs.push({
        id: `tx-${now}-${Math.floor(Math.random() * 100000)}`,
        type: 'income',
        amount: difference,
        description: customNote.trim() || 'Penyesuaian Saldo (Koreksi Pemasukan)',
        category: 'Penyesuaian Saldo',
        date,
        dayOfWeek: getDayOfWeekFromDate(date),
      })
    }

    onSubmit(generatedTxs)
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
        aria-labelledby="adjust-balance-title"
        className={`${
          closing ? 'motion-crt-off' : 'motion-crt'
        } pixel-modal-frame flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden bg-[var(--theme-card)]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
          {/* Judul Modal */}
          <div className="flex items-center justify-between border-b-2 border-[var(--theme-border-subtle)] pb-3">
            <div className="flex items-center gap-2">
              <PixelScaleIcon className="h-5 w-5 text-[var(--theme-gold-text)]" />
              <h2
                id="adjust-balance-title"
                className="font-retro text-data font-bold tracking-normal text-[var(--theme-gold-text)]"
              >
                ATUR SALDO RIIL
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

          <p className="font-sans text-body leading-normal text-[var(--theme-text-muted)]">
            Gunakan fitur ini jika saldo di dompet/rekening fisikmu berbeda dengan aplikasi (misal
            setelah transfer antar-rekening atau koreksi uang riil).
          </p>

          {/* Info Saldo Tercatat Saat Ini — baris pembatas datar tanpa background box */}
          <div className="flex items-center justify-between border-b-2 border-[var(--theme-border-subtle)] pb-3">
            <span className="font-sans text-meta tracking-normal text-[var(--theme-text-muted)]">
              Saldo Tercatat di Aplikasi:
            </span>
            <span className="font-mono text-data font-bold tabular-nums text-[var(--theme-text)]">
              {formatRupiah(currentBalance)}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Input Saldo Nyata */}
            <label className="flex flex-col gap-1.5">
              <span className="font-retro text-label font-bold tracking-normal text-[var(--theme-text)]">
                SALDO RIIL DI DOMPET / BANK SAAT INI (RP)
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
                className="pixel-input bg-[var(--theme-card)] px-3 py-2 font-mono text-data font-bold tabular-nums text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)]"
              />
            </label>

            {/* Pratinjau Selisih Otomatis */}
            {difference !== null && (
              <div
                className={`flex flex-col gap-1 border-b-2 border-[var(--theme-border-subtle)] pb-3 ${
                  difference < 0
                    ? 'text-[var(--theme-expense-text)]'
                    : difference > 0
                    ? 'text-[var(--theme-income)]'
                    : 'text-[var(--theme-text-muted)]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 font-sans text-meta font-bold tracking-normal">
                    {difference < 0 ? (
                      <>
                        <PixelTrendIcon direction="down" className="h-4 w-4" />
                        <span>Selisih Berkurang</span>
                      </>
                    ) : difference > 0 ? (
                      <>
                        <PixelTrendIcon direction="up" className="h-4 w-4" />
                        <span>Selisih Bertambah (Pemasukan)</span>
                      </>
                    ) : (
                      <>
                        <PixelScaleIcon className="h-4 w-4" />
                        <span>Tidak Ada Selisih</span>
                      </>
                    )}
                  </span>
                  <span className="font-mono text-body font-bold tabular-nums">
                    {difference > 0 ? '+' : ''}
                    {formatRupiah(difference)}
                  </span>
                </div>
                <p className="mt-0.5 font-sans text-meta leading-normal opacity-90">
                  {difference < 0
                    ? `Saldo aplikasi akan disesuaikan berkurang sebesar ${formatRupiah(
                        Math.abs(difference)
                      )} agar saldo pas.`
                    : difference > 0
                    ? `Saldo aplikasi akan disesuaikan bertambah sebesar ${formatRupiah(
                        difference
                      )} agar saldo pas.`
                    : 'Nominal sama dengan saldo yang tercatat saat ini.'}
                </p>
              </div>
            )}

            {/* Pengaturan Khusus jika Selisih Berkurang (Poin 1) */}
            {difference !== null && difference < 0 && (
              <div className="flex flex-col gap-3 border-b-2 border-[var(--theme-border-subtle)] pb-3.5">
                <h3 className="font-retro text-label font-bold tracking-normal text-[var(--theme-text)]">
                  PENGATURAN STATUS BEBAN &amp; BIAYA ADMIN
                </h3>

                {/* 1. Opsi Apakah Ditetapkan sebagai Pengeluaran Bulanan */}
                <label className="flex cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={treatAsExpense}
                    onChange={(e) => setTreatAsExpense(e.target.checked)}
                    className="mt-0.5 h-4 w-4 cursor-pointer accent-[var(--theme-gold)]"
                  />
                  <div className="min-w-0">
                    <span className="font-sans text-meta font-bold text-[var(--theme-text)]">
                      Tetapkan selisih saldo sebagai Pengeluaran Bulanan
                    </span>
                    <p className="mt-0.5 font-sans text-label leading-normal tracking-normal text-[var(--theme-text-muted)]">
                      {treatAsExpense
                        ? 'Selisih akan memotong batas budget bulanan.'
                        : 'Hanya koreksi kas (TIDAK membebani kartu Pengeluaran & HP Bar budget).'}
                    </p>
                  </div>
                </label>

                {/* 2. Opsi Biaya Admin Transfer */}
                <div className="border-t border-[var(--theme-border-subtle)] pt-2.5">
                  <label className="flex cursor-pointer items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={hasAdminFee}
                      onChange={(e) => setHasAdminFee(e.target.checked)}
                      className="mt-0.5 h-4 w-4 cursor-pointer accent-[var(--theme-gold)]"
                    />
                    <div className="min-w-0">
                      <span className="font-sans text-meta font-bold text-[var(--theme-text)]">
                        Ada Biaya Admin / Transfer Bank
                      </span>
                      <p className="mt-0.5 font-sans text-label leading-normal tracking-normal text-[var(--theme-text-muted)]">
                        Misal saat transfer ke DANA atau bank lain terkena biaya admin.
                      </p>
                    </div>
                  </label>

                  {hasAdminFee && (
                    <div className="mt-3 flex flex-col gap-2.5 border-t border-[var(--theme-border-subtle)] pt-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-retro text-label font-bold tracking-normal text-[var(--theme-text)]">
                          NOMINAL BIAYA ADMIN (RP)
                        </span>
                        <input
                          type="number"
                          min={0}
                          step="100"
                          value={adminFeeAmount}
                          onChange={(e) => setAdminFeeAmount(e.target.value)}
                          placeholder="cth: 6500"
                          className="pixel-input w-28 bg-[var(--theme-card)] px-2.5 py-1 text-right font-mono text-body font-bold tabular-nums text-[var(--theme-text)]"
                        />
                      </div>

                      {/* Preset Biaya Admin Cepat */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-sans text-label tracking-normal text-[var(--theme-text-muted)]">
                          Preset:
                        </span>
                        {ADMIN_FEE_PRESETS.map((fee) => (
                          <button
                            key={fee}
                            type="button"
                            onClick={() => setAdminFeeAmount(String(fee))}
                            className={`pixel-button cursor-pointer px-2 py-0.5 font-retro text-label font-bold tracking-normal ${
                              Number(adminFeeAmount) === fee
                                ? 'bg-[var(--theme-gold)] text-black'
                                : 'bg-[var(--theme-card-subtle)] text-[var(--theme-text)] hover:bg-[var(--theme-card)]'
                            }`}
                          >
                            {formatRupiah(fee)}
                          </button>
                        ))}
                      </div>

                      <input
                        type="text"
                        value={adminFeeNote}
                        onChange={(e) => setAdminFeeNote(e.target.value)}
                        placeholder="Keterangan biaya admin"
                        className="pixel-input bg-[var(--theme-card)] px-2.5 py-1.5 font-sans text-meta text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)]"
                      />

                      <p className="flex items-start gap-1.5 font-sans text-label leading-normal tracking-normal text-[var(--theme-income)]">
                        <PixelCheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>
                          Biaya admin {formatRupiah(parsedAdminFee || 0)} akan otomatis dicatat
                          sebagai pengeluaran riil di kartu Pengeluaran.
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Keterangan Tambahan (Opsional) */}
            <label className="flex flex-col gap-1.5">
              <span className="font-retro text-label font-bold tracking-normal text-[var(--theme-text)]">
                KETERANGAN / ALASAN (OPSIONAL)
              </span>
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder={
                  hasAdminFee
                    ? 'cth: Transfer saldo ke DANA'
                    : difference !== null && difference < 0
                    ? 'cth: Lupa catat kopi dan parkir'
                    : 'cth: Penyesuaian kas bulanan'
                }
                className="pixel-input bg-[var(--theme-card)] px-3 py-2 font-sans text-body text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)]"
              />
            </label>

            {/* Tanggal Penyesuaian */}
            <label className="flex flex-col gap-1.5">
              <span className="font-retro text-label font-bold tracking-normal text-[var(--theme-text)]">
                TANGGAL PENCATATAN
              </span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="pixel-input cursor-pointer bg-[var(--theme-card)] px-3 py-2 font-mono text-body tabular-nums text-[var(--theme-text)]"
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
                disabled={difference === null || difference === 0}
                className={`pixel-button flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 font-retro text-meta font-bold ${
                  difference === null || difference === 0
                    ? 'cursor-not-allowed bg-[var(--theme-card-subtle)] text-[var(--theme-text-muted)] opacity-60'
                    : 'cursor-pointer bg-[var(--theme-gold)] text-black hover:bg-[var(--theme-gold-hover)]'
                }`}
              >
                <PixelSaveIcon className="h-4 w-4" />
                <span>Simpan Saldo Baru</span>
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
