import { getAllWorkspaces } from '@/db'
import type { Workspace } from '@/types'
import type { Ref } from 'vue'

export function useWorkspacesInitialization(workspaces: Ref<Record<string, Workspace>>) {
  async function initializeWorkspaces() {
    const storedWorkspaces = await getAllWorkspaces()
    Object.entries(storedWorkspaces).forEach(([id, workspace]) => {
      workspaces.value[id] = workspace
    })
  }

  return { initializeWorkspaces }
}
