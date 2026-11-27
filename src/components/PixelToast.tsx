import { PixelCheckIcon, PixelCloseIcon, PixelTrashIcon } from './PixelIcons'

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
      className="motion-toast-in pixel-toast-frame fixed bottom-5 right-5 z-40 flex max-w-sm items-center gap-3 bg-[var(--theme-card)] px-4 py-3 text-[var(--theme-text)]"
    >
      <span
        className={`pixel-badge flex h-6 w-6 shrink-0 items-center justify-center ${
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
          className="pixel-button shrink-0 cursor-pointer bg-[var(--theme-gold)] px-2.5 py-1 font-retro text-label font-bold tracking-normal text-black hover:bg-[var(--theme-gold-hover)]"
        >
          {toast.actionLabel}
        </button>
      )}

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Tutup notifikasi"
        title="Tutup notifikasi"
        className="shrink-0 cursor-pointer p-1 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
      >
        <PixelCloseIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
