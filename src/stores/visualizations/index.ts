// Pinia store for visualizations: composes validation, initialization, accessor, and mutation sub-modules into a single public API.
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Visualization } from '@/types/visualizations'
import { useVisualizationsInitialization } from './initialization'
import { useVisualizationsValidation } from './validation'
import { useVisualizationsAccessors } from './accessors'
import { useVisualizationsMutations } from './mutations'

export const useVisualizationsStore = defineStore('visualizations', () => {
  const visualizations = ref<Record<string, Visualization>>({})
  const visualizationIds = computed(() => Object.keys(visualizations.value))

  const { doesVisualizationExist, validateVisualizationExists } =
    useVisualizationsValidation(visualizations)
  const { initializeVisualizations } = useVisualizationsInitialization(visualizations)
  const {
    getVisualization,
    getVisualizationName,
    getVisualizationType,
    getVisualizationSettings,
  } = useVisualizationsAccessors(visualizations, validateVisualizationExists)
  const { addVisualization, updateVisualization, deleteVisualization } =
    useVisualizationsMutations(visualizations, getVisualization, validateVisualizationExists)

  return {
    visualizationIds,
    initializeVisualizations,
    doesVisualizationExist,
    validateVisualizationExists,
    getVisualization,
    getVisualizationName,
    getVisualizationType,
    getVisualizationSettings,
    addVisualization,
    updateVisualization,
    deleteVisualization,
  }
})
