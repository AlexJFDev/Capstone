<script setup lang="ts">
import { computed, ref } from 'vue'
import RoadmapPane from '@/components/roadmap/RoadmapPane.vue'

const WORKSPACE_IDS = [
  'w-1a2b3c4d-5e6f-7890-abcd-ef1234567890',
  'w-2b3c4d5e-6f7a-8901-bcde-f12345678901',
]

const workspaceIndex = ref(0)
const workspaceId = computed(() => {
  return WORKSPACE_IDS[workspaceIndex.value]!
})

function toggle() {
  workspaceIndex.value = (workspaceIndex.value + 1) % WORKSPACE_IDS.length

  console.log("Toggled")
}
</script>

<template>
  <v-main>
    <div class="pane">
      <v-btn @click="toggle" style="margin-bottom: 8px">Toggle Workspace</v-btn>
      <RoadmapPane :workspaceId="workspaceId" />
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
