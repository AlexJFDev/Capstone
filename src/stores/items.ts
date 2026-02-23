import { items as dummyItems } from "@/testing/dummy-items"
import { constructEmptyItem, type Item } from "@/types"
import { defineStore } from "pinia"
import { ref } from "vue"

const ITEM_UUID_REGEX = /^i-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const useItemsStore = defineStore('items', () => {
  const items = ref<Record<string, Item>>({})

  function initializeItems() {
    // Will need to be updated when IndexedDB is added
    // For now, basically simulating loading
    Object.entries(dummyItems).forEach(([key, item]) => {
      item["start-date"] = new Date(item['start-date'])
      item["end-date"] = new Date(item['end-date'])
      
      addItem(key, item)
    })
    dummyItems
  }

  function addItem(key: string, item: Item) {
    if (!ITEM_UUID_REGEX.test(key)) {
      throw new Error(`Invalid item key: "${key}"`)
    }
    items.value[key] = item
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
    addNewItem
  }
})