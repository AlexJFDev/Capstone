// Loads all persisted visualizations from IndexedDB into the visualizations store on startup.
// DB wiring will be added when getAllVisualizations is available in the persistence layer.
import type { Visualization } from '@/types/visualizations'
import type { Ref } from 'vue'

export function useVisualizationsInitialization(
  _visualizations: Ref<Record<string, Visualization>>,
) {
  // oxlint-disable-next-line consistent-function-scoping
  function initializeVisualizations() {}

  return { initializeVisualizations }
}
