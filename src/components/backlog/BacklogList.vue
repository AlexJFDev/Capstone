<script setup lang="ts">
import { useItemsStore } from '@/stores/items'


defineProps<{
  itemIds: string[]
}>()

const itemStore = useItemsStore()

</script>

<template>
  <div
    v-for="itemId in itemIds"
    :key="itemId"
  >
    {{ itemStore.getItem(itemId) }}
  </div>
</template>

<style scoped>

</style>