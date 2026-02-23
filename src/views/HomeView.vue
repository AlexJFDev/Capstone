<script setup lang="ts">
import RoadmapPane from '@/components/roadmap/RoadmapPane.vue'

const TEST_WORKSPACE_ID = 'w-1a2b3c4d-5e6f-7890-abcd-ef1234567890'
</script>

<template>
  <v-main>
    <div class="pane">
      <RoadmapPane :workspaceId="TEST_WORKSPACE_ID"/>
    </div>
  </v-main>
</template>

<style scoped>
.pane {
  width: calc(100vw - 200px);
  height: calc(100vh - 200px);
  padding: 16px;
}
</style>
