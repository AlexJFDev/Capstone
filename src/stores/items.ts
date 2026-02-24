import { items as dummyItems } from "@/testing/dummy-items"
import { constructEmptyItem, isValidItemKey, type Item } from "@/types"
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
    if (!isValidItemKey(key)) {
      throw new Error(`Invalid item key: "${key}"`)
    }
    items.value[key] = item
  }

  function getItem(key: string): Item {
    if (!isValidItemKey(key)) {
      throw new Error(`Invalid item key: "${key}"`)
    }
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

  return {
    items,
    initializeItems,
    addItem,
    addNewItem,
    getItem,
    getItems,
    getName,
    getColor
  }
})