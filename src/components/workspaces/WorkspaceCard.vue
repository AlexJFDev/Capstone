<!-- Card displaying a workspace's name, description, and item list with hover actions to edit, open, or toggle as favorite. -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import ItemList from '../items/ItemList.vue'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import { useWorkspacesStore } from '@/stores/workspaces'
import { useInterfaceStore } from '@/stores/interface'

const props = defineProps<{
  workspaceId: string
}>()

const router = useRouter()
const workspacesStore = useWorkspacesStore()
const userInterface = useInterfaceStore()

const workspace = computed(() => workspacesStore.getWorkspace(props.workspaceId))

const hovered = ref(false)

const isFavorite = computed(() => userInterface.favoriteWorkspaceId === props.workspaceId)

function toggleFavorite() {
  userInterface.setFavoriteWorkspace(isFavorite.value ? null : props.workspaceId)
}
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
      <div class="d-flex align-center">
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
        <v-btn
          :icon="isFavorite ? 'mdi-star' : 'mdi-star-outline'"
          :color="isFavorite ? 'yellow' : undefined"
          class="star-btn"
          :class="{ visible: isFavorite || hovered }"
          density="compact"
          variant="text"
          @click="toggleFavorite"
        />
      </div>
    </template>

    <v-card-text class="d-flex ga-8 flex-column">
      <MarkdownRenderer :content="workspace.description" />
      <ItemList v-model="workspace.items" />
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

.star-btn {
  visibility: hidden;
}

.star-btn.visible {
  visibility: visible;
}
</style>
