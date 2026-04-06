// Provides read-only accessor functions (getVisualization, getVisualizationName, getVisualizationType, getVisualizationSettings) for the visualizations store.
import type { Visualization, VisualizationSettings, VisualizationType } from '@/types/visualizations'
import type { Ref } from 'vue'

export function useVisualizationsAccessors(
  visualizations: Ref<Record<string, Visualization>>,
  validateVisualizationExists: (id: string) => void,
) {
  function getVisualization(id: string): Visualization {
    validateVisualizationExists(id)
    return visualizations.value[id]!
  }

  function getVisualizationName(id: string): string {
    return getVisualization(id).name
  }

  function getVisualizationType(id: string): VisualizationType {
    return getVisualization(id).type
  }

  function getVisualizationSettings(id: string): VisualizationSettings {
    return getVisualization(id).settings
  }

  return { getVisualization, getVisualizationName, getVisualizationType, getVisualizationSettings }
}
