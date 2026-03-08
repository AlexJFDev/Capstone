import { items as dummyItems } from "@/testing/dummy-items"
import { constructEmptyItem, validateItemKey, type Item } from "@/types"
import { validateColor } from "@/utils/colors"
import { validateRange } from "@/utils/dates"
import { defineStore } from "pinia"
import { computed, ref } from "vue"

export const useItemsStore = defineStore('items', () => {
  const items = ref<Record<string, Item>>({})
  const itemKeys = computed(() => Object.keys(items.value))

  function initializeItems() {
    // Will need to be updated when IndexedDB is added
    // For now, basically simulating loading
    Object.entries(dummyItems).forEach(([key, item]) => {
      item.startDate = new Date(item.startDate)
      item.endDate = new Date(item.endDate)

      addItem(key, item)
    })
  }

  function addItem(key: string, item: Item) {
    validateItemKey(key)
    items.value[key] = item
  }

  function getItem(key: string): Item {
    validateItemKey(key)
    return items.value[key]!
  }

  function getItems(keys: string[]): Item[] {
    return keys.map(getItem)
  }
  
  function getName(key: string): string {
    return getItem(key).name
  }

  function getColor(key: string): string {
    return getItem(key).color
  }

  function getStartDate(key: string): Date {
    return getItem(key).startDate
  }

  function getEndDate(key: string): Date {
    return getItem(key).endDate
  }

  function addNewItem() {
    const key = `i-${crypto.randomUUID()}`
    const item = constructEmptyItem()

    addItem(key, item)

    return { key, item }
  }

  function updateItem(key: string, updates: Partial<Item>) {
    validateItemKey(key)
    if (!(key in items.value)) {
      throw new Error(`Unknown item key: "${key}"`)
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
        end: getEndDate(key)
      })
    } else if (updates.endDate) {
      // Just end date being set
      validateRange({
        start: getStartDate(key),
        end: updates.endDate
      })
    }

    Object.assign(getItem(key), updates)
  }

  return {
    itemKeys,
    initializeItems,
    addItem,
    addNewItem,
    getItem,
    getItems,
    getName,
    getColor,
    updateItem
  }
})