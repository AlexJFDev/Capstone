<script setup lang="ts">
/**
 * RoadmapChart
 *
 * Renders a horizontally-scrollable SVG Gantt-style chart for a list of roadmap items.
 * Each item is drawn as a colored bar spanning its startDate to endDate, aligned to a
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

import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import { CHART_BAR_PADDING, CHART_BORDER_COLOR_PRIMARY, LIST_WIDTH, ROW_HEIGHT } from './constants'
import { computeDateRange, computeDaysInRange, computeIntervalStarts, xForDate, type RoadmapScale } from './roadmap-utils'
import { useItemsStore } from '@/stores/items'
import { useInterfaceStore } from '@/stores/interface'

const props = defineProps<{
  /** Ordered list of roadmap item IDs to render, one row per item. */
  itemIds: string[]
  /** Zoom/display scale; only `pixelsPerDay` affects this component's rendering. */
  scale: RoadmapScale
}>()

const itemsStore = useItemsStore()
const interfaceStore = useInterfaceStore()

const rootRef = useTemplateRef('root')
const width = ref(0)
let resizeObserver: ResizeObserver | null = null
onMounted(() => {
  resizeObserver = new ResizeObserver(entries => {
    width.value = entries[0]?.contentRect.width ?? 0
  })
  resizeObserver.observe(rootRef.value!.parentElement!.parentElement!)
})
onBeforeUnmount(() => resizeObserver?.disconnect())

const items = computed(() => itemsStore.getItems(props.itemIds))

const dateRange = computed(() => computeDateRange(items.value, props.scale))

/** Total number of calendar days spanned by the timeline window (used for SVG width). */
const totalDays = computed(() => computeDaysInRange(dateRange.value))

/** Full pixel width of the SVG canvas. Grows/shrinks with zoom (pixelsPerDay). */
const svgWidth = computed(() => Math.max(totalDays.value * props.scale.pixelsPerDay, width.value - LIST_WIDTH))
/** Full pixel height of the SVG canvas — one row per item, no padding. */
const svgHeight = computed(() => props.itemIds.length * ROW_HEIGHT)

/**
 * Array of Dates, one per interval boundary, from timeline start to end.
 * Used to draw the vertical grid lines in the template.
 */
const intervalStarts = computed(() => computeIntervalStarts(dateRange.value, svgWidth.value, props.scale))

/**
 * Derived bar geometry for every visible item. Each bar object carries:
 *  - id     → item identifier (used as Vue key)
 *  - x      → left edge pixel position (from item startDate)
 *  - width  → bar width in pixels  (endDate x − startDate x)
 *  - color  → fill color from the item definition
 *  - y      → top edge of the row (before CHART_BAR_PADDING is applied in the template)
 *
 * Items whose IDs are not found in the `items` map are silently excluded.
 */
const bars = computed(() =>
  props.itemIds
    .map((id, index) => {
      const item = itemsStore.getItem(id)
      if (!item) return null
      const x = xForDate(item.startDate, dateRange.value, props.scale)
      const width = xForDate(item.endDate, dateRange.value, props.scale) - x
      return { id, x, width, color: item.color, y: index * ROW_HEIGHT }
    })
    .filter(b => b !== null)
)
</script>

<template>
  <div class="roadmap-chart" ref="root">
    <svg
      :width="svgWidth"
      :height="svgHeight"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Vertical grid lines at each interval boundary -->
      <line
        v-for="week in intervalStarts"
        :key="week.getTime()"
        :x1="xForDate(week, dateRange, scale)"
        :x2="xForDate(week, dateRange, scale)"
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

      <!-- Row hover backgrounds -->
      <rect
        v-for="(itemId, index) in itemIds"
        :key="`bg-${itemId}`"
        x="0"
        :y="index * ROW_HEIGHT"
        :width="svgWidth"
        :height="ROW_HEIGHT"
        class="row-bg"
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
        class="bar"
        @click="interfaceStore.openItemViewer(bar.id)"
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

.row-bg {
  fill: transparent;

  &:hover {
    fill: rgba(0, 0, 0, 0.04);
  }
}

.bar {
  cursor: pointer;

  &:hover {
    opacity: 0.85;
  }
}
</style>
