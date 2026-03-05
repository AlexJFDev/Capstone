<script setup lang="ts">
import { areWorkspacesEqual, constructEmptyWorkspace, generateWorkspaceKey, type Workspace } from '@/types'
import { computed, ref, watch } from 'vue'
import ItemList from '../items/ItemList.vue'
import { useWorkspacesStore } from '@/stores/workspaces'
import { useInterfaceStore } from '@/stores/interface'

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
  }
})

// Actions
function save() {
  if (isEditing.value) {
    workspaceStore.updateWorkspace(props.workspaceId!, draft.value)
    userInterface.closeWorkspaceEditor()
  } else {
    const key = generateWorkspaceKey()
    workspaceStore.addWorkspace(key, draft.value)
    userInterface.closeWorkspaceEditor()
  }
}

async function cancel() {
  if (!changesMade.value || await userInterface.confirm("You have unsaved changes. Are you sure you would like to discard them?")) {
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
      <v-toolbar-title>{{ props.workspaceId ? 'Edit workspace' : 'New workspace' }}</v-toolbar-title>
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
          />
          <v-textarea
            v-model="draft.description"
            label="Description"
            variant="outlined"
            density="compact"
            rows="3"
            hide-details="auto"
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
      <div class="pa-2">
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
