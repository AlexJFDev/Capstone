<script setup lang="ts">
import { computed, ref } from 'vue'
import ItemEditorPanel from '@/components/items/ItemEditorPanel.vue'
import ItemViewerPanel from '@/components/items/ItemViewerPanel.vue'
import WorkspaceEditorPanel from '@/components/workspaces/WorkspaceEditorPanel.vue'
import WorkspacesPanel from '@/components/workspaces/WorkspacesPanel.vue'
import RoadmapPane from '@/components/roadmap/RoadmapPane.vue'
import { useWorkspacesStore } from '@/stores/workspaces'
import { useInterfaceStore } from '@/stores/interface'
import SpeedbumpDialog from '@/SpeedbumpDialog.vue'
import BacklogList from '@/components/backlog/BacklogList.vue'
import { useItemsStore } from '@/stores/items'
import { items as dummyItems } from '@/testing/dummy-items'
import { workspaces as dummyWorkspaces } from '@/testing/dummy-workspaces'
import { clearDatabase } from '@/db'

const workspacesStore = useWorkspacesStore()
const itemsStore = useItemsStore()
const interfaceStore = useInterfaceStore()

const test_item_id = itemsStore.itemIds[0]

const workspaceIds = workspacesStore.workspaceIds

const itemEditorOpen = ref(false)
const itemViewerOpen = ref(false)
const workspaceEditorOpen = ref(false)
const workspacesOpen = ref(false)

const workspaceIndex = ref(1)
const workspaceId = computed(() => workspaceIds[workspaceIndex.value]!)

function toggle() {
  workspaceIndex.value = (workspaceIndex.value + 1) % workspaceIds.length
}

async function clearAll() {
  await clearDatabase()
  window.location.reload()
}

function loadDummyData() {
  for (const [id, item] of Object.entries(dummyItems)) {
    if (!itemsStore.doesItemExist(id)) {
      itemsStore.addItem(id, item)
    }
  }
  for (const [id, workspace] of Object.entries(dummyWorkspaces)) {
    if (!workspacesStore.doesWorkspaceExist(id)) {
      workspacesStore.addWorkspace(id, workspace)
    }
  }
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
        <v-col cols="auto">
          <v-btn @click="interfaceStore.confirm('Are you sure?')">Speedbump</v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn @click="loadDummyData">Load Dummy Data</v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn @click="clearAll">Clear Database</v-btn>
        </v-col>
      </v-row>
    </v-container>

    <div class="pane">
      <RoadmapPane v-if="workspaceId" :workspaceId="workspaceId" />
    </div>

    <ItemEditorPanel v-model="itemEditorOpen" />
    <ItemViewerPanel v-if="test_item_id" v-model="itemViewerOpen" :itemId="test_item_id" />
    <WorkspaceEditorPanel v-model="workspaceEditorOpen" />
    <WorkspacesPanel v-model="workspacesOpen" :workspaceIds="workspaceIds" />
    <SpeedbumpDialog />

    <BacklogList :item-ids="itemsStore.itemIds" />
  </v-main>
</template>

<style scoped>
.pane {
  width: calc(100vw - 200px);
  height: calc(100vh - 200px);
  padding: 16px;
}
</style>
