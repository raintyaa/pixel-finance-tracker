import { useEffect, useState } from 'react'

interface MenuItem {
  icon: string
  label: string
  active?: boolean
  badge?: string
}

const MAIN_MENU: MenuItem[] = [
  { icon: '📊', label: 'Dashboard', active: true },
  { icon: '📈', label: 'Analisis' },
  { icon: '💳', label: 'Riwayat Transaksi' },
  { icon: '🎯', label: 'Batas Budget', badge: 'Segera' },
]

const SYSTEM_MENU: MenuItem[] = [
  { icon: '⚙️', label: 'Pengaturan' },
  { icon: '💾', label: 'Backup Data', badge: 'Hari 12' },
]

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-black bg-[var(--theme-gold)] text-xl shadow-[2px_2px_0px_#000]">
        <span aria-hidden="true">🪙</span>
      </div>
      <div className="min-w-0">
        <p className="font-['Silkscreen'] text-sm font-bold tracking-wide text-black">
          PIXEL LEDGER
        </p>
        <span className="mt-1 inline-block border border-black bg-[var(--theme-gold-badge)] px-1.5 py-0.5 font-['Silkscreen'] text-[8px] font-bold tracking-[0.14em] text-[var(--theme-gold-text)]">
          RETRO FINANCE
        </span>
      </div>
    </div>
  )
}

function NavItem({
  item,
  onNavigate,
}: {
  item: MenuItem
  onNavigate?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onNavigate}
      aria-current={item.active ? 'page' : undefined}
      className={`group flex w-full items-center justify-between gap-2 border-2 px-3 py-2.5 text-left text-sm transition-all ${
        item.active
          ? 'border-black bg-[var(--theme-gold)] font-bold text-black shadow-[2px_2px_0px_#000]'
          : 'border-transparent text-[#3f3f46] hover:border-black hover:bg-[#fffbeb] hover:shadow-[2px_2px_0px_#000]'
      }`}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span className="text-base leading-none" aria-hidden="true">
          {item.icon}
        </span>
        <span className="truncate">{item.label}</span>
      </span>

      {item.badge ? (
        <span
          className={`shrink-0 border border-black px-1.5 py-0.5 font-['Silkscreen'] text-[9px] leading-none ${
            item.active
              ? 'bg-black text-[var(--theme-gold)]'
              : 'bg-[var(--theme-card-subtle)] text-[var(--theme-text-muted)]'
          }`}
        >
          {item.badge}
        </span>
      ) : null}
    </button>
  )
}

function NavGroup({
  label,
  items,
  onNavigate,
}: {
  label: string
  items: MenuItem[]
  onNavigate?: () => void
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 px-1">
        <p className="font-['Silkscreen'] text-[9px] font-bold tracking-[0.2em] text-[#a1a1aa]">
          {label}
        </p>
        <span className="h-px flex-1 bg-[#e4e4e7]" />
      </div>
      <div className="flex flex-col gap-1.5">
        {items.map((item) => (
          <NavItem key={item.label} item={item} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  )
}

function SidebarFooter() {
  return (
    <div className="shrink-0 border-t-2 border-black p-4">
      <div className="pixel-box-sm bg-[#fffbeb] p-3.5">
        <div className="flex items-center gap-2">
          <span className="text-base" aria-hidden="true">
            💾
          </span>
          <p className="font-['Silkscreen'] text-[10px] font-bold tracking-wider text-[var(--theme-gold-text)]">
            OFFLINE-FIRST
          </p>
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-[#52525b]">
          Tersimpan otomatis di browser ini.{' '}
          <span className="whitespace-nowrap font-bold text-black">Zero data loss.</span>
        </p>
        <div className="mt-2 flex items-center gap-1.5 border-t border-[#e4e4e7] pt-2 font-mono text-[10px] text-[var(--theme-text-muted)]">
          <span className="h-2 w-2 border border-black bg-[var(--theme-income)]" />
          LocalStorage aktif
        </div>
      </div>
    </div>
  )
}

function SidebarNavigation({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <nav
        aria-label="Navigasi utama"
        className="flex-1 overflow-y-auto p-4"
      >
        <NavGroup label="MENU UTAMA" items={MAIN_MENU} onNavigate={onNavigate} />
        <div className="mt-6">
          <NavGroup label="SISTEM" items={SYSTEM_MENU} onNavigate={onNavigate} />
        </div>
      </nav>
      <SidebarFooter />
    </>
  )
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!mobileOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileOpen])

  const closeMobile = () => setMobileOpen(false)

  return (
    <>
      {/* Header ringkas untuk mobile */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b-2 border-black bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-black bg-[var(--theme-gold)] text-base shadow-[2px_2px_0px_#000]">
            <span aria-hidden="true">🪙</span>
          </div>
          <div>
            <p className="font-['Silkscreen'] text-xs font-bold tracking-wide text-black">
              PIXEL LEDGER
            </p>
            <p className="font-mono text-[9px] text-[var(--theme-text-muted)]">
              RETRO FINANCE
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Buka menu navigasi"
          aria-expanded={mobileOpen}
          aria-controls="mobile-sidebar"
          className="pixel-button flex h-9 w-9 items-center justify-center bg-[var(--theme-card)] text-lg leading-none text-black hover:bg-[var(--theme-card-gold)] cursor-pointer"
        >
          <span aria-hidden="true">☰</span>
        </button>
      </div>

      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r-2 border-black bg-white lg:flex">
        <div className="shrink-0 border-b-2 border-black p-4">
          <BrandMark />
        </div>
        <SidebarNavigation />
      </aside>

      {/* Drawer mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            onClick={closeMobile}
            aria-hidden="true"
          />
          <div
            id="mobile-sidebar"
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi utama"
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r-2 border-black bg-white shadow-[6px_0_0_#000]"
          >
            <div className="flex shrink-0 items-center justify-between border-b-2 border-black p-4">
              <BrandMark />
              <button
                type="button"
                onClick={closeMobile}
                aria-label="Tutup menu navigasi"
                className="pixel-button ml-2 flex h-8 w-8 shrink-0 items-center justify-center bg-[var(--theme-card-subtle)] text-sm text-black hover:bg-[var(--theme-card-gold)] cursor-pointer"
              >
                <span aria-hidden="true">✕</span>
              </button>
            </div>
            <SidebarNavigation onNavigate={closeMobile} />
          </div>
        </div>
      )}
    </>
  )
}
