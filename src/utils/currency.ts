/**
 * Utilitas untuk memformat dan mengolah mata uang Rupiah (IDR).
 * Menggunakan standar bawaan browser (Intl.NumberFormat) tanpa library tambahan.
 */
// Format angka mentah (misal: 50000) menjadi string rapi "Rp 50.000"
export function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

// Format ringkas jika hanya butuh angka bertitik tanpa tulisan "Rp" (misal: "50.000")
export function formatNumber(amount: number): string {
    return new Intl.NumberFormat('id-ID').format(amount)
}


// Membersihkan teks input pengguna (misal: "Rp 50.000" atau "50,000") kembali menjadi angka murni 50000
export function parseRupiah(input: string): number {
    const cleaned = input.replace(/[^0-9]/g, '')
    return cleaned ? parseInt(cleaned, 10) : 0
}