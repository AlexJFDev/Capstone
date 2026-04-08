// Provides moveItem, addItemToCollection, and removeItemFromCollection operations for managing workspace item membership.
import { putWorkspace } from '@/db'
import type { Collection } from '@/types/collections'
import type { Ref } from 'vue'
import { useItemsStore } from '../items'

// oxlint-disable-next-line max-lines-per-function
export function useCollectionsMembership(
  collections: Ref<Record<string, Collection>>,
  getCollection: (id: string) => Collection,
  validateCollectionExists: (id: string) => void,
) {
  function moveItem(collectionId: string, itemId: string, amount: number) {
    validateCollectionExists(collectionId)

    const itemsStore = useItemsStore()
    itemsStore.validateItemExists(itemId)

    const items = collections.value[collectionId]!.items
    const index = items.indexOf(itemId)
    if (index === -1) {
      throw new Error(`Item "${itemId}" not found in collection "${collectionId}"`)
    }

    const newIndex = index + amount
    if (newIndex < 0) {
      throw new Error(`Cannot move item before the start of the list`)
    }
    if (newIndex >= items.length) {
      throw new Error(`Cannot move item past the end of the list`)
    }

    items.splice(index, 1)
    items.splice(newIndex, 0, itemId)
    putWorkspace(collectionId, getCollection(collectionId))
  }

  function addItemToCollection(itemId: string, collectionId: string) {
    const itemsStore = useItemsStore()

    itemsStore.validateItemExists(itemId)
    validateCollectionExists(collectionId)

    const collection = getCollection(collectionId)

    if (collection.items.includes(itemId)) return

    collection.items.push(itemId)
    putWorkspace(collectionId, getCollection(collectionId))
  }

  function removeItemFromCollection(itemId: string, collectionId: string) {
    const itemsStore = useItemsStore()

    itemsStore.validateItemExists(itemId)
    validateCollectionExists(collectionId)

    const collection = getCollection(collectionId)
    const index = collection.items.indexOf(itemId)

    if (index === -1) return

    collection.items.splice(index, 1)
    putWorkspace(collectionId, getCollection(collectionId))
  }

  return { moveItem, addItemToCollection, removeItemFromCollection }
}
