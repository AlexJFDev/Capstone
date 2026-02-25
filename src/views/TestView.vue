<script setup lang="ts">
import { computed, ref } from 'vue'
import ItemEditorPanel from '@/components/items/ItemEditorPanel.vue'
import ItemViewerPanel from '@/components/items/ItemViewerPanel.vue'
import WorkspaceEditorPanel from '@/components/workspaces/WorkspaceEditorPanel.vue'
import WorkspacesPanel from '@/components/workspaces/WorkspacesPanel.vue'
import RoadmapPane from '@/components/roadmap/RoadmapPane.vue'
import { useWorkspacesStore } from '@/stores/workspaces'

const TEST_ITEM_ID = 'i-a1b2c3d4-e5f6-4890-abcd-ef1234567890'

const workspacesStore = useWorkspacesStore()

const workspaceIds = workspacesStore.workspaceKeys

const itemEditorOpen = ref(false)
const itemViewerOpen = ref(false)
const workspaceEditorOpen = ref(false)
const workspacesOpen = ref(false)

const WORKSPACE_IDS = [
  'w-1a2b3c4d-5e6f-4890-abcd-ef1234567890',
  'w-2b3c4d5e-6f7a-4901-bcde-f12345678901',
]

const workspaceIndex = ref(0)
const workspaceId = computed(() => WORKSPACE_IDS[workspaceIndex.value]!)

function toggle() {
  workspaceIndex.value = (workspaceIndex.value + 1) % WORKSPACE_IDS.length
}
</script>

<template>
  <v-main>
    <v-container>
      <v-row>
        <v-col cols="auto">
          <v-btn @click="itemEditorOpen = true">Item Editor</v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn @click="itemViewerOpen = true">Item Viewer</v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn @click="workspaceEditorOpen = true">Workspace Editor</v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn @click="workspacesOpen = true">Workspaces</v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn @click="toggle">Toggle Workspace</v-btn>
        </v-col>
      </v-row>
    </v-container>

    <div class="pane">
      <RoadmapPane :workspaceId="workspaceId" />
    </div>

    <ItemEditorPanel v-model="itemEditorOpen" />
    <ItemViewerPanel v-model="itemViewerOpen" :itemId="TEST_ITEM_ID" />
    <WorkspaceEditorPanel v-model="workspaceEditorOpen" />
    <WorkspacesPanel v-model="workspacesOpen" :workspaceIds="workspaceIds" />
  </v-main>
</template>

<style scoped>
.pane {
  width: calc(100vw - 200px);
  height: calc(100vh - 200px);
  padding: 16px;
}
</style>
