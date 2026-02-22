<script setup lang="ts">
/**
 * RoadmapChart
 *
 * Renders a horizontally-scrollable SVG Gantt-style chart for a list of roadmap items.
 * Each item is drawn as a colored bar spanning its start-date to end-date, aligned to a
 * shared timeline. The timeline always starts on a Sunday and ends on a Sunday so that
 * the week grid lines fall cleanly on column boundaries.
 *
 * Layout
 * ------
 *  - Every item occupies one fixed-height row (ROW_HEIGHT px).
 *  - Bars are vertically inset by CHART_BAR_PADDING on each side so they don't touch the row borders.
 *  - Vertical grid lines mark the start of every week (Sunday midnight).
 *  - Horizontal grid lines separate rows, with an additional line closing the last row.
 *
 * Props
 * -----
 *  itemIds  – Ordered list of item IDs to display (top-to-bottom).
 *             Each ID must exist in the `items` record imported from dummy-items.
 *  scale    – Controls zoom level and (future) header labelling.
 *             `pixelsPerDay` is the only field used for rendering here; the other
 *             fields (`headerLabel`, `gridInterval`) are reserved for a header bar component.
 *
 * Coordinate system
 * -----------------
 *  All x positions are computed via xForDate(), which maps a Date to an SVG x-pixel by
 *  measuring how many days it lies after `dateRange.start` and multiplying by pixelsPerDay.
 *  y positions are simply `rowIndex * ROW_HEIGHT`.
 */

import { computed } from 'vue'
import { items } from '@/testing/dummy-items'
import { CHART_BAR_PADDING, CHART_BORDER_COLOR_PRIMARY, ROW_HEIGHT } from './constants'

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

const props = defineProps<{
  /** Ordered list of roadmap item IDs to render, one row per item. */
  itemIds: string[]
  /** Zoom/display scale; only `pixelsPerDay` affects this component's rendering. */
  scale: RoadmapScale
}>()

/**
 * Derives the overall timeline window from the earliest start-date and latest end-date
 * across all visible items. Both boundaries are then snapped to Sunday midnight so the
 * week columns align perfectly with the grid lines.
 *
 * Returns null when no valid items are provided (nothing to render).
 */
const dateRange = computed(() => {
  // Collect every start and end date from the visible items, skipping unknown IDs.
  const dates = props.itemIds.flatMap(id => {
    const item = items[id]
    if (!item) return []
    return [new Date(item['start-date']), new Date(item['end-date'])]
  })
  if (dates.length === 0) return null

  const min = new Date(Math.min(...dates.map(d => d.getTime())))
  const max = new Date(Math.max(...dates.map(d => d.getTime())))

  // Snap start back to the nearest Sunday (getDay() === 0 means already Sunday → stays).
  const start = new Date(min)
  start.setDate(start.getDate() - start.getDay())
  start.setHours(0, 0, 0, 0)

  // Snap end forward to the *next* Sunday.
  // If max is already a Sunday, (7 - 0) % 7 === 0, so we force a full week forward (|| 7)
  // to ensure there is always at least one grid column after the last bar.
  const end = new Date(max)
  const daysUntilSunday = (7 - end.getDay()) % 7
  end.setDate(end.getDate() + (daysUntilSunday || 7))
  end.setHours(0, 0, 0, 0)

  return { start, end }
})

/** Total number of calendar days spanned by the timeline window (used for SVG width). */
const totalDays = computed(() => {
  if (!dateRange.value) return 0
  // Divide millisecond difference by ms-per-day (86 400 000) and round to avoid float drift.
  return Math.round((dateRange.value.end.getTime() - dateRange.value.start.getTime()) / 86400000)
})

/** Full pixel width of the SVG canvas. Grows/shrinks with zoom (pixelsPerDay). */
const svgWidth = computed(() => totalDays.value * props.scale.pixelsPerDay)
/** Full pixel height of the SVG canvas — one row per item, no padding. */
const svgHeight = computed(() => props.itemIds.length * ROW_HEIGHT)

/**
 * Array of Dates, one per week boundary (every Sunday), from timeline start to end.
 * Used to draw the vertical grid lines in the template.
 */
const weekStarts = computed(() => {
  if (!dateRange.value) return []
  const weeks: Date[] = []
  const cur = new Date(dateRange.value.start)
  while (cur.getTime() < dateRange.value.end.getTime()) {
    weeks.push(new Date(cur))
    cur.setDate(cur.getDate() + 7)
  }
  return weeks
})

/**
 * Converts a Date to an SVG x-coordinate relative to the left edge of the canvas.
 *
 * Formula: (date − rangeStart) in days × pixelsPerDay
 *
 * @param date  The date to convert.
 * @returns     Pixel offset from the left edge of the SVG.
 */
function xForDate(date: Date): number {
  if (!dateRange.value) return 0
  const days = (date.getTime() - dateRange.value.start.getTime()) / 86400000
  return days * props.scale.pixelsPerDay
}

/**
 * Derived bar geometry for every visible item. Each bar object carries:
 *  - id     → item identifier (used as Vue key)
 *  - x      → left edge pixel position (from item start-date)
 *  - width  → bar width in pixels  (end-date x − start-date x)
 *  - color  → fill color from the item definition
 *  - y      → top edge of the row (before CHART_BAR_PADDING is applied in the template)
 *
 * Items whose IDs are not found in the `items` map are silently excluded.
 */
const bars = computed(() =>
  props.itemIds
    .map((id, index) => {
      const item = items[id]
      if (!item) return null
      const x = xForDate(new Date(item['start-date']))
      const width = xForDate(new Date(item['end-date'])) - x
      return { id, x, width, color: item.color, y: index * ROW_HEIGHT }
    })
    .filter(b => b !== null)
)
</script>

<template>
  <div class="roadmap-chart">
    <svg
      :width="svgWidth"
      :height="svgHeight"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Vertical grid lines at each week boundary -->
      <line
        v-for="week in weekStarts"
        :key="week.getTime()"
        :x1="xForDate(week)"
        :x2="xForDate(week)"
        y1="0"
        :y2="svgHeight"
        :stroke="CHART_BORDER_COLOR_PRIMARY"
        stroke-width="1"
      />

      <!-- 
        Horizontal row dividers matching the item list borders. 
        Increments of .5 ensure SVG renders lines in a single pixel and not between two pixels.
      -->
      <line
        v-for="(_, index) in itemIds"
        :key="index"
        x1="0"
        :x2="svgWidth"
        :y1="index * ROW_HEIGHT - 0.5"
        :y2="index * ROW_HEIGHT - 0.5"
        :stroke="CHART_BORDER_COLOR_PRIMARY"
        stroke-width="1"
      />
      <!-- Bottom border of last row. -->
      <line
        x1="0"
        :x2="svgWidth"
        :y1="svgHeight - 0.5"
        :y2="svgHeight - 0.5"
        :stroke="CHART_BORDER_COLOR_PRIMARY"
        stroke-width="1"
      />

      <!-- Item bars -->
      <rect
        v-for="bar in bars"
        :key="bar.id"
        :x="bar.x"
        :y="bar.y + CHART_BAR_PADDING"
        :width="bar.width"
        :height="ROW_HEIGHT - CHART_BAR_PADDING * 2"
        :fill="bar.color"
        rx="3"
      />
    </svg>
  </div>
</template>

<style scoped>
svg {
  display: block;
}

.roadmap-chart {
  height: max-content;
}
</style>
