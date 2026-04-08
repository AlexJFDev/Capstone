<!-- Development-only sandbox view for manually testing UI components and loading dummy data. -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import ItemEditorPanel from '@/components/items/ItemEditorPanel.vue'
import ItemViewerPanel from '@/components/items/ItemViewerPanel.vue'
import CollectionEditorPanel from '@/components/collections/CollectionEditorPanel.vue'
import CollectionsPanel from '@/components/collections/CollectionsPanel.vue'
import RoadmapPane from '@/components/roadmap/RoadmapPane.vue'
import { useCollectionsStore } from '@/stores/collections'
import { useInterfaceStore } from '@/stores/interface'
import SpeedbumpDialog from '@/SpeedbumpDialog.vue'
import BacklogList from '@/components/backlog/BacklogList.vue'
import { useItemsStore } from '@/stores/items'
import { useVisualizationsStore } from '@/stores/visualizations'
import { useSpacesStore } from '@/stores/spaces'
import { useRouter } from 'vue-router'
import { items as dummyItems } from '@/testing/dummy-items'
import { workspaces as dummyWorkspaces } from '@/testing/dummy-collections'
import { visualizations as dummyVisualizations } from '@/testing/dummy-visualizations'
import { spaces as dummySpaces } from '@/testing/dummy-spaces'
import { clearDatabase } from '@/db'

const collectionsStore = useCollectionsStore()
const itemsStore = useItemsStore()
const visualizationsStore = useVisualizationsStore()
const spacesStore = useSpacesStore()
const interfaceStore = useInterfaceStore()
const router = useRouter()

const test_item_id = computed(() => itemsStore.itemIds[0])

const collectionIds = collectionsStore.collectionIds

const itemEditorOpen = ref(false)
const itemViewerOpen = ref(false)
const collectionEditorOpen = ref(false)
const collectionsOpen = ref(false)

const workspaceIndex = ref(1)
const collectionId = computed(() => collectionIds[workspaceIndex.value]!)

function toggle() {
  workspaceIndex.value = (workspaceIndex.value + 1) % collectionIds.length
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
    if (!collectionsStore.doesCollectionExist(id)) {
      collectionsStore.addWorkspace(id, workspace)
    }
  }
  for (const [id, visualization] of Object.entries(dummyVisualizations)) {
    if (!visualizationsStore.doesVisualizationExist(id)) {
      visualizationsStore.addVisualization(id, visualization)
    }
  }
  for (const [id, space] of Object.entries(dummySpaces)) {
    if (!spacesStore.doesSpaceExist(id)) {
      spacesStore.addSpace(id, space)
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
          <v-btn @click="collectionEditorOpen = true">Workspace Editor</v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn @click="collectionsOpen = true">Workspaces</v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn @click="toggle">Toggle Workspace</v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn @click="interfaceStore.revealSpeedBump('Are you sure?')">Speedbump</v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn
            @click="router.push({ name: 'space', params: { spaceId: spacesStore.spaceIds[0] } })"
            >First Space</v-btn
          >
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
      <RoadmapPane v-if="collectionId" :collection-id="collectionId" />
    </div>

    <ItemEditorPanel v-model="itemEditorOpen" />
    <ItemViewerPanel v-if="test_item_id" v-model="itemViewerOpen" :item-id="test_item_id" />
    <CollectionEditorPanel v-model="collectionEditorOpen" />
    <CollectionsPanel v-model="collectionsOpen" :collection-ids="collectionIds" />
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
