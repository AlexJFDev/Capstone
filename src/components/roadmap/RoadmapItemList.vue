<script setup lang="ts">
import { useItemsStore } from '@/stores/items'
import { useInterfaceStore } from '@/stores/interface'
import { LIST_BORDER_COLOR, LIST_WIDTH_PX, ROW_HEIGHT_PX } from './constants'
import { computed } from 'vue';
import { useWorkspacesStore } from '@/stores/workspaces';


const props = defineProps<{
  workspaceId: string
}>()

const itemsStore = useItemsStore()
const workspacesStore = useWorkspacesStore()
const interfaceStore = useInterfaceStore()

const itemIds = computed(() => workspacesStore.getWorkspace(props.workspaceId).items)

function moveUp(itemId: string) {
  workspacesStore.moveItem(props.workspaceId, itemId, -1)
}

function moveDown(itemId: string) {
  workspacesStore.moveItem(props.workspaceId, itemId, 1)
}

</script>

<template>
  <div class="items-list-wrapper">
    <div
      v-for="itemId in itemIds"
      :key="itemId"
      class="item-row"
    >
      <div class="move-buttons">
        <v-icon class="move-button" size="x-small" @click="moveUp(itemId)">mdi-menu-up</v-icon>
        <v-icon class="move-button" size="x-small" @click="moveDown(itemId)">mdi-menu-down</v-icon>
      </div>
      <div class="item-name" @click="interfaceStore.openItemViewer(itemId)">{{ itemsStore.getName(itemId) }}</div>
      <div class="settings-button" @click.stop="interfaceStore.openItemEditor(itemId)">
        <v-icon>mdi-cog</v-icon>
      </div>
    </div>
  </div>
</template>

<style scoped>
.items-list-wrapper {
  width: v-bind(LIST_WIDTH_PX);
  min-width: v-bind(LIST_WIDTH_PX);
  height: 100%;
  background-color: rgb(var(--v-theme-surface));
}

.item-row {
  height: v-bind(ROW_HEIGHT_PX);
  display: flex;
  gap: 8px;
  border-top: 1px solid v-bind(LIST_BORDER_COLOR);
  border-bottom: 1px solid v-bind(LIST_BORDER_COLOR);

  &:first-child {
    border-top: none;
  }

  &:last-child {
    border-bottom: none;
  }

  & + .item-row {
    border-top: none;
  }
  align-items: center;

  .item-name {
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    cursor: pointer;
  }

  .move-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: v-bind(ROW_HEIGHT_PX);
    visibility: hidden;

    .move-button {
      cursor: pointer;
      width: 100%;
      border-radius: 2px;

      &:hover {
        background-color: rgba(0, 0, 0, 0.08);
      }

      &:active {
        background-color: rgba(0, 0, 0, 0.16);
      }
    }
  }

  .settings-button {
    visibility: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    width: v-bind(ROW_HEIGHT_PX);
    height: 100%;
    cursor: pointer;
    border-radius: 2px;

    &:hover {
      background-color: rgba(0, 0, 0, 0.08);
    }

    &:active {
      background-color: rgba(0, 0, 0, 0.16);
    }
  }

  &:hover {
    .move-buttons,
    .settings-button {
      visibility: visible;
    }
  }

}
</style>