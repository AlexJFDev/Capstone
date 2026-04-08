// Derives reactive roadmap scale and list-width state and persists updates to IndexedDB via the interface store.
// When activeVisualizationId is set and refers to a roadmap visualization, settings are saved to that
// visualization instead of global AppSettings.
import { putSettings } from '@/db'
import type { RoadmapInterval, RoadmapScale } from '@/components/roadmap/roadmap-utils'
import type { Ref } from 'vue'
import { computed } from 'vue'
import { useVisualizationsStore } from '../visualizations'
import type { RoadmapSettings } from '@/types/settings/roadmap'

// Saves partial roadmap settings to the active visualization; returns true when saved to a visualization.
function saveToActiveVisualization(vizId: string, updates: Partial<RoadmapSettings>): boolean {
  const visualizationsStore = useVisualizationsStore()
  if (!visualizationsStore.doesVisualizationExist(vizId)) return false
  const current = visualizationsStore.getVisualizationSettings(vizId) as RoadmapSettings
  visualizationsStore.updateVisualization(vizId, { settings: { ...current, ...updates } })
  return true
}

export function useInterfaceRoadmap(
  pixelsPerDay: Ref<number>,
  gridInterval: Ref<RoadmapInterval>,
  roadmapListWidth: Ref<number>,
  activeVisualizationId: Ref<string | null>,
) {
  const roadmapScale = computed<RoadmapScale>(() => ({
    pixelsPerDay: pixelsPerDay.value,
    headerLabel: (date: Date) =>
      date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    gridInterval: gridInterval.value,
  }))
  const roadmapListWidthPx = computed(() => `${roadmapListWidth.value}px`)

  async function updateRoadmapScale(scale: RoadmapScale) {
    pixelsPerDay.value = scale.pixelsPerDay
    gridInterval.value = scale.gridInterval
    const vizId = activeVisualizationId.value
    if (
      vizId &&
      saveToActiveVisualization(vizId, {
        pixelsPerDay: scale.pixelsPerDay,
        gridInterval: scale.gridInterval,
      })
    )
      return
    await putSettings({ pixelsPerDay: scale.pixelsPerDay, gridInterval: scale.gridInterval })
  }

  async function updateRoadmapListWidth(width: number) {
    roadmapListWidth.value = width
    const vizId = activeVisualizationId.value
    if (vizId && saveToActiveVisualization(vizId, { roadmapListWidth: width })) return
    await putSettings({ roadmapListWidth: width })
  }

  return { roadmapScale, roadmapListWidthPx, updateRoadmapScale, updateRoadmapListWidth }
}
