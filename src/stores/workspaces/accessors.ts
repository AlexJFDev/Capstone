// Provides getWorkspace and getWorkspaceName read-only accessors for the workspaces store.
import type { Workspace } from '@/types/workspaces'
import type { Ref } from 'vue'

export function useWorkspacesAccessors(
  workspaces: Ref<Record<string, Workspace>>,
  validateWorkspaceExists: (id: string) => void,
) {
  function getWorkspace(id: string): Workspace {
    validateWorkspaceExists(id)
    return workspaces.value[id]!
  }

  function getWorkspaceName(id: string): string {
    return getWorkspace(id).name
  }

  return { getWorkspace, getWorkspaceName }
}
