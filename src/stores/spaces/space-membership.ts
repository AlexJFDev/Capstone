// Provides addWorkspaceToSpace, removeWorkspaceFromSpace, addVisualizationToSpace, and removeVisualizationFromSpace operations for managing space membership.
import { putSpace } from '@/db'
import type { Space } from '@/types/spaces'
import type { Ref } from 'vue'
import { useWorkspacesStore } from '../collections'
import { useVisualizationsStore } from '../visualizations'

// oxlint-disable-next-line max-lines-per-function
export function useSpacesMembership(
  spaces: Ref<Record<string, Space>>,
  getSpace: (id: string) => Space,
  validateSpaceExists: (id: string) => void,
) {
  function addWorkspaceToSpace(workspaceId: string, spaceId: string) {
    const workspacesStore = useWorkspacesStore()

    workspacesStore.validateWorkspaceExists(workspaceId)
    validateSpaceExists(spaceId)

    const space = getSpace(spaceId)

    if (space.workspaceIds.includes(workspaceId)) return

    space.workspaceIds.push(workspaceId)
    putSpace(spaceId, getSpace(spaceId))
  }

  function removeWorkspaceFromSpace(workspaceId: string, spaceId: string) {
    const workspacesStore = useWorkspacesStore()

    workspacesStore.validateWorkspaceExists(workspaceId)
    validateSpaceExists(spaceId)

    const space = getSpace(spaceId)
    const index = space.workspaceIds.indexOf(workspaceId)

    if (index === -1) return

    space.workspaceIds.splice(index, 1)
    putSpace(spaceId, getSpace(spaceId))
  }

  function addVisualizationToSpace(visualizationId: string, spaceId: string) {
    const visualizationsStore = useVisualizationsStore()

    visualizationsStore.validateVisualizationExists(visualizationId)
    validateSpaceExists(spaceId)

    const space = getSpace(spaceId)

    if (space.visualizationIds.includes(visualizationId)) return

    space.visualizationIds.push(visualizationId)
    putSpace(spaceId, getSpace(spaceId))
  }

  function removeVisualizationFromSpace(visualizationId: string, spaceId: string) {
    const visualizationsStore = useVisualizationsStore()

    visualizationsStore.validateVisualizationExists(visualizationId)
    validateSpaceExists(spaceId)

    const space = getSpace(spaceId)
    const index = space.visualizationIds.indexOf(visualizationId)

    if (index === -1) return

    space.visualizationIds.splice(index, 1)
    putSpace(spaceId, getSpace(spaceId))
  }

  return {
    addWorkspaceToSpace,
    removeWorkspaceFromSpace,
    addVisualizationToSpace,
    removeVisualizationFromSpace,
  }
}
