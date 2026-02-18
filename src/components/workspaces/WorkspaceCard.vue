<script setup lang="ts">
import { type Workspace } from '@/testing/dummy-workspaces'
import ItemRow from '../items/ItemRow.vue'
import { items } from '@/testing/dummy-items'

const props = defineProps<{
  workspace: Workspace
}>()

const { workspace } = props

</script>

<template>
  <v-card
    :title="workspace.name"
    :color="workspace.color"
  >
    <v-card-text>
      {{ workspace.description }}
      <v-container>
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

</style>
