// Defines RoadmapSettings type factory and equality.
// TODO_: Move RoadmapInterval into this file.
import { DEFAULT_LIST_WIDTH, DEFAULT_PIXELS_PER_DAY } from '@/components/roadmap/constants'
import type { RoadmapInterval } from '@/components/roadmap/roadmap-utils'

export interface RoadmapSettings {
  pixelsPerDay: number
  gridInterval: RoadmapInterval
  roadmapListWidth: number
  // User will be able to select any field that exists on item. `null` means custom. 
  sortField: string | null
  sortIsAscending: boolean
}

export function constructDefaultRoadmapSettings(): RoadmapSettings {
  return {
    pixelsPerDay: DEFAULT_PIXELS_PER_DAY,
    gridInterval: 'week',
    roadmapListWidth: DEFAULT_LIST_WIDTH,
    sortField: null,
    sortIsAscending: false,
  }
}

export function areRoadmapSettingsEqual(settings1: RoadmapSettings, settings2: RoadmapSettings) {
  if (settings1 === settings2) return true

  return (
    settings1.pixelsPerDay === settings2.pixelsPerDay &&
    settings1.gridInterval === settings2.gridInterval &&
    settings1.roadmapListWidth === settings2.roadmapListWidth &&
    settings1.sortField === settings2.sortField &&
    settings1.sortIsAscending === settings2.sortIsAscending
  )
}