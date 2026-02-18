<script setup lang="ts">
import { type Item } from '@/testing/dummy-items'

const props = defineProps<{
  item: Item
}>()
</script>

<template>
  <v-row>
    {{ item.name }}
  </v-row>
</template>

<style scoped>

</style>