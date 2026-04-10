// Tracks the active visualization in a SpaceView and syncs per-visualization roadmap settings into
// the shared roadmap refs when the active visualization changes.
import { ref, watch } from 'vue'
import { useVisualizationsStore } from '../visualizations'
import type { RoadmapSettings } from '@/types/settings/roadmap'
import type { RoadmapInterval } from '@/components/roadmap/roadmap-utils'
import type { Ref } from 'vue'

export function useInterfaceActiveVisualization(
  pixelsPerDay: Ref<number>,
  gridInterval: Ref<RoadmapInterval>,
  roadmapListWidth: Ref<number>,
) {
  const activeVisualizationId = ref<string | null>(null)

  watch(activeVisualizationId, (newId) => {
    if (!newId) return
    const visualizationsStore = useVisualizationsStore()
    if (!visualizationsStore.doesVisualizationExist(newId)) return
    if (visualizationsStore.getVisualizationType(newId) !== 'roadmap') return
    const settings = visualizationsStore.getVisualizationSettings(newId) as RoadmapSettings
    pixelsPerDay.value = settings.pixelsPerDay
    gridInterval.value = settings.gridInterval
    roadmapListWidth.value = settings.roadmapListWidth
  })

  function setActiveVisualization(id: string | null) {
    activeVisualizationId.value = id
  }

  return { activeVisualizationId, setActiveVisualization }
}
