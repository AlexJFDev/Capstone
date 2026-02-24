<script setup lang="ts">
import { computed, ref } from 'vue'
import RoadmapPane from '@/components/roadmap/RoadmapPane.vue'
import WorkspacesPanel from '@/components/workspaces/WorkspacesPanel.vue'
import { usePanelStore } from '@/stores/panels'
import WorkspaceEditorPanel from '@/components/workspaces/WorkspaceEditorPanel.vue'
import ItemViewerPanel from '@/components/items/ItemViewerPanel.vue'
import ItemEditorPanel from '@/components/items/ItemEditorPanel.vue'
import { useWorkspacesStore } from '@/stores/workspaces'

const workspacesStore = useWorkspacesStore()

const activeWorkspaceId = ref(workspacesStore.workspaceKeys[0]!)

const workspaceName = computed(() => workspacesStore.getWorkspaceName(activeWorkspaceId.value))

const panels = usePanelStore()
</script>

<template>
  <v-app-bar elevation="0" border="b">
    <v-app-bar-title>Capstone</v-app-bar-title>
    <template #append>
      <v-btn
        prepend-icon="mdi-view-dashboard-outline"
        variant="text"
        @click="panels.openWorkspaces"
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
        <RoadmapPane :workspaceId="activeWorkspaceId" />
      </div>
    </div>
  </v-main>

  <WorkspacesPanel v-model="panels.workspacesOpen" :workspaceIds="workspacesStore.workspaceKeys" />
  <WorkspaceEditorPanel v-model="panels.workspaceEditorOpen" :workspace-id="panels.editingWorkspaceId" />
  <ItemViewerPanel v-model="panels.itemViewerOpen" :item-id="panels.viewingItemId" />
  <ItemEditorPanel v-model="panels.itemEditorOpen" :item-id="panels.editingItemId" />
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
