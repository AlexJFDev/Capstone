// Loads all persisted workspaces from IndexedDB into the workspaces store on startup.
import { getAllWorkspaces } from '@/db'
import type { Workspace } from '@/types/collections'
import type { Ref } from 'vue'

export function useCollectionsInitialization(collections: Ref<Record<string, Workspace>>) {
  async function initializeCollections() {
    const storedCollections = await getAllWorkspaces()
    Object.entries(storedCollections).forEach(([id, collection]) => {
      collections.value[id] = collection
    })
  }

  return { initializeCollections }
}
