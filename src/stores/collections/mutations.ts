// Provides addCollection, updateCollection, and deleteCollection mutations for the collections store, with validation and DB persistence.
import { putCollection, removeCollection } from '@/db'
import { validateCollectionId, type Collection } from '@/types/collections'
import { validateColor } from '@/utils/colors'
import type { Ref } from 'vue'
import { useItemsStore } from '../items'

export function useCollectionsMutations(
  collections: Ref<Record<string, Collection>>,
  getCollection: (id: string) => Collection,
  validateCollectionExists: (id: string) => void,
) {
  function addCollection(id: string, collection: Collection) {
    validateCollectionId(id)
    collections.value[id] = collection
    putCollection(id, collections.value[id]!)
  }

  function updateCollection(id: string, updates: Partial<Collection>) {
    validateCollectionExists(id)

    if (updates.color) {
      validateColor(updates.color)
    }
    if (updates.items) {
      const itemsStore = useItemsStore()
      updates.items.forEach(itemsStore.validateItemExists)
    }

    Object.assign(collections.value[id]!, updates)
    putCollection(id, getCollection(id))
  }

  function deleteCollection(collectionId: string) {
    validateCollectionExists(collectionId)

    delete collections.value[collectionId]
    removeCollection(collectionId)
  }

  return { addCollection, updateCollection, deleteCollection }
}
