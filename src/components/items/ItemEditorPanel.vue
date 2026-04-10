<!-- Right-side drawer panel for creating or editing an item's details, schedule, color, and collection memberships. -->
<script setup lang="ts">
import { areItemsEqual, constructEmptyItem, generateItemId, type Item } from '@/types/items'
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import { useItemsStore } from '@/stores/items'
import { useCollectionsStore } from '@/stores/collections'
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
const collectionsStore = useCollectionsStore()
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
const collectionDraft = ref<string[]>([])
const originalCollectionIds = ref<string[]>([])

const changesMade = computed(
  () =>
    !areItemsEqual(draft.value, original.value) ||
    collectionDraft.value.length !== originalCollectionIds.value.length ||
    collectionDraft.value.some((wid) => !originalCollectionIds.value.includes(wid)),
)

// collection options for the autocomplete (collections not already in the draft)
const availableCollections = computed(() =>
  collectionsStore.collectionIds
    .filter((wid) => !collectionDraft.value.includes(wid))
    .map((wid) => ({ id: wid, name: collectionsStore.getCollectionName(wid) })),
)

function addCollection(wid: string) {
  if (!collectionDraft.value.includes(wid)) {
    collectionDraft.value.push(wid)
  }
}

function removeCollection(wid: string) {
  collectionDraft.value = collectionDraft.value.filter((w) => w !== wid)
}

// Draft Management
function setDraft(item: Item) {
  original.value = item
  draft.value = { ...item }
  dateRangeDraft.value = {
    start: item.startDate,
    end: item.endDate,
  }

  const currentCollectionIds = props.itemId
    ? collectionsStore.collectionIds.filter((wid) =>
        collectionsStore.getCollection(wid).items.includes(props.itemId!),
      )
    : []
  collectionDraft.value = [...currentCollectionIds]
  originalCollectionIds.value = [...currentCollectionIds]
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

  // Apply collection membership changes
  for (const wid of collectionDraft.value) {
    if (!originalCollectionIds.value.includes(wid)) {
      collectionsStore.addItemToCollection(savedItemId, wid)
    }
  }
  for (const wid of originalCollectionIds.value) {
    if (!collectionDraft.value.includes(wid)) {
      collectionsStore.removeItemFromCollection(savedItemId, wid)
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

// Collection autocomplete
const collectionToAdd = ref<string | null>(null)
watch(collectionToAdd, (wid) => {
  if (wid) {
    addCollection(wid)
    collectionToAdd.value = null
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
        <v-card-title class="text-subtitle-2">Collections</v-card-title>
        <v-divider />
        <v-card-text class="d-flex flex-column ga-2">
          <div class="d-flex flex-wrap ga-1">
            <v-chip
              v-for="wid in collectionDraft"
              :key="wid"
              :color="collectionsStore.getCollection(wid).color"
              size="small"
              variant="flat"
              closable
              @click:close="removeCollection(wid)"
            >
              {{ collectionsStore.getCollectionName(wid) }}
            </v-chip>
            <span v-if="collectionDraft.length === 0" class="text-body-2 text-medium-emphasis">
              Not in any collections
            </span>
          </div>
          <v-autocomplete
            v-if="availableCollections.length > 0"
            v-model="collectionToAdd"
            label="Add Collection"
            :items="availableCollections"
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
