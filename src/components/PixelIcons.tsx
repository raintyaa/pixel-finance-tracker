interface PixelIconProps {
  className?: string
}

export function PixelCoinIcon({ className = 'h-4 w-4 shrink-0' }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" shapeRendering="crispEdges" aria-hidden="true" className={className}>
      <rect x="5" y="1" width="6" height="1" fill="currentColor" />
      <rect x="3" y="2" width="2" height="1" fill="currentColor" />
      <rect x="11" y="2" width="2" height="1" fill="currentColor" />
      <rect x="2" y="3" width="1" height="2" fill="currentColor" />
      <rect x="13" y="3" width="1" height="2" fill="currentColor" />
      <rect x="1" y="5" width="1" height="6" fill="currentColor" />
      <rect x="14" y="5" width="1" height="6" fill="currentColor" />
      <rect x="2" y="11" width="1" height="2" fill="currentColor" />
      <rect x="13" y="11" width="1" height="2" fill="currentColor" />
      <rect x="3" y="13" width="2" height="1" fill="currentColor" />
      <rect x="11" y="13" width="2" height="1" fill="currentColor" />
      <rect x="5" y="14" width="6" height="1" fill="currentColor" />
      {/* Inner glint */}
      <rect x="5" y="3" width="4" height="1" fill="currentColor" opacity="0.35" />
      <rect x="3" y="5" width="1" height="4" fill="currentColor" opacity="0.35" />
      {/* Center vertical slot */}
      <rect x="7" y="4" width="2" height="8" fill="currentColor" />
    </svg>
  )
}

export function PixelDashboardIcon({ className = 'h-4 w-4 shrink-0' }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true" className={className}>
      <path d="M2 2h5v5H2V2zm1 1v3h3V3H3zM9 2h5v5H9V2zm1 1v3h3V3h-3zM2 9h5v5H2V9zm1 1v3h3v-3H3zM9 9h5v5H9V9zm1 1v3h3v-3h-3z" />
      <rect x="4" y="4" width="1" height="1" opacity="0.5" />
      <rect x="11" y="11" width="1" height="1" opacity="0.5" />
    </svg>
  )
}

export function PixelChartIcon({ className = 'h-4 w-4 shrink-0' }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true" className={className}>
      <rect x="2" y="13" width="12" height="1" />
      <rect x="2" y="2" width="1" height="11" />
      <rect x="4" y="9" width="2" height="3" />
      <rect x="7" y="6" width="2" height="6" />
      <rect x="10" y="3" width="2" height="9" />
    </svg>
  )
}

export function PixelHistoryIcon({ className = 'h-4 w-4 shrink-0' }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true" className={className}>
      <path d="M2 3h12v10H2V3zm1 1v8h10V4H3z" />
      <rect x="5" y="6" width="6" height="1" />
      <rect x="5" y="9" width="4" height="1" />
    </svg>
  )
}

export function PixelTargetIcon({ className = 'h-4 w-4 shrink-0' }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true" className={className}>
      <path d="M5 1h6v1H5V1zM3 2h2v1H3V2zm8 0h2v1h-2V2zM2 3h1v2H2V3zm11 0h1v2h-1V3zM1 5h1v6H1V5zm13 0h1v6h-1V5zM2 11h1v2H2v-2zm11 0h1v2h-1v-2zM3 13h2v1H3v-1zm8 0h2v1h-2v-1zM5 14h6v1H5v-1z" />
      <path d="M6 4h4v1H6V4zM4 6h1v4H4V6zm7 0h1v4h-1V6zm-5 5h4v1H6v-1z" opacity="0.7" />
      <rect x="7" y="7" width="2" height="2" />
    </svg>
  )
}

export function PixelSaveIcon({ className = 'h-4 w-4 shrink-0' }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true" className={className}>
      <path d="M2 2h10l2 2v10H2V2zm1 1v10h10V4.5L11.5 3H3z" />
      <rect x="5" y="3" width="5" height="3" opacity="0.45" />
      <rect x="5" y="9" width="6" height="4" opacity="0.35" />
      <rect x="8" y="3" width="1" height="2" />
    </svg>
  )
}

export function PixelHeartIcon({
  className = 'h-4 w-4 shrink-0',
  filled = true,
}: PixelIconProps & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" shapeRendering="crispEdges" aria-hidden="true" className={className}>
      {/* Pixel heart outline */}
      <path
        d="M3 2h3v1h1v1h2V3h1V2h3v1h1v1h1v4h-1v2h-2v2h-2v2H9v1H7v-1H5v-2H3v-2H2V8H1V4h1V3h1V2z"
        fill="currentColor"
        opacity={filled ? 1 : 0.25}
      />
      {filled && (
        <>
          <rect x="3" y="4" width="2" height="1" fill="#ffffff" opacity="0.6" />
          <rect x="3" y="5" width="1" height="1" fill="#ffffff" opacity="0.6" />
        </>
      )}
    </svg>
  )
}

export function PixelSkullIcon({ className = 'h-4 w-4 shrink-0' }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" shapeRendering="crispEdges" aria-hidden="true" className={className}>
      <path
        d="M5 2h6v1h2v2h1v4h-1v2h-1v3H4v-3H3V9H2V5h1V3h2V2z"
        fill="currentColor"
      />
      <rect x="4" y="6" width="3" height="2" fill="#ffffff" />
      <rect x="9" y="6" width="3" height="2" fill="#ffffff" />
      <rect x="7" y="9" width="2" height="1" fill="#ffffff" />
      <rect x="5" y="12" width="1" height="2" fill="#ffffff" />
      <rect x="8" y="12" width="1" height="2" fill="#ffffff" />
      <rect x="10" y="12" width="1" height="2" fill="#ffffff" />
    </svg>
  )
}

export function PixelWarnIcon({ className = 'h-4 w-4 shrink-0' }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" shapeRendering="crispEdges" aria-hidden="true" className={className}>
      <path
        d="M7 2h2v2h1v2h1v2h1v2h1v2h1v2H2v-2h1v-2h1V8h1V6h1V4h1V2z"
        fill="currentColor"
      />
      <rect x="7" y="6" width="2" height="4" fill="#ffffff" />
      <rect x="7" y="11" width="2" height="2" fill="#ffffff" />
    </svg>
  )
}

export function PixelScaleIcon({ className = 'h-4 w-4 shrink-0' }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true" className={className}>
      <rect x="7" y="2" width="2" height="11" />
      <rect x="3" y="4" width="10" height="1" />
      <rect x="4" y="13" width="8" height="2" />
      <rect x="2" y="5" width="1" height="3" />
      <rect x="4" y="5" width="1" height="3" />
      <rect x="2" y="8" width="3" height="2" />
      <rect x="11" y="5" width="1" height="3" />
      <rect x="13" y="5" width="1" height="3" />
      <rect x="11" y="8" width="3" height="2" />
    </svg>
  )
}

export function PixelResetIcon({ className = 'h-4 w-4 shrink-0' }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true" className={className}>
      <path d="M5 3h6v1h2v2h-2V5H5v2H3V4h2V3zm-2 7h2v1h6V9h2v3h-2v1H5v-1H3v-2z" />
      <path d="M11 2h2v4h-4V4h2V2zM3 10h4v2H5v2H3v-4z" />
    </svg>
  )
}

export function PixelEditIcon({ className = 'h-4 w-4 shrink-0' }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true" className={className}>
      <path d="M11 2h2v1h1v2h-1v1h-1v1h-1V6h-1V5h-1V4h1V3h1V2zM8 6h2v1h1v2h-1v1H9v1H8v1H7v1H6v1H2v-4h1V9h1V8h1V7h1V6h2z" />
    </svg>
  )
}

export function PixelTrashIcon({ className = 'h-4 w-4 shrink-0' }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true" className={className}>
      <rect x="5" y="2" width="6" height="1" />
      <rect x="2" y="4" width="12" height="1" />
      <path d="M3 5h10v9H3V5zm2 2v5h1V7H5zm2.5 0v5h1V7h-1zM10 7v5h1V7h-1z" />
    </svg>
  )
}

export function PixelPlusIcon({ className = 'h-4 w-4 shrink-0' }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true" className={className}>
      <rect x="7" y="3" width="2" height="10" />
      <rect x="3" y="7" width="10" height="2" />
    </svg>
  )
}

export function PixelCalendarIcon({ className = 'h-4 w-4 shrink-0' }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true" className={className}>
      <rect x="4" y="2" width="2" height="2" />
      <rect x="10" y="2" width="2" height="2" />
      <path d="M2 4h12v10H2V4zm1 3v6h10V7H3z" />
      <rect x="5" y="9" width="2" height="2" />
      <rect x="9" y="9" width="2" height="2" />
    </svg>
  )
}

export function PixelGlobeIcon({ className = 'h-4 w-4 shrink-0' }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true" className={className}>
      <path d="M5 2h6v1h2v2h1v6h-1v2h-2v1H5v-1H3v-2H2V5h1V3h2V2zm0 2v2h2V4H5zm4 0v2h2V4H9zM4 7v2h3V7H4zm5 0v2h3V7H9zm-4 3v2h2v-2H5zm4 0v2h2v-2H9z" />
    </svg>
  )
}

export function PixelBoltIcon({ className = 'h-4 w-4 shrink-0' }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true" className={className}>
      <path d="M8 1h3L9 6h4l-6 9V9H3l5-8z" />
    </svg>
  )
}

export function PixelFlameIcon({ className = 'h-4 w-4 shrink-0' }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true" className={className}>
      <path d="M7 1h2v2h1v2h2v2h1v4h-1v2h-2v1H6v-1H4v-2H3V7h1V5h2V3h1V1zm0 7v4h2V8H7z" />
    </svg>
  )
}

export function PixelArrowIcon({
  direction,
  className = 'h-4 w-4 shrink-0',
}: PixelIconProps & { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true" className={className}>
      {direction === 'left' ? (
        <path d="M9 3h2v10H9v-2H7V9H5V7h2V5h2V3z" />
      ) : (
        <path d="M5 3h2v2h2v2h2v2H9v2H7v2H5V3z" />
      )}
    </svg>
  )
}

export function PixelCheckIcon({ className = 'h-4 w-4 shrink-0' }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true" className={className}>
      <path d="M12 4h2v2h-2V4zm-2 2h2v2h-2V6zM8 8h2v2H8V8zm-2 2h2v2H6v-2zM4 8h2v2H4V8zM2 6h2v2H2V6z" />
    </svg>
  )
}

export function PixelPaletteIcon({ className = 'h-4 w-4 shrink-0' }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true" className={className}>
      <path d="M5 2h6v1h2v2h1v4h-2v2h-2v2H5v-1H3v-2H2V5h1V3h2V2zm0 3v2h2V5H5zm4 0v2h2V5H9zM5 9v2h2V9H5z" />
    </svg>
  )
}
