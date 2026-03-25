<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import ItemList from '../items/ItemList.vue'
import { useWorkspacesStore } from '@/stores/workspaces'
import { constructEmptyWorkspace } from '@/types'
import { useInterfaceStore } from '@/stores/interface';
import { renderMarkdown } from '@/utils/markdown'

const props = defineProps<{
  workspaceId: string
}>()

const router = useRouter()
const workspacesStore = useWorkspacesStore()
const userInterface = useInterfaceStore()

const workspace = computed(() => workspacesStore.getWorkspace(props.workspaceId))
const renderedDescription = computed(() => renderMarkdown(workspace.value.description))

const hovered = ref(false)
</script>

<template>
  <v-card
    :title="workspace.name"
    :color="workspace.color"
    :elevation="hovered ? 8 : 2"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <template #append>
      <div class="actions" :class="{ visible: hovered }">
        <v-btn
          icon="mdi-pencil"
          density="compact"
          variant="text" 
          @click="userInterface.openWorkspaceEditor(workspaceId)"
        />
        <v-btn 
          icon="mdi-open-in-new"
          density="compact"
          variant="text"
          @click="router.push({ name: 'workspace', params: { workspaceId } })"
        />
      </div>
    </template>

    <v-card-text class="d-flex ga-8 flex-column">
      <div class="markdown-body" v-html="renderedDescription" />
      <ItemList v-model="workspace.items"/>
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

.markdown-body :deep(> *:first-child) {
  margin-top: 0;
}

.markdown-body :deep(> *:last-child) {
  margin-bottom: 0;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4),
.markdown-body :deep(h5),
.markdown-body :deep(h6) {
  margin: 0.5em 0;
  font-weight: 600;
  line-height: 1.3;
}

.markdown-body :deep(p) {
  margin: 0.5em 0;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

.markdown-body :deep(code) {
  font-family: monospace;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 3px;
  padding: 0.1em 0.3em;
}

.markdown-body :deep(pre) {
  background: rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  padding: 0.75em 1em;
  overflow-x: auto;
  margin: 0.5em 0;
}

.markdown-body :deep(pre code) {
  background: none;
  padding: 0;
}

.markdown-body :deep(blockquote) {
  border-left: 3px solid rgba(0, 0, 0, 0.2);
  margin: 0.5em 0;
  padding-left: 1em;
  opacity: 0.7;
}
</style>
