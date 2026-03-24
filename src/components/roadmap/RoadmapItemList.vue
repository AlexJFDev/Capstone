<script setup lang="ts">
import { useItemsStore } from '@/stores/items'
import { useInterfaceStore } from '@/stores/interface'
import { LIST_BORDER_COLOR, ROW_HEIGHT, ROW_HEIGHT_PX, SECTION_BORDER_COLOR } from './constants'
import { computed, ref } from 'vue';
import { useWorkspacesStore } from '@/stores/workspaces';


const props = defineProps<{
  workspaceId: string
  listWidth: number
}>()

const listWidthPx = computed(() => `${props.listWidth}px`)

const itemsStore = useItemsStore()
const workspacesStore = useWorkspacesStore()
const interfaceStore = useInterfaceStore()

const itemIds = computed(() => workspacesStore.getWorkspace(props.workspaceId).items)

const draggingItemId = ref<string | null>(null)
const ghostX = ref(0)
const ghostY = ref(0)

// Position ghost so the drag-bar icon center sits under the cursor
const ghostStyle = computed(() => ({
  left: `${ghostX.value - ROW_HEIGHT / 2}px`,
  top: `${ghostY.value - ROW_HEIGHT / 2}px`,
  width: `${props.listWidth}px`,
  height: ROW_HEIGHT_PX,
}))

function startDrag(event: MouseEvent, itemId: string) {
  event.preventDefault()
  draggingItemId.value = itemId
  ghostX.value = event.clientX
  ghostY.value = event.clientY
  document.body.style.cursor = 'grabbing'

  let startY = event.clientY
  let accumulatedDelta = 0

  function onMouseMove(e: MouseEvent) {
    ghostX.value = e.clientX
    ghostY.value = e.clientY

    accumulatedDelta += e.clientY - startY
    startY = e.clientY

    const steps = Math.trunc(accumulatedDelta / ROW_HEIGHT)
    if (steps === 0) return

    const items = workspacesStore.getWorkspace(props.workspaceId).items
    const currentIndex = items.indexOf(itemId)
    const newIndex = currentIndex + steps

    if (newIndex >= 0 && newIndex < items.length) {
      workspacesStore.moveItem(props.workspaceId, itemId, steps)
      accumulatedDelta -= steps * ROW_HEIGHT
    } else {
      accumulatedDelta = 0
    }
  }

  function onMouseUp() {
    draggingItemId.value = null
    document.body.style.cursor = ''
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

</script>

<template>
  <div class="items-list-wrapper">
    <div
      v-for="(itemId, index) in itemIds"
      :key="itemId"
      class="item-row"
      :class="{ 'drag-target': itemId === draggingItemId }"
    >
      <template v-if="itemId !== draggingItemId">
        <div class="drag-bar" @mousedown="startDrag($event, itemId)">
          <v-icon>mdi-drag-horizontal</v-icon>
        </div>
        <div class="item-name" @click="interfaceStore.openItemViewer(itemId)">{{ itemsStore.getName(itemId) }}</div>
        <div class="settings-button" @click.stop="interfaceStore.openItemEditor(itemId)">
          <v-icon>mdi-cog</v-icon>
        </div>
      </template>
    </div>
  </div>

  <Teleport to="body">
    <div v-if="draggingItemId" class="drag-ghost" :style="ghostStyle">
      <div class="drag-bar-ghost">
        <v-icon>mdi-drag-horizontal</v-icon>
      </div>
      <div class="item-name-ghost">{{ itemsStore.getName(draggingItemId) }}</div>
    </div>
  </Teleport>
</template>

<style scoped>
.items-list-wrapper {
  width: v-bind(listWidthPx);
  min-width: v-bind(listWidthPx);
  height: 100%;
  background-color: rgb(var(--v-theme-surface));
  border-right: 1px solid v-bind(SECTION_BORDER_COLOR);
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

      &.invisible {
        visibility: hidden;
      }

      &:hover {
        background-color: rgba(0, 0, 0, 0.08);
      }

      &:active {
        background-color: rgba(0, 0, 0, 0.16);
      }
    }
  }

  .drag-bar {
    visibility: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    width: v-bind(ROW_HEIGHT_PX);
    height: 100%;
    cursor: move;
    border-radius: 2px;
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
    .drag-bar,
    .settings-button {
      visibility: visible;
    }
  }

  &.drag-target {
    box-shadow: inset 0 2px 0 rgba(0, 0, 0, 0.35), inset 0 -2px 0 rgba(0, 0, 0, 0.35);
  }

}

.drag-ghost {
  position: fixed;
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgb(var(--v-theme-surface));
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border-radius: 2px;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.9;
  overflow: hidden;
}

.drag-bar-ghost {
  display: flex;
  justify-content: center;
  align-items: center;
  width: v-bind(ROW_HEIGHT_PX);
  height: 100%;
  flex-shrink: 0;
}

.item-name-ghost {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>