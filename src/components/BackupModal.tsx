import { useRef, useState } from 'react'
import type { BackupData, BudgetConfig, Transaction } from '../types/finance'
import { exportToCsv, exportToJson, validateAndParseBackupJson } from '../utils/backup'
import { formatRupiah } from '../utils/currency'
import { useExitAnimation } from '../utils/motion'
import {
  PixelChartIcon,
  PixelCheckIcon,
  PixelCloseIcon,
  PixelDownloadIcon,
  PixelFolderIcon,
  PixelSaveIcon,
  PixelWarnIcon,
} from './PixelIcons'

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
        } pixel-modal-frame flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden bg-[var(--theme-card)]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
          {/* Header Modal */}
          <div className="flex items-center justify-between border-b-2 border-[var(--theme-border-subtle)] pb-3">
            <div className="flex items-center gap-2.5">
              <PixelSaveIcon className="h-5 w-5 text-[var(--theme-gold-text)]" />
              <div>
                <h2
                  id="backup-modal-title"
                  className="font-retro text-data font-bold tracking-normal text-[var(--theme-gold-text)]"
                >
                  PENCADANGAN &amp; PEMULIHAN
                </h2>
                <p className="font-sans text-label leading-normal tracking-normal text-[var(--theme-text-muted)]">
                  Ekspor arsip JSON/CSV &amp; pulihkan data lokal
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

          {/* Notifikasi Banner Sukses / Galat */}
          {successMessage && (
            <div className="flex items-center gap-2 border-b-2 border-[var(--theme-income)] pb-2.5 text-[var(--theme-income)]">
              <PixelCheckIcon className="h-4 w-4 shrink-0" />
              <p className="font-sans text-meta font-medium leading-normal">{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2 border-b-2 border-[var(--theme-expense)] pb-2.5 text-[var(--theme-expense-text)]">
              <PixelWarnIcon className="h-4 w-4 shrink-0" />
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
              <span className="block font-sans text-label tracking-normal text-[var(--theme-text-muted)]">
                Batas Anggaran:
              </span>
              <span className="font-mono text-meta font-bold tabular-nums text-[var(--theme-gold-text)]">
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
                  <div className="flex items-center gap-1.5 font-retro text-label font-bold tracking-normal text-[var(--theme-text)]">
                    <PixelSaveIcon className="h-4 w-4 text-[var(--theme-gold-text)]" />
                    <span>FORMAT JSON</span>
                  </div>
                  <p className="mt-1 font-sans text-label leading-normal tracking-normal text-[var(--theme-text-muted)]">
                    Cadangan penuh (transaksi + batas budget) untuk diimpor kembali kapan saja.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="pixel-button flex cursor-pointer items-center justify-center gap-1.5 bg-[var(--theme-gold)] px-3 py-2 font-retro text-label font-bold tracking-normal text-black hover:bg-[var(--theme-gold-hover)]"
                >
                  <PixelDownloadIcon className="h-3.5 w-3.5" />
                  <span>UNDUH (.JSON)</span>
                </button>
              </div>

              {/* Opsi CSV */}
              <div className="flex flex-col justify-between gap-2.5">
                <div>
                  <div className="flex items-center gap-1.5 font-retro text-label font-bold tracking-normal text-[var(--theme-text)]">
                    <PixelChartIcon className="h-4 w-4 text-[var(--theme-income)]" />
                    <span>FORMAT CSV (EXCEL)</span>
                  </div>
                  <p className="mt-1 font-sans text-label leading-normal tracking-normal text-[var(--theme-text-muted)]">
                    Tabel data dengan kolom rapi. Cocok dibuka di Microsoft Excel atau Google Sheets.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="pixel-button flex cursor-pointer items-center justify-center gap-1.5 bg-[var(--theme-card)] px-3 py-2 font-retro text-label font-bold tracking-normal text-[var(--theme-text)] hover:bg-[var(--theme-card-subtle)]"
                >
                  <PixelDownloadIcon className="h-3.5 w-3.5" />
                  <span>UNDUH (.CSV)</span>
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
                  className="flex cursor-pointer items-center justify-center gap-3 border-2 border-dashed border-[var(--theme-border-subtle)] p-4 text-center transition-colors hover:border-[var(--theme-border)] hover:bg-[var(--theme-card-subtle)]"
                >
                  <PixelFolderIcon className="h-5 w-5 shrink-0 text-[var(--theme-gold-text)]" />
                  <div>
                    <p className="font-retro text-label font-bold tracking-normal text-[var(--theme-text)]">
                      PILIH BERKAS CADANGAN (.JSON)
                    </p>
                    <p className="font-sans text-label leading-normal tracking-normal text-[var(--theme-text-muted)]">
                      Klik untuk memilih file cadangan JSON dari komputermu
                    </p>
                  </div>
                </label>
                {selectedFile && !errorMessage && (
                  <p className="font-mono text-label leading-normal tracking-normal text-[var(--theme-text-muted)]">
                    Memproses: {selectedFile.name}...
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 border-t border-[var(--theme-income)] pt-2.5 text-[var(--theme-text)]">
                <div className="flex items-center justify-between border-b border-[var(--theme-border-subtle)] pb-2">
                  <span className="font-retro text-label font-bold tracking-normal text-[var(--theme-income)]">
                    PRATINJAU BERKAS CADANGAN
                  </span>
                  <span className="font-mono text-label tracking-normal text-[var(--theme-text-muted)]">
                    {selectedFile?.name}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 font-sans text-meta">
                  <div>
                    <span className="block text-label tracking-normal text-[var(--theme-text-muted)]">
                      Jumlah Transaksi:
                    </span>
                    <strong className="font-mono text-body tabular-nums text-[var(--theme-text)]">
                      {previewData.transactions.length} item
                    </strong>
                  </div>
                  <div>
                    <span className="block text-label tracking-normal text-[var(--theme-text-muted)]">
                      Batas Anggaran:
                    </span>
                    <strong className="font-mono text-body tabular-nums text-[var(--theme-text)]">
                      {previewData.budget ? formatRupiah(previewData.budget.monthlyLimit) : 'Sesuai Asal'}
                    </strong>
                  </div>
                  <div className="col-span-2 text-label tracking-normal text-[var(--theme-text-muted)]">
                    Tanggal Ekspor: {new Date(previewData.exportedAt).toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="mt-1 flex gap-3">
                  <button
                    type="button"
                    onClick={handleExecuteRestore}
                    className="pixel-button flex cursor-pointer items-center gap-1.5 bg-[var(--theme-income)] px-3 py-2 font-retro text-label font-bold tracking-normal text-white hover:opacity-90"
                  >
                    <PixelDownloadIcon className="h-3.5 w-3.5" />
                    <span>PULIHKAN DATA SEKARANG</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewData(null)
                      setSelectedFile(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="pixel-button cursor-pointer bg-[var(--theme-card-subtle)] px-3 py-2 font-retro text-label font-bold tracking-normal text-[var(--theme-text)] hover:bg-[var(--theme-card)]"
                  >
                    BATAL
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bagian Opsi Reset ke Setelan Awal */}
          <div className="flex flex-col gap-2 border-t-2 border-[var(--theme-border-subtle)] pt-3">
            <h3 className="font-retro text-label font-bold tracking-normal text-[var(--theme-text-muted)]">
              OPSI DARURAT (RESET KE DATA AWAL)
            </h3>

            {!confirmReset ? (
              <div className="flex items-center justify-between gap-3">
                <p className="font-sans text-label leading-normal tracking-normal text-[var(--theme-text-muted)]">
                  Kembalikan data ke setelan bawaan pabrik jika kamu ingin memulai kembali dari awal.
                </p>
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="pixel-button shrink-0 cursor-pointer bg-[var(--theme-card)] px-3 py-1.5 font-retro text-label font-bold tracking-normal text-[var(--theme-expense-text)] hover:bg-[var(--theme-expense-badge)]"
                >
                  RESET PABRIK
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 border-t border-[var(--theme-expense)] pt-2.5 text-[var(--theme-expense-text)]">
                <p className="flex items-start gap-2 font-sans text-meta font-bold leading-normal">
                  <PixelWarnIcon className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    PERINGATAN: Seluruh data transaksi di browser akan dihapus dan dikembalikan ke
                    data awal bawaan. Tindakan ini tidak dapat dibatalkan kecuali kamu memiliki file
                    cadangan.
                  </span>
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleExecuteResetToDefault}
                    className="pixel-button cursor-pointer bg-[var(--theme-expense)] px-3 py-1.5 font-retro text-label font-bold text-white hover:opacity-90"
                  >
                    YA, RESET KE AWAL
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="pixel-button cursor-pointer bg-[var(--theme-card-subtle)] px-3 py-1.5 font-retro text-label font-bold text-[var(--theme-text)] hover:bg-[var(--theme-card)]"
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
