// Loads persisted app settings into the interface store on startup and exposes setFavoriteCollection.
import { getSettings, makeDefaultSettings, putSettings } from '@/db'
import type { RoadmapInterval } from '@/components/roadmap/roadmap-utils'
import type { Ref } from 'vue'

export function useInterfaceInitialization(
  favoriteCollectionId: Ref<string | null>,
  pixelsPerDay: Ref<number>,
  gridInterval: Ref<RoadmapInterval>,
  roadmapListWidth: Ref<number>,
) {
  async function initializeInterface() {
    const settings = (await getSettings()) || makeDefaultSettings()

    favoriteCollectionId.value = settings.favoriteCollectionId
    pixelsPerDay.value = settings.pixelsPerDay
    gridInterval.value = settings.gridInterval
    roadmapListWidth.value = settings.roadmapListWidth
  }

  async function setFavoriteCollection(id: string | null) {
    favoriteCollectionId.value = id
    await putSettings({ favoriteCollectionId: id })
  }

  return { initializeInterface, setFavoriteCollection }
}
