import { workspaces as dummyWorkspaces } from "@/testing/dummy-workspaces"
import { constructEmptyWorkspace, isValidColor, isValidItemKey, isValidWorkspaceKey, type Workspace } from "@/types"
import { defineStore } from "pinia"
import { computed, ref } from "vue"

export const useWorkspacesStore = defineStore('workspaces', () => {
  const workspaces = ref<Record<string, Workspace>>({})
  const workspaceKeys = computed(() => Object.keys(workspaces.value))

  function initializeWorkspaces() {
    // Will need to be updated when IndexedDB is added
    // For now, basically simulating loading
    Object.entries(dummyWorkspaces).forEach(([key, workspace]) => {
      addWorkspace(key, workspace)
    })
  }

  function addWorkspace(key: string, workspace: Workspace) {
    if (!isValidWorkspaceKey(key)) {
      throw new Error(`Invalid workspace key: "${key}"`)
    }
    workspaces.value[key] = workspace
  }

  function getWorkspace(key: string): Workspace {
    if (!isValidWorkspaceKey(key)) {
      throw new Error(`Invalid workspace key: "${key}"`)
    }
    return workspaces.value[key]!
  }

  function addNewWorkspace() {
    const key = `w-${crypto.randomUUID()}`
    const workspace = constructEmptyWorkspace()

    addWorkspace(key, workspace)

    return { key, workspace }
  }

  function updateWorkspace(key: string, updates: Partial<Workspace>) {
    if (!isValidWorkspaceKey(key)) {
      throw new Error(`Invalid workspace key: "${key}"`)
    }
    if (!(key in workspaces.value)) {
      throw new Error(`Unknown workspace key: "${key}"`)
    }
    if (updates.color && !isValidColor(updates.color)) {
      throw new Error(`Invalid color: "${updates.color}"`)
    }
    if (updates.items) {
      updates.items.forEach(
        itemId => {
          if (!isValidItemKey(itemId)) {
            throw new Error(`Invalid item key: "${itemId}"`)
          }
        }
      )
    }

    Object.assign(workspaces.value[key]!, updates)
  }

  return {
    initializeWorkspaces,
    addWorkspace,
    addNewWorkspace,
    getWorkspace,
    workspaceKeys,
    updateWorkspace
  }
})