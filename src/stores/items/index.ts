import { defineStore } from "pinia"
import { computed, ref } from "vue"
import type { Item } from "@/types"
import { useItemsInitialization } from "./initialization"
import { useItemsValidation } from "./validation"
import { useItemsAccessors } from "./accessors"
import { useItemsMutations } from "./mutations"

export const useItemsStore = defineStore('items', () => {
  const items = ref<Record<string, Item>>({})
  const itemIds = computed(() => Object.keys(items.value))

  const { doesItemExist, validateItemExists } = useItemsValidation(items)
  const { initializeItems } = useItemsInitialization(items)
  const { getItem, getItems, getName, getColor, getStartDate, getEndDate } =
    useItemsAccessors(items, validateItemExists)
  const { addItem, updateItem, deleteItem } =
    useItemsMutations(items, getItem, validateItemExists, getStartDate, getEndDate)

  function applyExternalPut(id: string, item: Item) {
    items.value[id] = item
  }

  function applyExternalRemove(id: string) {
    delete items.value[id]
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
    deleteItem,
    applyExternalPut,
    applyExternalRemove
  }
})
