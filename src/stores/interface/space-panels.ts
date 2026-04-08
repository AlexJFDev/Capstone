// Manages open/close state and editing context for the spaces and space editor panels.
import { useToggle } from '@vueuse/core'
import { ref } from 'vue'

export function useInterfaceSpacePanels() {
  const [spacesOpen, toggleSpaces] = useToggle(false)

  const spaceEditorOpen = ref(false)
  const editingSpaceId = ref<string | undefined>()
  function openSpaceEditor(spaceId: string) {
    editingSpaceId.value = spaceId
    spaceEditorOpen.value = true
  }
  function openSpaceCreator() {
    editingSpaceId.value = undefined
    spaceEditorOpen.value = true
  }
  function closeSpaceEditor() {
    editingSpaceId.value = undefined
    spaceEditorOpen.value = false
  }

  return {
    spacesOpen,
    toggleSpaces,
    spaceEditorOpen,
    editingSpaceId,
    openSpaceEditor,
    openSpaceCreator,
    closeSpaceEditor,
  }
}
