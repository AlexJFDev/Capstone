import type { Item } from '@/types'
import type { DateRange } from './types'

const SEC_IN_DAY = 86400000

/**
 * Derives the overall timeline window from the earliest start-date and latest end-date
 * across all visible items. Both boundaries are then snapped to Sunday midnight so the
 * week columns align perfectly with the grid lines.
 * 
 * @param items 
 * @returns 
 */
export function computeDateRange(items: Item[]): DateRange {
  if (items.length === 0) return { start: new Date(0), end: new Date(0) }
  // Find the first start date and last end date in the item list
  let min = Infinity
  let max = -Infinity
  items.forEach((item) => {
    min = Math.min(item["start-date"].getTime(), min)
    max = Math.max(item["end-date"].getTime(), max)
  })
  // Range start is the Sunday before the first item start date
  const start = new Date(min)
  start.setDate(start.getDate() - start.getDay())
  start.setHours(0, 0, 0, 0)
  // Range end is the Sunday after the final item end date
  const end = new Date(max)
  const daysUntilSunday = (7 - end.getDay()) % 7
  end.setDate(end.getDate() + (daysUntilSunday || 7))
  end.setHours(0, 0, 0, 0)

  return { start, end }
}

/**
 * Computes the number of days in a DateRange
 * @param range
 * @returns 
 */
export function computeDaysInRange(range: DateRange): number {
  return Math.round((range.end.getTime() - range.start.getTime()) / SEC_IN_DAY)
}

/**
 * Computes the start date of each week in a DateRange
 * @param range 
 * @returns 
 */
export function computeStartsInRange(range: DateRange): Date[] {
  const weeks: Date[] = []
  const cur = new Date(range.start)
  while (cur.getTime() < range.end.getTime()) {
    weeks.push(new Date(cur))
    cur.setDate(cur.getDate() + 7)
  }
  return weeks
}

/**
 * Extends a week-starts array beyond the date range to cover a given SVG pixel width.
 * Appends additional weekly dates until the next week would start past svgWidth.
 *
 * @param weekStarts  Output of computeStartsInRange — the baseline week boundaries.
 * @param svgWidth    The target pixel width that grid lines must cover.
 * @param range       The date range used to convert dates to x-coordinates.
 * @param pixelsPerDay  Zoom level; must match the value used to compute svgWidth.
 */
export function extendWeekStarts(weekStarts: Date[], svgWidth: number, range: DateRange, pixelsPerDay: number): Date[] {
  if (weekStarts.length === 0) return weekStarts
  const result = [...weekStarts]
  const next = new Date(result[result.length - 1]!)
  next.setDate(next.getDate() + 7)
  while (xForDate(next, range, pixelsPerDay) < svgWidth) {
    result.push(new Date(next))
    next.setDate(next.getDate() + 7)
  }
  return result
}

/**
 * Converts a Date to an SVG x-coordinate relative to the left edge of the canvas.
 *
 * Formula: (date − rangeStart) in days × pixelsPerDay
 *
 * @param date  The date to convert.
 * @returns     Pixel offset from the left edge of the SVG.
 */
export function xForDate(date: Date, range: DateRange, pixelsPerDay: number): number {
  const days = (date.getTime() - range.start.getTime()) / SEC_IN_DAY
  return days * pixelsPerDay
}