<script setup lang="ts">
import DateChip from '@/components/DateChip.vue'
import { useItemsStore } from '@/stores/items'
import { constructEmptyItem } from '@/types'
import { computed } from 'vue'
import { renderMarkdown } from '@/utils/markdown'

const model = defineModel<boolean>()

const props = defineProps<{
  itemId?: string
}>()

const itemsStore = useItemsStore()

const item = computed(
  () => props.itemId ?
    itemsStore.getItem(props.itemId) :
    constructEmptyItem()
)

const renderedDescription = computed(() => renderMarkdown(item.value.description))

</script>

<template>
  <v-navigation-drawer
    v-if="item"
    v-model="model"
    temporary 
    location="right"
    width="500"
  >

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
          <div class="text-body-2 markdown-body" v-html="renderedDescription" />
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

.markdown-body :deep(> *:first-child) {
  margin-top: 0;
}

.markdown-body :deep(> *:last-child) {
  margin-bottom: 0;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4),
.markdown-body :deep(h5),
.markdown-body :deep(h6) {
  margin: 0.5em 0;
  font-weight: 600;
  line-height: 1.3;
}

.markdown-body :deep(p) {
  margin: 0.5em 0;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

.markdown-body :deep(code) {
  font-family: monospace;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 3px;
  padding: 0.1em 0.3em;
}

.markdown-body :deep(pre) {
  background: rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  padding: 0.75em 1em;
  overflow-x: auto;
  margin: 0.5em 0;
}

.markdown-body :deep(pre code) {
  background: none;
  padding: 0;
}

.markdown-body :deep(blockquote) {
  border-left: 3px solid rgba(0, 0, 0, 0.2);
  margin: 0.5em 0;
  padding-left: 1em;
  color: rgba(0, 0, 0, 0.6);
}
</style>
