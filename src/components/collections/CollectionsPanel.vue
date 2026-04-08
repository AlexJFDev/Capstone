<!-- Right-side drawer listing all collection cards sorted with the favorite first, plus a button to create a new collection. -->
<script setup lang="ts">
import { computed } from 'vue'
import CollectionCard from './CollectionCard.vue'
import { useInterfaceStore } from '@/stores/interface'

const props = defineProps<{
  collectionIds: Array<string>
}>()

const model = defineModel<boolean>()

const userInterface = useInterfaceStore()

const sortedWorkspaceIds = computed(() => {
  const favorite = userInterface.favoriteCollectionId
  if (!favorite || !props.collectionIds.includes(favorite)) return props.collectionIds
  return [favorite, ...props.collectionIds.filter((id) => id !== favorite)]
})

function addCollection() {
  userInterface.openCollectionCreator()
}
</script>

<template>
  <v-navigation-drawer v-model="model" temporary touchless width="500">
    <!-- HEADER -->
    <v-toolbar class="header" density="compact">
      <v-btn icon="mdi-close" @click="model = false" />
      <v-toolbar-title>Collections</v-toolbar-title>
    </v-toolbar>

    <!-- BODY -->
    <div class="pa-3 d-flex flex-column ga-3">
      <CollectionCard
        v-for="collectionId in sortedWorkspaceIds"
        :key="collectionId"
        :collection-id="collectionId"
      />

      <v-card class="add-workspace-card" variant="outlined" @click="addCollection">
        <v-card-title class="d-flex align-center ga-2 text-medium-emphasis">
          <v-icon>mdi-plus</v-icon>
          New collection
        </v-card-title>
      </v-card>
    </div>
  </v-navigation-drawer>
</template>

<style scoped>
.add-workspace-card {
  cursor: pointer;
  border-style: dashed !important;
}

.header {
  position: sticky;
  top: 0;
  z-index: 1;
}
</style>
