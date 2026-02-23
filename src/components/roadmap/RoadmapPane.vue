<script setup lang="ts">
import { workspaces } from '@/testing/dummy-workspaces'
import RoadmapItemList from './RoadmapItemList.vue';
import { LIST_WIDTH_PX, PANE_COLOR_PRIMARY, ROW_HEIGHT_PX, SECTION_BORDER_COLOR } from './constants'
import type { RoadmapScale } from './types'
import RoadmapChart from './RoadmapChart.vue'
import RoadmapHeader from './RoadmapHeader.vue';
import { computed } from 'vue';

const props = defineProps<{
  workspaceId: string,
}>()

const workspace = computed(() => workspaces[props.workspaceId]!)

const scale: RoadmapScale = {
  pixelsPerDay: 30,
  headerLabel: (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  gridInterval: 'week',
}

const addItem = () => {}

</script>

<template>
  <div class="roadmap-pane">

    <!-- Header -->
    <div class="header">
      <div class="list-header">
        <div class="list-box" />
        <v-btn flat class="add-button" @click="addItem">Add Item</v-btn>
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
</template>

<style scoped>
.roadmap-pane {
  height: 100%;
  overflow: auto;
  border: 2px solid v-bind(PANE_COLOR_PRIMARY);
  border-radius: 4px;

  .header {
    display: flex;
    background-color: rgb(var(--v-theme-surface));
    width: fit-content;
    min-width: 100%;

    border-bottom: 1px solid v-bind(SECTION_BORDER_COLOR);

    position: sticky;
    top: 0;
    z-index: 1;

    .list-header {
      width: v-bind(LIST_WIDTH_PX);
      border-right: 1px solid v-bind(SECTION_BORDER_COLOR);
      position: sticky;
      left: 0;

      background-color: rgb(var(--v-theme-surface));

      .list-box {
        background-color: v-bind(PANE_COLOR_PRIMARY);
        height: v-bind(ROW_HEIGHT_PX);
      }

      .add-button {
        width: v-bind(LIST_WIDTH_PX);
        height: v-bind(ROW_HEIGHT_PX);
        border-radius: 0;
      }
    }
  }

  .body {
    display: flex;
    width: fit-content;
    min-width: 100%;

    .item-list {
      border-right: 1px solid v-bind(SECTION_BORDER_COLOR);

      position: sticky;
      left: 0;
    }
  }
}
</style>