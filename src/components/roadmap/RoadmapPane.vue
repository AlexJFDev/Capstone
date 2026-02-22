<script setup lang="ts">
import { workspaces } from '@/testing/dummy-workspaces'
import RoadmapItemList from './RoadmapItemList.vue';
import { LIST_WIDTH_PX, PANE_COLOR_PRIMARY, ROW_HEIGHT_PX } from './constants'
import type { RoadmapScale } from './types'
import RoadmapChart from './RoadmapChart.vue'
import RoadmapHeader from './RoadmapHeader.vue';

const props = defineProps<{
  workspaceId: string,
}>()

const workspace = workspaces[props.workspaceId]!

const scale: RoadmapScale = {
  pixelsPerDay: 30,
  headerLabel: (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  gridInterval: 'week',
}

</script>

<template>
  <div class="pa-8">
    <div class="roadmap-pane">

      <!-- Header -->
      <div class="header">
        <div class="list-header">
          <div class="list-box" />
          <div class="list-margin">Add Item</div>
        </div>
        <RoadmapHeader :itemIds="workspace.items" :scale="scale" />
      </div>

      <!-- Body: Items List & Roadmap Render -->
      <div class="body">
        <!-- Item List -->
        <RoadmapItemList :itemIds="workspace.items" />

        <!-- Roadmap Chart -->
        <RoadmapChart :itemIds="workspace.items" :scale="scale" />
      </div>

      <!-- Footer -->
      <div class="list-margin">Add Item</div>
    </div>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  flex-direction: row;
  background-color: rgb(var(--v-theme-surface));

  .list-header {
    display: flex;
    flex-direction: column;
    width: v-bind(LIST_WIDTH_PX);
    
    .list-box {
      background-color: v-bind(PANE_COLOR_PRIMARY);
      height: v-bind(ROW_HEIGHT_PX);
    }
  }

  .chart-header {
    width: calc(100% - v-bind(LIST_WIDTH_PX));
  }
}

.list-margin {
  height: v-bind(ROW_HEIGHT_PX);
  width: v-bind(LIST_WIDTH_PX);
}

.body {
  display: flex;
  max-height: calc(100vh - 250px);
}

.roadmap-pane {
  max-height: calc(100vh - 64px);
  overflow: auto;
  display: flex;
  flex-direction: column;
  border-width: 2px;
  border-radius: 4px;
  border-style: solid;
  border-color: v-bind(PANE_COLOR_PRIMARY);
}
</style>