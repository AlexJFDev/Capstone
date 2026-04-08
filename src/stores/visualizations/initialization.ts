// Loads all persisted visualizations from IndexedDB into the visualizations store on startup.
import { getAllVisualizations } from '@/db'
import type { Visualization } from '@/types/visualizations'
import type { Ref } from 'vue'

export function useVisualizationsInitialization(
  visualizations: Ref<Record<string, Visualization>>,
) {
  async function initializeVisualizations() {
    const storedVisualizations = await getAllVisualizations()
    Object.entries(storedVisualizations).forEach(([id, visualization]) => {
      visualizations.value[id] = visualization
    })
  }

  return { initializeVisualizations }
}
