import { putWorkspace } from "@/db"
import type { Workspace } from "@/types"
import type { Ref } from "vue"
import { useItemsStore } from "../items"

export function useWorkspacesMembership(
  workspaces: Ref<Record<string, Workspace>>,
  getWorkspace: (id: string) => Workspace,
  validateWorkspaceExists: (id: string) => void
) {
  function addItemToWorkspace(itemId: string, workspaceId: string) {
    const itemsStore = useItemsStore()

    itemsStore.validateItemExists(itemId)
    validateWorkspaceExists(workspaceId)

    const workspace = getWorkspace(workspaceId)

    if (workspace.items.includes(itemId)) return

    workspace.items.push(itemId)
    putWorkspace(workspaceId, getWorkspace(workspaceId))
  }

  function removeItemFromWorkspace(itemId: string, workspaceId: string) {
    const itemsStore = useItemsStore()

    itemsStore.validateItemExists(itemId)
    validateWorkspaceExists(workspaceId)

    const workspace = getWorkspace(workspaceId)
    const index = workspace.items.indexOf(itemId)

    if (index === -1) return

    workspace.items.splice(index, 1)
    putWorkspace(workspaceId, getWorkspace(workspaceId))
  }

  return { addItemToWorkspace, removeItemFromWorkspace }
}
