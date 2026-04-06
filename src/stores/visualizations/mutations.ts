// Provides addVisualization, updateVisualization, and deleteVisualization mutations for the visualizations store.
// DB persistence will be added when putVisualization and removeVisualization are available in the persistence layer.
import { validateVisualizationId, type Visualization } from '@/types/visualizations'
import type { Ref } from 'vue'
import { useSpacesStore } from '../spaces'

export function useVisualizationsMutations(
  visualizations: Ref<Record<string, Visualization>>,
  getVisualization: (id: string) => Visualization,
  validateVisualizationExists: (id: string) => void,
) {
  function addVisualization(id: string, visualization: Visualization) {
    validateVisualizationId(id)
    visualizations.value[id] = visualization
  }

  function updateVisualization(id: string, updates: Partial<Visualization>) {
    validateVisualizationExists(id)
    Object.assign(getVisualization(id), updates)
  }

  function deleteVisualization(id: string) {
    validateVisualizationExists(id)

    const spacesStore = useSpacesStore()
    for (const spaceId of spacesStore.spaceIds) {
      spacesStore.removeVisualizationFromSpace(id, spaceId)
    }

    delete visualizations.value[id]
  }

  return { addVisualization, updateVisualization, deleteVisualization }
}
