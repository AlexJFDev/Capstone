import { workspaces as dummyWorkspaces } from "@/testing/dummy-workspaces"
import { constructEmptyWorkspace, validateColor, validateItemKey, validateWorkspaceKey, type Workspace } from "@/types"
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
    validateWorkspaceKey(key)
    workspaces.value[key] = workspace
  }

  function getWorkspace(key: string): Workspace {
    validateWorkspaceKey(key)
    return workspaces.value[key]!
  }

  function addNewWorkspace() {
    const key = `w-${crypto.randomUUID()}`
    const workspace = constructEmptyWorkspace()

    addWorkspace(key, workspace)

    return { key, workspace }
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

  return {
    initializeWorkspaces,
    addWorkspace,
    addNewWorkspace,
    getWorkspace,
    workspaceKeys,
    updateWorkspace,
    getWorkspaceName
  }
})