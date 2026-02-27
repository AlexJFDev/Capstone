<script setup lang="ts">
import BacklogList from '@/components/backlog/BacklogList.vue'
import { useItemsStore } from '@/stores/items'

const itemsStore = useItemsStore()
</script>

<template>
  <v-main>
    <div class="view">
      <div class="view-header">
        <div class="d-flex align-center ga-2">
          <v-icon>mdi-format-list-bulleted</v-icon>
          <span class="text-h6">Items</span>
        </div>
      </div>

      <BacklogList :itemIds="itemsStore.itemKeys" />
    </div>
  </v-main>
</template>

<style scoped>
.view {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 12px;
}

.view-header {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
</style>
