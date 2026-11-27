import { describe, expect, it } from 'vitest'
import type { BudgetConfig, Transaction } from '../types/finance'
import { getBudgetHealth, isActiveExpense, isBudgetExpense } from '../utils/analytics'

describe('finance logic & accounting rules', () => {
  // Mock data transaksi autentik November
  const sampleTransactions: Transaction[] = [
    {
      id: 'tx-initial-balance',
      type: 'income',
      amount: 1308855,
      description: 'Saldo Awal Akumulasi Kas',
      category: 'Saldo Awal',
      date: '2026-10-31',
      dayOfWeek: 6,
    },
    {
      id: 'tx-income-nov',
      type: 'income',
      amount: 1500000,
      description: 'Pemasukan Kas November',
      category: 'Uang Saku',
      date: '2026-11-01',
      dayOfWeek: 0,
    },
    {
      id: 'tx-nov-geprek',
      type: 'expense',
      amount: 10000,
      description: 'Beli Ayam Geprek',
      category: 'Makanan & Minuman',
      date: '2026-11-01',
      dayOfWeek: 0,
    },
    {
      id: 'tx-nov-beras',
      type: 'expense',
      amount: 57500,
      description: 'Beli Beras',
      category: 'Makanan & Minuman',
      date: '2026-11-01',
      dayOfWeek: 0,
    },
    {
      id: 'tx-nov-listrik',
      type: 'expense',
      amount: 36500,
      description: 'Beli Token Listrik',
      category: 'Tagihan & Utilitas',
      date: '2026-11-02',
      dayOfWeek: 1,
    },
    {
      id: 'tx-nov-bensin',
      type: 'expense',
      amount: 20000,
      description: 'bensin',
      category: 'Transportasi',
      date: '2026-11-02',
      dayOfWeek: 1,
    },
    {
      id: 'tx-nov-kopi',
      type: 'expense',
      amount: 17000,
      description: 'Beli Kopi',
      category: 'Makanan & Minuman',
      date: '2026-11-03',
      dayOfWeek: 2,
    },
  ]

  const calculateBalance = (txs: Transaction[]) => {
    const allTimeIncome = txs
      .filter((tx) => tx.type === 'income')
      .reduce((acc, tx) => acc + tx.amount, 0)

    const allTimeExpense = txs
      .filter((tx) => tx.type === 'expense')
      .reduce((acc, tx) => acc + tx.amount, 0)

    return {
      allTimeIncome,
      allTimeExpense,
      realBalance: allTimeIncome - allTimeExpense,
    }
  }

  const calculateMonthlyExpense = (txs: Transaction[], monthPrefix: string) => {
    return txs
      .filter((tx) => tx.date.startsWith(monthPrefix) && isActiveExpense(tx))
      .reduce((acc, tx) => acc + tx.amount, 0)
  }

  const calculateBudgetExpense = (
    txs: Transaction[],
    monthPrefix: string,
    budget: BudgetConfig
  ) => {
    const excludeLegacy = budget.excludeAdjustmentsFromBudget ?? true
    return txs
      .filter((tx) => tx.date.startsWith(monthPrefix) && isBudgetExpense(tx, excludeLegacy))
      .reduce((acc, tx) => acc + tx.amount, 0)
  }

  it('calculates real running balance correctly (Pemasukan - Pengeluaran)', () => {
    const { allTimeIncome, allTimeExpense, realBalance } = calculateBalance(sampleTransactions)

    expect(allTimeIncome).toBe(1308855 + 1500000) // 2.808.855
    expect(allTimeExpense).toBe(10000 + 57500 + 36500 + 20000 + 17000) // 141.000
    expect(realBalance).toBe(2667855)
  })

  it('calculates active monthly expense correctly for November 2026', () => {
    const novExpense = calculateMonthlyExpense(sampleTransactions, '2026-11')
    expect(novExpense).toBe(141000)
  })

  describe('Reset Pengeluaran dengan Kunci Saldo (isClosedToBalance: true)', () => {
    it('sets monthly expense to Rp 0 while maintaining exact real cash balance', () => {
      // Simulasikan pengguna melakukan "Reset Pengeluaran (Saldo Tetap)"
      const closedTransactions = sampleTransactions.map((tx) =>
        tx.type === 'expense' && tx.date.startsWith('2026-11')
          ? { ...tx, isClosedToBalance: true }
          : tx
      )

      // 1. Saldo kas riil tetap utuh karena uang fisik memang sudah keluar
      const { realBalance } = calculateBalance(closedTransactions)
      expect(realBalance).toBe(2667855)

      // 2. Beban pengeluaran bulanan aktif menjadi Rp 0
      const monthlyExpense = calculateMonthlyExpense(closedTransactions, '2026-11')
      expect(monthlyExpense).toBe(0)

      // 3. Beban budget juga menjadi Rp 0
      const budgetExpense = calculateBudgetExpense(closedTransactions, '2026-11', {
        monthlyLimit: 1500000,
        excludeAdjustmentsFromBudget: true,
      })
      expect(budgetExpense).toBe(0)
    })
  })

  describe('Penyesuaian Saldo Riil & Biaya Admin', () => {
    it('treats admin fee as monthly expense while exempting transfer from budget', () => {
      // Skenario: Saldo 2.667.855 ditransfer ke DANA sebesar 800.500 dengan biaya admin 6.500
      // Saldo baru menjadi 1.860.855 (berkurang 807.000)
      const adminFeeTx: Transaction = {
        id: 'tx-admin-fee',
        type: 'expense',
        amount: 6500,
        description: 'Biaya Admin Transfer DANA',
        category: 'Biaya Admin',
        date: '2026-11-21',
        dayOfWeek: 6,
        isAdjustmentExpense: true, // Pasti dihitung beban
      }

      const transferTx: Transaction = {
        id: 'tx-transfer',
        type: 'expense',
        amount: 800500,
        description: 'Transfer ke DANA',
        category: 'Penyesuaian Saldo',
        date: '2026-11-21',
        dayOfWeek: 6,
        isAdjustmentExpense: false, // Tidak dihitung beban bulanan
      }

      const updatedTxs = [adminFeeTx, transferTx, ...sampleTransactions]

      // Saldo kas riil berkurang total 807.000
      const { realBalance } = calculateBalance(updatedTxs)
      expect(realBalance).toBe(2667855 - 807000) // 1.860.855

      // Pengeluaran bulanan hanya bertambah 6.500 (dari 141.000 menjadi 147.500)
      const monthlyExpense = calculateMonthlyExpense(updatedTxs, '2026-11')
      expect(monthlyExpense).toBe(141000 + 6500) // 147.500

      // Budget bulanan juga hanya bertambah 6.500 (transfer non-beban tetap dikecualikan)
      const budgetExpense = calculateBudgetExpense(updatedTxs, '2026-11', {
        monthlyLimit: 1500000,
        excludeAdjustmentsFromBudget: true,
      })
      expect(budgetExpense).toBe(141000 + 6500)
    })

    it('includes balance adjustment in BOTH monthly expense and budget when explicitly checked (isAdjustmentExpense: true)', () => {
      const explicitExpenseAdjustTx: Transaction = {
        id: 'tx-explicit-adjust-expense',
        type: 'expense',
        amount: 111400,
        description: 'Penyesuaian Saldo (Pengeluaran tak tercatat)',
        category: 'Penyesuaian Saldo',
        date: '2026-11-26',
        dayOfWeek: 4,
        isAdjustmentExpense: true,
      }

      const updatedTxs = [explicitExpenseAdjustTx, ...sampleTransactions]
      const monthlyExpense = calculateMonthlyExpense(updatedTxs, '2026-11')
      const budgetExpense = calculateBudgetExpense(updatedTxs, '2026-11', {
        monthlyLimit: 1500000,
        excludeAdjustmentsFromBudget: true,
      })

      expect(monthlyExpense).toBe(141000 + 111400) // 252.400
      expect(budgetExpense).toBe(141000 + 111400) // 252.400 (wajib memotong budget)
    })

    it('excludes legacy Penyesuaian Saldo without isAdjustmentExpense flag from budget when excludeAdjustmentsFromBudget is true', () => {
      const legacyAdjustTx: Transaction = {
        id: 'tx-legacy-adjust',
        type: 'expense',
        amount: 200000,
        description: 'Koreksi Saldo Lama',
        category: 'Penyesuaian Saldo',
        date: '2026-11-10',
        dayOfWeek: 2,
      }

      const updatedTxs = [legacyAdjustTx, ...sampleTransactions]
      const budgetExpense = calculateBudgetExpense(updatedTxs, '2026-11', {
        monthlyLimit: 1500000,
        excludeAdjustmentsFromBudget: true,
      })

      expect(budgetExpense).toBe(141000)
    })
  })

  describe('Budget HP Bar Status Thresholds (100% -> 0% draining)', () => {
    it('returns full 100% HP and 3 hearts when expense is 0', () => {
      const res = getBudgetHealth(0, 1500000)
      expect(res.status).toBe('healthy')
      expect(res.statusLabel).toBe('DOMPET SEHAT')
      expect(res.remainingHpPercentage).toBe(100)
      expect(res.hearts).toBe(3)
    })

    it('returns healthy status when remaining HP is above 50%', () => {
      const res = getBudgetHealth(141000, 1500000) // ~91% HP left
      expect(res.status).toBe('healthy')
      expect(res.statusLabel).toBe('DOMPET SEHAT')
      expect(res.remainingHpPercentage).toBe(91)
      expect(res.usedPercentage).toBe(9)
      expect(res.hearts).toBe(3)
    })

    it('returns warning status (2 hearts) when remaining HP is between 21% and 50%', () => {
      const res = getBudgetHealth(900000, 1500000) // 40% HP left
      expect(res.status).toBe('warning')
      expect(res.statusLabel).toBe('MULAI MENIPIS')
      expect(res.remainingHpPercentage).toBe(40)
      expect(res.hearts).toBe(2)
    })

    it('returns critical status (1 heart) when remaining HP is 0% to 20% without exceeding limit', () => {
      const res = getBudgetHealth(1350000, 1500000) // 10% HP left
      expect(res.status).toBe('critical')
      expect(res.statusLabel).toBe('HAMPIR HABIS')
      expect(res.remainingHpPercentage).toBe(10)
      expect(res.hearts).toBe(1)

      const exactLimit = getBudgetHealth(1500000, 1500000)
      expect(exactLimit.status).toBe('critical')
      expect(exactLimit.remainingHpPercentage).toBe(0)
      expect(exactLimit.hearts).toBe(1)
    })

    it('returns over status (0% HP, 0 hearts) when expense exceeds budget limit', () => {
      const res = getBudgetHealth(1800000, 1500000)
      expect(res.status).toBe('over')
      expect(res.statusLabel).toBe('OVER BUDGET!')
      expect(res.remainingHpPercentage).toBe(0)
      expect(res.remainingBudget).toBe(-300000)
      expect(res.hearts).toBe(0)
    })
  })
})
