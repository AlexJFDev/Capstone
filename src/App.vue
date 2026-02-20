<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ref } from 'vue'
import ItemEditorPanel from '@/components/items/ItemEditorPanel.vue'
import ItemViewerPanel from '@/components/items/ItemViewerPanel.vue'
import WorkspaceEditorPanel from '@/components/workspaces/WorkspaceEditorPanel.vue'
import WorkspacesPanel from '@/components/workspaces/WorkspacesPanel.vue'
import { workspaces } from '@/testing/dummy-workspaces'

const TEST_ITEM_ID = 'i-a1b2c3d4-e5f6-7890-abcd-ef1234567890'

const workspaceIds = Object.keys(workspaces)

const itemEditorOpen = ref(false)
const itemViewerOpen = ref(false)
const workspaceEditorOpen = ref(false)
const workspacesOpen = ref(false)
</script>

<template>
  <v-app>
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
    <ItemViewerPanel v-model="itemViewerOpen" :itemId="TEST_ITEM_ID" />
    <WorkspaceEditorPanel v-model="workspaceEditorOpen" />
    <WorkspacesPanel v-model="workspacesOpen" :workspaceIds="workspaceIds" />
    
    <RouterView />
  </v-app>
</template>
