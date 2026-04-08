// Provides doesCollectionExist and validateCollectionExists helpers for the collections store.
import { isValidCollectionId, type Workspace } from '@/types/collections'
import type { Ref } from 'vue'

export function useCollectionsValidation(collections: Ref<Record<string, Workspace>>) {
  function doesCollectionExist(id: string): boolean {
    isValidCollectionId(id)
    return id in collections.value
  }

  function validateCollectionExists(id: string) {
    if (!doesCollectionExist(id)) {
      throw new Error(`Unknown collection id: "${id}"`)
    }
  }

  return { doesCollectionExist, validateCollectionExists }
}
