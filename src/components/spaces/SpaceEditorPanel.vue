<!-- Right-side drawer panel for creating or editing a space's name, description, color, collection membership, and visualizations. -->
<script setup lang="ts">
import { areSpacesEqual, constructNewSpace, generateSpaceId, type Space } from '@/types/spaces'
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import { useSpacesStore } from '@/stores/spaces'
import { useWorkspacesStore } from '@/stores/workspaces'
import { useVisualizationsStore } from '@/stores/visualizations'
import { useInterfaceStore } from '@/stores/interface'
import { required } from '@/utils/validation'
import ColorInput from '../inputs/ColorPicker.vue'

// External state
const model = defineModel<boolean>()
const props = defineProps<{
  spaceId?: string
}>()

const spacesStore = useSpacesStore()
const workspacesStore = useWorkspacesStore()
const visualizationsStore = useVisualizationsStore()
const userInterface = useInterfaceStore()

// Editing state
const isEditing = computed(() => !!props.spaceId)
const editingSpace = computed(() =>
  isEditing.value ? spacesStore.getSpace(props.spaceId!) : constructNewSpace(),
)

// Draft state
const draft = ref<Space>(constructNewSpace())
const original = ref<Space>(constructNewSpace())
const changesMade = computed(() => !areSpacesEqual(draft.value, original.value))

// Draft management
function setDraft(space: Space) {
  original.value = {
    ...space,
    workspaceIds: [...space.workspaceIds],
    visualizationIds: [...space.visualizationIds],
  }
  draft.value = {
    ...space,
    workspaceIds: [...space.workspaceIds],
    visualizationIds: [...space.visualizationIds],
  }
}

watch(model, async (isOpen) => {
  if (isOpen) {
    setDraft(isEditing.value ? editingSpace.value : constructNewSpace())
    await nextTick()
    formRef.value?.resetValidation()
  }
})

// Collection membership
const availableWorkspaceIds = computed(() =>
  workspacesStore.workspaceIds.filter((id) => !draft.value.workspaceIds.includes(id)),
)

function removeWorkspace(workspaceId: string) {
  const index = draft.value.workspaceIds.indexOf(workspaceId)
  draft.value.workspaceIds.splice(index, 1)
}

function addWorkspace(workspaceId: string) {
  if (!draft.value.workspaceIds.includes(workspaceId)) {
    draft.value.workspaceIds.push(workspaceId)
  }
}

// Visualizations
const availableVisualizationIds = computed(() =>
  visualizationsStore.visualizationIds.filter((id) => !draft.value.visualizationIds.includes(id)),
)

function removeVisualization(visualizationId: string) {
  const index = draft.value.visualizationIds.indexOf(visualizationId)
  draft.value.visualizationIds.splice(index, 1)
}

function addVisualization(visualizationId: string) {
  if (!draft.value.visualizationIds.includes(visualizationId)) {
    draft.value.visualizationIds.push(visualizationId)
  }
}

// Actions
async function save() {
  const { valid } = await formRef.value!.validate()
  if (!valid) return

  if (isEditing.value) {
    spacesStore.updateSpace(props.spaceId!, draft.value)
    userInterface.closeSpaceEditor()
  } else {
    const id = generateSpaceId()
    spacesStore.addSpace(id, draft.value)
    userInterface.closeSpaceEditor()
  }
}

async function cancel() {
  if (
    !changesMade.value ||
    (await userInterface.revealSpeedBump(
      'You have unsaved changes. Are you sure you would like to discard them?',
    ))
  ) {
    userInterface.closeSpaceEditor()
  }
}

async function deleteSpace() {
  if (
    await userInterface.revealSpeedBump(
      `Are you sure you want to delete "${draft.value.name}"? This cannot be undone.`,
    )
  ) {
    spacesStore.deleteSpace(props.spaceId!)
    userInterface.closeSpaceEditor()
  }
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
      <v-toolbar-title>{{ isEditing ? 'Edit space' : 'New space' }}</v-toolbar-title>
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
        <v-card-title class="text-subtitle-2">Collections</v-card-title>
        <v-divider />
        <v-card-text class="d-flex flex-column ga-2">
          <v-chip
            v-for="workspaceId in draft.workspaceIds"
            :key="workspaceId"
            closable
            @click:close="removeWorkspace(workspaceId)"
          >
            {{ workspacesStore.getWorkspaceName(workspaceId) }}
          </v-chip>
          <v-select
            v-if="availableWorkspaceIds.length > 0"
            label="Add collection"
            variant="outlined"
            density="compact"
            hide-details
            :items="
              availableWorkspaceIds.map((id) => ({
                title: workspacesStore.getWorkspaceName(id),
                value: id,
              }))
            "
            @update:model-value="addWorkspace"
          />
          <p v-else-if="draft.workspaceIds.length === 0" class="text-medium-emphasis text-body-2">
            No collections available
          </p>
        </v-card-text>
      </v-card>

      <v-card variant="outlined">
        <v-card-title class="text-subtitle-2">Visualizations</v-card-title>
        <v-divider />
        <v-card-text class="d-flex flex-column ga-2">
          <v-chip
            v-for="visualizationId in draft.visualizationIds"
            :key="visualizationId"
            closable
            @click:close="removeVisualization(visualizationId)"
          >
            {{ visualizationsStore.getVisualizationName(visualizationId) }}
          </v-chip>
          <v-select
            v-if="availableVisualizationIds.length > 0"
            label="Add visualization"
            variant="outlined"
            density="compact"
            hide-details
            :items="
              availableVisualizationIds.map((id) => ({
                title: visualizationsStore.getVisualizationName(id),
                value: id,
              }))
            "
            @update:model-value="addVisualization"
          />
          <p
            v-else-if="draft.visualizationIds.length === 0"
            class="text-medium-emphasis text-body-2"
          >
            No visualizations available
          </p>
        </v-card-text>
      </v-card>
    </v-form>

    <!-- FOOTER -->
    <template #append>
      <v-divider />
      <div class="pa-2 d-flex flex-column ga-2">
        <v-btn v-if="isEditing" block color="red" @click="deleteSpace">Delete</v-btn>
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
