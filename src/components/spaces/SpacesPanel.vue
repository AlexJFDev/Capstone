<!-- Right-side drawer listing all space cards plus a button to create a new space. -->
<script setup lang="ts">
import SpaceCard from './SpaceCard.vue'
import { useInterfaceStore } from '@/stores/interface'

defineProps<{
  spaceIds: Array<string>
}>()

const model = defineModel<boolean>()

const userInterface = useInterfaceStore()

function addSpace() {
  userInterface.openSpaceCreator()
}
</script>

<template>
  <v-navigation-drawer v-model="model" temporary touchless width="500">
    <!-- HEADER -->
    <v-toolbar class="header" density="compact">
      <v-btn icon="mdi-close" @click="model = false" />
      <v-toolbar-title>Spaces</v-toolbar-title>
    </v-toolbar>

    <!-- BODY -->
    <div class="pa-3 d-flex flex-column ga-3">
      <SpaceCard v-for="spaceId in spaceIds" :key="spaceId" :space-id="spaceId" />

      <v-card class="add-space-card" variant="outlined" @click="addSpace">
        <v-card-title class="d-flex align-center ga-2 text-medium-emphasis">
          <v-icon>mdi-plus</v-icon>
          New space
        </v-card-title>
      </v-card>
    </div>
  </v-navigation-drawer>
</template>

<style scoped>
.add-space-card {
  cursor: pointer;
  border-style: dashed !important;
}

.header {
  position: sticky;
  top: 0;
  z-index: 1;
}
</style>
