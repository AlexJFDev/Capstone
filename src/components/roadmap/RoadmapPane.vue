<script setup lang="ts">
import { workspaces } from '@/testing/dummy-workspaces'
import RoadmapItemList from './RoadmapItemList.vue';
import { LIST_WIDTH_PX, PANE_COLOR_PRIMARY, ROW_HEIGHT_PX, SECTION_BORDER_COLOR } from './constants'
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
          <div>Add Item</div>
        </div>
        <RoadmapHeader :itemIds="workspace.items" :scale="scale" />
      </div>

      <!-- Body: Items List & Roadmap Render -->
      <div class="body">
        <!-- Item List -->
        <RoadmapItemList class="item-list" :itemIds="workspace.items" />

        <!-- Roadmap Chart -->
        <RoadmapChart class="chart" :itemIds="workspace.items" :scale="scale" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.roadmap-pane {
  max-height: calc(100vh - 64px);
  overflow: auto;
  display: flex;
  flex-direction: column;
  border: 2px solid v-bind(PANE_COLOR_PRIMARY);
  border-radius: 4px;

  .header {
    display: flex;
    background-color: rgb(var(--v-theme-surface));
    width: fit-content;

    border-bottom: 1px solid v-bind(SECTION_BORDER_COLOR);

    position: sticky;
    top: 0;
    z-index: 1;

    .list-header {
      display: flex;
      flex-direction: column;
      width: v-bind(LIST_WIDTH_PX);
      border-right: 1px solid v-bind(SECTION_BORDER_COLOR);
      position: sticky;
      left: 0;
      z-index: 2;

      background-color: rgb(var(--v-theme-surface));

      .list-box {
        background-color: v-bind(PANE_COLOR_PRIMARY);
        height: v-bind(ROW_HEIGHT_PX);
      }
    }

  }

  .body {
    display: flex;
    max-height: calc(100vh - 250px);
    width: fit-content;

    .item-list {
      border-right: 1px solid v-bind(SECTION_BORDER_COLOR);

      position: sticky;
      left: 0;
    }
  }
}
</style>