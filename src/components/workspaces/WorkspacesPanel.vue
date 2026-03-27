<script setup lang="ts">
import { computed } from 'vue'
import WorkspaceCard from './WorkspaceCard.vue'
import { useInterfaceStore } from '@/stores/interface'

const props = defineProps<{
  workspaceIds: Array<string>
}>()

const model = defineModel<boolean>()

const userInterface = useInterfaceStore()

const sortedWorkspaceIds = computed(() => {
  const favorite = userInterface.favoriteWorkspaceId
  if (!favorite || !props.workspaceIds.includes(favorite)) return props.workspaceIds
  return [favorite, ...props.workspaceIds.filter(id => id !== favorite)]
})

function addWorkspace() {
  userInterface.openWorkspaceCreator()
}
</script>

<template>
  <v-navigation-drawer
    v-model="model"
    temporary
    touchless
    width="500"
  >
    <!-- HEADER -->
    <v-toolbar class="header" density="compact">
      <v-btn icon="mdi-close" @click="model = false" />
      <v-toolbar-title>Workspaces</v-toolbar-title>
    </v-toolbar>

    <!-- BODY -->
    <div class="pa-3 d-flex flex-column ga-3">
      <WorkspaceCard
        v-for="workspaceId in sortedWorkspaceIds"
        :key="workspaceId"
        :workspace-id="workspaceId"
      />

      <v-card class="add-workspace-card" variant="outlined" @click="addWorkspace">
        <v-card-title class="d-flex align-center ga-2 text-medium-emphasis">
          <v-icon>mdi-plus</v-icon>
          New workspace
        </v-card-title>
      </v-card>

    </div>
  </v-navigation-drawer>
</template>

<style scoped>
.add-workspace-card {
  cursor: pointer;
  border-style: dashed !important;
}

.header {
  position: sticky;
  top: 0;
  z-index: 1;
}
</style>
