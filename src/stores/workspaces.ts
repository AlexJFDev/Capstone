import { workspaces as dummyWorkspaces } from "@/testing/dummy-workspaces"
import { constructEmptyWorkspace, validateItemKey, validateWorkspaceKey, type Workspace } from "@/types"
import { validateColor } from "@/utils/colors"
import { defineStore } from "pinia"
import { computed, ref } from "vue"

export const useWorkspacesStore = defineStore('workspaces', () => {
  const workspaces = ref<Record<string, Workspace>>({})
  const workspaceKeys = computed(() => Object.keys(workspaces.value))
  const hasWorkspaces = computed(() => workspaceKeys.value.length > 0)

  function initializeWorkspaces() {
    // Will need to be updated when IndexedDB is added
    // For now, basically simulating loading
    Object.entries(dummyWorkspaces).forEach(([key, workspace]) => {
      addWorkspace(key, workspace)
    })
  }

  function addWorkspace(key: string, workspace: Workspace) {
    validateWorkspaceKey(key)
    workspaces.value[key] = workspace
  }

  function getWorkspace(key: string): Workspace {
    validateWorkspaceKey(key)
    return workspaces.value[key]!
  }

  function updateWorkspace(key: string, updates: Partial<Workspace>) {
    validateWorkspaceKey(key)
    if (!(key in workspaces.value)) {
      throw new Error(`Unknown workspace key: "${key}"`)
    }
    if (updates.color) {
      validateColor(updates.color)
    }
    if (updates.items) {
      updates.items.forEach(validateItemKey)
    }

    Object.assign(workspaces.value[key]!, updates)
  }

  function getWorkspaceName(key: string): string {
    return getWorkspace(key).name
  }

  function moveItem(workspaceId: string, itemId: string, amount: number) {
    validateWorkspaceKey(workspaceId)
    if (!(workspaceId in workspaces.value)) {
      throw new Error(`Unknown workspace key: "${workspaceId}"`)
    }

    validateItemKey(itemId)
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

  return {
    initializeWorkspaces,
    addWorkspace,
    getWorkspace,
    workspaceKeys,
    updateWorkspace,
    getWorkspaceName,
    moveItem,
    hasWorkspaces
  }
})