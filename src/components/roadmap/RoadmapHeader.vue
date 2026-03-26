<script setup lang="ts">
import { toRef, useTemplateRef } from 'vue'
import { storeToRefs } from 'pinia'
import { xForDate } from './roadmap-utils'
import { ROW_HEIGHT } from './constants'
import SvgVerticalGridLines from './SvgVerticalGridLines.vue'
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
  <div ref="root" class="roadmap-header">
    <svg
      :width="svgWidth"
      :height="svgHeight"
    >
      <SvgVerticalGridLines :interval-starts="intervalStarts" :date-range="dateRange" :scale="scale" :height="svgHeight" />
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