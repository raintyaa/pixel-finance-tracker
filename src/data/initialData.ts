import type { Category, Transaction } from '../types/finance'

// 1. Daftar Kategori Bawaan dengan Ikon Pixel / Emoji
export const DEFAULT_CATEGORIES: Category[] = [
    // Kategori Pengeluaran
    { id: 'cat-food', name: 'Makanan & Minuman', icon: '🍔', type: 'expense' },
    { id: 'cat-transport', name: 'Transportasi', icon: '🚗', type: 'expense' },
    { id: 'cat-shopping', name: 'Belanja', icon: '🛍️', type: 'expense' },
    { id: 'cat-entertainment', name: 'Hiburan', icon: '🎮', type: 'expense' },
    { id: 'cat-bills', name: 'Tagihan & Utilitas', icon: '⚡', type: 'expense' },
    { id: 'cat-other-exp', name: 'Lain-lain', icon: '📦', type: 'expense' },
    // Kategori Pemasukan
    { id: 'cat-allowance', name: 'Uang Saku', icon: '🪙', type: 'income' },
    { id: 'cat-other-inc', name: 'Pemasukan Lain / Hadiah', icon: '🎁', type: 'income' },
]

// 2. Data Sampel Transaksi Awal untuk Pengujian
export const INITIAL_TRANSACTIONS: Transaction[] = [
    {
        id: 'tx-1',
        type: 'income',
        amount: 1500000,
        description: 'Transfer Uang Saku Bulanan',
        category: 'Uang Saku',
        date: '2026-09-07',
        dayOfWeek: 1, // Senin
    },
    {
        id: 'tx-2',
        type: 'expense',
        amount: 28000,
        description: 'Nasi Padang + Es Teh',
        category: 'Makanan & Minuman',
        date: '2026-09-07',
        dayOfWeek: 1, // Senin
    },
    {
        id: 'tx-3',
        type: 'expense',
        amount: 50000,
        description: 'Langganan Internet / Kuota',
        category: 'Tagihan & Utilitas',
        date: '2026-09-08',
        dayOfWeek: 2, // Selasa
    }
]