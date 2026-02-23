import { workspaces as dummyWorkspaces } from "@/testing/dummy-workspaces"
import { constructEmptyWorkspace, type Workspace } from "@/types"
import { defineStore } from "pinia"
import { ref } from "vue"

const WORKSPACE_UUID_REGEX = /^w-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const useWorkspacesStore = defineStore('workspaces', () => {
  const workspaces = ref<Record<string, Workspace>>({})

  function initializeWorkspaces() {
    // Will need to be updated when IndexedDB is added
    // For now, basically simulating loading
    Object.entries(dummyWorkspaces).forEach(([key, workspace]) => {
      addWorkspace(key, workspace)
    })
    dummyWorkspaces
  }

  function addWorkspace(key: string, workspace: Workspace) {
    if (!WORKSPACE_UUID_REGEX.test(key)) {
      throw new Error(`Invalid workspace key: "${key}"`)
    }
    workspaces.value[key] = workspace
  }

  function addNewWorkspace() {
    const key = `w-${crypto.randomUUID()}`
    const workspace = constructEmptyWorkspace()

    addWorkspace(key, workspace)

    return { key, workspace }
  }

  return {
    workspaces,
    initializeWorkspaces,
    addWorkspace,
    addNewWorkspace
  }
})