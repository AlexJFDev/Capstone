<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RoadmapPane from '@/components/roadmap/RoadmapPane.vue'
import { useWorkspacesStore } from '@/stores/workspaces'
import { useInterfaceStore, type SortOption } from '@/stores/interface'

const route = useRoute()
const router = useRouter()
const workspacesStore = useWorkspacesStore()
const userInterface = useInterfaceStore()

const sortOptions: { label: string; value: SortOption }[] = [
  { label: 'Custom', value: 'custom' },
  { label: 'By start date', value: 'startDate' },
  { label: 'By end date', value: 'endDate' },
  { label: 'By name', value: 'name' },
]

// Handle workspace being deleted while viewing
watch(() => workspacesStore.workspaceIds, (ids) => {
  const routeId = route.params.workspaceId as string
  if (routeId && !ids.includes(routeId)) {
    router.push({ name: 'home' })
  }
})

const workspaceParam = computed(() => route.params.workspaceId as string)

const activeWorkspace = computed(() => workspaceParam.value || userInterface.defaultWorkspaceId)

const workspaceName = computed(() => activeWorkspace.value ?
    workspacesStore.getWorkspaceName(activeWorkspace.value) :
    ''
)

</script>

<template>
  <v-main style="height: 100vh; overflow: hidden;">
    <div v-if="!activeWorkspace" class="empty-state">
      <v-icon size="48" color="medium-emphasis">mdi-view-dashboard-outline</v-icon>
      <p class="text-headline-small text-medium-emphasis">No workspaces yet</p>
      <v-btn variant="tonal" prepend-icon="mdi-plus" @click="userInterface.openWorkspaceCreator()">
        New workspace
      </v-btn>
    </div>

    <div v-if="activeWorkspace" class="view">
      <div class="view-header">
        <div class="d-flex align-center ga-2">
          <v-icon>mdi-chart-gantt</v-icon>
          <span class="text-headline-small">{{ workspaceName }}</span>
        </div>
        <div class="d-flex">
          <div class="d-flex align-center ga-2">
            <v-select
              :model-value="userInterface.sortOption"
              :items="sortOptions"
              item-title="label"
              item-value="value"
              density="compact"
              hide-details
              variant="outlined"
              style="min-width: 160px;"
              label="Sort"
              @update:model-value="userInterface.setSortOption($event)"
            />
            <v-tooltip 
              :text="userInterface.sortDirectionIsAscending ? 'Ascending' : 'Descending'"
              location="bottom"
            >
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  :style="userInterface.sortingIsCustom ? 'visibility: hidden' : ''"
                  :icon="userInterface.sortDirectionIsAscending ? 'mdi-sort-ascending' : 'mdi-sort-descending'"
                  flat
                  density="compact"
                  @click="userInterface.setSortDirection(userInterface.sortDirectionIsAscending ? 'desc' : 'asc')"
                />
              </template>
            </v-tooltip>
          </div>
          <v-btn prepend-icon="mdi-cog" flat @click="userInterface.openSettings()">Settings</v-btn>
        </div>
      </div>

      <div class="roadmap-container">
        <RoadmapPane :workspace-id="activeWorkspace" />
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
  justify-content: space-between;
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
