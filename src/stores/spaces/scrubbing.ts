// Removes stale workspace and visualization IDs (referencing deleted entities) from space membership lists and persists the cleaned space.
// DB persistence will be added when putSpace is available in the persistence layer.
import type { Space } from '@/types/spaces'
import type { Ref } from 'vue'
import { useWorkspacesStore } from '../workspaces'
import { useVisualizationsStore } from '../visualizations'

export function useSpacesScrubbing(
  spaces: Ref<Record<string, Space>>,
  getSpace: (id: string) => Space,
  validateSpaceExists: (id: string) => void,
) {
  function scrubSpace(id: string) {
    validateSpaceExists(id)

    const workspacesStore = useWorkspacesStore()
    const visualizationsStore = useVisualizationsStore()
    const space = getSpace(id)

    const validWorkspaceIds = space.workspaceIds.filter((workspaceId) =>
      workspacesStore.doesWorkspaceExist(workspaceId),
    )
    const validVisualizationIds = space.visualizationIds.filter((visualizationId) =>
      visualizationsStore.doesVisualizationExist(visualizationId),
    )

    const workspaceIdsChanged = validWorkspaceIds.length !== space.workspaceIds.length
    const visualizationIdsChanged = validVisualizationIds.length !== space.visualizationIds.length

    if (workspaceIdsChanged || visualizationIdsChanged) {
      spaces.value[id]!.workspaceIds = validWorkspaceIds
      spaces.value[id]!.visualizationIds = validVisualizationIds
    }
  }

  function scrubAllSpaces() {
    for (const id of Object.keys(spaces.value)) {
      scrubSpace(id)
    }
  }

  return { scrubSpace, scrubAllSpaces }
}
