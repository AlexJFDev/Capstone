<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { CHART_BAR_PADDING, ROW_HEIGHT } from './constants'
import { useItemsStore } from '@/stores/items'
import { useInterfaceStore } from '@/stores/interface'
import { MSEC_IN_DAY } from '@/utils/dates'
import { startDragGesture } from './useDragGesture'

const props = defineProps<{
  id: string
  x: number
  y: number
  width: number
  color: string
}>()

const itemsStore = useItemsStore()
const interfaceStore = useInterfaceStore()
const { roadmapScale: scale } = storeToRefs(interfaceStore)

const HANDLE_WIDTH = 8
const barY = () => props.y + CHART_BAR_PADDING
const barHeight = ROW_HEIGHT - CHART_BAR_PADDING * 2

function startEdgeDrag(event: MouseEvent, side: 'start' | 'end') {
  event.stopPropagation()

  const startX = event.clientX
  const item = itemsStore.getItem(props.id)
  const originalDate = side === 'start' ? new Date(item.startDate) : new Date(item.endDate)

  startDragGesture(
    event,
    (e) => {
      const deltaDays = Math.round((e.clientX - startX) / scale.value.pixelsPerDay)
      const newDate = new Date(originalDate.getTime() + deltaDays * MSEC_IN_DAY)
      const current = itemsStore.getItem(props.id)
      if (side === 'start') {
        if (newDate < current.endDate) itemsStore.updateItem(props.id, { startDate: newDate })
      } else if (newDate > current.startDate) {
        itemsStore.updateItem(props.id, { endDate: newDate })
      }
    },
    { cursor: 'ew-resize' },
  )
}
</script>

<template>
  <g>
    <rect
      :x="x"
      :y="barY()"
      :width="width"
      :height="barHeight"
      :fill="color"
      rx="3"
      class="bar"
      @click="interfaceStore.openItemViewer(id)"
    />
    <!-- Left (start date) resize handle -->
    <rect
      :x="x"
      :y="barY()"
      :width="HANDLE_WIDTH"
      :height="barHeight"
      fill="transparent"
      class="bar-edge-handle"
      @mousedown="startEdgeDrag($event, 'start')"
    />
    <!-- Right (end date) resize handle -->
    <rect
      :x="x + width - HANDLE_WIDTH"
      :y="barY()"
      :width="HANDLE_WIDTH"
      :height="barHeight"
      fill="transparent"
      class="bar-edge-handle"
      @mousedown="startEdgeDrag($event, 'end')"
    />
  </g>
</template>

<style scoped>
.bar {
  cursor: pointer;

  &:hover {
    opacity: 0.85;
  }
}

.bar-edge-handle {
  cursor: ew-resize;
}
</style>
