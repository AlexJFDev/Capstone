import { getAllItems } from "@/db"
import type { Item } from "@/types"
import type { Ref } from "vue"

export function useItemsInitialization(items: Ref<Record<string, Item>>) {
  async function initializeItems() {
    items.value = await getAllItems()
  }

  return { initializeItems }
}
