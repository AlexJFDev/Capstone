<!-- Right-side drawer panel for viewing an item's details, schedule, color, and workspace memberships in read-only mode. -->
<script setup lang="ts">
import DateChip from '@/components/DateChip.vue'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import WorkspaceChip from '@/components/collections/CollectionChip.vue'
import { useItemsStore } from '@/stores/items'
import { useCollectionsStore } from '@/stores/collections'
import { constructEmptyItem } from '@/types/items'
import { computed } from 'vue'

const model = defineModel<boolean>()

const props = defineProps<{
  itemId?: string
}>()

const itemsStore = useItemsStore()
const collectionsStore = useCollectionsStore()

const item = computed(() =>
  props.itemId ? itemsStore.getItem(props.itemId) : constructEmptyItem(),
)

const collectionIds = computed(() =>
  props.itemId
    ? collectionsStore.collectionIds.filter((wid) =>
        collectionsStore.getWorkspace(wid).items.includes(props.itemId!),
      )
    : [],
)
</script>

<template>
  <v-navigation-drawer v-if="item" v-model="model" temporary touchless location="right" width="500">
    <!-- HEADER -->
    <v-toolbar class="header" density="compact">
      <v-btn icon="mdi-close" @click="model = false" />
      <v-toolbar-title>{{ item.name }}</v-toolbar-title>
    </v-toolbar>

    <!-- BODY -->
    <div class="pa-3 d-flex flex-column ga-3">
      <v-card variant="outlined">
        <v-card-title class="text-subtitle-2">Details</v-card-title>
        <v-divider />
        <v-card-text>
          <MarkdownRenderer class="text-body-2" :content="item.description" />
        </v-card-text>
      </v-card>

      <v-row no-gutters class="ga-3">
        <v-col cols="8">
          <v-card variant="outlined">
            <v-card-title class="text-subtitle-2">Schedule</v-card-title>
            <v-divider />
            <v-card-text class="d-flex flex-column ga-1">
              <div class="d-flex align-center ga-2">
                <span class="text-caption text-medium-emphasis date-label">Start</span>
                <DateChip :date="item.startDate" />
              </div>
              <div class="d-flex align-center ga-2">
                <span class="text-caption text-medium-emphasis date-label">End</span>
                <DateChip :date="item.endDate" />
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col>
          <v-card variant="outlined" height="100%">
            <v-card-title class="text-subtitle-2">Appearance</v-card-title>
            <v-divider />
            <v-card-text>
              <v-chip :color="item.color" label>{{ item.color }}</v-chip>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-card variant="outlined">
        <v-card-title class="text-subtitle-2">Workspaces</v-card-title>
        <v-divider />
        <v-card-text class="d-flex flex-wrap ga-1">
          <WorkspaceChip v-for="wid in collectionIds" :key="wid" :collectionId="wid" />
          <span v-if="collectionIds.length === 0" class="text-body-2 text-medium-emphasis">
            Not in any workspaces
          </span>
        </v-card-text>
      </v-card>
    </div>
  </v-navigation-drawer>
</template>

<style scoped>
.date-label {
  min-width: 2.5rem;
}

.header {
  position: sticky;
  top: 0;
  z-index: 1;
}
</style>
