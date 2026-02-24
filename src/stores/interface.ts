import { defineStore } from "pinia"
import { ref } from "vue"

export const useInterfaceStore = defineStore('panels', () => {
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
    openItemEditor
  }
})