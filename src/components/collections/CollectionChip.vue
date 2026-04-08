<!-- Renders a small colored chip for a collection, adding a subtle border when the collection color is very light. -->
<script setup lang="ts">
import { computed } from 'vue'
import { useCollectionsStore } from '@/stores/collections'
import { isLightColor } from '@/utils/colors'

const props = defineProps<{
  collectionId: string
}>()

const collectionsStore = useCollectionsStore()

const collection = computed(() => collectionsStore.getCollection(props.collectionId))
const showBorder = computed(() => isLightColor(collection.value.color))
</script>

<template>
  <v-chip
    :color="collection.color"
    size="small"
    variant="flat"
    :style="showBorder ? { border: '1px solid rgba(0,0,0,0.2)' } : {}"
  >
    {{ collection.name }}
  </v-chip>
</template>
