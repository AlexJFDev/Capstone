<script setup lang="ts">
import { computed } from 'vue'
import RoadmapPane from '@/components/roadmap/RoadmapPane.vue'
import WorkspacesPanel from '@/components/workspaces/WorkspacesPanel.vue'
import { useInterfaceStore } from '@/stores/interface'
import WorkspaceEditorPanel from '@/components/workspaces/WorkspaceEditorPanel.vue'
import ItemViewerPanel from '@/components/items/ItemViewerPanel.vue'
import ItemEditorPanel from '@/components/items/ItemEditorPanel.vue'
import { useWorkspacesStore } from '@/stores/workspaces'
import SpeedbumpDialog from '@/SpeedbumpDialog.vue'

const workspacesStore = useWorkspacesStore()
const userInterface = useInterfaceStore()

const workspaceName = computed(() => workspacesStore.getWorkspaceName(userInterface.activeWorkspace))

</script>

<template>
  <v-app-bar elevation="0" border="b">
    <v-app-bar-title>Chronicle</v-app-bar-title>
    <template #append>
      <v-btn
        prepend-icon="mdi-view-dashboard-outline"
        variant="text"
        @click="userInterface.openWorkspaces"
      >
        Workspaces
      </v-btn>
    </template>
  </v-app-bar>

  <v-main style="height: 100vh; overflow: hidden;">
    <div class="view">
      <div class="view-header">
        <div class="d-flex align-center ga-2">
          <v-icon>mdi-chart-gantt</v-icon>
          <span class="text-h6">{{ workspaceName }}</span>
        </div>
      </div>

      <div class="roadmap-container">
        <RoadmapPane :workspaceId="userInterface.activeWorkspace" />
      </div>
    </div>
  </v-main>

  <ItemEditorPanel v-model="userInterface.itemEditorOpen" :item-id="userInterface.editingItemId" />
  <ItemViewerPanel v-model="userInterface.itemViewerOpen" :item-id="userInterface.viewingItemId" />
  <WorkspaceEditorPanel v-model="userInterface.workspaceEditorOpen" :workspace-id="userInterface.editingWorkspaceId" />
  <WorkspacesPanel v-model="userInterface.workspacesOpen" :workspaceIds="workspacesStore.workspaceKeys" />
  <SpeedbumpDialog />
</template>

<style scoped>
.view {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 12px;
}

.view-header {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.roadmap-container {
  flex: 1;
  min-height: 0;
}
</style>
