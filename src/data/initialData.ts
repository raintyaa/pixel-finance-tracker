import type { Category, Transaction } from '../types/finance'

// 1. Daftar Kategori Bawaan dengan Ikon Pixel / Emoji
export const DEFAULT_CATEGORIES: Category[] = [
    // Kategori Pengeluaran
    { id: 'cat-food', name: 'Makanan & Minuman', icon: '🍔', type: 'expense' },
    { id: 'cat-transport', name: 'Transportasi', icon: '🚗', type: 'expense' },
    { id: 'cat-shopping', name: 'Belanja', icon: '🛍️', type: 'expense' },
    { id: 'cat-entertainment', name: 'Hiburan', icon: '🎮', type: 'expense' },
    { id: 'cat-bills', name: 'Tagihan & Utilitas', icon: '⚡', type: 'expense' },
    { id: 'cat-admin-fee', name: 'Biaya Admin', icon: '🏦', type: 'expense' },
    { id: 'cat-adjust-exp', name: 'Penyesuaian Saldo', icon: '⚖️', type: 'expense' },
    { id: 'cat-other-exp', name: 'Lain-lain', icon: '📦', type: 'expense' },
    // Kategori Pemasukan
    { id: 'cat-initial', name: 'Saldo Awal', icon: '🏦', type: 'income' },
    { id: 'cat-allowance', name: 'Uang Saku', icon: '🪙', type: 'income' },
    { id: 'cat-adjust-inc', name: 'Penyesuaian Saldo', icon: '⚖️', type: 'income' },
    { id: 'cat-other-inc', name: 'Pemasukan Lain / Hadiah', icon: '🎁', type: 'income' },
]

// 2. Data Transaksi Awal Terkalibrasi Bersih (Histori November Asli)
export const INITIAL_TRANSACTIONS: Transaction[] = [
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