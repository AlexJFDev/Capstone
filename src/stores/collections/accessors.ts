// Provides getCollection and getCollectionName read-only accessors for the workspaces store.
import type { Workspace } from '@/types/collections'
import type { Ref } from 'vue'

export function useCollectionsAccessors(
  workspaces: Ref<Record<string, Workspace>>,
  validateCollectionExists: (id: string) => void,
) {
  function getCollection(id: string): Workspace {
    validateCollectionExists(id)
    return workspaces.value[id]!
  }

  function getCollectionName(id: string): string {
    return getCollection(id).name
  }

  return { getCollection, getCollectionName }
}
