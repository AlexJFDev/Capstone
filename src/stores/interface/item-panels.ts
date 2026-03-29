import { ref } from 'vue'

export function useInterfaceItemPanels() {
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
    return new Promise((resolve) => {
      itemCreatorResolve = resolve
    })
  }
  function resolveItemCreator(id: string | null) {
    itemCreatorResolve?.(id)
    itemCreatorResolve = null
  }

  return {
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
  }
}
