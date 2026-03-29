import { putWorkspace, removeWorkspace } from '@/db'
import { validateWorkspaceId, type Workspace } from '@/types'
import { validateColor } from '@/utils/colors'
import type { Ref } from 'vue'
import { useItemsStore } from '../items'

export function useWorkspacesMutations(
  workspaces: Ref<Record<string, Workspace>>,
  getWorkspace: (id: string) => Workspace,
  validateWorkspaceExists: (id: string) => void,
) {
  function addWorkspace(id: string, workspace: Workspace) {
    validateWorkspaceId(id)
    workspaces.value[id] = workspace
    putWorkspace(id, workspaces.value[id]!)
  }

  function updateWorkspace(id: string, updates: Partial<Workspace>) {
    validateWorkspaceExists(id)

    if (updates.color) {
      validateColor(updates.color)
    }
    if (updates.items) {
      const itemsStore = useItemsStore()
      updates.items.forEach(itemsStore.validateItemExists)
    }

    Object.assign(workspaces.value[id]!, updates)
    putWorkspace(id, getWorkspace(id))
  }

  function deleteWorkspace(workspaceId: string) {
    validateWorkspaceExists(workspaceId)

    delete workspaces.value[workspaceId]
    removeWorkspace(workspaceId)
  }

  return { addWorkspace, updateWorkspace, deleteWorkspace }
}
