<script setup lang="ts">
import { items } from '@/testing/dummy-items'
import ColorSwatch from '@/components/ColorSwatch.vue'

withDefaults(defineProps<{
  edit?: boolean
}>(), {
  edit: false,
})

const model = defineModel<string[]>({ default: [] })

const removeItem = (_itemId: string) => {}
const addItem = () => {}
</script>

<template>
  <div class="item-list bg-white text-black rounded-lg border">

    <v-row
      v-for="(itemId, index) in model"
      :key="itemId"
      class="ma-0"
      :class="{ 'border-b': edit || index < model.length - 1 }"
      align="center"
    >
      <v-col cols="1" class="d-flex justify-center">
        <ColorSwatch :color="items[itemId]!.color" />
      </v-col>
      <v-col class="pa-0">
        {{ items[itemId]!.name }}
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
