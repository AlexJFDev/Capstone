<script setup lang="ts">
const model = defineModel<boolean>()
</script>

<template>
  <v-navigation-drawer
    v-model="model"
    temporary
  >
    <div class="item-viewer-panel">
      <p>ItemViewerPanel</p>
    </div>
  </v-navigation-drawer>
</template>

<style scoped>
</style>
