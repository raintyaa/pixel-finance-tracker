import { useRef, useState } from 'react'
import type { BackupData, BudgetConfig, Transaction } from '../types/finance'
import { exportToCsv, exportToJson, validateAndParseBackupJson } from '../utils/backup'
import { formatRupiah } from '../utils/currency'
import { useExitAnimation } from '../utils/motion'

interface BackupModalProps {
  transactions: Transaction[]
  budget: BudgetConfig
  onRestoreData: (restoredTransactions: Transaction[], restoredBudget?: BudgetConfig) => void
  onResetToDefault: () => void
  onClose: () => void
}

export default function BackupModal({
  transactions,
  budget,
  onRestoreData,
  onResetToDefault,
  onClose,
}: BackupModalProps) {
  const { closing, requestClose } = useExitAnimation(onClose)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // State Import & Pemulihan
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<BackupData | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')

  // State Konfirmasi Reset Pabrik
  const [confirmReset, setConfirmReset] = useState<boolean>(false)

  // Handler Download JSON
  const handleExportJson = () => {
    exportToJson(transactions, budget)
    setSuccessMessage('Berkas cadangan JSON berhasil diunduh ke perangkatmu.')
    setErrorMessage('')
  }

  // Handler Download CSV
  const handleExportCsv = () => {
    exportToCsv(transactions)
    setSuccessMessage('Tabel rekap transaksi CSV berhasil diunduh ke perangkatmu.')
    setErrorMessage('')
  }

  // Handler Pemilihan File Cadangan JSON
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const text = await file.text()
      const result = validateAndParseBackupJson(text)

      if (!result.valid || !result.data) {
        setErrorMessage(result.error || 'Format berkas JSON cadangan tidak valid.')
        setPreviewData(null)
      } else {
        setPreviewData(result.data)
      }
    } catch (err) {
      setErrorMessage(`Gagal membaca berkas: ${err instanceof Error ? err.message : 'Galat sistem'}`)
      setPreviewData(null)
    }
  }

  // Handler Eksekusi Pulihkan Data
  const handleExecuteRestore = () => {
    if (!previewData) return

    onRestoreData(previewData.transactions, previewData.budget)
    setSuccessMessage(
      `Sukses! Sebanyak ${previewData.transactions.length} transaksi berhasil dipulihkan.`
    )
    setPreviewData(null)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handler Reset ke Data Awal
  const handleExecuteResetToDefault = () => {
    onResetToDefault()
    setConfirmReset(false)
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
        aria-labelledby="backup-modal-title"
        className={`${
          closing ? 'motion-crt-off' : 'motion-crt'
        } pixel-box flex max-h-[92vh] w-full max-w-lg flex-col gap-4 overflow-y-auto border-3 border-[var(--theme-border)] bg-[var(--theme-card)] p-5 shadow-[6px_6px_0px_var(--theme-shadow)]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b-2 border-[var(--theme-border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none" aria-hidden="true">
              💾
            </span>
            <div>
              <h2
                id="backup-modal-title"
                className="font-retro text-data font-bold tracking-normal text-[var(--theme-gold-text)]"
              >
                PENCADANGAN & PEMULIHAN
              </h2>
              <p className="font-sans text-label tracking-normal text-[var(--theme-text-muted)]">
                Ekspor arsip JSON/CSV &amp; pulihkan data lokal
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

        {/* Notifikasi Banner Sukses / Galat */}
        {successMessage && (
          <div className="flex items-center gap-2 border-b-2 border-emerald-400 pb-2.5 text-emerald-800">
            <span className="text-base" aria-hidden="true">
              ✅
            </span>
            <p className="font-sans text-meta font-medium leading-normal">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center gap-2 border-b-2 border-red-400 pb-2.5 text-red-700">
            <span className="text-base" aria-hidden="true">
              ⚠️
            </span>
            <p className="font-sans text-meta font-bold leading-normal">{errorMessage}</p>
          </div>
        )}

        {/* Ringkasan Data Saat Ini */}
        <div className="flex items-center justify-between border-b-2 border-[var(--theme-border-subtle)] pb-3">
          <div>
            <h3 className="font-retro text-label font-bold tracking-normal text-[var(--theme-text-muted)]">
              DATA AKTIF DI BROWSER
            </h3>
            <p className="mt-0.5 font-mono text-data font-bold tabular-nums text-[var(--theme-text)]">
              {transactions.length} Transaksi Tercatat
            </p>
          </div>
          <div className="text-right">
            <span className="font-sans text-label tracking-normal text-[var(--theme-text-muted)] block">
              Batas Anggaran:
            </span>
            <span className="font-mono text-meta font-bold text-[var(--theme-gold-text)]">
              {formatRupiah(budget.monthlyLimit)}
            </span>
          </div>
        </div>

        {/* Bagian Ekspor Data (Download) */}
        <div className="flex flex-col gap-2.5">
          <h3 className="font-retro text-label font-bold tracking-normal text-[var(--theme-text)]">
            UNDUH CADANGAN DATA (EKSPOR)
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Opsi JSON */}
            <div className="flex flex-col justify-between gap-2.5">
              <div>
                <div className="flex items-center gap-1.5 font-retro text-label font-bold tracking-normal text-black">
                  <span>💾</span>
                  <span>FORMAT JSON</span>
                </div>
                <p className="mt-1 font-sans text-label tracking-normal text-[var(--theme-text-muted)] leading-normal">
                  Cadangan penuh (transaksi + batas budget) untuk diimpor kembali kapan saja.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportJson}
                className="pixel-button cursor-pointer border border-black bg-[var(--theme-gold)] px-3 py-2 font-retro text-label font-bold tracking-normal text-black shadow-[2px_2px_0px_#000] hover:bg-[var(--theme-gold-hover)]"
              >
                UNDUH (.JSON)
              </button>
            </div>

            {/* Opsi CSV */}
            <div className="flex flex-col justify-between gap-2.5">
              <div>
                <div className="flex items-center gap-1.5 font-retro text-label font-bold tracking-normal text-black">
                  <span>📊</span>
                  <span>FORMAT CSV (EXCEL)</span>
                </div>
                <p className="mt-1 font-sans text-label tracking-normal text-[var(--theme-text-muted)] leading-normal">
                  Tabel data dengan kolom rapi. Cocok dibuka di Microsoft Excel atau Google Sheets.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportCsv}
                className="pixel-button cursor-pointer border border-black bg-white px-3 py-2 font-retro text-label font-bold tracking-normal text-black shadow-[2px_2px_0px_#000] hover:bg-zinc-100"
              >
                UNDUH (.CSV)
              </button>
            </div>
          </div>
        </div>

        {/* Bagian Pulihkan Data (Impor JSON) */}
        <div className="flex flex-col gap-2.5 border-t-2 border-[var(--theme-border-subtle)] pt-3">
          <h3 className="font-retro text-label font-bold tracking-normal text-[var(--theme-text)]">
            PULIHKAN DARI CADANGAN (IMPOR)
          </h3>

          <input
            type="file"
            ref={fileInputRef}
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
            id="backup-file-input"
          />

          {!previewData ? (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="backup-file-input"
                className="flex cursor-pointer items-center justify-center gap-2 border-2 border-dashed border-zinc-400 bg-[var(--theme-card-subtle)] p-4 text-center transition-colors hover:border-black hover:bg-zinc-100"
              >
                <span className="text-xl" aria-hidden="true">
                  📂
                </span>
                <div>
                  <p className="font-retro text-label font-bold tracking-normal text-black">
                    PILIH BERKAS CADANGAN (.JSON)
                  </p>
                  <p className="font-sans text-label tracking-normal leading-normal text-[var(--theme-text-muted)]">
                    Klik untuk memilih file cadangan JSON dari komputermu
                  </p>
                </div>
              </label>
              {selectedFile && !errorMessage && (
                <p className="font-mono text-label tracking-normal text-[var(--theme-text-muted)]">
                  Memproses: {selectedFile.name}...
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 border-t border-emerald-400 pt-2.5 text-emerald-950">
              <div className="flex items-center justify-between border-b border-emerald-300 pb-2">
                <span className="font-retro text-label font-bold tracking-normal text-emerald-900">
                  PRATINJAU BERKAS CADANGAN
                </span>
                <span className="font-mono text-label tracking-normal text-emerald-700">
                  {selectedFile?.name}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 font-sans text-meta">
                <div>
                  <span className="text-emerald-700 block text-label tracking-normal">Jumlah Transaksi:</span>
                  <strong className="font-mono text-body text-emerald-950">
                    {previewData.transactions.length} item
                  </strong>
                </div>
                <div>
                  <span className="text-emerald-700 block text-label tracking-normal">Batas Anggaran:</span>
                  <strong className="font-mono text-body text-emerald-950">
                    {previewData.budget ? formatRupiah(previewData.budget.monthlyLimit) : 'Sesuai Asal'}
                  </strong>
                </div>
                <div className="col-span-2 text-label tracking-normal text-emerald-800">
                  Tanggal Ekspor: {new Date(previewData.exportedAt).toLocaleString('id-ID')}
                </div>
              </div>

              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  onClick={handleExecuteRestore}
                  className="pixel-button cursor-pointer border-2 border-black bg-emerald-600 px-3 py-2 font-retro text-label font-bold tracking-normal text-white shadow-[2px_2px_0px_#000] hover:bg-emerald-700"
                >
                  📥 PULIHKAN DATA SEKARANG
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewData(null)
                    setSelectedFile(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="pixel-button cursor-pointer border border-black bg-white px-3 py-2 font-retro text-label font-bold tracking-normal text-black shadow-[1px_1px_0px_#000] hover:bg-zinc-100"
                >
                  BATAL
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bagian Opsi Reset ke Setelan Awal */}
        <div className="flex flex-col gap-2 border-t-2 border-[var(--theme-border-subtle)] pt-3">
          <h3 className="font-retro text-label font-bold tracking-normal text-zinc-600">
            OPSI DARURAT (RESET KE DATA AWAL)
          </h3>

          {!confirmReset ? (
            <div className="flex items-center justify-between gap-3">
              <p className="font-sans text-label tracking-normal text-[var(--theme-text-muted)] leading-normal">
                Kembalikan data ke setelan bawaan pabrik jika kamu ingin memulai kembali dari awal.
              </p>
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="pixel-button shrink-0 cursor-pointer border border-black bg-white px-3 py-1.5 font-retro text-label font-bold tracking-normal text-red-600 shadow-[1px_1px_0px_#000] hover:bg-red-50"
              >
                RESET PABRIK
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 border-t border-red-400 pt-2.5 text-red-900">
              <p className="font-sans text-meta font-bold leading-normal">
                ⚠️ PERINGATAN: Seluruh data transaksi di browser akan dihapus dan dikembalikan ke data
                awal bawaan. Tindakan ini tidak dapat dibatalkan kecuali kamu memiliki file cadangan.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleExecuteResetToDefault}
                  className="pixel-button cursor-pointer border border-black bg-red-600 px-3 py-1.5 font-retro text-label font-bold text-white shadow-[2px_2px_0px_#000] hover:bg-red-700"
                >
                  YA, RESET KE AWAL
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="pixel-button cursor-pointer border border-black bg-white px-3 py-1.5 font-retro text-label font-bold text-black shadow-[1px_1px_0px_#000] hover:bg-zinc-100"
                >
                  BATAL
                </button>
              </div>
            </div>
          )}
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
