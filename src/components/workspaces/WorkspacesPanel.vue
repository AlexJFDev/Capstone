<script setup lang="ts">
import WorkspaceCard from './WorkspaceCard.vue'
import { useInterfaceStore } from '@/stores/interface'

defineProps<{
  workspaceIds: Array<string>
}>()

const model = defineModel<boolean>()

const userInterface = useInterfaceStore()

function addWorkspace() {
  userInterface.openWorkspaceCreator()
}
</script>

<template>
  <v-navigation-drawer
    v-model="model"
    temporary
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
        v-for="workspaceId in workspaceIds"
        :key="workspaceId"
        :workspaceId="workspaceId"
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
