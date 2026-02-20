<script setup lang="ts">
const model = defineModel<boolean>()
</script>

<template>
  <v-navigation-drawer
    v-model="model"
    temporary
    width="500"
  >
    <div class="workspace-editor-panel">
      <p>WorkspaceEditorPanel</p>
    </div>
  </v-navigation-drawer>
</template>

<style scoped>
</style>
