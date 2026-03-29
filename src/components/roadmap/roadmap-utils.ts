import type { Item } from '@/types'
import { MSEC_IN_DAY, type DateRange } from '@/utils/dates'

// === TYPES ===

/**
 * Interval for the vertical lines on a roadmap
 */
export type RoadmapInterval = 'day' | 'week' | 'month'

/**
 * Describes the current zoom / display scale of the roadmap timeline.
 *
 * @property pixelsPerDay   How many SVG pixels represent one calendar day.
 *                          Higher values zoom in; lower values zoom out.
 * @property headerLabel    Function that formats a Date for display in the (external)
 *                          timeline header row.
 * @property gridInterval   Intended granularity of the header labels ('day' | 'week' | 'month').
 *
 */
export interface RoadmapScale {
  pixelsPerDay: number
  headerLabel: (date: Date) => string
  gridInterval: RoadmapInterval
}

// === HELPERS ===

/** Advances a date in-place by one interval step. */
function advanceByInterval(date: Date, gridInterval: RoadmapInterval): void {
  if (gridInterval === 'day') date.setDate(date.getDate() + 1)
  else if (gridInterval === 'week') date.setDate(date.getDate() + 7)
  else date.setMonth(date.getMonth() + 1)
}

// === FUNCTIONS ===

/**
 * Snaps a date back to the start of its interval boundary:
 * midnight for 'day', the preceding Sunday for 'week', the 1st of the month for 'month'.
 */
export function snapIntervalStart(date: Date, gridInterval: RoadmapInterval): Date {
  const d = new Date(date)
  if (gridInterval === 'week') d.setDate(d.getDate() - d.getDay())
  else if (gridInterval === 'month') d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Snaps a date forward to the next interval boundary:
 * the following midnight for 'day', the following Sunday for 'week', the 1st of the next month for 'month'.
 */
export function snapIntervalEnd(date: Date, gridInterval: RoadmapInterval): Date {
  const d = new Date(date)
  if (gridInterval === 'day') {
    d.setDate(d.getDate() + 1)
  } else if (gridInterval === 'week') {
    const daysUntilSunday = (7 - d.getDay()) % 7
    d.setDate(d.getDate() + (daysUntilSunday || 7))
  } else {
    d.setMonth(d.getMonth() + 1, 1)
  }
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Derives the overall timeline window from the earliest startDate and latest endDate
 * across all visible items. Boundaries are snapped to the interval via snapIntervalStart/End.
 */
export function computeDateRange(items: Item[], scale: RoadmapScale): DateRange {
  if (items.length === 0)
    return {
      start: snapIntervalStart(new Date(), scale.gridInterval),
      end: snapIntervalEnd(new Date(), scale.gridInterval),
    }
  let min = Infinity
  let max = -Infinity
  items.forEach((item) => {
    min = Math.min(item.startDate.getTime(), min)
    max = Math.max(item.endDate.getTime(), max)
  })
  return {
    start: snapIntervalStart(new Date(min), scale.gridInterval),
    end: snapIntervalEnd(new Date(max), scale.gridInterval),
  }
}

/**
 * Computes the number of days in a DateRange.
 */
export function computeDaysInRange(range: DateRange): number {
  return Math.round((range.end.getTime() - range.start.getTime()) / MSEC_IN_DAY)
}

/**
 * Computes all interval boundary dates needed to cover both the date range and the SVG
 * pixel width. Combines the previous computeStartsInRange + extendIntervalStarts into
 * a single pass using advanceByInterval.
 */
export function computeIntervalStarts(
  range: DateRange,
  svgWidth: number,
  scale: RoadmapScale,
): Date[] {
  const starts: Date[] = []
  const cur = new Date(range.start)
  while (cur.getTime() < range.end.getTime() || xForDate(cur, range, scale) < svgWidth) {
    starts.push(new Date(cur))
    advanceByInterval(cur, scale.gridInterval)
  }
  return starts
}

/**
 * Converts a Date to an SVG x-coordinate relative to the left edge of the canvas.
 *
 * Formula: (date − rangeStart) in days × pixelsPerDay
 *
 * @param date  The date to convert.
 * @returns     Pixel offset from the left edge of the SVG.
 */
export function xForDate(date: Date, range: DateRange, scale: RoadmapScale): number {
  const days = (date.getTime() - range.start.getTime()) / MSEC_IN_DAY
  return days * scale.pixelsPerDay
}
