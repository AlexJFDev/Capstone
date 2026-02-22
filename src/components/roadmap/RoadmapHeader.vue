<script setup lang="ts">
import { computed } from 'vue'
import type { RoadmapScale } from './types'
import { items as dummyItems } from '@/testing/dummy-items'
import { computeDateRange, computeDaysInRange, computeStartsInRange, xForDate } from './utils'
import { CHART_BORDER_COLOR_PRIMARY, ROW_HEIGHT } from './constants';

const props = defineProps<{
  itemIds: string[]
  scale: RoadmapScale
}>()

const items = computed(() => props.itemIds.map((itemId) => dummyItems[itemId]!))

const dateRange = computed(() => computeDateRange(items.value))

/** Total number of calendar days spanned by the timeline window (used for SVG width). */
const totalDays = computed(() => computeDaysInRange(dateRange.value))

/** Full pixel width of the SVG canvas. Grows/shrinks with zoom (pixelsPerDay). */
const svgWidth = computed(() => totalDays.value * props.scale.pixelsPerDay)
const svgHeight = ROW_HEIGHT * 2

/**
 * Array of Dates, one per week boundary (every Sunday), from timeline start to end.
 * Used to draw the vertical grid lines in the template.
 */
const weekStarts = computed(() => computeStartsInRange(dateRange.value))

</script>

<template>
  <div class="roadmap-header">
    <svg
      :width="svgWidth"
      :height="svgHeight"
    >
      <line
        v-for="week in weekStarts"
        :key="week.getTime()"
        :x1="xForDate(week, dateRange, scale.pixelsPerDay)"
        :x2="xForDate(week, dateRange, scale.pixelsPerDay)"
        y1="0"
        :y2="svgHeight"
        :stroke="CHART_BORDER_COLOR_PRIMARY"
        stroke-width="1"
      />
    </svg>
  </div>
</template>

<style scoped>
svg {
  display: block;
}

.roadmap-header {
  height: max-content;
}
</style>