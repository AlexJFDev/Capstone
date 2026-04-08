// Loads all persisted collections from IndexedDB into the collections store on startup.
import { getAllCollections } from '@/db'
import type { Collection } from '@/types/collections'
import type { Ref } from 'vue'

export function useCollectionsInitialization(collections: Ref<Record<string, Collection>>) {
  async function initializeCollections() {
    const storedCollections = await getAllCollections()
    Object.entries(storedCollections).forEach(([id, collection]) => {
      collections.value[id] = collection
    })
  }

  return { initializeCollections }
}
