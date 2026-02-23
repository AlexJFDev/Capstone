<script setup lang="ts">
import { constructEmptyItem, items } from '@/testing/dummy-items'
import { computed, ref, watch } from 'vue'

const model = defineModel<boolean>()

const props = defineProps<{
  itemId?: string
}>()

const save = () => {}
const cancel = () => {}

const draft = ref(constructEmptyItem())
const item = computed(() => items[props.itemId!])

watch(model, isOpen => {
  if (isOpen && item.value) {
    draft.value = { ...item.value }
  } else {
    draft.value = constructEmptyItem()
  }
})

</script>

<template>
  <v-navigation-drawer 
    v-model="model" 
    temporary 
    location="right"
    width="500"
  >

    <!-- HEADER -->
    <v-toolbar density="compact">
      <v-btn icon="mdi-close" @click="cancel" />
      <v-toolbar-title>{{ props.itemId ? 'Edit item' : 'New item' }}</v-toolbar-title>
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
                v-model="draft['start-date']"
                label="Start date"
                type="date"
                variant="outlined"
                density="compact"
                hide-details="auto"
              />
              <v-text-field
                v-model="draft['end-date']"
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
</style>
