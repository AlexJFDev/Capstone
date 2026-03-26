import { getAllItems, putItem, removeItem } from "@/db"
import { isValidItemId, validateItemId, type Item } from "@/types"
import { validateColor } from "@/utils/colors"
import { validateRange } from "@/utils/dates"
import { defineStore } from "pinia"
import { computed, ref } from "vue"
import { useWorkspacesStore } from "./workspaces"

export const useItemsStore = defineStore('items', () => {
  const items = ref<Record<string, Item>>({})
  const itemIds = computed(() => Object.keys(items.value))

  async function initializeItems() {
    const storedItems = await getAllItems()
    Object.entries(storedItems).forEach(([id, item]) => items.value[id] = item)
  }

  function doesItemExist(id: string): boolean {
    isValidItemId(id)
    return id in items.value
  }

  function validateItemExists(id: string) {
    if (!doesItemExist(id)) {
      throw new Error(`Unknown item id: "${id}"`)
    }
  }

  function addItem(id: string, item: Item) {
    validateItemId(id)
    items.value[id] = item
    putItem(id, items.value[id]!)
  }

  function getItem(id: string): Item {
    validateItemExists(id)
    return items.value[id]!
  }

  function getItems(ids: string[]): Item[] {
    return ids.map(getItem)
  }

  function getName(id: string): string {
    return getItem(id).name
  }

  function getColor(id: string): string {
    return getItem(id).color
  }

  function getStartDate(id: string): Date {
    return getItem(id).startDate
  }

  function getEndDate(id: string): Date {
    return getItem(id).endDate
  }

  function updateItem(id: string, updates: Partial<Item>) {
    validateItemExists(id)

    if (updates.color) {
      validateColor(updates.color)
    }
    if (updates.startDate && updates.endDate) {
      // Start and end dates being set
      validateRange({
        start: updates.startDate,
        end: updates.endDate
      })
    }
    else if (updates.startDate) {
      // Just start date being set
      validateRange({
        start: updates.startDate,
        end: getEndDate(id)
      })
    } else if (updates.endDate) {
      // Just end date being set
      validateRange({
        start: getStartDate(id),
        end: updates.endDate
      })
    }

    Object.assign(getItem(id), updates)
    putItem(id, getItem(id))
  }

  function deleteItem(id: string) {
    validateItemExists(id)

    const workspacesStore = useWorkspacesStore()

    for (const workspaceId of workspacesStore.workspaceIds) {
      workspacesStore.removeItemFromWorkspace(id, workspaceId)
    }

    delete items.value[id]
    removeItem(id)
  }

  return {
    itemIds,
    initializeItems,
    addItem,
    getItem,
    getItems,
    getName,
    getColor,
    getStartDate,
    getEndDate,
    updateItem,
    doesItemExist,
    validateItemExists,
    deleteItem
  }
})
