<!-- Stub page view that displays the active space's raw JSON along with its visualizations and collections. -->
<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSpacesStore } from '@/stores/spaces'
import { useVisualizationsStore } from '@/stores/visualizations'
import { useCollectionsStore } from '@/stores/collections'

const route = useRoute()
const router = useRouter()
const spacesStore = useSpacesStore()
const visualizationsStore = useVisualizationsStore()
const collectionsStore = useCollectionsStore()

// Handle space being deleted while viewing
watch(
  () => spacesStore.spaceIds,
  (ids) => {
    const routeId = route.params.spaceId as string
    if (routeId && !ids.includes(routeId)) {
      router.push({ name: 'home' })
    }
  },
)

const spaceId = computed(() => route.params.spaceId as string)

const space = computed(() => (spaceId.value ? spacesStore.getSpace(spaceId.value) : null))

const visualizations = computed(() =>
  space.value
    ? space.value.visualizationIds
        .filter((id) => visualizationsStore.doesVisualizationExist(id))
        .map((id) => ({ id, ...visualizationsStore.getVisualization(id) }))
    : [],
)

const collections = computed(() =>
  space.value
    ? space.value.collectionIds
        .filter((id) => collectionsStore.doesCollectionExist(id))
        .map((id) => ({ id, ...collectionsStore.getCollection(id) }))
    : [],
)
</script>

<template>
  <v-main style="height: 100vh; overflow: auto">
    <div v-if="!space" class="empty-state">
      <v-icon size="48" color="medium-emphasis">mdi-tab-unselected</v-icon>
      <p class="text-h6 text-medium-emphasis">Space not found</p>
    </div>

    <div v-else class="view">
      <div class="view-header">
        <div class="d-flex align-center ga-2">
          <v-icon>mdi-tab</v-icon>
          <span class="text-h6">{{ spacesStore.getSpaceName(spaceId) }}</span>
          <v-chip size="small" variant="tonal">{{ spaceId }}</v-chip>
        </div>
      </div>

      <v-card variant="outlined">
        <v-card-title class="text-body-1">Space</v-card-title>
        <v-card-text>
          <pre>{{ JSON.stringify({ id: spaceId, ...space }, null, 2) }}</pre>
        </v-card-text>
      </v-card>

      <v-card variant="outlined">
        <v-card-title class="text-body-1"
          >Visualizations ({{ visualizations.length }})</v-card-title
        >
        <v-card-text>
          <pre>{{ JSON.stringify(visualizations, null, 2) }}</pre>
        </v-card-text>
      </v-card>

      <v-card variant="outlined">
        <v-card-title class="text-body-1">Collections ({{ collections.length }})</v-card-title>
        <v-card-text>
          <pre>{{ JSON.stringify(collections, null, 2) }}</pre>
        </v-card-text>
      </v-card>
    </div>
  </v-main>
</template>

<style scoped>
.view {
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

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

pre {
  font-size: 0.8rem;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
