// Defines Visualization type factory, equality, ID validation, and generation helpers.

import { areBacklogSettingsEqual, type BacklogSettings } from './settings/backlog'
import {
  areRoadmapSettingsEqual,
  constructDefaultRoadmapSettings,
  type RoadmapSettings,
} from './settings/roadmap'

// Add 'calendar' | 'board'
export type VisualizationType = 'roadmap' | 'backlog'

export type VisualizationSettings = RoadmapSettings | BacklogSettings

export interface Visualization {
  name: string
  type: VisualizationType
  settings: VisualizationSettings
}

export function constructNewVisualization(): Visualization {
  return {
    name: 'Visualization',
    type: 'roadmap',
    settings: constructDefaultRoadmapSettings(),
  }
}

export function areVisualizationsEqual(
  visualization1: Visualization,
  visualization2: Visualization,
): boolean {
  if (visualization1 === visualization2) return true

  if (visualization1.name !== visualization2.name) return false
  if (visualization1.type !== visualization2.type) return false

  if (visualization1.type === 'roadmap') {
    return areRoadmapSettingsEqual(
      visualization1.settings as RoadmapSettings,
      visualization2.settings as RoadmapSettings,
    )
  }

  return areBacklogSettingsEqual(
    visualization1.settings as BacklogSettings,
    visualization2.settings as BacklogSettings,
  )
}

const VISUALIZATION_UUID_REGEX =
  /^v-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export function isValidVisualizationId(id: string): boolean {
  return VISUALIZATION_UUID_REGEX.test(id)
}
export function validateVisualizationId(id: string) {
  if (!isValidVisualizationId(id)) {
    throw new Error(`Invalid visualization id: "${id}"`)
  }
}

export function generateVisualizationId() {
  return `v-${crypto.randomUUID()}`
}
