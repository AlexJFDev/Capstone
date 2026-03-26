import { putWorkspace } from "@/db"
import type { Workspace } from "@/types"
import type { Ref } from "vue"
import { useItemsStore } from "../items"

export function useWorkspacesItemManagement(
  workspaces: Ref<Record<string, Workspace>>,
  getWorkspace: (id: string) => Workspace,
  validateWorkspaceExists: (id: string) => void
) {
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

  return { moveItem, removeItemFromWorkspace }
}
