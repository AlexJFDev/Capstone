<!-- Renders SVG vertical lines at each interval boundary across the full height of the roadmap SVG canvas. -->
<script setup lang="ts">
import { type DateRange } from '@/utils/dates'
import { xForDate, type RoadmapScale } from './roadmap-utils'
import { CHART_BORDER_COLOR_PRIMARY } from './constants'

defineProps<{
  intervalStarts: Date[]
  dateRange: DateRange
  scale: RoadmapScale
  height: number
}>()
</script>

<template>
  <line
    v-for="date in intervalStarts"
    :key="date.getTime()"
    :x1="xForDate(date, dateRange, scale)"
    :x2="xForDate(date, dateRange, scale)"
    y1="0"
    :y2="height"
    :stroke="CHART_BORDER_COLOR_PRIMARY"
    stroke-width="1"
  />
</template>
