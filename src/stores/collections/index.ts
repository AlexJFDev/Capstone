// Pinia store for collections: composes validation, initialization, accessor, mutation, membership, and scrubbing sub-modules.
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Collection } from '@/types/collections'
import { useCollectionsInitialization } from './initialization'
import { useCollectionsValidation } from './validation'
import { useCollectionsAccessors } from './accessors'
import { useCollectionsMutations } from './mutations'
import { useCollectionsMembership } from './collection-membership'
import { useCollectionsScrubbing } from './scrubbing'

export const useCollectionsStore = defineStore('collections', () => {
  const collections = ref<Record<string, Collection>>({})
  const collectionIds = computed(() => Object.keys(collections.value))
  const hasCollections = computed(() => collectionIds.value.length > 0)

  const { doesCollectionExist, validateCollectionExists } = useCollectionsValidation(collections)
  const { initializeCollections } = useCollectionsInitialization(collections)
  const { getCollection, getCollectionName } = useCollectionsAccessors(
    collections,
    validateCollectionExists,
  )
  const { addCollection, updateCollection, deleteCollection } = useCollectionsMutations(
    collections,
    getCollection,
    validateCollectionExists,
  )
  const { scrubCollection, scrubAllCollections } = useCollectionsScrubbing(
    collections,
    getCollection,
    validateCollectionExists,
  )
  const { moveItem, addItemToCollection, removeItemFromCollection } = useCollectionsMembership(
    collections,
    getCollection,
    validateCollectionExists,
  )

  return {
    collectionIds,
    hasCollections,
    initializeCollections,
    doesCollectionExist,
    validateCollectionExists,
    getCollection,
    getCollectionName,
    addCollection,
    updateCollection,
    deleteCollection,
    scrubCollection,
    scrubAllCollections,
    addItemToCollection,
    moveItem,
    removeItemFromCollection,
  }
})
