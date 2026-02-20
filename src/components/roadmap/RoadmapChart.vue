<script setup lang="ts">
import { computed } from 'vue'
import { items } from '@/testing/dummy-items'

export interface RoadmapScale {
  pixelsPerDay: number
  headerLabel: (date: Date) => string
  gridInterval: 'day' | 'week' | 'month'
}

const props = defineProps<{
  itemIds: string[]
  scale: RoadmapScale
}>()

const ROW_HEIGHT = 30
const BAR_PADDING = 6

const dateRange = computed(() => {
  const dates = props.itemIds.flatMap(id => {
    const item = items[id]
    if (!item) return []
    return [new Date(item['start-date']), new Date(item['end-date'])]
  })
  if (dates.length === 0) return null

  const min = new Date(Math.min(...dates.map(d => d.getTime())))
  const max = new Date(Math.max(...dates.map(d => d.getTime())))

  // Snap start back to the nearest Sunday
  const start = new Date(min)
  start.setDate(start.getDate() - start.getDay())
  start.setHours(0, 0, 0, 0)

  // Snap end forward to the next Sunday
  const end = new Date(max)
  const daysUntilSunday = (7 - end.getDay()) % 7
  end.setDate(end.getDate() + (daysUntilSunday || 7))
  end.setHours(0, 0, 0, 0)

  return { start, end }
})

const totalDays = computed(() => {
  if (!dateRange.value) return 0
  return Math.round((dateRange.value.end.getTime() - dateRange.value.start.getTime()) / 86400000)
})

const svgWidth = computed(() => totalDays.value * props.scale.pixelsPerDay)
const svgHeight = computed(() => props.itemIds.length * ROW_HEIGHT)

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

function xForDate(date: Date): number {
  if (!dateRange.value) return 0
  const days = (date.getTime() - dateRange.value.start.getTime()) / 86400000
  return days * props.scale.pixelsPerDay
}

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
  <svg
    class="roadmap-chart"
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
      stroke="rgba(0,0,0,0.12)"
      stroke-width="1"
    />

    <!-- Horizontal row dividers matching the item list borders -->
    <line
      v-for="(_, index) in itemIds"
      :key="index"
      x1="0"
      :x2="svgWidth"
      :y1="index * ROW_HEIGHT"
      :y2="index * ROW_HEIGHT"
      stroke="rgba(0,0,0,0.12)"
      stroke-width="1"
    />
    <!-- Bottom border of last row -->
    <line
      x1="0"
      :x2="svgWidth"
      :y1="svgHeight"
      :y2="svgHeight"
      stroke="rgba(0,0,0,0.12)"
      stroke-width="1"
    />

    <!-- Item bars -->
    <rect
      v-for="bar in bars"
      :key="bar.id"
      :x="bar.x"
      :y="bar.y + BAR_PADDING"
      :width="bar.width"
      :height="ROW_HEIGHT - BAR_PADDING * 2"
      :fill="bar.color"
      rx="3"
    />
  </svg>
</template>

<style scoped>
svg {
  display: block;
}

.roadmap-chart {
  overflow-x: auto;
}
</style>
