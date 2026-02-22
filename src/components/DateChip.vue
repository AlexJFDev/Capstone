<script setup lang="ts">
import { computed } from 'vue'
import { formatDate, type DateStyle } from './utils';

const props = withDefaults(defineProps<{
  date: string | number | Date
  style?: DateStyle
}>(), {
  style: 'short-american'
})

const formatted = computed(() => formatDate(props.date, props.style))

</script>

<template>
  <div class="d-flex align-center ga-1">
    <v-icon size="small">mdi-calendar</v-icon>
    <span class="text-body-2">{{ formatted }}</span>
  </div>
</template>

<style scoped>
</style>
