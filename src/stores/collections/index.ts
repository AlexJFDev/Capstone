// Pinia store for workspaces: composes validation, initialization, accessor, mutation, membership, and scrubbing sub-modules.
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Workspace } from '@/types/collections'
import { useWorkspacesInitialization } from './initialization'
import { useWorkspacesValidation } from './validation'
import { useWorkspacesAccessors } from './accessors'
import { useWorkspacesMutations } from './mutations'
import { useWorkspacesMembership } from './collection-membership'
import { useWorkspacesScrubbing } from './scrubbing'

export const useCollectionsStore = defineStore('workspaces', () => {
  const workspaces = ref<Record<string, Workspace>>({})
  const collectionIds = computed(() => Object.keys(workspaces.value))
  const hasCollections = computed(() => collectionIds.value.length > 0)

  const { doesCollectionExist, validateWorkspaceExists } = useWorkspacesValidation(workspaces)
  const { initializeCollections } = useWorkspacesInitialization(workspaces)
  const { getWorkspace, getWorkspaceName } = useWorkspacesAccessors(
    workspaces,
    validateWorkspaceExists,
  )
  const { addWorkspace, updateWorkspace, deleteWorkspace } = useWorkspacesMutations(
    workspaces,
    getWorkspace,
    validateWorkspaceExists,
  )
  const { scrubWorkspace, scrubAllCollections } = useWorkspacesScrubbing(
    workspaces,
    getWorkspace,
    validateWorkspaceExists,
  )
  const { moveItem, addItemToWorkspace, removeItemFromWorkspace } = useWorkspacesMembership(
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
