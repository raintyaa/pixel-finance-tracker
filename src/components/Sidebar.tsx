import { type ComponentType, useEffect, useState } from 'react'
import type { ThemeId } from '../utils/storage'
import {
  PixelChartIcon,
  PixelCoinIcon,
  PixelDashboardIcon,
  PixelHistoryIcon,
  PixelPaletteIcon,
  PixelSaveIcon,
  PixelTargetIcon,
} from './PixelIcons'

export type ActiveTab = 'dashboard' | 'analytics' | 'history'

interface MenuItem {
  Icon: ComponentType<{ className?: string }>
  label: string
  tab?: ActiveTab
  badge?: string
}

const MAIN_MENU: MenuItem[] = [
  { Icon: PixelDashboardIcon, label: 'Dashboard', tab: 'dashboard' },
  { Icon: PixelChartIcon, label: 'Analisis', tab: 'analytics' },
  { Icon: PixelHistoryIcon, label: 'Riwayat Transaksi', tab: 'history' },
  { Icon: PixelTargetIcon, label: 'Batas Budget' },
]

const SYSTEM_MENU: MenuItem[] = [{ Icon: PixelSaveIcon, label: 'Backup Data' }]

const THEME_OPTIONS: ReadonlyArray<{
  id: ThemeId
  label: string
  paper: string
  accent: string
}> = [
  { id: 'neo-gold', label: 'Neo-Gold', paper: '#fafafa', accent: '#f59e0b' },
  { id: 'warm-paper', label: 'Warm Paper', paper: '#faf6ee', accent: '#d97706' },
  { id: 'cyber-arcade', label: 'Arcade', paper: '#fffef5', accent: '#eab308' },
]

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-[var(--theme-border)] bg-[var(--theme-gold)] text-black shadow-[2px_2px_0px_var(--theme-shadow)]">
        <PixelCoinIcon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="font-retro text-brand font-bold tracking-normal text-[var(--theme-text)]">
          PIXEL LEDGER
        </p>
        <span className="mt-1 inline-block border border-[var(--theme-border)] bg-[var(--theme-gold-badge)] px-1.5 py-0.5 font-retro text-label font-bold leading-none tracking-normal text-[var(--theme-gold-text)]">
          RETRO FINANCE
        </span>
      </div>
    </div>
  )
}

function NavItem({
  item,
  isActive,
  onNavigate,
}: {
  item: MenuItem
  isActive: boolean
  onNavigate?: () => void
}) {
  const { Icon } = item
  return (
    <button
      type="button"
      onClick={onNavigate}
      aria-current={isActive ? 'page' : undefined}
      className={`group flex w-full cursor-pointer items-center justify-between gap-2 border-2 px-3 py-2.5 text-left text-body font-sans font-medium transition-[transform,background-color,border-color,box-shadow] duration-150 hover:translate-x-0.5 ${
        isActive
          ? 'border-[var(--theme-border)] bg-[var(--theme-gold)] font-bold text-black shadow-[2px_2px_0px_var(--theme-shadow)]'
          : 'border-transparent text-[var(--theme-text)] hover:border-[var(--theme-border)] hover:bg-[var(--theme-gold-surface)] hover:shadow-[2px_2px_0px_var(--theme-shadow)]'
      }`}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{item.label}</span>
      </span>

      {item.badge ? (
        <span
          className={`shrink-0 border border-[var(--theme-border)] px-1 py-0.5 font-retro text-label leading-none tracking-normal ${
            isActive
              ? 'bg-[var(--theme-border)] text-[var(--theme-gold)]'
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
  activeTab,
  onSelectTab,
  onNavigate,
  onOpenBudget,
  onOpenBackup,
}: {
  label: string
  items: MenuItem[]
  activeTab: ActiveTab
  onSelectTab: (tab: ActiveTab) => void
  onNavigate?: () => void
  onOpenBudget?: () => void
  onOpenBackup?: () => void
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 px-1">
        <p className="font-retro text-label font-bold tracking-normal text-[var(--theme-text-muted)]">
          {label}
        </p>
        <span className="h-px flex-1 bg-[var(--theme-border-subtle)]" />
      </div>
      <div className="flex flex-col gap-1.5">
        {items.map((item) => (
          <NavItem
            key={item.label}
            item={item}
            isActive={item.tab !== undefined && item.tab === activeTab}
            onNavigate={() => {
              if (item.tab) {
                onSelectTab(item.tab)
              } else if (item.label === 'Batas Budget' && onOpenBudget) {
                onOpenBudget()
              } else if (item.label === 'Backup Data' && onOpenBackup) {
                onOpenBackup()
              }
              onNavigate?.()
            }}
          />
        ))}
      </div>
    </div>
  )
}

function ThemeCartridgeSwitcher({
  theme,
  onChangeTheme,
}: {
  theme: ThemeId
  onChangeTheme: (next: ThemeId) => void
}) {
  return (
    <div className="shrink-0 border-t-2 border-[var(--theme-border-subtle)] p-4">
      <p className="mb-2.5 flex items-center gap-1.5 font-retro text-label font-bold tracking-normal text-[var(--theme-text-muted)]">
        <PixelPaletteIcon className="h-3.5 w-3.5" />
        <span>TEMA KARTRID</span>
      </p>
      <div className="grid grid-cols-3 gap-1.5" role="group" aria-label="Pilih tema warna">
        {THEME_OPTIONS.map((opt) => {
          const isSelected = theme === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChangeTheme(opt.id)}
              title={`Tema ${opt.label}`}
              className={`flex cursor-pointer flex-col items-center gap-1.5 border-2 px-1.5 py-2 font-sans text-label leading-none tracking-normal transition-[transform,background-color,border-color,box-shadow] duration-100 ${
                isSelected
                  ? 'border-[var(--theme-border)] bg-[var(--theme-gold-surface)] font-bold text-[var(--theme-text)] shadow-[2px_2px_0px_var(--theme-shadow)]'
                  : 'border-[var(--theme-border-subtle)] bg-[var(--theme-card)] text-[var(--theme-text-muted)] hover:border-[var(--theme-border)] hover:text-[var(--theme-text)]'
              }`}
            >
              <span
                aria-hidden="true"
                className="flex h-3.5 w-6 overflow-hidden border border-[var(--theme-border)]"
              >
                <span className="h-full w-1/2" style={{ backgroundColor: opt.paper }} />
                <span className="h-full w-1/2" style={{ backgroundColor: opt.accent }} />
              </span>
              <span className="truncate">{opt.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SidebarNavigation({
  activeTab,
  onSelectTab,
  onNavigate,
  onOpenBudget,
  onOpenBackup,
}: {
  activeTab: ActiveTab
  onSelectTab: (tab: ActiveTab) => void
  onNavigate?: () => void
  onOpenBudget?: () => void
  onOpenBackup?: () => void
}) {
  return (
    <nav aria-label="Navigasi utama" className="flex-1 overflow-y-auto p-4">
      <NavGroup
        label="MENU UTAMA"
        items={MAIN_MENU}
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        onNavigate={onNavigate}
        onOpenBudget={onOpenBudget}
      />
      <div className="mt-6">
        <NavGroup
          label="SISTEM"
          items={SYSTEM_MENU}
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          onNavigate={onNavigate}
          onOpenBackup={onOpenBackup}
        />
      </div>
    </nav>
  )
}

export default function Sidebar({
  activeTab,
  onSelectTab,
  onOpenBudget,
  onOpenBackup,
  theme,
  onChangeTheme,
}: {
  activeTab: ActiveTab
  onSelectTab: (tab: ActiveTab) => void
  onOpenBudget?: () => void
  onOpenBackup?: () => void
  theme: ThemeId
  onChangeTheme: (next: ThemeId) => void
}) {
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
      <div className="sticky top-0 z-40 flex items-center justify-between border-b-2 border-[var(--theme-border)] bg-[var(--theme-card)] px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-[var(--theme-border)] bg-[var(--theme-gold)] text-black shadow-[2px_2px_0px_var(--theme-shadow)]">
            <PixelCoinIcon className="h-4 w-4" />
          </div>
          <div>
            <p className="font-retro text-brand font-bold tracking-normal text-[var(--theme-text)]">
              PIXEL LEDGER
            </p>
            <p className="font-retro text-label font-bold tracking-normal text-[var(--theme-gold-text)]">
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
          className="pixel-button flex h-9 w-9 cursor-pointer items-center justify-center bg-[var(--theme-card)] text-lg leading-none text-[var(--theme-text)] hover:bg-[var(--theme-card-gold)]"
        >
          <span aria-hidden="true">☰</span>
        </button>
      </div>

      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r-2 border-[var(--theme-border)] bg-[var(--theme-card)] lg:flex">
        <div className="shrink-0 border-b-2 border-[var(--theme-border)] p-4">
          <BrandMark />
        </div>
        <SidebarNavigation
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          onOpenBudget={onOpenBudget}
          onOpenBackup={onOpenBackup}
        />
        <ThemeCartridgeSwitcher theme={theme} onChangeTheme={onChangeTheme} />
      </aside>

      {/* Drawer mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="motion-backdrop absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            onClick={closeMobile}
            aria-hidden="true"
          />
          <div
            id="mobile-sidebar"
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi utama"
            className="motion-drawer absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r-2 border-[var(--theme-border)] bg-[var(--theme-card)] shadow-[6px_0_0_var(--theme-shadow)]"
          >
            <div className="flex shrink-0 items-center justify-between border-b-2 border-[var(--theme-border)] p-4">
              <BrandMark />
              <button
                type="button"
                onClick={closeMobile}
                aria-label="Tutup menu navigasi"
                className="pixel-button ml-2 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center bg-[var(--theme-card-subtle)] text-sm text-[var(--theme-text)] hover:bg-[var(--theme-card-gold)]"
              >
                <span aria-hidden="true">✕</span>
              </button>
            </div>
            <SidebarNavigation
              activeTab={activeTab}
              onSelectTab={onSelectTab}
              onNavigate={closeMobile}
              onOpenBudget={onOpenBudget}
              onOpenBackup={onOpenBackup}
            />
            <ThemeCartridgeSwitcher theme={theme} onChangeTheme={onChangeTheme} />
          </div>
        </div>
      )}
    </>
  )
}
