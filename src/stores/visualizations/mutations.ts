// Provides addVisualization, updateVisualization, and deleteVisualization mutations for the visualizations store, with validation and DB persistence.
import { putVisualization, removeVisualization } from '@/db'
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
    putVisualization(id, visualizations.value[id]!)
  }

  function updateVisualization(id: string, updates: Partial<Visualization>) {
    validateVisualizationExists(id)
    Object.assign(getVisualization(id), updates)
    putVisualization(id, getVisualization(id))
  }

  function deleteVisualization(id: string) {
    validateVisualizationExists(id)

    const spacesStore = useSpacesStore()
    for (const spaceId of spacesStore.spaceIds) {
      spacesStore.removeVisualizationFromSpace(id, spaceId)
    }

    delete visualizations.value[id]
    removeVisualization(id)
  }

  return { addVisualization, updateVisualization, deleteVisualization }
}
