<script setup lang="ts">
import { ref } from 'vue'
import ItemEditorPanel from '@/components/items/ItemEditorPanel.vue'
import ItemViewerPanel from '@/components/items/ItemViewerPanel.vue'
import WorkspaceEditorPanel from '@/components/workspaces/WorkspaceEditorPanel.vue'
import WorkspacesPanel from '@/components/workspaces/WorkspacesPanel.vue'

const itemEditorOpen = ref(false)
const itemViewerOpen = ref(false)
const workspaceEditorOpen = ref(false)
const workspacesOpen = ref(false)
</script>

<template>
  <v-main>
    <v-container>
      <v-row>
        <v-col cols="auto">
          <v-btn @click="itemEditorOpen = true">Item Editor</v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn @click="itemViewerOpen = true">Item Viewer</v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn @click="workspaceEditorOpen = true">Workspace Editor</v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn @click="workspacesOpen = true">Workspaces</v-btn>
        </v-col>
      </v-row>
    </v-container>

    <ItemEditorPanel v-model="itemEditorOpen" />
    <ItemViewerPanel v-model="itemViewerOpen" />
    <WorkspaceEditorPanel v-model="workspaceEditorOpen" />
    <WorkspacesPanel v-model="workspacesOpen" />
  </v-main>
</template>
