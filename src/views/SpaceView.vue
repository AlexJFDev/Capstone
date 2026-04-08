<!-- Page view for a Space: renders a tab bar of visualizations and the active visualization below it. -->
<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSpacesStore } from '@/stores/spaces'
import { useVisualizationsStore } from '@/stores/visualizations'
import { useWorkspacesStore } from '@/stores/workspaces'
import { useInterfaceStore } from '@/stores/interface'
import { constructNewVisualization, generateVisualizationId } from '@/types/visualizations'
import RoadmapPane from '@/components/roadmap/RoadmapPane.vue'
import BacklogList from '@/components/backlog/BacklogList.vue'

const route = useRoute()
const router = useRouter()
const spacesStore = useSpacesStore()
const visualizationsStore = useVisualizationsStore()
const workspacesStore = useWorkspacesStore()
const userInterface = useInterfaceStore()

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

const validVisualizationIds = computed(() =>
  space.value
    ? space.value.visualizationIds.filter((id) => visualizationsStore.doesVisualizationExist(id))
    : [],
)

// The currently selected visualization tab
const activeVisualizationId = ref<string | null>(null)

// Keep the active visualization valid when visualizations are added or removed
watch(
  validVisualizationIds,
  (ids) => {
    if (!activeVisualizationId.value || !ids.includes(activeVisualizationId.value)) {
      activeVisualizationId.value = ids[0] ?? null
    }
  },
  { immediate: true },
)

// Sync with the interface store so roadmap settings reflect the active visualization
watch(activeVisualizationId, (id) => userInterface.setActiveVisualization(id), { immediate: true })

// Reset when leaving the view so global roadmap settings apply elsewhere
onUnmounted(() => userInterface.setActiveVisualization(null))

// Collect unique item IDs from all of the space's workspaces in order
const spaceItemIds = computed(() => {
  if (!space.value) return []
  const seen = new Set<string>()
  const ids: string[] = []
  for (const workspaceId of space.value.workspaceIds) {
    if (!workspacesStore.doesWorkspaceExist(workspaceId)) continue
    for (const itemId of workspacesStore.getWorkspace(workspaceId).items) {
      if (!seen.has(itemId)) {
        seen.add(itemId)
        ids.push(itemId)
      }
    }
  }
  return ids
})

const activeVisualization = computed(() =>
  activeVisualizationId.value &&
  visualizationsStore.doesVisualizationExist(activeVisualizationId.value)
    ? visualizationsStore.getVisualization(activeVisualizationId.value)
    : null,
)

const visualizationTypeIcons: Record<string, string> = {
  roadmap: 'mdi-chart-gantt',
  backlog: 'mdi-format-list-bulleted',
  calendar: 'mdi-calendar',
  board: 'mdi-view-column',
}

function getVisualizationIcon(vizId: string): string {
  const vizType = visualizationsStore.getVisualizationType(vizId)
  return visualizationTypeIcons[vizType] ?? 'mdi-eye'
}

function addVisualization() {
  const newId = generateVisualizationId()
  visualizationsStore.addVisualization(newId, constructNewVisualization())
  spacesStore.addVisualizationToSpace(newId, spaceId.value)
  activeVisualizationId.value = newId
}

function openVisualizationSettings() {
  userInterface.toggleSettings(true)
}
</script>

<template>
  <v-main style="height: 100vh; overflow: hidden">
    <div v-if="!space" class="empty-state">
      <v-icon size="48" color="medium-emphasis">mdi-tab-unselected</v-icon>
      <p class="text-h6 text-medium-emphasis">Space not found</p>
    </div>

    <div v-else class="view">
      <!-- Tab bar -->
      <div class="tab-bar">
        <v-tabs v-model="activeVisualizationId" density="compact" class="flex-grow-1">
          <v-tab
            v-for="vizId in validVisualizationIds"
            :key="vizId"
            :value="vizId"
            class="visualization-tab"
          >
            <v-icon size="small" class="mr-1">{{ getVisualizationIcon(vizId) }}</v-icon>
            {{ visualizationsStore.getVisualizationName(vizId) }}
            <v-btn
              v-if="visualizationsStore.getVisualizationType(vizId) === 'roadmap'"
              icon="mdi-cog"
              variant="plain"
              density="compact"
              size="x-small"
              class="ml-1"
              @click.stop="openVisualizationSettings"
            />
          </v-tab>
        </v-tabs>
        <v-btn
          icon="mdi-plus"
          variant="text"
          density="compact"
          class="add-visualization-button"
          @click="addVisualization"
        />
      </div>

      <!-- Visualization content -->
      <div class="visualization-container">
        <template v-if="activeVisualization">
          <RoadmapPane
            v-if="activeVisualization.type === 'roadmap'"
            :item-ids="spaceItemIds"
            class="fill-height"
          />
          <BacklogList
            v-else-if="activeVisualization.type === 'backlog'"
            :item-ids="spaceItemIds"
          />
          <div v-else class="placeholder">
            <v-icon size="48" color="medium-emphasis">mdi-view-dashboard-outline</v-icon>
            <p class="text-medium-emphasis">
              {{ activeVisualization.type }} view is not yet available
            </p>
          </div>
        </template>

        <div v-else class="placeholder">
          <v-icon size="48" color="medium-emphasis">mdi-chart-timeline-variant</v-icon>
          <p class="text-h6 text-medium-emphasis">No visualizations yet</p>
          <v-btn variant="tonal" prepend-icon="mdi-plus" @click="addVisualization">
            Add visualization
          </v-btn>
        </div>
      </div>
    </div>
  </v-main>
</template>

<style scoped>
.view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tab-bar {
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  flex-shrink: 0;
}

.add-visualization-button {
  margin: 0 4px;
}

.visualization-tab {
  text-transform: none;
}

.visualization-container {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.fill-height {
  height: 100%;
}

.placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
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
