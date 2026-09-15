/**
 * Utilitas untuk mengelola hari dan tanggal dalam format Indonesia.
 */

// Daftar 7 Kolom Hari untuk Tabel Mingguan (Indeks 0 = Minggu s/d 6 = Sabtu)
export const DAYS_OF_WEEK = [
    'Minggu',
    'Senin',
    'Selasa',
    'Rabu',
    'Kamis',
    'Jumat',
    'Sabtu',
] as const

// Singkatan nama hari untuk tampilan layar yang lebih sempit/mobile
export const DAYS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'] as const

// Daftar nama bulan dalam Bahasa Indonesia
export const MONTH_NAMES = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
] as const

// Mendapatkan nama hari dari indeks angka (0 = Minggu, 1 = Senin, dst.)
export function getDayName(dayIndex: number): string {
    return DAYS_OF_WEEK[dayIndex] ?? 'Minggu'
}

// Mendapatkan tanggal hari ini dalam format standar "YYYY-MM-DD"
export function getTodayDateString(): string {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const date = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${date}`
}

// Mengetahui indeks hari (0-6) dari sebuah string tanggal "YYYY-MM-DD"
export function getDayOfWeekFromDate(dateStr: string): number {
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.getDay() // 0 = Minggu, 1 = Senin, dst.
}

// Memformat tanggal ISO "2026-09-08" menjadi ramah dibaca "8 September 2026"
export function formatDateIndo(dateStr: string): string {
    const [year, month, day] = dateStr.split('-').map(Number)
    if (!year || !month || !day) return dateStr
    return `${day} ${MONTH_NAMES[month - 1]} ${year}`
}

export interface WeekInfo {
    weekNumber: number
    startDate: string
    endDate: string
    label: string
}

export function getWeeksInMonth(year: number, month: number): WeekInfo[] {
    const weeks: WeekInfo[] = []
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)

    const start = new Date(firstDay)
    start.setDate(firstDay.getDate() - firstDay.getDay())

    let currentStart = new Date(start)
    let weekNum = 1

    while (currentStart <= lastDay) {
        const currentEnd = new Date(currentStart)
        currentEnd.setDate(currentStart.getDate() + 6)

        const startMonthName = MONTH_NAMES[currentStart.getMonth()].slice(0, 3)
        const endMonthName = MONTH_NAMES[currentEnd.getMonth()].slice(0, 3)

        const label =
            currentStart.getMonth() === currentEnd.getMonth()
                ? `${currentStart.getDate()} - ${currentEnd.getDate()} ${startMonthName}`
                : `${currentStart.getDate()} ${startMonthName} - ${currentEnd.getDate()} ${endMonthName}`

        const formatIso = (d: Date) => {
            const y = d.getFullYear()
            const m = String(d.getMonth() + 1).padStart(2, '0')
            const dt = String(d.getDate()).padStart(2, '0')
            return `${y}-${m}-${dt}`
        }

        weeks.push({
            weekNumber: weekNum,
            startDate: formatIso(currentStart),
            endDate: formatIso(currentEnd),
            label,
        })

        currentStart.setDate(currentStart.getDate() + 7)
        weekNum++
    }

    return weeks
}