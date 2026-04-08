// Removes stale item IDs (referencing deleted items) from workspace item lists and persists the cleaned workspace.
import { putWorkspace } from '@/db'
import type { Workspace } from '@/types/collections'
import type { Ref } from 'vue'
import { useItemsStore } from '../items'

export function useCollectionsScrubbing(
  workspaces: Ref<Record<string, Workspace>>,
  getCollection: (id: string) => Workspace,
  validateCollectionExists: (id: string) => void,
) {
  function scrubCollection(id: string) {
    validateCollectionExists(id)
    const itemsStore = useItemsStore()
    const workspace = getCollection(id)
    const validItems = workspace.items.filter((itemId) => itemsStore.doesItemExist(itemId))
    if (validItems.length !== workspace.items.length) {
      workspaces.value[id]!.items = validItems
      putWorkspace(id, getCollection(id))
    }
  }

  function scrubAllCollections() {
    for (const id of Object.keys(workspaces.value)) {
      scrubCollection(id)
    }
  }

  return { scrubCollection, scrubAllCollections }
}
