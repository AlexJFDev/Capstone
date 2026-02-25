<script setup lang="ts">
import { areItemsEqual, constructEmptyItem, type Item } from '@/types'
import { computed, ref, watch } from 'vue'
import { useItemsStore } from '@/stores/items'
import { dateToShortISOString } from '../utils';
import { useInterfaceStore } from '@/stores/interface';

// External State
const model = defineModel<boolean>()
const props = defineProps<{
  itemId?: string
}>()

const itemsStore = useItemsStore()
const userInterface = useInterfaceStore()

// Editing State
const isEditing = computed(() => !!props.itemId)
const editingItem = computed(
  () => isEditing.value ?
    itemsStore.getItem(props.itemId!) :
    constructEmptyItem()
)

// Draft State
const draft = ref<Item>(constructEmptyItem())
const startDateDraft = ref('')
const endDateDraft = ref('')
const changesMade = computed(() => !areItemsEqual(draft.value, editingItem.value))

// Draft Management
function setDraft(item: Item) {
  draft.value = { ...item }
  startDateDraft.value = dateToShortISOString(item['start-date'])
  endDateDraft.value = dateToShortISOString(item['end-date'])
}

watch(model, isOpen => {
  if (isOpen) {
    setDraft(editingItem.value)
  }
})

watch(startDateDraft, date => draft.value['start-date'] = new Date(date))
watch(endDateDraft, date => draft.value['end-date'] = new Date(date))

// Action Functions
function save() {
  if (isEditing.value) {
    itemsStore.updateItem(props.itemId!, draft.value)
    userInterface.closeItemEditor()
  } else {
    console.log("TODO: Handle saving new item")
  }
}

async function cancel() {
  if (!changesMade.value || await userInterface.confirm("You have unsaved changes. Are you sure you would like to discard them?")) {
    userInterface.closeItemEditor()
  }
}

</script>

<template>
  <v-navigation-drawer
    :model-value="model"
    @update:model-value="val => { if (!val) cancel() }"
    temporary
    location="right"
    width="500"
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

      <v-row no-gutters class="ga-3">
        <v-col cols="4">
          <v-card variant="outlined">
            <v-card-title class="text-subtitle-2">Schedule</v-card-title>
            <v-divider />
            <v-card-text class="d-flex flex-column ga-2">
              <v-text-field
                v-model="startDateDraft"
                label="Start date"
                type="date"
                variant="outlined"
                density="compact"
                hide-details="auto"
              />
              <v-text-field
                v-model="endDateDraft"
                label="End date"
                type="date"
                variant="outlined"
                density="compact"
                hide-details="auto"
              />
            </v-card-text>
          </v-card>
        </v-col>
        <v-col>
          <v-card variant="outlined" height="100%">
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
        </v-col>
      </v-row>

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
