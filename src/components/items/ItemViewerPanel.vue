<script setup lang="ts">
import { items } from '@/testing/dummy-items'
import { ref } from 'vue'
import DateChip from '@/components/DateChip.vue'

// TODO: Make prop based
const item = ref(items['i-a1b2c3d4-e5f6-7890-abcd-ef1234567890']!)

const model = defineModel<boolean>()
</script>

<template>
  <v-navigation-drawer v-model="model" temporary location="right">

    <!-- HEADER -->
    <v-toolbar density="compact">
      <v-btn icon="mdi-close" @click="model = false" />
      <v-toolbar-title>{{ item.name }}</v-toolbar-title>
    </v-toolbar>

    <!-- BODY -->
    <div class="pa-3 d-flex flex-column ga-3">

      <v-card variant="outlined">
        <v-card-title class="text-subtitle-2">Details</v-card-title>
        <v-divider />
        <v-card-text>
          <p class="text-body-2">{{ item.description }}</p>
        </v-card-text>
      </v-card>

      <v-card variant="outlined">
        <v-card-title class="text-subtitle-2">Schedule</v-card-title>
        <v-divider />
        <v-card-text class="d-flex flex-column ga-1">
          <div class="d-flex align-center ga-2">
            <span class="text-caption text-medium-emphasis date-label">Start</span>
            <DateChip :date="item['start-date']" />
          </div>
          <div class="d-flex align-center ga-2">
            <span class="text-caption text-medium-emphasis date-label">End</span>
            <DateChip :date="item['end-date']" />
          </div>
        </v-card-text>
      </v-card>

      <v-card variant="outlined">
        <v-card-title class="text-subtitle-2">Appearance</v-card-title>
        <v-divider />
        <v-card-text>
          <v-chip :color="item.color" label>{{ item.color }}</v-chip>
        </v-card-text>
      </v-card>

    </div>

  </v-navigation-drawer>
</template>

<style scoped>
</style>
