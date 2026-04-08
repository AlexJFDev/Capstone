// Loads all persisted workspaces from IndexedDB into the workspaces store on startup.
import { getAllWorkspaces } from '@/db'
import type { Workspace } from '@/types/collections'
import type { Ref } from 'vue'

export function useWorkspacesInitialization(workspaces: Ref<Record<string, Workspace>>) {
  async function initializeCollections() {
    const storedWorkspaces = await getAllWorkspaces()
    Object.entries(storedWorkspaces).forEach(([id, workspace]) => {
      workspaces.value[id] = workspace
    })
  }

  return { initializeCollections }
}
