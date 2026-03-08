<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { useInterfaceStore } from './stores/interface'
import { useWorkspacesStore } from './stores/workspaces'
import ItemEditorPanel from './components/items/ItemEditorPanel.vue'
import ItemViewerPanel from './components/items/ItemViewerPanel.vue'
import WorkspaceEditorPanel from './components/workspaces/WorkspaceEditorPanel.vue'
import WorkspacesPanel from './components/workspaces/WorkspacesPanel.vue'
import SpeedbumpDialog from './SpeedbumpDialog.vue'

const router = useRouter()
const userInterface = useInterfaceStore()
const workspacesStore = useWorkspacesStore()
</script>

<template>
  <v-app>
    <v-app-bar elevation="0" border="b">
      <v-app-bar-title>Chronicle</v-app-bar-title>
      <template #append>
        <v-btn
          prepend-icon="mdi-format-list-bulleted"
          variant="text"
          @click="router.push({ name: 'items' })"
        >
          Items
        </v-btn>
        <v-btn
          prepend-icon="mdi-view-dashboard-outline"
          variant="text"
          @click="userInterface.openWorkspaces"
        >
          Workspaces
        </v-btn>
      </template>
    </v-app-bar>
    <RouterView />

    <ItemEditorPanel v-model="userInterface.itemEditorOpen" :item-id="userInterface.editingItemId" />
    <ItemViewerPanel v-model="userInterface.itemViewerOpen" :item-id="userInterface.viewingItemId" />
    <WorkspaceEditorPanel v-model="userInterface.workspaceEditorOpen" :workspace-id="userInterface.editingWorkspaceId" />
    <WorkspacesPanel v-model="userInterface.workspacesOpen" :workspaceIds="workspacesStore.workspaceIds" />
    <SpeedbumpDialog />
  </v-app>
</template>
