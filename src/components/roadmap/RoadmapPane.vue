<script setup lang="ts">
import RoadmapItemList from './RoadmapItemList.vue'
import { LIST_BORDER_COLOR, LIST_WIDTH_PX, PANE_COLOR_PRIMARY, ROW_HEIGHT_PX, SECTION_BORDER_COLOR } from './constants'
import RoadmapChart from './RoadmapChart.vue'
import RoadmapHeader from './RoadmapHeader.vue'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useWorkspacesStore } from '@/stores/workspaces'
import { useInterfaceStore } from '@/stores/interface'
import { constructEmptyWorkspace } from '@/types'
import AddItemMenu from '@/components/items/AddItemMenu.vue'
import type { RoadmapScale } from './roadmap-utils'

const props = defineProps<{
  workspaceId: string,
}>()

const workspacesStore = useWorkspacesStore()
const userInterface = useInterfaceStore()

const workspace = computed(() => workspacesStore.getWorkspace(props.workspaceId))

const scale: RoadmapScale = {
  pixelsPerDay: 30,
  headerLabel: (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  gridInterval: 'week',
}

function addItem(itemId: string) {
  workspacesStore.updateWorkspace(props.workspaceId, { items: [...workspace.value.items, itemId] })
}

async function newItem() {
  const itemId = await userInterface.openItemCreator()
  if (itemId) workspacesStore.updateWorkspace(props.workspaceId, { items: [...workspace.value.items, itemId] })
}

const paneRef = ref<HTMLElement | null>(null)
const hasHorizontalScroll = ref(false)
const hasVerticalScroll = ref(false)

function updateScrollState() {
  const el = paneRef.value
  if (!el) return
  hasHorizontalScroll.value = el.scrollWidth > el.clientWidth
  hasVerticalScroll.value = el.scrollHeight > el.clientHeight
}

watch(() => workspace.value.items, () => nextTick(updateScrollState))

let resizeObserver: ResizeObserver

onMounted(() => {
  resizeObserver = new ResizeObserver(updateScrollState)
  if (paneRef.value) resizeObserver.observe(paneRef.value)
  nextTick(updateScrollState)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})

</script>

<template>
  <div class="roadmap-wrapper">
    <div
      ref="paneRef"
      class="roadmap-pane"
      :class="{ 'scroll-x': hasHorizontalScroll, 'scroll-y': hasVerticalScroll }"
    >

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
        <RoadmapHeader :itemIds="workspace.items" :scale="scale" />
      </div>

      <!-- Body: Items List & Roadmap Render -->
      <div class="body">
        <!-- Item List -->
        <RoadmapItemList class="item-list" :workspace-id="workspaceId" />

        <!-- Roadmap Chart -->
        <RoadmapChart class="chart" :itemIds="workspace.items" :scale="scale" />
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

    &.scroll-x {
      box-shadow: inset 0 -1px 0 v-bind(LIST_BORDER_COLOR);
    }

    &.scroll-y {
      box-shadow: inset -1px 0 0 v-bind(LIST_BORDER_COLOR);
    }

    &.scroll-x.scroll-y {
      box-shadow: inset 0 -1px 0 v-bind(LIST_BORDER_COLOR), inset -1px 0 0 v-bind(LIST_BORDER_COLOR);
    }

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
        width: v-bind(LIST_WIDTH_PX);
        border-right: 1px solid v-bind(SECTION_BORDER_COLOR);
        position: sticky;
        left: 0;

        background-color: rgb(var(--v-theme-surface));

        .list-box {
          background-color: v-bind(PANE_COLOR_PRIMARY);
          height: v-bind(ROW_HEIGHT_PX);
        }

        .add-button {
          width: v-bind(LIST_WIDTH_PX);
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