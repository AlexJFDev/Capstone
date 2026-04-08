// Provides doesCollectionExist and validateWorkspaceExists helpers for the workspaces store.
import { isValidCollectionId, type Workspace } from '@/types/collections'
import type { Ref } from 'vue'

export function useCollectionsValidation(workspaces: Ref<Record<string, Workspace>>) {
  function doesCollectionExist(id: string): boolean {
    isValidCollectionId(id)
    return id in workspaces.value
  }

  function validateWorkspaceExists(id: string) {
    if (!doesCollectionExist(id)) {
      throw new Error(`Unknown workspace id: "${id}"`)
    }
  }

  return { doesCollectionExist, validateWorkspaceExists }
}
