import { getSettings, makeDefaultSettings, putSettings } from "@/db"
import { defineStore } from "pinia"
import { computed, ref } from "vue"
import { useWorkspacesStore } from "./workspaces"
import type { RoadmapInterval, RoadmapScale } from "@/components/roadmap/roadmap-utils"
import { DEFAULT_INTERVAL, DEFAULT_LIST_WIDTH, DEFAULT_PIXELS_PER_DAY } from "@/components/roadmap/constants"

export type SortOption = 'custom' | 'startDate' | 'endDate' | 'name'
export type SortDirection = 'asc' | 'desc'

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
  const roadmapScale = computed<RoadmapScale>(() => {
    return {
      pixelsPerDay: pixelsPerDay.value,
      headerLabel: (date: Date) => 
        date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      gridInterval: gridInterval.value
    }
  })
  const roadmapListWidth = ref<number>(DEFAULT_LIST_WIDTH)
  const roadmapListWidthPx = computed(() => `${roadmapListWidth.value}px`)
  // Sorting
  const sortOption = ref<SortOption>('custom')
  const sortDirection = ref<SortDirection>('asc')
  function setSortOption(option: SortOption) { sortOption.value = option }
  function setSortDirection(direction: SortDirection) { sortDirection.value = direction }
  const sortingIsCustom = computed(() => sortOption.value === 'custom')
  const sortDirectionIsAscending = computed(() => sortDirection.value === 'asc')

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

  async function updateRoadmapScale(scale: RoadmapScale) {
    pixelsPerDay.value = scale.pixelsPerDay
    gridInterval.value = scale.gridInterval
    await putSettings({
      pixelsPerDay: scale.pixelsPerDay,
      gridInterval: scale.gridInterval
    })
  }

  async function updateRoadmapListWidth(width: number) {
    roadmapListWidth.value = width
    await putSettings({ roadmapListWidth: width })
  }


  /* === PANEL STATES ===*/
  // Settings
  const settingsOpen = ref(false)
  function openSettings() { settingsOpen.value = true }
  function closeSettings() { settingsOpen.value = false }
  // Workspaces list
  const workspacesOpen = ref(false)
  function openWorkspaces() {
    workspacesOpen.value = true
  }
  function closeWorkspaces() {
    workspacesOpen.value = false
  }
  // Workspace editor
  const workspaceEditorOpen = ref(false)
  const editingWorkspaceId = ref<string | undefined>()
  function openWorkspaceEditor(workspaceId: string) {
    editingWorkspaceId.value = workspaceId
    workspaceEditorOpen.value = true
  }
  function openWorkspaceCreator() {
    editingWorkspaceId.value = undefined
    workspaceEditorOpen.value = true
  }
  function closeWorkspaceEditor() {
    editingWorkspaceId.value = undefined
    workspaceEditorOpen.value = false
  }
  // Item viewer
  const itemViewerOpen = ref(false)
  const viewingItemId = ref<string | undefined>()
  function openItemViewer(itemId: string) {
    viewingItemId.value = itemId
    itemViewerOpen.value = true
  }
  function closeItemViewer() {
    viewingItemId.value = undefined
    itemViewerOpen.value = false
  }
  // Item editor
  const itemEditorOpen = ref(false)
  const editingItemId = ref<string | undefined>()
  function openItemEditor(itemId: string) {
    editingItemId.value = itemId
    itemEditorOpen.value = true
  }
  function closeItemEditor() {
    resolveItemCreator(null)
    editingItemId.value = undefined
    itemEditorOpen.value = false
  }

  let itemCreatorResolve: ((id: string | null) => void) | null = null
  function openItemCreator(): Promise<string | null> {
    editingItemId.value = ''
    itemEditorOpen.value = true
    return new Promise(resolve => {
      itemCreatorResolve = resolve
    })
  }
  function resolveItemCreator(id: string | null) {
    itemCreatorResolve?.(id)
    itemCreatorResolve = null
  }
  // Speedbump
  const speedbumpOpen = ref(false)
  const speedbumpMessage = ref('')
  let speedbumpResolve: ((confirmed: boolean) => void) | null = null

  function confirm(message: string): Promise<boolean> {
    speedbumpMessage.value = message
    speedbumpOpen.value = true
    return new Promise((resolve) => {
      speedbumpResolve = resolve
    })
  }

  function resolveSpeedbump(confirmed: boolean) {
    speedbumpOpen.value = false
    speedbumpResolve?.(confirmed)
    speedbumpResolve = null
  }

  return {
    favoriteWorkspaceId,
    defaultWorkspaceId,
    workspacesOpen,
    openWorkspaces,
    closeWorkspaces,
    workspaceEditorOpen,
    editingWorkspaceId,
    openWorkspaceEditor,
    openWorkspaceCreator,
    closeWorkspaceEditor,
    itemViewerOpen,
    viewingItemId,
    openItemViewer,
    closeItemViewer,
    itemEditorOpen,
    editingItemId,
    openItemEditor,
    closeItemEditor,
    openItemCreator,
    resolveItemCreator,
    speedbumpOpen,
    speedbumpMessage,
    confirm,
    resolveSpeedbump,
    initializeInterface,
    setFavoriteWorkspace,
    roadmapScale,
    roadmapListWidthPx,
    roadmapListWidth,
    updateRoadmapScale,
    updateRoadmapListWidth,
    settingsOpen,
    openSettings,
    closeSettings,
    sortOption,
    sortDirection,
    setSortOption,
    setSortDirection,
    sortingIsCustom,
    sortDirectionIsAscending
  }
})
