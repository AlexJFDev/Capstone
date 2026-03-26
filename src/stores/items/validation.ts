import { isValidItemId, type Item } from "@/types"
import type { Ref } from "vue"

export function useItemsValidation(items: Ref<Record<string, Item>>) {
  function doesItemExist(id: string): boolean {
    isValidItemId(id)
    return id in items.value
  }

  function validateItemExists(id: string) {
    if (!doesItemExist(id)) {
      throw new Error(`Unknown item id: "${id}"`)
    }
  }

  return { doesItemExist, validateItemExists }
}
