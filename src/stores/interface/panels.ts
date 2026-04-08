// Manages open/close state and editing context for the settings, collections, and collection editor panels.
import { useToggle } from '@vueuse/core'
import { ref } from 'vue'

export function useInterfacePanels() {
  const [settingsOpen, toggleSettings] = useToggle(false)

  const [collectionsOpen, toggleCollections] = useToggle(false)

  const collectionEditorOpen = ref(false)
  const editingCollectionId = ref<string | undefined>()
  function openCollectionEditor(collectionId: string) {
    editingCollectionId.value = collectionId
    collectionEditorOpen.value = true
  }
  function openCollectionCreator() {
    editingCollectionId.value = undefined
    collectionEditorOpen.value = true
  }
  function closeWorkspaceEditor() {
    editingCollectionId.value = undefined
    collectionEditorOpen.value = false
  }

  return {
    settingsOpen,
    toggleSettings,
    collectionsOpen,
    toggleCollections,
    collectionEditorOpen,
    editingCollectionId,
    openCollectionEditor,
    openCollectionCreator,
    closeWorkspaceEditor,
  }
}
