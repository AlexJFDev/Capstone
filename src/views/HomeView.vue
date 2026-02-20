<script setup lang="ts">
import RoadmapPane from '@/components/roadmap/RoadmapPane.vue'

const TEST_WORKSPACE_ID = 'w-1a2b3c4d-5e6f-7890-abcd-ef1234567890'
</script>

<template>
  <v-main>
    <RoadmapPane :workspaceId="TEST_WORKSPACE_ID"/>
  </v-main>
</template>
