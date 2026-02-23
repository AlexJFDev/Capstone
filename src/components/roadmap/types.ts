/**
 * Describes the current zoom / display scale of the roadmap timeline.
 *
 * @property pixelsPerDay   How many SVG pixels represent one calendar day.
 *                          Higher values zoom in; lower values zoom out.
 * @property headerLabel    Function that formats a Date for display in the (external)
 *                          timeline header row. Unused inside this component.
 * @property gridInterval   Intended granularity of the header labels ('day' | 'week' | 'month').
 *                          Unused inside this component — grid lines are always drawn weekly.
 */
export interface RoadmapScale {
  pixelsPerDay: number
  headerLabel: (date: Date) => string
  gridInterval: 'day' | 'week' | 'month'
}

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