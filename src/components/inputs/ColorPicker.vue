<!-- Color picker input with a random-color button, built on v-input. -->
<script setup lang="ts">
import { generateRandomColor } from '@/utils/colors'

const model = defineModel<string>()
</script>

<template>
  <v-input :model-value="model">
    <template #default>
      <div class="d-flex align-center ga-2 w-100">
        <v-text-field
          v-model="model"
          label="Color"
          variant="outlined"
          density="compact"
          type="color"
          hide-details
        />
        <v-btn
          icon="mdi-dice-multiple"
          size="small"
          variant="text"
          title="Random color"
          @click="model = generateRandomColor()"
        />
      </div>
    </template>
  </v-input>
</template>
