import { useEffect, useRef, useState } from 'react'

/**
 * Utilitas gerak untuk "arcade ledger".
 * Tanpa library tambahan: requestAnimationFrame + CSS keyframes di index.css.
 */

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * Angka berjalan seperti papan skor: dari nilai lama menuju nilai baru.
 * Nilai awal tampil langsung (tanpa koreografi saat muat halaman).
 */
export function useCountUp(target: number, duration = 560): number {
  const [display, setDisplay] = useState(target)
  const currentRef = useRef(target)
  const frameRef = useRef(0)

  useEffect(() => {
    const from = currentRef.current
    if (from === target) return

    cancelAnimationFrame(frameRef.current)
    const start = performance.now()
    const delta = target - from
    // Reduce Motion: lompat langsung ke nilai akhir pada frame pertama
    const total = prefersReducedMotion() ? 1 : duration

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / total)
      const eased = 1 - Math.pow(1 - progress, 3)
      const next = Math.round(from + delta * eased)
      currentRef.current = next
      setDisplay(next)
      if (progress < 1) frameRef.current = requestAnimationFrame(step)
    }

    frameRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameRef.current)
  }, [target, duration])

  return display
}

/**
 * Kunci yang naik setiap kali nilai berubah — dipakai sebagai `key`
 * agar animasi satu-kali (koin jatuh, angka pop) bisa diputar ulang.
 * Nilai nol berarti belum pernah berubah (tanpa animasi saat muat).
 */
export function useChangeKey(value: number | string): number {
  const previousRef = useRef(value)
  const [key, setKey] = useState(0)

  useEffect(() => {
    if (previousRef.current === value) return
    previousRef.current = value
    setKey((current) => current + 1)
  }, [value])

  return key
}

/**
 * Menutup dialog dengan animasi "CRT mati": tandai `closing`,
 * jalankan animasi keluar, baru panggil onClose setelah durasinya.
 */
export function useExitAnimation(onClose: () => void, duration = 160) {
  const [closing, setClosing] = useState(false)
  const timeoutRef = useRef(0)

  const requestClose = () => {
    if (closing) return
    setClosing(true)
    timeoutRef.current = window.setTimeout(
      () => {
        setClosing(false)
        onClose()
      },
      prefersReducedMotion() ? 0 : duration
    )
  }

  useEffect(() => () => window.clearTimeout(timeoutRef.current), [])

  return { closing, requestClose }
}
