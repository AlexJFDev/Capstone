<script setup lang="ts">
import { type Item } from '@/testing/dummy-items'

defineProps<{
  item: Item
}>()
</script>

<template>
  <div class="item-row border-b py-2 px-4">
    {{ item.name }}
  </div>
</template>

<style scoped>
.item-row:last-child {
  border-bottom: none;
}
</style>