// Provides doesCollectionExist and validateWorkspaceExists helpers for the workspaces store.
import { isValidWorkspaceId, type Workspace } from '@/types/collections'
import type { Ref } from 'vue'

export function useWorkspacesValidation(workspaces: Ref<Record<string, Workspace>>) {
  function doesCollectionExist(id: string): boolean {
    isValidWorkspaceId(id)
    return id in workspaces.value
  }

  function validateWorkspaceExists(id: string) {
    if (!doesCollectionExist(id)) {
      throw new Error(`Unknown workspace id: "${id}"`)
    }
  }

  return { doesCollectionExist, validateWorkspaceExists }
}
