<script setup lang="ts">
import { ref } from 'vue'
import { workspaces } from '@/testing/dummy-workspaces';
import ItemList from '../items/ItemList.vue'

const props = defineProps<{
  workspaceId: string
}>()

const workspace = workspaces[props.workspaceId]!
const hovered = ref(false)
</script>

<template>
  <v-card
    :title="workspace.name"
    :color="workspace.color"
    :elevation="hovered ? 8 : 2"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <template #append>
      <div class="actions" :class="{ visible: hovered }">
        <v-btn icon="mdi-pencil" density="compact" variant="text" />
        <v-btn icon="mdi-open-in-new" density="compact" variant="text" />
      </div>
    </template>

    <v-card-text class="d-flex ga-8 flex-column">
      {{ workspace.description }}
      <ItemList v-model="workspace.items"/>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.actions {
  display: flex;
  gap: 4px;
  visibility: hidden;
}

.actions.visible {
  visibility: visible;
}
</style>
