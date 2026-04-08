// Provides doesVisualizationExist and validateVisualizationExists helpers for the visualizations store.
import { isValidVisualizationId, type Visualization } from '@/types/visualizations'
import type { Ref } from 'vue'

export function useVisualizationsValidation(visualizations: Ref<Record<string, Visualization>>) {
  function doesVisualizationExist(id: string): boolean {
    isValidVisualizationId(id)
    return id in visualizations.value
  }

  function validateVisualizationExists(id: string) {
    if (!doesVisualizationExist(id)) {
      throw new Error(`Unknown visualization id: "${id}"`)
    }
  }

  return { doesVisualizationExist, validateVisualizationExists }
}
