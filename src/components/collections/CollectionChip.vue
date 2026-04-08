<!-- Renders a small colored chip for a workspace, adding a subtle border when the workspace color is very light. -->
<script setup lang="ts">
import { computed } from 'vue'
import { useCollectionsStore } from '@/stores/collections'
import { isLightColor } from '@/utils/colors'

const props = defineProps<{
  collectionId: string
}>()

const collectionsStore = useCollectionsStore()

const workspace = computed(() => collectionsStore.getCollection(props.collectionId))
const showBorder = computed(() => isLightColor(workspace.value.color))
</script>

<template>
  <v-chip
    :color="workspace.color"
    size="small"
    variant="flat"
    :style="showBorder ? { border: '1px solid rgba(0,0,0,0.2)' } : {}"
  >
    {{ workspace.name }}
  </v-chip>
</template>
