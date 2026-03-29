import { getSettings, makeDefaultSettings, putSettings } from '@/db'
import type { RoadmapInterval } from '@/components/roadmap/roadmap-utils'
import type { Ref } from 'vue'

export function useInterfaceInitialization(
  favoriteWorkspaceId: Ref<string | null>,
  pixelsPerDay: Ref<number>,
  gridInterval: Ref<RoadmapInterval>,
  roadmapListWidth: Ref<number>,
) {
  async function initializeInterface() {
    const settings = (await getSettings()) || makeDefaultSettings()

    favoriteWorkspaceId.value = settings.favoriteWorkspaceId
    pixelsPerDay.value = settings.pixelsPerDay
    gridInterval.value = settings.gridInterval
    roadmapListWidth.value = settings.roadmapListWidth
  }

  async function setFavoriteWorkspace(id: string | null) {
    favoriteWorkspaceId.value = id
    await putSettings({ favoriteWorkspaceId: id })
  }

  return { initializeInterface, setFavoriteWorkspace }
}
