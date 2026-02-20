<script setup lang="ts">
import { type Workspace } from '@/testing/dummy-workspaces'
import ItemRow from '../items/ItemRow.vue'
import { items } from '@/testing/dummy-items'

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
      <v-container class="table-container bg-white text-black rounded-lg border pa-0">
        <ItemRow
          v-for="itemId in workspace.items"
          :key="itemId"
          :item="items[itemId]!"
        />
      </v-container>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.table-container {
  overflow: hidden;
}
</style>
