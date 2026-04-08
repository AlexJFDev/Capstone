// Provides addCollection, updateCollection, and deleteCollection mutations for the workspaces store, with validation and DB persistence.
import { putWorkspace, removeWorkspace } from '@/db'
import { validateCollectionId, type Workspace } from '@/types/collections'
import { validateColor } from '@/utils/colors'
import type { Ref } from 'vue'
import { useItemsStore } from '../items'

export function useCollectionsMutations(
  workspaces: Ref<Record<string, Workspace>>,
  getCollection: (id: string) => Workspace,
  validateCollectionExists: (id: string) => void,
) {
  function addCollection(id: string, workspace: Workspace) {
    validateCollectionId(id)
    workspaces.value[id] = workspace
    putWorkspace(id, workspaces.value[id]!)
  }

  function updateCollection(id: string, updates: Partial<Workspace>) {
    validateCollectionExists(id)

    if (updates.color) {
      validateColor(updates.color)
    }
    if (updates.items) {
      const itemsStore = useItemsStore()
      updates.items.forEach(itemsStore.validateItemExists)
    }

    Object.assign(workspaces.value[id]!, updates)
    putWorkspace(id, getCollection(id))
  }

  function deleteCollection(collectionId: string) {
    validateCollectionExists(collectionId)

    delete workspaces.value[collectionId]
    removeWorkspace(collectionId)
  }

  return { addCollection, updateCollection, deleteCollection }
}
