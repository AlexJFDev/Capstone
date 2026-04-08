// Pinia store for workspaces: composes validation, initialization, accessor, mutation, membership, and scrubbing sub-modules.
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Workspace } from '@/types/collections'
import { useCollectionsInitialization } from './initialization'
import { useCollectionsValidation } from './validation'
import { useCollectionsAccessors } from './accessors'
import { useCollectionsMutations } from './mutations'
import { useCollectionsMembership } from './collection-membership'
import { useCollectionsScrubbing } from './scrubbing'

export const useCollectionsStore = defineStore('workspaces', () => {
  const workspaces = ref<Record<string, Workspace>>({})
  const collectionIds = computed(() => Object.keys(workspaces.value))
  const hasCollections = computed(() => collectionIds.value.length > 0)

  const { doesCollectionExist, validateCollectionExists } = useCollectionsValidation(workspaces)
  const { initializeCollections } = useCollectionsInitialization(workspaces)
  const { getCollection, getCollectionName } = useCollectionsAccessors(
    workspaces,
    validateCollectionExists,
  )
  const { addCollection, updateCollection, deleteCollection } = useCollectionsMutations(
    workspaces,
    getCollection,
    validateCollectionExists,
  )
  const { scrubCollection, scrubAllCollections } = useCollectionsScrubbing(
    workspaces,
    getCollection,
    validateCollectionExists,
  )
  const { moveItem, addItemToCollection, removeItemFromCollection } = useCollectionsMembership(
    workspaces,
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
