// Provides getCollection and getCollectionName read-only accessors for the collections store.
import type { Collection } from '@/types/collections'
import type { Ref } from 'vue'

export function useCollectionsAccessors(
  collections: Ref<Record<string, Collection>>,
  validateCollectionExists: (id: string) => void,
) {
  function getCollection(id: string): Collection {
    validateCollectionExists(id)
    return collections.value[id]!
  }

  function getCollectionName(id: string): string {
    return getCollection(id).name
  }

  return { getCollection, getCollectionName }
}
