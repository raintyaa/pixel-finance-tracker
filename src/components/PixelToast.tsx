import { PixelCheckIcon, PixelTrashIcon } from './PixelIcons'

export interface ToastItem {
  id: number
  message: string
  variant: 'success' | 'delete'
  actionLabel?: string
  onAction?: () => void
}

interface PixelToastProps {
  toast: ToastItem
  onDismiss: () => void
}

export default function PixelToast({ toast, onDismiss }: PixelToastProps) {
  const isDelete = toast.variant === 'delete'

  return (
    <div
      role="status"
      aria-live="polite"
      className="motion-toast-in pixel-box fixed bottom-4 right-4 z-40 flex max-w-sm items-center gap-3 bg-[var(--theme-card)] px-3.5 py-2.5 text-[var(--theme-text)]"
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center border border-[var(--theme-border)] ${
          isDelete
            ? 'bg-[var(--theme-expense-badge)] text-[var(--theme-expense-text)]'
            : 'bg-[var(--theme-income-badge)] text-[var(--theme-income)]'
        }`}
        aria-hidden="true"
      >
        {isDelete ? (
          <PixelTrashIcon className="h-3.5 w-3.5" />
        ) : (
          <PixelCheckIcon className="h-3.5 w-3.5" />
        )}
      </span>

      <p className="min-w-0 flex-1 font-sans text-meta font-bold leading-normal text-[var(--theme-text)]">
        {toast.message}
      </p>

      {toast.actionLabel && toast.onAction && (
        <button
          type="button"
          onClick={toast.onAction}
          className="pixel-button shrink-0 cursor-pointer bg-[var(--theme-gold)] px-2 py-1 font-retro text-label font-bold tracking-normal text-black hover:bg-[var(--theme-gold-hover)]"
        >
          {toast.actionLabel}
        </button>
      )}

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Tutup notifikasi"
        title="Tutup notifikasi"
        className="shrink-0 cursor-pointer px-1 py-0.5 font-retro text-label text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
      >
        ✕
      </button>
    </div>
  )
}
