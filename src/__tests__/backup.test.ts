import { describe, expect, it } from 'vitest'
import type { BackupData } from '../types/finance'
import { validateAndParseBackupJson } from '../utils/backup'

describe('backup & restore parser validation', () => {
  const validBackup: BackupData = {
    version: '1.0',
    exportedAt: '2026-11-21T10:00:00.000Z',
    appName: 'Pixel Ledger',
    transactions: [
      {
        id: 'tx-1',
        type: 'income',
        amount: 1500000,
        description: 'Uang Saku',
        category: 'Uang Saku',
        date: '2026-11-01',
        dayOfWeek: 0,
      },
      {
        id: 'tx-2',
        type: 'expense',
        amount: 25000,
        description: 'Makan Siang',
        category: 'Makanan & Minuman',
        date: '2026-11-01',
        dayOfWeek: 0,
        isClosedToBalance: false,
      },
    ],
    budget: {
      monthlyLimit: 1500000,
      excludeAdjustmentsFromBudget: true,
    },
  }

  it('successfully validates and parses compliant backup JSON', () => {
    const raw = JSON.stringify(validBackup)
    const result = validateAndParseBackupJson(raw)

    expect(result.valid).toBe(true)
    expect(result.data).toBeDefined()
    expect(result.data?.transactions.length).toBe(2)
    expect(result.data?.budget?.monthlyLimit).toBe(1500000)
    expect(result.data?.appName).toBe('Pixel Ledger')
  })

  it('tolerates direct transaction array imports', () => {
    const raw = JSON.stringify(validBackup.transactions)
    const result = validateAndParseBackupJson(raw)

    expect(result.valid).toBe(true)
    expect(result.data?.transactions.length).toBe(2)
    expect(result.data?.transactions[0].id).toBe('tx-1')
  })

  it('rejects malformed or non-JSON strings', () => {
    const result = validateAndParseBackupJson('This is not json { [')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Gagal membaca berkas JSON')
  })

  it('rejects empty or primitive JSON values', () => {
    expect(validateAndParseBackupJson('null').valid).toBe(false)
    expect(validateAndParseBackupJson('"string"').valid).toBe(false)
    expect(validateAndParseBackupJson('12345').valid).toBe(false)
  })

  it('rejects backup payload missing transactions array', () => {
    const result = validateAndParseBackupJson(JSON.stringify({ appName: 'Pixel Ledger' }))
    expect(result.valid).toBe(false)
    expect(result.error).toContain('field "transactions" tidak ditemukan')
  })

  it('rejects transactions with invalid types', () => {
    const invalidTx = {
      ...validBackup,
      transactions: [
        {
          id: 'tx-bad',
          type: 'invalid_type',
          amount: 50000,
          date: '2026-11-01',
          category: 'Lain-lain',
          dayOfWeek: 0,
        },
      ],
    }

    const result = validateAndParseBackupJson(JSON.stringify(invalidTx))
    expect(result.valid).toBe(false)
    expect(result.error).toContain('memiliki tipe yang tidak valid')
  })

  it('rejects transactions with negative or NaN amounts', () => {
    const invalidAmountTx = {
      ...validBackup,
      transactions: [
        {
          id: 'tx-negative',
          type: 'expense',
          amount: -500,
          date: '2026-11-01',
          category: 'Lain-lain',
          dayOfWeek: 0,
        },
      ],
    }

    const result = validateAndParseBackupJson(JSON.stringify(invalidAmountTx))
    expect(result.valid).toBe(false)
    expect(result.error).toContain('memiliki nominal yang tidak valid')
  })

  it('rejects transactions missing date or ID', () => {
    const missingDateTx = {
      ...validBackup,
      transactions: [
        {
          id: 'tx-no-date',
          type: 'expense',
          amount: 50000,
          category: 'Lain-lain',
          dayOfWeek: 0,
        },
      ],
    }

    const result = validateAndParseBackupJson(JSON.stringify(missingDateTx))
    expect(result.valid).toBe(false)
    expect(result.error).toContain('tidak memiliki tanggal yang valid')
  })
})
