// Provides addItem, updateItem, and deleteItem mutations for the items store, with validation and DB persistence.
import { putItem, removeItem } from '@/db'
import { validateItemId, type Item } from '@/types/items'
import { validateColor } from '@/utils/colors'
import { validateRange } from '@/utils/dates'
import type { Ref } from 'vue'
import { useCollectionsStore } from '../collections'

export function useItemsMutations(
  items: Ref<Record<string, Item>>,
  getItem: (id: string) => Item,
  validateItemExists: (id: string) => void,
  getStartDate: (id: string) => Date,
  getEndDate: (id: string) => Date,
) {
  function addItem(id: string, item: Item) {
    validateItemId(id)
    items.value[id] = item
    putItem(id, items.value[id]!)
  }

  function updateItem(id: string, updates: Partial<Item>) {
    validateItemExists(id)

    if (updates.color) {
      validateColor(updates.color)
    }
    if (updates.startDate && updates.endDate) {
      validateRange({ start: updates.startDate, end: updates.endDate })
    } else if (updates.startDate) {
      validateRange({ start: updates.startDate, end: getEndDate(id) })
    } else if (updates.endDate) {
      validateRange({ start: getStartDate(id), end: updates.endDate })
    }

    Object.assign(getItem(id), updates)
    putItem(id, getItem(id))
  }

  function deleteItem(id: string) {
    validateItemExists(id)

    const collectionsStore = useCollectionsStore()

    for (const workspaceId of collectionsStore.workspaceIds) {
      collectionsStore.removeItemFromWorkspace(id, workspaceId)
    }

    delete items.value[id]
    removeItem(id)
  }

  return { addItem, updateItem, deleteItem }
}
