<script setup lang="ts">
import { computed, ref } from 'vue'
import ItemList from '../items/ItemList.vue'
import { useWorkspacesStore } from '@/stores/workspaces'
import { constructEmptyWorkspace } from '@/types'

const props = defineProps<{
  workspaceId: string
}>()

const workspacesStore = useWorkspacesStore()

const workspace = computed(
  () => props.workspaceId ?
    workspacesStore.getWorkspace(props.workspaceId) :
    constructEmptyWorkspace()
)

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
