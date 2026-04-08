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

  const { doesCollectionExist, validateWorkspaceExists } = useCollectionsValidation(workspaces)
  const { initializeCollections } = useCollectionsInitialization(workspaces)
  const { getWorkspace, getWorkspaceName } = useCollectionsAccessors(
    workspaces,
    validateWorkspaceExists,
  )
  const { addWorkspace, updateWorkspace, deleteWorkspace } = useCollectionsMutations(
    workspaces,
    getWorkspace,
    validateWorkspaceExists,
  )
  const { scrubWorkspace, scrubAllCollections } = useCollectionsScrubbing(
    workspaces,
    getWorkspace,
    validateWorkspaceExists,
  )
  const { moveItem, addItemToWorkspace, removeItemFromWorkspace } = useCollectionsMembership(
    workspaces,
    getWorkspace,
    validateWorkspaceExists,
  )

  return {
    collectionIds,
    hasCollections,
    initializeCollections,
    doesCollectionExist,
    validateWorkspaceExists,
    getWorkspace,
    getWorkspaceName,
    addWorkspace,
    updateWorkspace,
    deleteWorkspace,
    scrubWorkspace,
    scrubAllCollections,
    addItemToWorkspace,
    moveItem,
    removeItemFromWorkspace,
  }
})
