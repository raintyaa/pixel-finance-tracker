import { describe, expect, it } from 'vitest'
import { formatNumber, formatRupiah, parseRupiah } from '../utils/currency'

describe('currency utilities', () => {
  describe('formatRupiah', () => {
    it('formats zero correctly with standard currency symbol and non-breaking space', () => {
      // Intl.NumberFormat('id-ID') menyisipkan non-breaking space (\u00A0)
      expect(formatRupiah(0).replace(/\u00A0/g, ' ')).toBe('Rp 0')
    })

    it('formats positive integers with thousand separators', () => {
      expect(formatRupiah(15000).replace(/\u00A0/g, ' ')).toBe('Rp 15.000')
      expect(formatRupiah(1500000).replace(/\u00A0/g, ' ')).toBe('Rp 1.500.000')
      expect(formatRupiah(2667855).replace(/\u00A0/g, ' ')).toBe('Rp 2.667.855')
    })

    it('handles small nominal amounts below 1000', () => {
      expect(formatRupiah(500).replace(/\u00A0/g, ' ')).toBe('Rp 500')
    })

    it('rounds decimals to whole numbers', () => {
      expect(formatRupiah(12500.65).replace(/\u00A0/g, ' ')).toBe('Rp 12.501')
      expect(formatRupiah(12500.2).replace(/\u00A0/g, ' ')).toBe('Rp 12.500')
    })

    it('handles negative amounts cleanly', () => {
      expect(formatRupiah(-50000).replace(/\u00A0/g, ' ')).toBe('-Rp 50.000')
    })
  })

  describe('formatNumber', () => {
    it('formats numbers with thousand separators without currency symbol', () => {
      expect(formatNumber(15000)).toBe('15.000')
      expect(formatNumber(2500000)).toBe('2.500.000')
      expect(formatNumber(0)).toBe('0')
    })
  })

  describe('parseRupiah', () => {
    it('parses formatted rupiah strings back to clean numbers', () => {
      expect(parseRupiah('Rp 50.000')).toBe(50000)
      expect(parseRupiah('Rp 1.500.000')).toBe(1500000)
      expect(parseRupiah('250,000')).toBe(250000)
      expect(parseRupiah('')).toBe(0)
      expect(parseRupiah('abc')).toBe(0)
    })
  })
})
