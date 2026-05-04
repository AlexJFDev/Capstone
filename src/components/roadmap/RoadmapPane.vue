<!-- Top-level roadmap layout: sticky header with timeline, scrollable item list and chart body, and an add-item menu.
     Accepts either collectionId (collection context, enables add-item and drag-to-reorder) or itemIds (read-only,
     used when rendering inside a SpaceView where items come from multiple collections). -->
<script setup lang="ts">
import { PANE_COLOR_PRIMARY, ROW_HEIGHT_PX, SECTION_BORDER_COLOR } from './constants'
import RoadmapChart from './RoadmapChart.vue'
import RoadmapHeader from './RoadmapHeader.vue'
import { computed, ref } from 'vue'
import { useCollectionsStore } from '@/stores/collections'
import { useInterfaceStore, type SortDirection, type SortOption } from '@/stores/interface'
import { useItemsStore } from '@/stores/items'
import AddItemMenu from '@/components/items/AddItemMenu.vue'
import { constructDefaultRoadmapSettings } from '@/types/settings/roadmap'
import type { RoadmapSettings } from '@/types/settings/roadmap'

const props = withDefaults(
  defineProps<{
    collectionId?: string
    itemIds?: string[]
    settings?: RoadmapSettings
  }>(),
  { 
    collectionId: () => '',
    itemIds: () => [],
    settings: constructDefaultRoadmapSettings 
  },
)

const collectionsStore = useCollectionsStore()
const userInterface = useInterfaceStore()
const itemsStore = useItemsStore()

const collection = computed(() =>
  props.collectionId ? collectionsStore.getCollection(props.collectionId) : null,
)

const {
  roadmapListWidth: listWidth,
  sortField,
  sortIsAscending
} = props.settings

const listWidthPx = computed(() => `${listWidth}px`)
const sortOption = computed<SortOption>(() => {
  if (sortField === 'name') return 'name'
  if (sortField === 'startDate') return 'startDate'
  if (sortField === 'endDate') return 'endDate'
  return 'custom'
})
const sortDirection = computed<SortDirection>(() => sortIsAscending ? 'asc' : 'desc')

const baseItemIds = computed(() => {
  if (props.itemIds) return props.itemIds
  if (collection.value) return collection.value.items
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
  if (!props.collectionId) return
  collectionsStore.addItemToCollection(itemId, props.collectionId)
}

async function newItem() {
  if (!props.collectionId) return
  const itemId = await userInterface.openItemCreator()
  if (itemId) collectionsStore.addItemToCollection(itemId, props.collectionId)
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
            v-if="collectionId && collection"
            :excluded-item-ids="collection.items"
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

      <!-- Body: RoadmapChart -->
      <div class="body">
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
    }
  }
}
</style>
