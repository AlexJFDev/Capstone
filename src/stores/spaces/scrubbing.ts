// Removes stale collection and visualization IDs (referencing deleted entities) from space membership lists and persists the cleaned space.
import { putSpace } from '@/db'
import type { Space } from '@/types/spaces'
import type { Ref } from 'vue'
import { useCollectionsStore } from '../collections'
import { useVisualizationsStore } from '../visualizations'

export function useSpacesScrubbing(
  spaces: Ref<Record<string, Space>>,
  getSpace: (id: string) => Space,
  validateSpaceExists: (id: string) => void,
) {
  function scrubSpace(id: string) {
    validateSpaceExists(id)

    const collectionsStore = useCollectionsStore()
    const visualizationsStore = useVisualizationsStore()
    const space = getSpace(id)

    const validWorkspaceIds = space.collectionIds.filter((collectionId) =>
      collectionsStore.doesCollectionExist(collectionId),
    )
    const validVisualizationIds = space.visualizationIds.filter((visualizationId) =>
      visualizationsStore.doesVisualizationExist(visualizationId),
    )

    const workspaceIdsChanged = validWorkspaceIds.length !== space.collectionIds.length
    const visualizationIdsChanged = validVisualizationIds.length !== space.visualizationIds.length

    if (workspaceIdsChanged || visualizationIdsChanged) {
      spaces.value[id]!.collectionIds = validWorkspaceIds
      spaces.value[id]!.visualizationIds = validVisualizationIds
      putSpace(id, getSpace(id))
    }
  }

  function scrubAllSpaces() {
    for (const id of Object.keys(spaces.value)) {
      scrubSpace(id)
    }
  }

  return { scrubSpace, scrubAllSpaces }
}
