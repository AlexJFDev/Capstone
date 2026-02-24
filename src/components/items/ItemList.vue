<script setup lang="ts">
import { computed } from 'vue'
import ColorSwatch from '@/components/ColorSwatch.vue'
import { useItemsStore } from '@/stores/items'

const props = withDefaults(defineProps<{
  edit?: boolean
  maxItems?: number
}>(), {
  edit: false,
  maxItems: 10,
})

const model = defineModel<string[]>({ default: [] })

const itemsStore = useItemsStore()

const visibleItems = computed(() => props.edit ? model.value : model.value.slice(0, props.maxItems))
const hasMore = computed(() => !props.edit && model.value.length > props.maxItems)

const removeItem = (_itemId: string) => {}
const addItem = () => {}
const viewMore = () => {}
</script>

<template>
  <div class="item-list bg-white text-black rounded-lg border">

    <v-row
      v-for="(itemId, index) in visibleItems"
      :key="itemId"
      class="ma-0"
      :class="{ 'border-b': edit || index < visibleItems.length - 1 || hasMore }"
      align="center"
    >
      <v-col cols="1" class="d-flex justify-center">
        <ColorSwatch :color="itemsStore.getColor(itemId)" />
      </v-col>
      <v-col class="pa-0">
        {{ itemsStore.getName(itemId) }}
      </v-col>
      <v-col v-if="edit" cols="auto" class="pa-1">
        <v-btn
          icon="mdi-trash-can-outline"
          variant="text"
          density="compact"
          size="small"
          @click="removeItem(itemId)"
        />
      </v-col>
    </v-row>

    <v-row v-if="hasMore" class="ma-0 add-row" align="center" @click="viewMore">
      <v-col cols="1" class="d-flex justify-center">
        <div class="add-swatch d-flex align-center justify-center">
          <v-icon size="8">mdi-chevron-down</v-icon>
        </div>
      </v-col>
      <v-col class="pa-0 text-caption text-medium-emphasis">
        View {{ model.length - props.maxItems }} more
      </v-col>
    </v-row>

    <v-row v-if="edit" class="ma-0 add-row" align="center" @click="addItem">
      <v-col cols="1" class="d-flex justify-center">
        <div class="add-swatch d-flex align-center justify-center">
          <v-icon size="8">mdi-plus</v-icon>
        </div>
      </v-col>
      <v-col class="pa-0 text-caption text-medium-emphasis">
        Add item
      </v-col>
    </v-row>

  </div>
</template>

<style scoped>
.item-list {
  overflow: hidden;
}

.add-row {
  cursor: pointer;
}

.add-swatch {
  width: 10px;
  height: 10px;
  border: 1px dashed rgba(0, 0, 0, 0.38);
}
</style>
