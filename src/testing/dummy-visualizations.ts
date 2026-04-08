// Static fixture data: a set of dummy Visualization records used for development and testing.
import type { Visualization } from '@/types/visualizations'

export const visualizations: Record<string, Visualization> = {
  'v-aaaa1111-bbbb-4ccc-8ddd-eeeeeeeeee01': {
    name: 'Sprint Roadmap',
    type: 'roadmap',
    settings: {
      pixelsPerDay: 80,
      gridInterval: 'week',
      roadmapListWidth: 240,
      sortField: null,
      sortIsAscending: false,
    },
  },
  'v-aaaa1111-bbbb-4ccc-8ddd-eeeeeeeeee02': {
    name: 'Quarterly Overview',
    type: 'roadmap',
    settings: {
      pixelsPerDay: 20,
      gridInterval: 'month',
      roadmapListWidth: 240,
      sortField: null,
      sortIsAscending: false,
    },
  },
  'v-aaaa1111-bbbb-4ccc-8ddd-eeeeeeeeee03': {
    name: 'Task Backlog',
    type: 'backlog',
    settings: {
      selectedFields: ['name', 'color'],
      sortField: null,
      sortIsAscending: false,
    },
  },
  'v-aaaa1111-bbbb-4ccc-8ddd-eeeeeeeeee04': {
    name: 'Release Timeline',
    type: 'roadmap',
    settings: {
      pixelsPerDay: 40,
      gridInterval: 'month',
      roadmapListWidth: 300,
      sortField: null,
      sortIsAscending: true,
    },
  },
  'v-aaaa1111-bbbb-4ccc-8ddd-eeeeeeeeee05': {
    name: 'Bug Backlog',
    type: 'backlog',
    settings: {
      selectedFields: ['name', 'color'],
      sortField: null,
      sortIsAscending: true,
    },
  },
}
