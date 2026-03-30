// Loads all persisted items from IndexedDB into the items store on startup.
import { getAllItems } from '@/db'
import type { Item } from '@/types'
import type { Ref } from 'vue'

export function useItemsInitialization(items: Ref<Record<string, Item>>) {
  async function initializeItems() {
    const storedItems = await getAllItems()
    Object.entries(storedItems).forEach(([id, item]) => (items.value[id] = item))
  }

  return { initializeItems }
}
