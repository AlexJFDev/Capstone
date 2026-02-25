import { defineStore } from "pinia"
import { ref } from "vue"
import { useWorkspacesStore } from "./workspaces"
import { validateWorkspaceKey } from "@/types"

export const useInterfaceStore = defineStore('panels', () => {
  const workspacesStore = useWorkspacesStore()

  const activeWorkspace = ref(workspacesStore.workspaceKeys[0]!)
  function setActiveWorkspace(key: string) {
    validateWorkspaceKey(key)
    activeWorkspace.value = key
  }

  const workspacesOpen = ref(false)
  function openWorkspaces() {
    workspacesOpen.value = true
  }

  const workspaceEditorOpen = ref(false)
  const editingWorkspaceId = ref<string | undefined>()
  function openWorkspaceEditor(workspaceId: string) {
    editingWorkspaceId.value = workspaceId
    workspaceEditorOpen.value = true
  }

  const itemViewerOpen = ref(false)
  const viewingItemId = ref<string | undefined>()
  function openItemViewer(itemId: string) {
    viewingItemId.value = itemId
    itemViewerOpen.value = true
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
    workspaceEditorOpen,
    editingWorkspaceId,
    openWorkspaceEditor,
    itemViewerOpen,
    viewingItemId,
    openItemViewer,
    itemEditorOpen,
    editingItemId,
    openItemEditor,
    activeWorkspace,
    setActiveWorkspace,
    closeItemEditor,
    speedbumpOpen,
    speedbumpMessage,
    confirm,
    resolveSpeedbump
  }
})