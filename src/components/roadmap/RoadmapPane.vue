<!-- Top-level roadmap layout: sticky header with timeline, scrollable item list and chart body, and an add-item menu.
     Accepts either workspaceId (workspace context, enables add-item and drag-to-reorder) or itemIds (read-only,
     used when rendering inside a SpaceView where items come from multiple workspaces). -->
<script setup lang="ts">
import RoadmapItemList from './RoadmapItemList.vue'
import { PANE_COLOR_PRIMARY, ROW_HEIGHT_PX, SECTION_BORDER_COLOR } from './constants'
import RoadmapChart from './RoadmapChart.vue'
import RoadmapHeader from './RoadmapHeader.vue'
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useWorkspacesStore } from '@/stores/workspaces'
import { useInterfaceStore } from '@/stores/interface'
import { useItemsStore } from '@/stores/items'
import AddItemMenu from '@/components/items/AddItemMenu.vue'

const props = defineProps<{
  workspaceId?: string
  itemIds?: string[]
}>()

const workspacesStore = useWorkspacesStore()
const userInterface = useInterfaceStore()
const itemsStore = useItemsStore()

const workspace = computed(() =>
  props.workspaceId ? workspacesStore.getWorkspace(props.workspaceId) : null,
)

const {
  roadmapListWidth: listWidth,
  roadmapListWidthPx: listWidthPx,
  sortOption,
  sortDirection,
} = storeToRefs(userInterface)

const baseItemIds = computed(() => {
  if (props.itemIds) return props.itemIds
  if (workspace.value) return workspace.value.items
  return []
})

const sortedItemIds = computed(() => {
  const ids = [...baseItemIds.value]
  if (sortOption.value === 'custom') return ids

  return ids.toSorted((a, b) => {
    let comparison = 0
    if (sortOption.value === 'name') {
      comparison = itemsStore.getName(a).localeCompare(itemsStore.getName(b))
    } else if (sortOption.value === 'startDate') {
      comparison = itemsStore.getStartDate(a).getTime() - itemsStore.getStartDate(b).getTime()
    } else if (sortOption.value === 'endDate') {
      comparison = itemsStore.getEndDate(a).getTime() - itemsStore.getEndDate(b).getTime()
    }
    return sortDirection.value === 'asc' ? comparison : -comparison
  })
})

function addItem(itemId: string) {
  if (!props.workspaceId) return
  workspacesStore.addItemToWorkspace(itemId, props.workspaceId)
}

async function newItem() {
  if (!props.workspaceId) return
  const itemId = await userInterface.openItemCreator()
  if (itemId) workspacesStore.addItemToWorkspace(itemId, props.workspaceId)
}

const hoveredItemId = ref<string | null>(null)
</script>

<template>
  <div class="roadmap-wrapper">
    <div class="roadmap-pane">
      <!-- Header -->
      <div class="header">
        <div class="list-header">
          <div class="list-box" />
          <AddItemMenu
            v-if="workspaceId && workspace"
            :excluded-item-ids="workspace.items"
            @add-item="addItem"
            @new-item="newItem"
          >
            <template #default="menuProps">
              <v-btn flat class="add-button" v-bind="menuProps">Add Item</v-btn>
            </template>
          </AddItemMenu>
          <div v-else class="add-button" />
        </div>
        <RoadmapHeader :item-ids="sortedItemIds" />
      </div>

      <!-- Body: Items List & Roadmap Render -->
      <div class="body">
        <!-- Item List -->
        <RoadmapItemList
          v-model:hovered-item-id="hoveredItemId"
          class="item-list"
          :workspace-id="workspaceId"
          :list-width="listWidth"
          :item-ids="sortedItemIds"
        />

        <!-- Roadmap Chart -->
        <RoadmapChart
          v-model:hovered-item-id="hoveredItemId"
          class="chart"
          :item-ids="sortedItemIds"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.roadmap-wrapper {
  height: 100%;
  width: 100%;

  .roadmap-pane {
    max-height: 100%;
    overflow: auto;
    border: 2px solid v-bind(PANE_COLOR_PRIMARY);
    border-radius: 4px;

    .header {
      display: flex;
      background-color: rgb(var(--v-theme-surface));
      width: fit-content;
      min-width: 100%;

      border-bottom: 1px solid v-bind(SECTION_BORDER_COLOR);

      position: sticky;
      top: 0;
      z-index: 1;

      .list-header {
        width: v-bind(listWidthPx);
        border-right: 1px solid v-bind(SECTION_BORDER_COLOR);
        position: sticky;
        left: 0;

        background-color: rgb(var(--v-theme-surface));

        .list-box {
          background-color: v-bind(PANE_COLOR_PRIMARY);
          height: v-bind(ROW_HEIGHT_PX);
        }

        .add-button {
          width: v-bind(listWidthPx);
          height: v-bind(ROW_HEIGHT_PX);
          border-radius: 0;
        }
      }
    }

    .body {
      display: flex;
      width: fit-content;
      min-width: 100%;

      .item-list {
        border-right: 1px solid v-bind(SECTION_BORDER_COLOR);
      }
    }
  }
}
</style>
