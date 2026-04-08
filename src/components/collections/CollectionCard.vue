<!-- Card displaying a collection's name, description, and item list with hover actions to edit, open, or toggle as favorite. -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import ItemList from '../items/ItemList.vue'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import { useCollectionsStore } from '@/stores/collections'
import { useInterfaceStore } from '@/stores/interface'

const props = defineProps<{
  collectionId: string
}>()

const router = useRouter()
const collectionsStore = useCollectionsStore()
const userInterface = useInterfaceStore()

const collection = computed(() => collectionsStore.getCollection(props.collectionId))

const hovered = ref(false)

const isFavorite = computed(() => userInterface.favoriteCollectionId === props.collectionId)

function toggleFavorite() {
  userInterface.setFavoriteCollection(isFavorite.value ? null : props.collectionId)
}
</script>

<template>
  <v-card
    :title="collection.name"
    :color="collection.color"
    :elevation="hovered ? 8 : 2"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <template #append>
      <div class="d-flex align-center">
        <div class="actions" :class="{ visible: hovered }">
          <v-btn
            icon="mdi-pencil"
            density="compact"
            variant="text"
            @click="userInterface.openCollectionEditor(collectionId)"
          />
          <v-btn
            icon="mdi-open-in-new"
            density="compact"
            variant="text"
            @click="router.push({ name: 'workspace', params: { collectionId } })"
          />
        </div>
        <v-btn
          :icon="isFavorite ? 'mdi-star' : 'mdi-star-outline'"
          :color="isFavorite ? 'yellow' : undefined"
          class="star-btn"
          :class="{ visible: isFavorite || hovered }"
          density="compact"
          variant="text"
          @click="toggleFavorite"
        />
      </div>
    </template>

    <v-card-text class="d-flex ga-8 flex-column">
      <MarkdownRenderer :content="collection.description" />
      <ItemList v-model="collection.items" />
    </v-card-text>
  </v-card>
</template>

<style scoped>
.actions {
  display: flex;
  gap: 4px;
  visibility: hidden;
}

.actions.visible {
  visibility: visible;
}

.star-btn {
  visibility: hidden;
}

.star-btn.visible {
  visibility: visible;
}
</style>
