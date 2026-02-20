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
    <div class="border-md rounded">

      <!-- Fixed Header: New Item button and the dates area -->
      <div class="margin">Header, New Item</div>

      <!-- Body: Items List & Roadmap Render -->
      <div class="body">
        <!-- Items List -->
        <RoadmapItemList :itemIds="workspace.items" />

        <!-- Roadmap Render -->
        <div class="roadmap-render">
          <RoadmapChart :itemIds="workspace.items" :scale="scale" />
        </div>
      </div>

      <!-- Fixed Footer: New Item Button -->
      <div class="margin">Footer, New Item</div>
    </div>
  </div>
</template>

<style scoped>
.margin {
  background-color: white;
  height: 30px;
}

.body {
  display: flex;
  max-height: calc(100vh - 200px);
}

.roadmap-render {
  overflow: auto;
  width: 100%;
}
</style>