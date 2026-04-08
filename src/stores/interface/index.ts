// Pinia store for UI state: composes roadmap scale, sorting, panel visibility, item panels, speedbump, and settings persistence.
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  DEFAULT_INTERVAL,
  DEFAULT_LIST_WIDTH,
  DEFAULT_PIXELS_PER_DAY,
} from '@/components/roadmap/constants'
import type { RoadmapInterval } from '@/components/roadmap/roadmap-utils'
import { useCollectionsStore } from '../collections'
import { useInterfaceInitialization } from './initialization'
import { useInterfaceRoadmap } from './roadmap'
import { useInterfaceSorting } from './sorting'
import { useInterfacePanels } from './panels'
import { useInterfaceItemPanels } from './item-panels'
import { useInterfaceSpeedbump } from './speedbump'

export type { SortOption, SortDirection } from './sorting'

export const useInterfaceStore = defineStore('interface', () => {
  const favoriteCollectionId = ref<string | null>(null)
  const defaultCollectionId = computed(() => {
    const collectionsStore = useCollectionsStore()

    if (!collectionsStore.hasCollections) return
    if (
      favoriteCollectionId.value &&
      collectionsStore.doesCollectionExist(favoriteCollectionId.value)
    ) {
      return favoriteCollectionId.value
    }
    return collectionsStore.collectionIds[0]
  })

  const pixelsPerDay = ref<number>(DEFAULT_PIXELS_PER_DAY)
  const gridInterval = ref<RoadmapInterval>(DEFAULT_INTERVAL)
  const roadmapListWidth = ref<number>(DEFAULT_LIST_WIDTH)

  const { initializeInterface, setFavoriteCollection } = useInterfaceInitialization(
    favoriteCollectionId,
    pixelsPerDay,
    gridInterval,
    roadmapListWidth,
  )
  const { roadmapScale, roadmapListWidthPx, updateRoadmapScale, updateRoadmapListWidth } =
    useInterfaceRoadmap(pixelsPerDay, gridInterval, roadmapListWidth)
  const sorting = useInterfaceSorting()
  const panels = useInterfacePanels()
  const itemPanels = useInterfaceItemPanels()
  const speedbump = useInterfaceSpeedbump()

  return {
    favoriteCollectionId,
    defaultCollectionId,
    initializeInterface,
    setFavoriteCollection,
    roadmapScale,
    roadmapListWidthPx,
    roadmapListWidth,
    updateRoadmapScale,
    updateRoadmapListWidth,
    ...sorting,
    ...panels,
    ...itemPanels,
    ...speedbump,
  }
})
