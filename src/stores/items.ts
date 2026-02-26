import { items as dummyItems } from "@/testing/dummy-items"
import { constructEmptyItem, validateColor, validateItemKey, type Item } from "@/types"
import { defineStore } from "pinia"
import { computed, ref } from "vue"

export const useItemsStore = defineStore('items', () => {
  const items = ref<Record<string, Item>>({})
  const itemKeys = computed(() => Object.keys(items.value))

  function initializeItems() {
    // Will need to be updated when IndexedDB is added
    // For now, basically simulating loading
    Object.entries(dummyItems).forEach(([key, item]) => {
      item["start-date"] = new Date(item['start-date'])
      item["end-date"] = new Date(item['end-date'])

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
    if (updates["start-date"]) {
      console.log("TODO: Start date validation")
    }
    if (updates["end-date"]) {
      console.log("TODO: End date validation")
    }

    Object.assign(getItem(key), updates)
  }

  return {
    items,
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