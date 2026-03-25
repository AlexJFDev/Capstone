<script setup lang="ts">
import { areWorkspacesEqual, constructEmptyWorkspace, generateWorkspaceId, type Workspace } from '@/types'
import { computed, ref, useTemplateRef, watch } from 'vue'
import ItemList from '../items/ItemList.vue'
import { useWorkspacesStore } from '@/stores/workspaces'
import { useInterfaceStore } from '@/stores/interface'
import { required } from '@/utils/validation'

// External state
const model = defineModel<boolean>()
const props = defineProps<{
  workspaceId?: string
}>()

const workspaceStore = useWorkspacesStore()
const userInterface = useInterfaceStore()

// Editing state
const isEditing = computed(() => !!props.workspaceId)
const editingWorkspace = computed(
  () => isEditing.value ?
    workspaceStore.getWorkspace(props.workspaceId!) :
    constructEmptyWorkspace()
)

// Draft state
const draft = ref<Workspace>(constructEmptyWorkspace())
const changesMade = computed(() => !areWorkspacesEqual(draft.value, editingWorkspace.value))

// Draft management
function setDraft(workspace: Workspace) {
  draft.value = { ...workspace, items: [...workspace.items] }
}

watch(model, isOpen => {
  if (isOpen) {
    setDraft(editingWorkspace.value)
  } else {
    formRef.value?.resetValidation()
  }
})

// Actions
async function save() {
  const { valid } = await formRef.value!.validate()
  if (!valid) return

  if (isEditing.value) {
    workspaceStore.updateWorkspace(props.workspaceId!, draft.value)
    userInterface.closeWorkspaceEditor()
  } else {
    const id = generateWorkspaceId()
    workspaceStore.addWorkspace(id, draft.value)
    userInterface.closeWorkspaceEditor()
  }
}

async function cancel() {
  if (!changesMade.value || await userInterface.confirm("You have unsaved changes. Are you sure you would like to discard them?")) {
    userInterface.closeWorkspaceEditor()
  }
}

async function deleteWorkspace() {
  if (await userInterface.confirm(`Are you sure you want to delete "${draft.value.name}"? This cannot be undone.`)) {
    workspaceStore.deleteWorkspace(props.workspaceId!)
    userInterface.closeWorkspaceEditor()
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
const nameRules = [ required ]

</script>

<template>
  <v-navigation-drawer
    :model-value="model"
    @update:model-value="val => { if (!val) cancel() }"
    temporary
    width="500"
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
          <v-text-field
            v-model="draft.color"
            label="Color"
            type="color"
            variant="outlined"
            density="compact"
            hide-details="auto"
          />
        </v-card-text>
      </v-card>

      <v-card variant="outlined">
        <v-card-title class="text-subtitle-2">Items</v-card-title>
        <v-divider />
        <v-card-text>
          <ItemList :model-value="draft.items" edit @remove-item="remove" @add-item="addItem" @new-item="newItem"></ItemList>
        </v-card-text>
      </v-card>

    </v-form>

    <!-- FOOTER -->
    <template #append>
      <v-divider />
      <div class="pa-2 d-flex flex-column ga-2">
        <v-btn v-if="isEditing" block color="red" @click="deleteWorkspace">Delete</v-btn>
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
