<script setup lang="ts">
import { type Item } from '@/testing/dummy-items'

defineProps<{
  item: Item
}>()
</script>

<template>
  <v-row class="item-row border-b ma-0" align="center">
    <v-col cols="1" class="d-flex justify-center">
      <div class="color-swatch rounded-sm" :style="{ backgroundColor: item.color }" />
    </v-col>
    <v-col class="pa-0">
      {{ item.name }}
    </v-col>
  </v-row>
</template>

<style scoped>
.item-row:last-child {
  border-bottom: none;
}

.color-swatch {
  width: 10px;
  height: 10px;
}
</style>