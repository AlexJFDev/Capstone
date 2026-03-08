import { workspaces as dummyWorkspaces } from "@/testing/dummy-workspaces"
import { constructEmptyWorkspace, validateItemId, validateWorkspaceId, type Workspace } from "@/types"
import { validateColor } from "@/utils/colors"
import { defineStore } from "pinia"
import { computed, ref } from "vue"

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

  function addWorkspace(id: string, workspace: Workspace) {
    validateWorkspaceId(id)
    workspaces.value[id] = workspace
  }

  function getWorkspace(id: string): Workspace {
    validateWorkspaceId(id)
    return workspaces.value[id]!
  }

  function updateWorkspace(id: string, updates: Partial<Workspace>) {
    validateWorkspaceId(id)
    if (!(id in workspaces.value)) {
      throw new Error(`Unknown workspace id: "${id}"`)
    }
    if (updates.color) {
      validateColor(updates.color)
    }
    if (updates.items) {
      updates.items.forEach(validateItemId)
    }

    Object.assign(workspaces.value[id]!, updates)
  }

  function getWorkspaceName(id: string): string {
    return getWorkspace(id).name
  }

  function moveItem(workspaceId: string, itemId: string, amount: number) {
    validateWorkspaceId(workspaceId)
    if (!(workspaceId in workspaces.value)) {
      throw new Error(`Unknown workspace id: "${workspaceId}"`)
    }

    validateItemId(itemId)
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
    workspaceIds,
    updateWorkspace,
    getWorkspaceName,
    moveItem,
    hasWorkspaces
  }
})
