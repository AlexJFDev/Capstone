<script setup lang="ts">
import { computed, ref } from 'vue'
import RoadmapPane from '@/components/roadmap/RoadmapPane.vue'
import WorkspacesPanel from '@/components/workspaces/WorkspacesPanel.vue'
import { workspaces } from '@/testing/dummy-workspaces'

const workspaceIds = Object.keys(workspaces)

const activeWorkspaceId = ref(workspaceIds[0]!)
const workspacesPanelOpen = ref(false)

const workspaceName = computed(() => workspaces[activeWorkspaceId.value]?.name ?? '')
</script>

<template>
  <v-app-bar elevation="0" border="b">
    <v-app-bar-title>Chronicle</v-app-bar-title>
    <template #append>
      <v-btn
        prepend-icon="mdi-view-dashboard-outline"
        variant="text"
        @click="workspacesPanelOpen = true"
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

  <WorkspacesPanel v-model="workspacesPanelOpen" :workspaceIds="workspaceIds" />
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
