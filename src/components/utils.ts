export type DateStyle = 'long-american' | 'short-american' | 'long-european' | 'short-european'

function ordinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return `${day}th`
  switch (day % 10) {
    case 1: return `${day}st`
    case 2: return `${day}nd`
    case 3: return `${day}rd`
    default: return `${day}th`
  }
}

export function formatDate(date: string | number | Date, style: DateStyle) {
  const d = new Date(date)
  const year = d.getUTCFullYear()
  const month = d.getUTCMonth() // 0-indexed
  const day = d.getUTCDate()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  const mm = String(month + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')

  switch (style ?? 'long-american') {
    case 'long-american':
      return `${monthNames[month]} ${ordinalSuffix(day)}, ${year}`
    case 'short-american':
      return `${mm}-${dd}-${year}`
    case 'long-european':
      return `${day} ${monthNames[month]} ${year}`
    case 'short-european':
      return `${dd}-${mm}-${year}`
  }
}