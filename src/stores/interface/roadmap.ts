// Derives reactive roadmap scale and list-width state and persists updates to IndexedDB via the interface store.
import { putSettings } from '@/db'
import type { RoadmapInterval, RoadmapScale } from '@/components/roadmap/roadmap-utils'
import type { Ref } from 'vue'
import { computed } from 'vue'

export function useInterfaceRoadmap(
  pixelsPerDay: Ref<number>,
  gridInterval: Ref<RoadmapInterval>,
  roadmapListWidth: Ref<number>,
) {
  const roadmapScale = computed<RoadmapScale>(() => {
    return {
      pixelsPerDay: pixelsPerDay.value,
      headerLabel: (date: Date) =>
        date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      gridInterval: gridInterval.value,
    }
  })
  const roadmapListWidthPx = computed(() => `${roadmapListWidth.value}px`)

  async function updateRoadmapScale(scale: RoadmapScale) {
    pixelsPerDay.value = scale.pixelsPerDay
    gridInterval.value = scale.gridInterval
    await putSettings({
      pixelsPerDay: scale.pixelsPerDay,
      gridInterval: scale.gridInterval,
    })
  }

  async function updateRoadmapListWidth(width: number) {
    roadmapListWidth.value = width
    await putSettings({ roadmapListWidth: width })
  }

  return { roadmapScale, roadmapListWidthPx, updateRoadmapScale, updateRoadmapListWidth }
}
