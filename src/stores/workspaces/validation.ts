import { isValidWorkspaceId, type Workspace } from '@/types'
import type { Ref } from 'vue'

export function useWorkspacesValidation(workspaces: Ref<Record<string, Workspace>>) {
  function doesWorkspaceExist(id: string): boolean {
    isValidWorkspaceId(id)
    return id in workspaces.value
  }

  function validateWorkspaceExists(id: string) {
    if (!doesWorkspaceExist(id)) {
      throw new Error(`Unknown workspace id: "${id}"`)
    }
  }

  return { doesWorkspaceExist, validateWorkspaceExists }
}
