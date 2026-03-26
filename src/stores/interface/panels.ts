import { ref } from "vue"

export function useInterfacePanels() {
  const settingsOpen = ref(false)
  function openSettings() { settingsOpen.value = true }
  function closeSettings() { settingsOpen.value = false }

  const workspacesOpen = ref(false)
  function openWorkspaces() { workspacesOpen.value = true }
  function closeWorkspaces() { workspacesOpen.value = false }

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
    openSettings,
    closeSettings,
    workspacesOpen,
    openWorkspaces,
    closeWorkspaces,
    workspaceEditorOpen,
    editingWorkspaceId,
    openWorkspaceEditor,
    openWorkspaceCreator,
    closeWorkspaceEditor
  }
}
