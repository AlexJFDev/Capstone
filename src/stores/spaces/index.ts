// Pinia store for spaces: composes validation, initialization, accessor, mutation, membership, and scrubbing sub-modules.
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Space } from '@/types/spaces'
import { useSpacesInitialization } from './initialization'
import { useSpacesValidation } from './validation'
import { useSpacesAccessors } from './accessors'
import { useSpacesMutations } from './mutations'
import { useSpacesMembership } from './space-membership'
import { useSpacesScrubbing } from './scrubbing'

export const useSpacesStore = defineStore('spaces', () => {
  const spaces = ref<Record<string, Space>>({})
  const spaceIds = computed(() => Object.keys(spaces.value))

  const { doesSpaceExist, validateSpaceExists } = useSpacesValidation(spaces)
  const { initializeSpaces } = useSpacesInitialization(spaces)
  const { getSpace, getSpaceName, getSpaceColor } = useSpacesAccessors(spaces, validateSpaceExists)
  const { addSpace, updateSpace, deleteSpace } = useSpacesMutations(
    spaces,
    getSpace,
    validateSpaceExists,
  )
  const { scrubSpace, scrubAllSpaces } = useSpacesScrubbing(spaces, getSpace, validateSpaceExists)
  const {
    addCollectionToSpace,
    removeCollectionFromSpace,
    addVisualizationToSpace,
    removeVisualizationFromSpace,
  } = useSpacesMembership(spaces, getSpace, validateSpaceExists)

  return {
    spaceIds,
    initializeSpaces,
    doesSpaceExist,
    validateSpaceExists,
    getSpace,
    getSpaceName,
    getSpaceColor,
    addSpace,
    updateSpace,
    deleteSpace,
    scrubSpace,
    scrubAllSpaces,
    addCollectionToSpace,
    removeCollectionFromSpace,
    addVisualizationToSpace,
    removeVisualizationFromSpace,
  }
})
