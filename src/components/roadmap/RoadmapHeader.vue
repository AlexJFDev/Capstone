<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import { computeDateRange, computeDaysInRange, computeIntervalStarts, xForDate, type RoadmapScale } from './roadmap-utils'
import { CHART_BORDER_COLOR_PRIMARY, DEFAULT_LIST_WIDTH, ROW_HEIGHT } from './constants'
import { formatDate } from '@/utils/dates'
import { useItemsStore } from '@/stores/items'

const props = defineProps<{
  itemIds: string[]
  scale: RoadmapScale
}>()

const itemsStore = useItemsStore()

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
const svgWidth = computed(() => Math.max(totalDays.value * props.scale.pixelsPerDay, width.value - DEFAULT_LIST_WIDTH))
const svgHeight = ROW_HEIGHT * 2

/**
 * Array of Dates, one per interval boundary, from timeline start to end.
 * Used to draw the vertical grid lines and labels in the template.
 */
const intervalStarts = computed(() => computeIntervalStarts(dateRange.value, svgWidth.value, props.scale))

</script>

<template>
  <div class="roadmap-header" ref="root">
    <svg
      :width="svgWidth"
      :height="svgHeight"
    >
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
      <text
        v-for="week in intervalStarts"
        :key="week.getTime()"
        :x="xForDate(week, dateRange, scale) + 4"
        y="40"
      >
        {{ scale.headerLabel(week) }}
      </text>
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