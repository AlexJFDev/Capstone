import { defineStore } from "pinia"
import { ref } from "vue"

export const useInterfaceStore = defineStore('panels', () => {
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
    editingItemId.value = ''
    itemEditorOpen.value = false
  }
  function openItemCreator() {
    editingItemId.value = ''
    itemEditorOpen.value = true
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
    workspacesOpen,
    openWorkspaces,
    closeWorkspaces,
    workspaceEditorOpen,
    editingWorkspaceId,
    openWorkspaceEditor,
    closeWorkspaceEditor,
    itemViewerOpen,
    viewingItemId,
    openItemViewer,
    closeItemViewer,
    itemEditorOpen,
    editingItemId,
    openItemEditor,
    closeItemEditor,
    speedbumpOpen,
    speedbumpMessage,
    confirm,
    resolveSpeedbump,
    openItemCreator
  }
})