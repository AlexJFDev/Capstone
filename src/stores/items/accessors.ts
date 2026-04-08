// Provides read-only accessor functions (getItem, getName, getColor, getStartDate, getEndDate) for the items store.
import type { Item } from '@/types/items'
import type { Ref } from 'vue'

export function useItemsAccessors(
  items: Ref<Record<string, Item>>,
  validateItemExists: (id: string) => void,
) {
  function getItem(id: string): Item {
    validateItemExists(id)
    return items.value[id]!
  }

  function getItems(ids: string[]): Item[] {
    return ids.map((id) => getItem(id))
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

  return { getItem, getItems, getName, getColor, getStartDate, getEndDate }
}
