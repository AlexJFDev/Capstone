// Provides addWorkspace, updateWorkspace, and deleteWorkspace mutations for the workspaces store, with validation and DB persistence.
import { putWorkspace, removeWorkspace } from '@/db'
import { validateCollectionId, type Workspace } from '@/types/collections'
import { validateColor } from '@/utils/colors'
import type { Ref } from 'vue'
import { useItemsStore } from '../items'

export function useWorkspacesMutations(
  workspaces: Ref<Record<string, Workspace>>,
  getWorkspace: (id: string) => Workspace,
  validateWorkspaceExists: (id: string) => void,
) {
  function addWorkspace(id: string, workspace: Workspace) {
    validateCollectionId(id)
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

  function deleteWorkspace(collectionId: string) {
    validateWorkspaceExists(collectionId)

    delete workspaces.value[collectionId]
    removeWorkspace(collectionId)
  }

  return { addWorkspace, updateWorkspace, deleteWorkspace }
}
