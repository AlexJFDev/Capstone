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
  min-width: 400px;
  height: 100%;
  border-right: 1px solid rgba(0, 0, .5);
  background-color: rgb(var(--v-theme-surface));
  position: sticky;
  left: 0;
  z-index: 1;
}

.item-row {
  height: 30px;
  display: flex;
  gap: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);

  &:first-child {
    border-top: none;
  }

  & + .item-row {
    border-top: none;
  }
  align-items: center;

  .move-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 24px;
    visibility: hidden;
  }

  .settings-button {
    display: flex;
    flex: 1;
    justify-content: flex-end;
    padding-right: 8px;
    visibility: hidden;
  }

  &:hover {
    .move-buttons,
    .settings-button {
      visibility: visible;
    }
  }

}
</style>