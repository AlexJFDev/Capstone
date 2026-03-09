<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import ItemList from '../items/ItemList.vue'
import { useWorkspacesStore } from '@/stores/workspaces'
import { constructEmptyWorkspace } from '@/types'
import { useInterfaceStore } from '@/stores/interface';

const props = defineProps<{
  workspaceId: string
}>()

const router = useRouter()
const workspacesStore = useWorkspacesStore()
const userInterface = useInterfaceStore()

const workspace = computed(() => workspacesStore.getWorkspace(props.workspaceId))

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
        <v-btn
          icon="mdi-pencil"
          density="compact"
          variant="text" 
          @click="userInterface.openWorkspaceEditor(workspaceId)"
        />
        <v-btn 
          icon="mdi-open-in-new"
          density="compact"
          variant="text"
          @click="router.push({ name: 'workspace', params: { workspaceId } })"
        />
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
