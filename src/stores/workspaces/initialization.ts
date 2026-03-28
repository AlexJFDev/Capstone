import { getAllWorkspaces } from "@/db"
import type { Workspace } from "@/types"
import type { Ref } from "vue"

export function useWorkspacesInitialization(workspaces: Ref<Record<string, Workspace>>) {
  async function initializeWorkspaces() {
    workspaces.value = await getAllWorkspaces()
  }

  return { initializeWorkspaces }
}
