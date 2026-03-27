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

import { computed, toRef, useTemplateRef } from 'vue'
import { storeToRefs } from 'pinia'
import { CHART_BORDER_COLOR_PRIMARY, ROW_HEIGHT, TODAY_LINE_COLOR } from './constants'
import { xForDate } from './roadmap-utils'
import SvgVerticalGridLines from './SvgVerticalGridLines.vue'
import { useItemsStore } from '@/stores/items'
import { useInterfaceStore } from '@/stores/interface'
import { useRoadmapTimeline } from './useRoadmapTimeline'
import RoadmapBar from './RoadmapBar.vue'

const props = defineProps<{
  /** Ordered list of roadmap item IDs to render, one row per item. */
  itemIds: string[]
  hoveredItemId: string | null
}>()

const emit = defineEmits<{
  'update:hoveredItemId': [id: string | null]
}>()

const itemsStore = useItemsStore()
const interfaceStore = useInterfaceStore()
const { roadmapScale: scale } = storeToRefs(interfaceStore)

const rootRef = useTemplateRef('root')
const { dateRange, svgWidth, intervalStarts } = useRoadmapTimeline(
  toRef(() => props.itemIds),
  rootRef,
)

/** Number of rows to display — at least 1 when empty so the chart isn't invisible. */
const rowCount = computed(() => Math.max(props.itemIds.length, 1))

/** Full pixel height of the SVG canvas — one row per item, no padding. */
const svgHeight = computed(() => rowCount.value * ROW_HEIGHT)

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
      const x = xForDate(item.startDate, dateRange.value, scale.value)
      const width = xForDate(item.endDate, dateRange.value, scale.value) - x
      return { id, x, width, color: item.color, y: index * ROW_HEIGHT }
    })
    .filter(b => b !== null)
)

const todayX = computed(() => xForDate(new Date(), dateRange.value, scale.value))
const showTodayLine = computed(() => todayX.value >= 0 && todayX.value <= svgWidth.value)

</script>

<template>
  <div ref="root" class="roadmap-chart">
    <svg
      :width="svgWidth"
      :height="svgHeight"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Vertical grid lines at each interval boundary -->
      <SvgVerticalGridLines :interval-starts="intervalStarts" :date-range="dateRange" :scale="scale" :height="svgHeight" />

      <!--
        Horizontal row dividers matching the item list borders.
        Increments of .5 ensure SVG renders lines in a single pixel and not between two pixels.
      -->
      <line
        v-for="(_, index) in rowCount"
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
        :class="{ 'row-bg': true, 'row-hovered': itemId === hoveredItemId }"
        @mouseenter="emit('update:hoveredItemId', itemId)"
        @mouseleave="emit('update:hoveredItemId', null)"
      />
      <!-- Empty-state background row (no hover) -->
      <rect
        v-if="itemIds.length === 0"
        key="bg-empty"
        x="0"
        y="0"
        :width="svgWidth"
        :height="ROW_HEIGHT"
        class="row-bg"
      />

      <!-- Item bars -->
      <RoadmapBar
        v-for="bar in bars"
        :id="bar.id"
        :key="bar.id"
        :x="bar.x"
        :y="bar.y"
        :width="bar.width"
        :color="bar.color"
      />

      <!-- Today vertical line -->
      <line
        v-if="showTodayLine"
        :x1="todayX"
        :x2="todayX"
        y1="0"
        :y2="svgHeight"
        :stroke="TODAY_LINE_COLOR"
        stroke-width="1"
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

  &:hover,
  &.row-hovered {
    fill: rgba(0, 0, 0, 0.04);
  }
}

</style>
