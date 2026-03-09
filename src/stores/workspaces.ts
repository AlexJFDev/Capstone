import { workspaces as dummyWorkspaces } from "@/testing/dummy-workspaces"
import { validateWorkspaceId, type Workspace } from "@/types"
import { validateColor } from "@/utils/colors"
import { defineStore } from "pinia"
import { computed, ref } from "vue"
import { useItemsStore } from "./items"

export const useWorkspacesStore = defineStore('workspaces', () => {
  const workspaces = ref<Record<string, Workspace>>({})
  const workspaceIds = computed(() => Object.keys(workspaces.value))
  const hasWorkspaces = computed(() => workspaceIds.value.length > 0)

  function initializeWorkspaces() {
    // Will need to be updated when IndexedDB is added
    // For now, basically simulating loading
    Object.entries(dummyWorkspaces).forEach(([id, workspace]) => {
      addWorkspace(id, workspace)
    })
  }

  function doesWorkspaceExist(id: string): boolean {
    validateWorkspaceId(id)
    return id in workspaces.value
  }

  function validateWorkspaceExists(id: string) {
    if (!doesWorkspaceExist(id)) {
      throw new Error(`Unknown workspace id: "${id}"`)
    }
  }

  function addWorkspace(id: string, workspace: Workspace) {
    validateWorkspaceId(id)
    workspaces.value[id] = workspace
  }

  function getWorkspace(id: string): Workspace {
    validateWorkspaceExists(id)
    return workspaces.value[id]!
  }

  function updateWorkspace(id: string, updates: Partial<Workspace>) {
    validateWorkspaceExists(id)
    
    if (updates.color) {
      validateColor(updates.color)
    }
    if (updates.items) {
      const itemsStore = useItemsStore()
      updates.items.forEach(itemsStore.validateItemExists)
    }

    Object.assign(workspaces.value[id]!, updates)
  }

  function getWorkspaceName(id: string): string {
    return getWorkspace(id).name
  }

  function moveItem(workspaceId: string, itemId: string, amount: number) {
    validateWorkspaceExists(workspaceId)

    const itemsStore = useItemsStore()
    itemsStore.validateItemExists(itemId)

    const items = workspaces.value[workspaceId]!.items
    const index = items.indexOf(itemId)
    if (index === -1) {
      throw new Error(`Item "${itemId}" not found in workspace "${workspaceId}"`)
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
  }

  function removeItemFromWorkspace(itemId: string, workspaceId: string) {
    const itemsStore = useItemsStore()

    itemsStore.validateItemExists(itemId)
    validateWorkspaceExists(workspaceId)

    const workspace = getWorkspace(workspaceId)
    const index = workspace.items.indexOf(itemId)

    if (index === -1) return

    workspace.items.splice(index, 1)
  }

  function deleteWorkspace(workspaceId: string) {
    validateWorkspaceExists(workspaceId)

    delete workspaces.value[workspaceId]
  }

  return {
    initializeWorkspaces,
    addWorkspace,
    getWorkspace,
    workspaceIds,
    updateWorkspace,
    getWorkspaceName,
    moveItem,
    hasWorkspaces,
    doesWorkspaceExist,
    validateWorkspaceExists,
    removeItemFromWorkspace
  }
})
