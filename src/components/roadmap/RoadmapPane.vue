<script setup lang="ts">
import { workspaces } from '@/testing/dummy-workspaces'
import RoadmapItemList from './RoadmapItemList.vue';
import RoadmapChart, { type RoadmapScale } from './RoadmapChart.vue';

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
        <div class="chart-header"></div>
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
    width: 400px;
    
    .list-box {
      background-color: rgba(0, 0, 0, 0.12);
      height: 30px;
    }
  }

  .chart-header {
    width: calc(100% - 400px);
  }
}

.list-margin {
  height: 30px;
  width: 400px;
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
  border-color: rgba(0, 0, 0, 0.12);
}
</style>