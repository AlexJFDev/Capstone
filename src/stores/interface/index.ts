import { defineStore } from "pinia"
import { computed, ref } from "vue"
import { DEFAULT_INTERVAL, DEFAULT_LIST_WIDTH, DEFAULT_PIXELS_PER_DAY } from "@/components/roadmap/constants"
import type { RoadmapInterval } from "@/components/roadmap/roadmap-utils"
import { useWorkspacesStore } from "../workspaces"
import { useInterfaceInitialization } from "./initialization"
import { useInterfaceRoadmap } from "./roadmap"
import { useInterfaceSorting } from "./sorting"
import { useInterfacePanels } from "./panels"
import { useInterfaceItemPanels } from "./item-panels"
import { useInterfaceSpeedbump } from "./speedbump"

export type { SortOption, SortDirection } from "./sorting"

export const useInterfaceStore = defineStore('interface', () => {
  const favoriteWorkspaceId = ref<string | null>(null)
  const defaultWorkspaceId = computed(() => {
    const workspacesStore = useWorkspacesStore()

    if (!workspacesStore.hasWorkspaces) return
    if (
      favoriteWorkspaceId.value &&
      workspacesStore.doesWorkspaceExist(favoriteWorkspaceId.value)
    ) {
      return favoriteWorkspaceId.value
    }
    return workspacesStore.workspaceIds[0]
  })

  const pixelsPerDay = ref<number>(DEFAULT_PIXELS_PER_DAY)
  const gridInterval = ref<RoadmapInterval>(DEFAULT_INTERVAL)
  const roadmapListWidth = ref<number>(DEFAULT_LIST_WIDTH)

  const { initializeInterface, setFavoriteWorkspace, applyExternalSettings } =
    useInterfaceInitialization(favoriteWorkspaceId, pixelsPerDay, gridInterval, roadmapListWidth)
  const { roadmapScale, roadmapListWidthPx, updateRoadmapScale, updateRoadmapListWidth } =
    useInterfaceRoadmap(pixelsPerDay, gridInterval, roadmapListWidth)
  const sorting = useInterfaceSorting()
  const panels = useInterfacePanels()
  const itemPanels = useInterfaceItemPanels()
  const speedbump = useInterfaceSpeedbump()

  return {
    favoriteWorkspaceId,
    defaultWorkspaceId,
    initializeInterface,
    setFavoriteWorkspace,
    applyExternalSettings,
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
