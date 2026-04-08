// Removes stale item IDs (referencing deleted items) from collection item lists and persists the cleaned collection.
import { putCollection } from '@/db'
import type { Collection } from '@/types/collections'
import type { Ref } from 'vue'
import { useItemsStore } from '../items'

export function useCollectionsScrubbing(
  collections: Ref<Record<string, Collection>>,
  getCollection: (id: string) => Collection,
  validateCollectionExists: (id: string) => void,
) {
  function scrubCollection(id: string) {
    validateCollectionExists(id)
    const itemsStore = useItemsStore()
    const collection = getCollection(id)
    const validItems = collection.items.filter((itemId) => itemsStore.doesItemExist(itemId))
    if (validItems.length !== collection.items.length) {
      collections.value[id]!.items = validItems
      putCollection(id, getCollection(id))
    }
  }

  function scrubAllCollections() {
    for (const id of Object.keys(collections.value)) {
      scrubCollection(id)
    }
  }

  return { scrubCollection, scrubAllCollections }
}
