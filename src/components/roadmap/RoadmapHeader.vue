<script setup lang="ts">
import { computed, toRef, useTemplateRef } from 'vue'
import { storeToRefs } from 'pinia'
import { xForDate } from './roadmap-utils'
import { ROW_HEIGHT, TODAY_LINE_COLOR } from './constants'
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

const svgHeight = ROW_HEIGHT * 3

const todayX = computed(() => xForDate(new Date(), dateRange.value, scale.value))
const showTodayLine = computed(() => todayX.value >= 0 && todayX.value <= svgWidth.value)

</script>

<template>
  <div class="roadmap-header" ref="root">
    <svg
      :width="svgWidth"
      :height="svgHeight"
    >
      <SvgVerticalGridLines :intervalStarts="intervalStarts" :dateRange="dateRange" :scale="scale" :height="svgHeight" />
      <text
        v-for="week in intervalStarts"
        :key="week.getTime()"
        :x="xForDate(week, dateRange, scale) + 4"
        y="40"
      >
        {{ scale.headerLabel(week) }}
      </text>
      <text
        v-if="showTodayLine"
        :x="todayX + 4"
        :y="svgHeight - 5"
        :fill="TODAY_LINE_COLOR"
      >
        Today
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