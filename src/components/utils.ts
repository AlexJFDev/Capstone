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

export function dateToShortISOString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/**
 * Returns true if the given hex color is light enough to risk blending into
 * a light background. Uses WCAG relative luminance.
 */
export function isLightColor(hex: string): boolean {
  const toLinear = (c: number) => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  const r = toLinear(parseInt(hex.slice(1, 3), 16) / 255)
  const g = toLinear(parseInt(hex.slice(3, 5), 16) / 255)
  const b = toLinear(parseInt(hex.slice(5, 7), 16) / 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.5
}
