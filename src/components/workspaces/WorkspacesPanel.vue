<script setup lang="ts">
import { workspaces } from '@/testing/dummy-workspaces'
import WorkspaceCard from './WorkspaceCard.vue'

const workspaceIds = Object.keys(workspaces)

const model = defineModel<boolean>()
</script>

<template>
  <v-navigation-drawer
    v-model="model"
    temporary
  >
    <!-- HEADER -->
    <v-toolbar density="compact">
      <v-btn icon="mdi-close" @click="model = false" />
      <v-toolbar-title>Workspaces</v-toolbar-title>
    </v-toolbar>

    <!-- BODY -->
    <div class="pa-3 d-flex flex-column ga-3">
      <WorkspaceCard
        v-for="workspaceId in workspaceIds"
        :key="workspaceId"
        :workspace="workspaces[workspaceId]!"
      />
    </div>
  </v-navigation-drawer>
</template>

<style scoped>
</style>
