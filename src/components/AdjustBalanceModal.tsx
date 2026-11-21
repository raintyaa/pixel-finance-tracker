import { useState } from 'react'
import type { Transaction } from '../types/finance'
import { formatRupiah } from '../utils/currency'
import { getDayOfWeekFromDate, getTodayDateString } from '../utils/date'
import { useExitAnimation } from '../utils/motion'

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
        } pixel-box flex max-h-[92vh] w-full max-w-md flex-col gap-4 overflow-y-auto border-3 border-[var(--theme-border)] bg-[var(--theme-card)] p-5 shadow-[6px_6px_0px_var(--theme-shadow)]`}
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
              className="font-retro text-data font-bold tracking-normal text-[var(--theme-gold-text)]"
            >
              ATUR SALDO RIIL
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

        <p className="font-sans text-body leading-relaxed text-[var(--theme-text-muted)]">
          Gunakan fitur ini jika saldo di dompet/rekening fisikmu berbeda dengan aplikasi (misal
          setelah transfer antar-rekening atau koreksi uang riil).
        </p>

        {/* Info Saldo Tercatat Saat Ini */}
        <div className="flex items-center justify-between border-2 border-[var(--theme-border)] bg-[var(--theme-card-subtle)] p-3">
          <span className="font-sans text-label tracking-normal text-[var(--theme-text-muted)]">
            Saldo Tercatat di Aplikasi:
          </span>
          <span className="font-mono text-data font-bold tabular-nums text-black">
            {formatRupiah(currentBalance)}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Input Saldo Nyata */}
          <label className="flex flex-col gap-1">
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
              className="pixel-input border-2 border-[var(--theme-border)] bg-[var(--theme-card)] px-3 py-2 font-mono text-data font-bold tabular-nums text-[var(--theme-text)] outline-none focus:border-[var(--theme-gold)]"
            />
          </label>

          {/* Pratinjau Selisih Otomatis */}
          {difference !== null && (
            <div
              className={`flex flex-col gap-1 border-2 border-[var(--theme-border)] p-3 ${
                difference < 0
                  ? 'bg-[var(--theme-expense-surface)] text-[var(--theme-expense-text)]'
                  : difference > 0
                  ? 'bg-[var(--theme-income-surface)] text-[var(--theme-income)]'
                  : 'bg-[var(--theme-card-subtle)] text-[var(--theme-text-muted)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-sans text-label font-bold tracking-normal">
                  {difference < 0
                    ? '🔻 Selisih Berkurang'
                    : difference > 0
                    ? '🔺 Selisih Bertambah (Pemasukan)'
                    : '⚖️ Tidak Ada Selisih'}
                </span>
                <span className="font-mono text-body font-bold tabular-nums">
                  {difference > 0 ? '+' : ''}
                  {formatRupiah(difference)}
                </span>
              </div>
              <p className="mt-0.5 font-sans text-meta leading-tight opacity-90">
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
            <div className="flex flex-col gap-3 rounded-none border-2 border-black bg-[var(--theme-card-subtle)] p-3">
              <p className="font-retro text-label font-bold text-[var(--theme-text)]">
                PENGATURAN STATUS BEBAN & BIAYA ADMIN
              </p>

              {/* 1. Opsi Apakah Ditetapkan sebagai Pengeluaran Bulanan */}
              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={treatAsExpense}
                  onChange={(e) => setTreatAsExpense(e.target.checked)}
                  className="mt-0.5 h-4 w-4 cursor-pointer accent-[var(--theme-gold)]"
                />
                <div className="min-w-0">
                  <span className="font-sans text-meta font-bold text-black">
                    Tetapkan selisih saldo sebagai Pengeluaran Bulanan
                  </span>
                  <p className="mt-0.5 font-sans text-label text-[var(--theme-text-muted)]">
                    {treatAsExpense
                      ? 'Selisih akan memotong batas budget bulanan.'
                      : 'Hanya koreksi kas (TIDAK membebani kartu Pengeluaran & HP Bar budget).'}
                  </p>
                </div>
              </label>

              {/* 2. Opsi Biaya Admin Transfer */}
              <div className="border-t border-zinc-300 pt-2.5">
                <label className="flex cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={hasAdminFee}
                    onChange={(e) => setHasAdminFee(e.target.checked)}
                    className="mt-0.5 h-4 w-4 cursor-pointer accent-[var(--theme-gold)]"
                  />
                  <div className="min-w-0">
                    <span className="font-sans text-meta font-bold text-black">
                      Ada Biaya Admin / Transfer Bank
                    </span>
                    <p className="mt-0.5 font-sans text-label text-[var(--theme-text-muted)]">
                      Misal saat transfer ke DANA atau bank lain terkena biaya admin.
                    </p>
                  </div>
                </label>

                {hasAdminFee && (
                  <div className="mt-3 flex flex-col gap-2 rounded-none border border-black bg-white p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-retro text-label font-bold text-zinc-800">
                        NOMINAL BIAYA ADMIN (RP)
                      </span>
                      <input
                        type="number"
                        min={0}
                        step="100"
                        value={adminFeeAmount}
                        onChange={(e) => setAdminFeeAmount(e.target.value)}
                        placeholder="cth: 6500"
                        className="w-28 border border-black px-2 py-1 font-mono text-body font-bold text-black text-right outline-none"
                      />
                    </div>

                    {/* Preset Biaya Admin Cepat */}
                    <div className="flex items-center gap-1.5">
                      <span className="font-sans text-label text-zinc-500">Preset:</span>
                      {ADMIN_FEE_PRESETS.map((fee) => (
                        <button
                          key={fee}
                          type="button"
                          onClick={() => setAdminFeeAmount(String(fee))}
                          className={`pixel-button cursor-pointer border border-black px-1.5 py-0.5 font-retro text-label font-bold ${
                            Number(adminFeeAmount) === fee
                              ? 'bg-[var(--theme-gold)] text-black'
                              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
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
                      className="border border-zinc-300 px-2 py-1 font-sans text-meta text-black outline-none focus:border-black"
                    />

                    <p className="font-sans text-[11px] text-emerald-800 leading-tight">
                      ✓ Biaya admin {formatRupiah(parsedAdminFee || 0)} akan otomatis dicatat
                      sebagai pengeluaran riil di kartu Pengeluaran.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Keterangan Tambahan (Opsional) */}
          <label className="flex flex-col gap-1">
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
              className="pixel-input border-2 border-[var(--theme-border)] bg-[var(--theme-card)] px-3 py-2 font-sans text-body text-[var(--theme-text)] outline-none focus:border-[var(--theme-gold)]"
            />
          </label>

          {/* Tanggal Penyesuaian */}
          <label className="flex flex-col gap-1">
            <span className="font-retro text-label font-bold tracking-normal text-[var(--theme-text)]">
              TANGGAL PENCATATAN
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pixel-input cursor-pointer border-2 border-[var(--theme-border)] bg-[var(--theme-card)] px-3 py-2 font-mono text-body tabular-nums text-[var(--theme-text)] outline-none focus:border-[var(--theme-gold)]"
            />
          </label>

          {error && (
            <p className="border-2 border-[var(--theme-expense)] bg-[var(--theme-expense-badge)] px-3 py-2 font-sans text-meta text-[var(--theme-expense-text)]">
              ⚠️ {error}
            </p>
          )}

          {/* Tombol Aksi */}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={difference === null || difference === 0}
              className={`pixel-button flex-1 cursor-pointer px-3 py-2.5 font-retro text-meta font-bold ${
                difference === null || difference === 0
                  ? 'cursor-not-allowed bg-[var(--theme-card-subtle)] text-[var(--theme-text-muted)] opacity-60'
                  : 'bg-[var(--theme-gold)] text-black hover:bg-[var(--theme-gold-hover)]'
              }`}
            >
              💾 Simpan Saldo Baru
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
  )
}
