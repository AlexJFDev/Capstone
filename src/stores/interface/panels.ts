// Manages open/close state and editing context for the settings, workspaces, and workspace editor panels.
import { useToggle } from '@vueuse/core'
import { ref } from 'vue'

export function useInterfacePanels() {
  const [ settingsOpen, toggleSettings ] = useToggle(false)

  const [ workspacesOpen, toggleWorkspaces ] = useToggle(false)

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

  return {
    settingsOpen,
    toggleSettings,
    workspacesOpen,
    toggleWorkspaces,
    workspaceEditorOpen,
    editingWorkspaceId,
    openWorkspaceEditor,
    openWorkspaceCreator,
    closeWorkspaceEditor,
  }
}
