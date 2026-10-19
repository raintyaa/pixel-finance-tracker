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

// 2. Data Transaksi Awal (Dikosongkan agar mulai bersih dari 0)
export const INITIAL_TRANSACTIONS: Transaction[] = []