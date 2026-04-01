<!-- Right-side drawer panel for creating or editing an item's details, schedule, color, and workspace memberships. -->
<script setup lang="ts">
import { areItemsEqual, constructEmptyItem, generateItemId, type Item } from '@/types'
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import { useItemsStore } from '@/stores/items'
import { useWorkspacesStore } from '@/stores/workspaces'
import { makeDateRange, type DateRange } from '@/utils/dates'
import { useInterfaceStore } from '@/stores/interface'
import { endDateAfterStart, rangeDatesValid, required } from '@/utils/validation'
import DateRangePicker from '../inputs/DateRangePicker.vue'
import ColorInput from '../inputs/ColorPicker.vue'

// External State
const model = defineModel<boolean>()
const props = defineProps<{
  itemId?: string
}>()

const itemsStore = useItemsStore()
const workspacesStore = useWorkspacesStore()
const userInterface = useInterfaceStore()

// Editing State
const isEditing = computed(() => !!props.itemId)
const editingItem = computed(() =>
  isEditing.value ? itemsStore.getItem(props.itemId!) : constructEmptyItem(),
)

// Draft State
const draft = ref<Item>(constructEmptyItem())
const original = ref<Item>(constructEmptyItem())
const dateRangeDraft = ref<DateRange>(makeDateRange())
const workspaceDraft = ref<string[]>([])
const originalWorkspaceIds = ref<string[]>([])

const changesMade = computed(
  () =>
    !areItemsEqual(draft.value, original.value) ||
    workspaceDraft.value.length !== originalWorkspaceIds.value.length ||
    workspaceDraft.value.some((wid) => !originalWorkspaceIds.value.includes(wid)),
)

// Workspace options for the autocomplete (workspaces not already in the draft)
const availableWorkspaces = computed(() =>
  workspacesStore.workspaceIds
    .filter((wid) => !workspaceDraft.value.includes(wid))
    .map((wid) => ({ id: wid, name: workspacesStore.getWorkspaceName(wid) })),
)

function addWorkspace(wid: string) {
  if (!workspaceDraft.value.includes(wid)) {
    workspaceDraft.value.push(wid)
  }
}

function removeWorkspace(wid: string) {
  workspaceDraft.value = workspaceDraft.value.filter((w) => w !== wid)
}

// Draft Management
function setDraft(item: Item) {
  original.value = item
  draft.value = { ...item }
  dateRangeDraft.value = {
    start: item.startDate,
    end: item.endDate,
  }

  const currentWorkspaceIds = props.itemId
    ? workspacesStore.workspaceIds.filter((wid) =>
        workspacesStore.getWorkspace(wid).items.includes(props.itemId!),
      )
    : []
  workspaceDraft.value = [...currentWorkspaceIds]
  originalWorkspaceIds.value = [...currentWorkspaceIds]
}

watch(model, async (isOpen) => {
  if (isOpen) {
    setDraft(isEditing.value ? editingItem.value : constructEmptyItem())
    await nextTick()
    formRef.value?.resetValidation()
  }
})

watch(dateRangeDraft, (dateRange) => {
  draft.value.startDate = dateRange.start
  draft.value.endDate = dateRange.end
})

// Action Functions
async function save() {
  const { valid } = await formRef.value!.validate()
  if (!valid) return

  let savedItemId: string

  if (isEditing.value) {
    itemsStore.updateItem(props.itemId!, draft.value)
    savedItemId = props.itemId!
  } else {
    const id = generateItemId()
    itemsStore.addItem(id, draft.value)
    savedItemId = id
    userInterface.resolveItemCreator(id)
  }

  // Apply workspace membership changes
  for (const wid of workspaceDraft.value) {
    if (!originalWorkspaceIds.value.includes(wid)) {
      workspacesStore.addItemToWorkspace(savedItemId, wid)
    }
  }
  for (const wid of originalWorkspaceIds.value) {
    if (!workspaceDraft.value.includes(wid)) {
      workspacesStore.removeItemFromWorkspace(savedItemId, wid)
    }
  }

  userInterface.closeItemEditor()
}

async function cancel() {
  if (
    !changesMade.value ||
    (await userInterface.revealSpeedBump(
      'You have unsaved changes. Are you sure you would like to discard them?',
    ))
  ) {
    userInterface.closeItemEditor()
  }
}

async function deleteItem() {
  if (
    await userInterface.revealSpeedBump(
      `Are you sure you want to delete "${draft.value.name}"? This cannot be undone.`,
    )
  ) {
    itemsStore.deleteItem(props.itemId!)
    userInterface.closeItemEditor()
  }
}

// Workspace autocomplete
const workspaceToAdd = ref<string | null>(null)
watch(workspaceToAdd, (wid) => {
  if (wid) {
    addWorkspace(wid)
    workspaceToAdd.value = null
  }
})

// Validation
const formRef = useTemplateRef('formRef')
const nameRules = [required]
const dateRangeRules = [endDateAfterStart, rangeDatesValid]
</script>

<template>
  <v-navigation-drawer
    :model-value="model"
    temporary
    touchless
    location="right"
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
      <v-toolbar-title>{{ isEditing ? 'Edit item' : 'New item' }}</v-toolbar-title>
      <v-spacer />
      <v-btn variant="text" @click="save">Save</v-btn>
    </v-toolbar>

    <!-- BODY -->
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

      <v-row no-gutters class="ga-3">
        <v-col cols="4">
          <v-card variant="outlined">
            <v-card-title class="text-subtitle-2">Schedule</v-card-title>
            <v-divider />
            <v-card-text class="d-flex flex-column ga-2">
              <DateRangePicker v-model="dateRangeDraft" :rules="dateRangeRules" />
            </v-card-text>
          </v-card>
        </v-col>
        <v-col>
          <v-card variant="outlined" height="100%">
            <v-card-title class="text-subtitle-2">Appearance</v-card-title>
            <v-divider />
            <v-card-text>
              <ColorInput v-model="draft.color" />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-card variant="outlined">
        <v-card-title class="text-subtitle-2">Workspaces</v-card-title>
        <v-divider />
        <v-card-text class="d-flex flex-column ga-2">
          <div class="d-flex flex-wrap ga-1">
            <v-chip
              v-for="wid in workspaceDraft"
              :key="wid"
              :color="workspacesStore.getWorkspace(wid).color"
              size="small"
              variant="flat"
              closable
              @click:close="removeWorkspace(wid)"
            >
              {{ workspacesStore.getWorkspaceName(wid) }}
            </v-chip>
            <span v-if="workspaceDraft.length === 0" class="text-body-2 text-medium-emphasis">
              Not in any workspaces
            </span>
          </div>
          <v-autocomplete
            v-if="availableWorkspaces.length > 0"
            v-model="workspaceToAdd"
            label="Add Workspace"
            :items="availableWorkspaces"
            item-title="name"
            item-value="id"
            variant="outlined"
            density="compact"
            hide-details
            clearable
          />
        </v-card-text>
      </v-card>
    </v-form>

    <!-- FOOTER -->
    <template #append>
      <v-divider />
      <div class="pa-2 d-flex flex-column ga-2">
        <v-btn v-if="isEditing" block color="red" @click="deleteItem">Delete</v-btn>
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
