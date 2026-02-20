<script setup lang="ts">
import { workspaces } from '@/testing/dummy-workspaces';
import ItemList from '../items/ItemList.vue'

const props = defineProps<{
  workspaceId: string
}>()

const workspace = workspaces[props.workspaceId]!

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
