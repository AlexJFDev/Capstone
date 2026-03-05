<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import RoadmapPane from '@/components/roadmap/RoadmapPane.vue'
import { useWorkspacesStore } from '@/stores/workspaces'
import { useInterfaceStore } from '@/stores/interface'

const route = useRoute()
const workspacesStore = useWorkspacesStore()
const userInterface = useInterfaceStore()

// Falls back to the first workspace when at '/'. In the future this should
// open the last viewed workspace instead, which will require persistence logic.
const activeWorkspace = computed(() => {
  if (workspacesStore.hasWorkspaces) {
    return (route.params.workspaceId as string) || workspacesStore.workspaceKeys[0]
  } else {
    return undefined
  }
})
const workspaceName = computed(() => {
  if (activeWorkspace.value) {
    return workspacesStore.getWorkspaceName(activeWorkspace.value)
  } else {
    return ''
  }
})

</script>

<template>
  <v-main style="height: 100vh; overflow: hidden;">
    <div v-if="!activeWorkspace" class="empty-state">
      <v-icon size="48" color="medium-emphasis">mdi-view-dashboard-outline</v-icon>
      <p class="text-h6 text-medium-emphasis">No workspaces yet</p>
      <v-btn variant="tonal" prepend-icon="mdi-plus" @click="userInterface.openWorkspaceCreator()">
        New workspace
      </v-btn>
    </div>

    <div v-if="activeWorkspace" class="view">
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

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
</style>
