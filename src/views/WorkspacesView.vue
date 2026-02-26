<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import RoadmapPane from '@/components/roadmap/RoadmapPane.vue'
import WorkspacesPanel from '@/components/workspaces/WorkspacesPanel.vue'
import { useInterfaceStore } from '@/stores/interface'
import WorkspaceEditorPanel from '@/components/workspaces/WorkspaceEditorPanel.vue'
import ItemViewerPanel from '@/components/items/ItemViewerPanel.vue'
import ItemEditorPanel from '@/components/items/ItemEditorPanel.vue'
import { useWorkspacesStore } from '@/stores/workspaces'
import SpeedbumpDialog from '@/SpeedbumpDialog.vue'

const route = useRoute()
const workspacesStore = useWorkspacesStore()
const userInterface = useInterfaceStore()

// Falls back to the first workspace when at '/'. In the future this should
// open the last viewed workspace instead, which will require persistence logic.
const activeWorkspace = computed(() =>
  (route.params.workspaceId as string) || workspacesStore.workspaceKeys[0]!
)
const workspaceName = computed(() => workspacesStore.getWorkspaceName(activeWorkspace.value))

</script>

<template>
  <v-main style="height: 100vh; overflow: hidden;">
    <div class="view">
      <div class="view-header">
        <div class="d-flex align-center ga-2">
          <v-icon>mdi-chart-gantt</v-icon>
          <span class="text-h6">{{ workspaceName }}</span>
        </div>
      </div>

      <div class="roadmap-container">
        <RoadmapPane :workspaceId="activeWorkspace" />
      </div>
    </div>
  </v-main>
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
