<script setup lang="ts">
import RoadmapItemList from './RoadmapItemList.vue'
import { PANE_COLOR_PRIMARY, ROW_HEIGHT_PX, SECTION_BORDER_COLOR } from './constants'
import RoadmapChart from './RoadmapChart.vue'
import RoadmapHeader from './RoadmapHeader.vue'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useWorkspacesStore } from '@/stores/workspaces'
import { useInterfaceStore } from '@/stores/interface'
import AddItemMenu from '@/components/items/AddItemMenu.vue'

const props = defineProps<{
  workspaceId: string,
}>()

const workspacesStore = useWorkspacesStore()
const userInterface = useInterfaceStore()

const workspace = computed(() => workspacesStore.getWorkspace(props.workspaceId))

// const scale: RoadmapScale = {
//   pixelsPerDay: 30,
//   headerLabel: (date: Date) => date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
//   gridInterval: 'week'
// }

const { roadmapScale: scale, roadmapListWidth: listWidth, roadmapListWidthPx: listWidthPx } = storeToRefs(userInterface)

function addItem(itemId: string) {
  workspacesStore.updateWorkspace(props.workspaceId, { items: [...workspace.value.items, itemId] })
}

async function newItem() {
  const itemId = await userInterface.openItemCreator()
  if (itemId) workspacesStore.updateWorkspace(props.workspaceId, { items: [...workspace.value.items, itemId] })
}

</script>

<template>
  <div class="roadmap-wrapper">
    <div class="roadmap-pane">

      <!-- Header -->
      <div class="header">
        <div class="list-header">
          <div class="list-box" />
          <AddItemMenu :excluded-item-ids="workspace.items" @add-item="addItem" @new-item="newItem">
            <template #default="menuProps">
              <v-btn flat class="add-button" v-bind="menuProps">Add Item</v-btn>
            </template>
          </AddItemMenu>
        </div>
        <RoadmapHeader :itemIds="workspace.items" :scale="scale" :listWidth="listWidth"/>
      </div>

      <!-- Body: Items List & Roadmap Render -->
      <div class="body">
        <!-- Item List -->
        <RoadmapItemList class="item-list" :workspace-id="workspaceId" />

        <!-- Roadmap Chart -->
        <RoadmapChart class="chart" :itemIds="workspace.items" :scale="scale" :listWidth="listWidth"/>
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

        position: sticky;
        left: 0;
      }
    }
  }
}
</style>