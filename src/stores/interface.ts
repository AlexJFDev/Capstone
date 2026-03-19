import { getSettings } from "@/db"
import { defineStore } from "pinia"
import { computed, ref } from "vue"
import { useWorkspacesStore } from "./workspaces"

export const useInterfaceStore = defineStore('interface', () => {
  let restoredWorkspaceId: string | undefined | null
  const defaultWorkspaceId = computed(() => {
    const workspacesStore = useWorkspacesStore()

    if (!workspacesStore.hasWorkspaces) return undefined
    if (
      !restoredWorkspaceId||
      !workspacesStore.doesWorkspaceExist(restoredWorkspaceId)
    ) {
      return workspacesStore.workspaceIds[0]
    } else {
      return restoredWorkspaceId
    }
  })
  async function initializeInterface() {
    const settings = await getSettings()
    restoredWorkspaceId = settings?.lastViewedWorkspaceId
  }

  const workspacesOpen = ref(false)
  function openWorkspaces() {
    workspacesOpen.value = true
  }
  function closeWorkspaces() {
    workspacesOpen.value = false
  }

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
    initializeInterface
  }

})