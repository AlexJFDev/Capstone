<!-- Root application shell: renders the app bar, router view, and all global overlay panels (editors, speedbump). -->
<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { useInterfaceStore } from './stores/interface'
import { useWorkspacesStore } from './stores/workspaces'
import { useSpacesStore } from './stores/spaces'
import ItemEditorPanel from './components/items/ItemEditorPanel.vue'
import ItemViewerPanel from './components/items/ItemViewerPanel.vue'
import WorkspaceEditorPanel from './components/workspaces/WorkspaceEditorPanel.vue'
import WorkspacesPanel from './components/workspaces/WorkspacesPanel.vue'
import SpaceEditorPanel from './components/spaces/SpaceEditorPanel.vue'
import SpacesPanel from './components/spaces/SpacesPanel.vue'
import SpeedbumpDialog from './SpeedbumpDialog.vue'
import SettingsPanel from './components/roadmap/SettingsPanel.vue'

const router = useRouter()
const userInterface = useInterfaceStore()
const workspacesStore = useWorkspacesStore()
const spacesStore = useSpacesStore()
</script>

<template>
  <v-app>
    <v-app-bar elevation="0" border="b">
      <template #prepend>
        <v-img src="/Chronicle/favicon.svg" width="32" height="32" class="ml-2" />
      </template>
      <v-app-bar-title>Chronicle</v-app-bar-title>
      <template #append>
        <v-btn
          prepend-icon="mdi-format-list-bulleted"
          variant="text"
          @click="router.push({ name: 'items' })"
        >
          Items
        </v-btn>
        <v-btn prepend-icon="mdi-tab-plus" variant="text" @click="userInterface.toggleSpaces(true)">
          Spaces
        </v-btn>
        <v-btn
          prepend-icon="mdi-view-dashboard-outline"
          variant="text"
          @click="userInterface.toggleWorkspaces(true)"
        >
          Workspaces
        </v-btn>
        <v-btn
          v-if="router.hasRoute('test')"
          prepend-icon="mdi-flask-outline"
          variant="text"
          @click="router.push({ name: 'test' })"
        >
          Test
        </v-btn>
      </template>
    </v-app-bar>
    <RouterView />

    <ItemEditorPanel
      v-model="userInterface.itemEditorOpen"
      :item-id="userInterface.editingItemId"
    />
    <ItemViewerPanel
      v-model="userInterface.itemViewerOpen"
      :item-id="userInterface.viewingItemId"
    />
    <WorkspaceEditorPanel
      v-model="userInterface.workspaceEditorOpen"
      :workspace-id="userInterface.editingWorkspaceId"
    />
    <WorkspacesPanel
      v-model="userInterface.workspacesOpen"
      :workspace-ids="workspacesStore.workspaceIds"
    />
    <SpaceEditorPanel
      v-model="userInterface.spaceEditorOpen"
      :space-id="userInterface.editingSpaceId"
    />
    <SpacesPanel v-model="userInterface.spacesOpen" :space-ids="spacesStore.spaceIds" />
    <SettingsPanel v-model="userInterface.settingsOpen" />
    <SpeedbumpDialog />
  </v-app>
</template>
