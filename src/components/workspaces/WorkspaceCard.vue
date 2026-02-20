<script setup lang="ts">
import { type Workspace } from '@/testing/dummy-workspaces'
import ItemList from '../items/ItemList.vue'

defineProps<{
  workspace: Workspace
}>()


</script>

<template>
  <v-card
    :title="workspace.name"
    :color="workspace.color"
  >
    <v-card-text class="d-flex ga-8 flex-column">
      {{ workspace.description }}
      <ItemList v-model="workspace.items"/>
    </v-card-text>
  </v-card>
</template>

<style scoped>
</style>
