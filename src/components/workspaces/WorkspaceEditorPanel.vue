<script setup lang="ts">
import { constructEmptyWorkspace, workspaces } from '@/testing/dummy-workspaces'
import { computed, ref, watch } from 'vue'
import ItemList from '../items/ItemList.vue'

const model = defineModel<boolean>()

const props = defineProps<{
  workspaceId?: string
}>()

const save = () => {}
const cancel = () => {}

const draft = ref(constructEmptyWorkspace())
const workspace = computed(() => workspaces[props.workspaceId!])

watch(model, isOpen => {
  if (isOpen && workspace.value) {
    draft.value = { ...workspace.value }
  } else {
    draft.value = constructEmptyWorkspace()
  }
})

</script>

<template>
  <v-navigation-drawer
    v-model="model"
    temporary
    width="500"
  >
    <!-- HEADER -->
    <v-toolbar density="compact">
      <v-btn icon="mdi-close" @click="cancel" />
      <v-toolbar-title>{{ props.workspaceId ? 'Edit item' : 'New workspace' }}</v-toolbar-title>
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
          <ItemList :model-value="draft.items" edit></ItemList>
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
</style>
