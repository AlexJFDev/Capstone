<script setup lang="ts">
import { type Workspace } from '@/testing/dummy-workspaces'

const props = defineProps<{
  workspace: Workspace
}>()

const { workspace } = props
</script>

<template>
  <v-card
    :title="workspace.name"
    :text="workspace.description"
    :color="workspace.color"
  />
</template>

<style scoped>

</style>
