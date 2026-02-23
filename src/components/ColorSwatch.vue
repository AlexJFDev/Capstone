<script setup lang="ts">
defineProps<{
  color: string
}>()
</script>

<template>
  <div class="color-swatch rounded-sm" :style="{ backgroundColor: color }" />
</template>

<style scoped>
.color-swatch {
  width: 10px;
  height: 10px;
}
</style>
