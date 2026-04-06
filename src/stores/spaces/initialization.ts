// Loads all persisted spaces from IndexedDB into the spaces store on startup.
// DB wiring will be added when getAllSpaces is available in the persistence layer.
import type { Space } from '@/types/spaces'
import type { Ref } from 'vue'

export function useSpacesInitialization(_spaces: Ref<Record<string, Space>>) {
  // oxlint-disable-next-line consistent-function-scoping
  function initializeSpaces() {}

  return { initializeSpaces }
}
