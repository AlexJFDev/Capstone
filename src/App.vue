<!-- Root application shell: renders the app bar, router view, and all global overlay panels (editors, speedbump). -->
<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { useInterfaceStore } from './stores/interface'
import { useCollectionsStore } from './stores/collections'
import { useSpacesStore } from './stores/spaces'
import ItemEditorPanel from './components/items/ItemEditorPanel.vue'
import ItemViewerPanel from './components/items/ItemViewerPanel.vue'
import CollectionEditorPanel from './components/collections/CollectionEditorPanel.vue'
import CollectionsPanel from './components/collections/CollectionsPanel.vue'
import SpaceEditorPanel from './components/spaces/SpaceEditorPanel.vue'
import SpacesPanel from './components/spaces/SpacesPanel.vue'
import SpeedbumpDialog from './SpeedbumpDialog.vue'
import SettingsPanel from './components/roadmap/SettingsPanel.vue'

const router = useRouter()
const userInterface = useInterfaceStore()
const collectionsStore = useCollectionsStore()
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
          @click="userInterface.toggleCollections(true)"
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
    <CollectionEditorPanel
      v-model="userInterface.collectionEditorOpen"
      :collection-id="userInterface.editingCollectionId"
    />
    <CollectionsPanel
      v-model="userInterface.collectionsOpen"
      :collection-ids="collectionsStore.collectionIds"
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
