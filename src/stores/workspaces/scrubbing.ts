import { putWorkspace } from "@/db"
import type { Workspace } from "@/types"
import type { Ref } from "vue"
import { useItemsStore } from "../items"

export function useWorkspacesScrubbing(
  workspaces: Ref<Record<string, Workspace>>,
  getWorkspace: (id: string) => Workspace,
  validateWorkspaceExists: (id: string) => void
) {
  function scrubWorkspace(id: string) {
    validateWorkspaceExists(id)
    const itemsStore = useItemsStore()
    const workspace = getWorkspace(id)
    const validItems = workspace.items.filter(itemId => itemsStore.doesItemExist(itemId))
    if (validItems.length !== workspace.items.length) {
      workspaces.value[id]!.items = validItems
      putWorkspace(id, getWorkspace(id))
    }
  }

  function scrubAllWorkspaces() {
    for (const id of Object.keys(workspaces.value)) {
      scrubWorkspace(id)
    }
  }

  return { scrubWorkspace, scrubAllWorkspaces }
}
