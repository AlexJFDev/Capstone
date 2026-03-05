
// === TYPES ===

export type DateStyle = 'long-american' | 'short-american' | 'long-european' | 'short-european'

/**
 * Simple range of dates.
 * 
 * @property start   The Beginning of the range
 * @property end     The end of the range
 */
export interface DateRange {
  start: Date
  end: Date
}

// === VALIDATION ===
/** True if the end date is after the start date. */
export function isValidRange(range: DateRange): boolean {
  const { start, end } = range
  return (
    isNaN(start.getTime()) ||
    isNaN(end.getTime()) ||
    end >= start
  )
}
/** Throws if range is invalid. */
export function validateRange(range: DateRange) {
  if (!isValidRange(range)) {
    throw new Error(`Invalid date range: ${range}`)
  }
}

// === CONSTANTS ===

/** Number of milliseconds in one day. */
export const MSEC_IN_DAY = 86400000

function ordinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return `${day}th`
  switch (day % 10) {
    case 1: return `${day}st`
    case 2: return `${day}nd`
    case 3: return `${day}rd`
    default: return `${day}th`
  }
}

/**
 * Formats a date value into a human-readable string using the given style.
 * All calculations use UTC to avoid timezone-related off-by-one-day errors.
 */
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

/** Returns the date as a `YYYY-MM-DD` string, suitable for use with `<input type="date">`. */
export function dateToShortISOString(date: Date): string {
  return date.toISOString().slice(0, 10)
}
