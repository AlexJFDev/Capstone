import { defineStore } from "pinia"
import { computed, ref } from "vue"
import type { Workspace } from "@/types"
import { useWorkspacesInitialization } from "./initialization"
import { useWorkspacesValidation } from "./validation"
import { useWorkspacesAccessors } from "./accessors"
import { useWorkspacesMutations } from "./mutations"
import { useWorkspacesMembership } from "./workspace-membership"
import { useWorkspacesScrubbing } from "./scrubbing"

export const useWorkspacesStore = defineStore('workspaces', () => {
  const workspaces = ref<Record<string, Workspace>>({})
  const workspaceIds = computed(() => Object.keys(workspaces.value))
  const hasWorkspaces = computed(() => workspaceIds.value.length > 0)

  const { doesWorkspaceExist, validateWorkspaceExists } = useWorkspacesValidation(workspaces)
  const { initializeWorkspaces } = useWorkspacesInitialization(workspaces)
  const { getWorkspace, getWorkspaceName } = useWorkspacesAccessors(workspaces, validateWorkspaceExists)
  const { addWorkspace, updateWorkspace, deleteWorkspace } =
    useWorkspacesMutations(workspaces, getWorkspace, validateWorkspaceExists)
  const { scrubWorkspace, scrubAllWorkspaces } =
    useWorkspacesScrubbing(workspaces, getWorkspace, validateWorkspaceExists)
  const { moveItem, addItemToWorkspace, removeItemFromWorkspace } =
    useWorkspacesMembership(workspaces, getWorkspace, validateWorkspaceExists)

  return {
    workspaceIds,
    hasWorkspaces,
    initializeWorkspaces,
    doesWorkspaceExist,
    validateWorkspaceExists,
    getWorkspace,
    getWorkspaceName,
    addWorkspace,
    updateWorkspace,
    deleteWorkspace,
    scrubWorkspace,
    scrubAllWorkspaces,
    addItemToWorkspace,
    moveItem,
    removeItemFromWorkspace
  }
})
