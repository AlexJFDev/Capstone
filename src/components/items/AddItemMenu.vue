<script setup lang="ts">
import { computed } from 'vue'
import { useItemsStore } from '@/stores/items'
import ColorSwatch from '@/components/ColorSwatch.vue'

const props = defineProps<{
  excludedItemIds: string[]
}>()

const emit = defineEmits<{
  addItem: [itemId: string]
  newItem: []
}>()

const itemsStore = useItemsStore()

const availableItems = computed(() =>
  itemsStore.itemKeys.filter(id => !props.excludedItemIds.includes(id))
)
</script>

<template>
  <v-menu :close-on-content-click="true">
    <template #activator="{ props: menuProps }">
      <slot v-bind="menuProps" />
    </template>

    <v-list class="menu-list pa-0">
      <!-- Sticky "New item" entry -->
      <v-list-item class="new-item-entry" @click="emit('newItem')">
        <template #prepend>
          <v-icon class="mr-1">mdi-plus</v-icon>
        </template>
        <v-list-item-title>New item</v-list-item-title>
      </v-list-item>

      <v-divider />

      <!-- Available items -->
      <v-list-item
        v-for="itemId in availableItems"
        :key="itemId"
        @click="emit('addItem', itemId)"
      >
        <template #prepend>
          <ColorSwatch :color="itemsStore.getColor(itemId)" class="mr-3" />
        </template>
        <v-list-item-title>{{ itemsStore.getName(itemId) }}</v-list-item-title>
      </v-list-item>

      <v-list-item v-if="availableItems.length === 0" disabled>
        <v-list-item-title class="text-medium-emphasis text-caption">All items are already added</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<style scoped>
.menu-list {
  max-height: 300px;
  overflow-y: auto;
}

.new-item-entry {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: rgb(var(--v-theme-surface));
}
</style>
