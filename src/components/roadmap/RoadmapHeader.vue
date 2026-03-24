<script setup lang="ts">
import { toRef, useTemplateRef } from 'vue'
import { storeToRefs } from 'pinia'
import { xForDate } from './roadmap-utils'
import { CHART_BORDER_COLOR_PRIMARY, ROW_HEIGHT } from './constants'
import { useRoadmapTimeline } from './useRoadmapTimeline'
import { useInterfaceStore } from '@/stores/interface'

const props = defineProps<{
  itemIds: string[]
}>()

const { roadmapScale: scale } = storeToRefs(useInterfaceStore())

const rootRef = useTemplateRef('root')
const { dateRange, svgWidth, intervalStarts } = useRoadmapTimeline(
  toRef(() => props.itemIds),
  rootRef,
)

const svgHeight = ROW_HEIGHT * 2

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