<!-- A single row of the RoadmapChart including the label on the left and the bar on the right. -->
<script setup lang="ts">
import { useItemsStore } from '@/stores/items'
import { CHART_BAR_PADDING, ROW_HEIGHT } from './constants'
import { computed } from 'vue'
import type { DateRange } from '@/utils/dates'
import { xForDate, type RoadmapScale } from './roadmap-utils'

const itemsStore = useItemsStore()

const props = defineProps<{
  labelWidth: number
  timelineWidth: number
  itemId: string
  dateRange: DateRange
  scale: RoadmapScale
}>()

const item = computed(() => itemsStore.getItem(props.itemId))

const barX = computed(() => xForDate(item.value.startDate, props.dateRange, props.scale))
const barWidth = computed(() => xForDate(item.value.endDate, props.dateRange, props.scale) - barX.value)
const barHeight = computed(() => ROW_HEIGHT - CHART_BAR_PADDING * 2)

const labelStyle = computed(() => `width: ${props.labelWidth}px`)

</script>

<template>
  <div class="d-flex">
    <!-- Label -->
    <div :style="labelStyle">
      {{ item.name }}
    </div>
    <!-- Bar -->
    <svg :width="timelineWidth" :height="ROW_HEIGHT">
      <rect
        :x="barX"
        :y="CHART_BAR_PADDING"
        :width="barWidth"
        :height="barHeight"
        :fill="item.color"
        rx="3"
      />
    </svg>
  </div>
</template>

<style scoped>

</style>