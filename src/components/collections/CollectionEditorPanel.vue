<!-- Right-side drawer panel for creating or editing a workspace's name, description, color, and item list. -->
<script setup lang="ts">
import {
  areCollectionsEqual,
  constructEmptyCollection,
  generateCollectionId,
  type Workspace,
} from '@/types/collections'
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import ItemList from '../items/ItemList.vue'
import { useCollectionsStore } from '@/stores/collections'
import { useInterfaceStore } from '@/stores/interface'
import { required } from '@/utils/validation'
import ColorInput from '../inputs/ColorPicker.vue'

// External state
const model = defineModel<boolean>()
const props = defineProps<{
  collectionId?: string
}>()

const collectionsStore = useCollectionsStore()
const userInterface = useInterfaceStore()

// Editing state
const isEditing = computed(() => !!props.collectionId)
const editingWorkspace = computed(() =>
  isEditing.value
    ? collectionsStore.getCollection(props.collectionId!)
    : constructEmptyCollection(),
)

// Draft state
const draft = ref<Workspace>(constructEmptyCollection())
const original = ref<Workspace>(constructEmptyCollection())
const changesMade = computed(() => !areCollectionsEqual(draft.value, original.value))

// Draft management
function setDraft(workspace: Workspace) {
  original.value = { ...workspace, items: [...workspace.items] }
  draft.value = { ...workspace, items: [...workspace.items] }
}

watch(model, async (isOpen) => {
  if (isOpen) {
    setDraft(isEditing.value ? editingWorkspace.value : constructEmptyCollection())
    await nextTick()
    formRef.value?.resetValidation()
  }
})

// Actions
async function save() {
  const { valid } = await formRef.value!.validate()
  if (!valid) return

  if (isEditing.value) {
    collectionsStore.updateCollection(props.collectionId!, draft.value)
    userInterface.closeCollectionEditor()
  } else {
    const id = generateCollectionId()
    collectionsStore.addCollection(id, draft.value)
    userInterface.closeCollectionEditor()
  }
}

async function cancel() {
  if (
    !changesMade.value ||
    (await userInterface.revealSpeedBump(
      'You have unsaved changes. Are you sure you would like to discard them?',
    ))
  ) {
    userInterface.closeCollectionEditor()
  }
}

async function deleteCollection() {
  if (
    await userInterface.revealSpeedBump(
      `Are you sure you want to delete "${draft.value.name}"? This cannot be undone.`,
    )
  ) {
    collectionsStore.deleteCollection(props.collectionId!)
    userInterface.closeCollectionEditor()
  }
}

function remove(itemId: string) {
  const index = draft.value.items.indexOf(itemId)
  draft.value.items.splice(index, 1)
}

function addItem(itemId: string) {
  draft.value.items.push(itemId)
}

async function newItem() {
  const itemId = await userInterface.openItemCreator()
  if (itemId) draft.value.items.push(itemId)
}

// Validation
const formRef = useTemplateRef('formRef')
const nameRules = [required]
</script>

<template>
  <v-navigation-drawer
    :model-value="model"
    temporary
    touchless
    width="500"
    @update:model-value="
      (val) => {
        if (!val) cancel()
      }
    "
  >
    <!-- HEADER -->
    <v-toolbar class="header" density="compact">
      <v-btn icon="mdi-close" @click="cancel" />
      <v-toolbar-title>{{ isEditing ? 'Edit workspace' : 'New workspace' }}</v-toolbar-title>
      <v-spacer />
      <v-btn variant="text" @click="save">Save</v-btn>
    </v-toolbar>

    <v-form ref="formRef" class="pa-3 d-flex flex-column ga-3">
      <v-card variant="outlined">
        <v-card-title class="text-subtitle-2">Details</v-card-title>
        <v-divider />
        <v-card-text class="d-flex flex-column ga-2">
          <v-text-field
            v-model="draft.name"
            label="Name"
            variant="outlined"
            density="compact"
            hide-details="auto"
            :rules="nameRules"
          />
          <v-textarea
            v-model="draft.description"
            label="Description"
            variant="outlined"
            density="compact"
            rows="3"
            hint="Markdown is supported"
            persistent-hint
          />
        </v-card-text>
      </v-card>

      <v-card variant="outlined">
        <v-card-title class="text-subtitle-2">Appearance</v-card-title>
        <v-divider />
        <v-card-text>
          <ColorInput v-model="draft.color" />
        </v-card-text>
      </v-card>

      <v-card variant="outlined">
        <v-card-title class="text-subtitle-2">Items</v-card-title>
        <v-divider />
        <v-card-text>
          <ItemList
            :model-value="draft.items"
            edit
            @remove-item="remove"
            @add-item="addItem"
            @new-item="newItem"
          ></ItemList>
        </v-card-text>
      </v-card>
    </v-form>

    <!-- FOOTER -->
    <template #append>
      <v-divider />
      <div class="pa-2 d-flex flex-column ga-2">
        <v-btn v-if="isEditing" block color="red" @click="deleteCollection">Delete</v-btn>
        <v-btn block variant="text" @click="cancel">Cancel</v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 1;
}
</style>
