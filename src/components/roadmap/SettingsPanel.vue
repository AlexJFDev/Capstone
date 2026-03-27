<script setup lang="ts">
import { useInterfaceStore } from '@/stores/interface'
import type { RoadmapInterval } from '@/components/roadmap/roadmap-utils'
import { DEFAULT_INTERVAL, DEFAULT_LIST_WIDTH, DEFAULT_PIXELS_PER_DAY, MAX_LIST_WIDTH, MIN_LIST_WIDTH } from '@/components/roadmap/constants'

const model = defineModel<boolean>()
const userInterface = useInterfaceStore()

const intervalOptions: { label: string; value: RoadmapInterval }[] = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
]

function updatePixelsPerDay(value: number) {
  userInterface.updateRoadmapScale({ ...userInterface.roadmapScale, pixelsPerDay: value })
}

function updateGridInterval(value: RoadmapInterval) {
  userInterface.updateRoadmapScale({ ...userInterface.roadmapScale, gridInterval: value })
}

async function reset() {
  if (await userInterface.confirm('Reset all settings to their defaults?')) {
    await userInterface.updateRoadmapScale({ ...userInterface.roadmapScale, pixelsPerDay: DEFAULT_PIXELS_PER_DAY, gridInterval: DEFAULT_INTERVAL })
    await userInterface.updateRoadmapListWidth(DEFAULT_LIST_WIDTH)
  }
}
</script>

<template>
  <v-navigation-drawer
    v-model="model"
    temporary
    touchless
    location="right"
    width="400"
  >
    <!-- HEADER -->
    <v-toolbar class="header" density="compact">
      <v-btn icon="mdi-close" @click="model = false" />
      <v-toolbar-title>Settings</v-toolbar-title>
    </v-toolbar>

    <!-- BODY -->
    <div class="pa-3 d-flex flex-column ga-3">

      <v-card variant="outlined">
        <v-card-title class="text-subtitle-2">Timeline</v-card-title>
        <v-divider />
        <v-card-text class="d-flex flex-column ga-4">

          <div>
            <div class="text-caption text-medium-emphasis mb-1">Grid interval</div>
            <v-btn-toggle
              :model-value="userInterface.roadmapScale.gridInterval"
              mandatory
              variant="outlined"
              density="compact"
              divided
              @update:model-value="updateGridInterval"
            >
              <v-btn
                v-for="option in intervalOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </v-btn>
            </v-btn-toggle>
          </div>

          <div>
            <div class="d-flex justify-space-between">
              <span class="text-caption text-medium-emphasis">Zoom</span>
              <span class="text-caption text-medium-emphasis">{{ userInterface.roadmapScale.pixelsPerDay }}px / day</span>
            </div>
            <v-slider
              :model-value="userInterface.roadmapScale.pixelsPerDay"
              :min="5"
              :max="100"
              :step="1"
              hide-details
              @update:model-value="updatePixelsPerDay"
            />
          </div>

        </v-card-text>
      </v-card>

      <v-card variant="outlined">
        <v-card-title class="text-subtitle-2">Layout</v-card-title>
        <v-divider />
        <v-card-text>
          <div>
            <div class="d-flex justify-space-between">
              <span class="text-caption text-medium-emphasis">Item list width</span>
              <span class="text-caption text-medium-emphasis">{{ userInterface.roadmapListWidth }}px</span>
            </div>
            <v-slider
              :model-value="userInterface.roadmapListWidth"
              :min="MIN_LIST_WIDTH"
              :max="MAX_LIST_WIDTH"
              :step="1"
              hide-details
              @update:model-value="userInterface.updateRoadmapListWidth"
            />
          </div>
        </v-card-text>
      </v-card>

    </div>

    <!-- FOOTER -->
    <template #append>
      <v-divider />
      <div class="pa-2">
        <v-btn block color="red" @click="reset">Reset to defaults</v-btn>
      </div>
    </template>

  </v-navigation-drawer>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 1;
}
</style>
