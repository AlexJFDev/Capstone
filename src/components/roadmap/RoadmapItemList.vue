<script setup lang="ts">
import { items } from '@/testing/dummy-items';


defineProps<{
  itemIds: Array<string>
}>()

</script>

<template>
  <div class="items-list-wrapper">
    <div
      v-for="itemId in itemIds"
      :key="itemId"
      class="item-row"
    >
      <div class="move-buttons">
        <v-btn icon="mdi-menu-up" density="compact" size="x-small" variant="text" />
        <v-btn icon="mdi-menu-down" density="compact" size="x-small" variant="text" />
      </div>
      <div class="item-name">{{ items[itemId]?.name }}</div>
      <div class="settings-button">
        <v-btn icon="mdi-cog" density="compact" size="small" variant="text" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.items-list-wrapper {
  width: 400px;
}

.item-row {
  height: 30px;
  display: flex;

  .move-buttons {
    display: flex;
    flex-direction: column;
  }

}

</style>