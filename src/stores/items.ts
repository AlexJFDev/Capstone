import { items as dummyItems } from "@/testing/dummy-items"
import { constructEmptyItem, validateItemId, type Item } from "@/types"
import { validateColor } from "@/utils/colors"
import { validateRange } from "@/utils/dates"
import { defineStore } from "pinia"
import { computed, ref } from "vue"

export const useItemsStore = defineStore('items', () => {
  const items = ref<Record<string, Item>>({})
  const itemIds = computed(() => Object.keys(items.value))

  function initializeItems() {
    // Will need to be updated when IndexedDB is added
    // For now, basically simulating loading
    Object.entries(dummyItems).forEach(([id, item]) => {
      item.startDate = new Date(item.startDate)
      item.endDate = new Date(item.endDate)

      addItem(id, item)
    })
  }

  function addItem(id: string, item: Item) {
    validateItemId(id)
    items.value[id] = item
  }

  function getItem(id: string): Item {
    validateItemId(id)
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
    validateItemId(id)
    if (!(id in items.value)) {
      throw new Error(`Unknown item id: "${id}"`)
    }
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
  }

  return {
    items,
    itemIds,
    initializeItems,
    addItem,
    getItem,
    getItems,
    getName,
    getColor,
    updateItem
  }
})
