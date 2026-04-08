<!-- Card displaying a space's name and description with hover actions to edit or open it. Clicking the card navigates to the space and closes the panel. -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import { useSpacesStore } from '@/stores/spaces'
import { useInterfaceStore } from '@/stores/interface'

const props = defineProps<{
  spaceId: string
}>()

const router = useRouter()
const spacesStore = useSpacesStore()
const userInterface = useInterfaceStore()

const space = computed(() => spacesStore.getSpace(props.spaceId))

const hovered = ref(false)

function openSpace() {
  router.push({ name: 'space', params: { spaceId: props.spaceId } })
  userInterface.toggleSpaces(false)
}
</script>

<template>
  <v-card
    :title="space.name"
    :color="space.color"
    :elevation="hovered ? 8 : 2"
    style="cursor: pointer"
    @click="openSpace"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <template #append>
      <div class="actions" :class="{ visible: hovered }">
        <v-btn
          icon="mdi-pencil"
          density="compact"
          variant="text"
          @click.stop="userInterface.openSpaceEditor(spaceId)"
        />
      </div>
    </template>

    <v-card-text>
      <MarkdownRenderer :content="space.description" />
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
</style>
