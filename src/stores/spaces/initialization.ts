// Loads all persisted spaces from IndexedDB into the spaces store on startup.
import { getAllSpaces } from '@/db'
import type { Space } from '@/types/spaces'
import type { Ref } from 'vue'

export function useSpacesInitialization(spaces: Ref<Record<string, Space>>) {
  async function initializeSpaces() {
    const storedSpaces = await getAllSpaces()
    Object.entries(storedSpaces).forEach(([id, space]) => (spaces.value[id] = space))
  }

  return { initializeSpaces }
}
