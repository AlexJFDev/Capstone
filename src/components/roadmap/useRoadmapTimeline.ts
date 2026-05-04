// Composable that derives dateRange, svgWidth, intervalStarts, and scale for roadmap SVG components based on item dates and container width.
import { computed, type Ref } from 'vue'
import { computeDateRange, computeDaysInRange, computeIntervalStarts, type RoadmapScale } from './roadmap-utils'
import { useItemsStore } from '@/stores/items'
import { useContainerWidth } from './useContainerWidth'
import type { RoadmapSettings } from '@/types/settings/roadmap'

/**
 * Shared timeline computations for roadmap SVG components.
 *
 * Tracks the container width via a ResizeObserver on the root element's grandparent
 * (matching the scroll-container layout used by RoadmapChart and RoadmapHeader),
 * then derives the full set of values needed to render a consistent timeline:
 * dateRange, svgWidth, intervalStarts, and scale.
 *
 * @param itemIds - Reactive list of item IDs whose date range defines the timeline window.
 * @param rootRef - Template ref for the component's root element; used to locate the scroll container.
 * @param settings - Reactive roadmap settings (pixelsPerDay, gridInterval, roadmapListWidth).
 */
export function useRoadmapTimeline(
  itemIds: Ref<string[]>,
  rootRef: Ref<HTMLElement | null>,
  settings: Ref<RoadmapSettings>,
) {
  const itemsStore = useItemsStore()
  const containerWidth = useContainerWidth(
    () => rootRef.value?.parentElement?.parentElement ?? null,
  )

  const scale = computed<RoadmapScale>(() => ({
    pixelsPerDay: settings.value.pixelsPerDay,
    gridInterval: settings.value.gridInterval,
    headerLabel: (date: Date) =>
      date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  }))

  const items = computed(() => itemsStore.getItems(itemIds.value))
  const dateRange = computed(() => computeDateRange(items.value, scale.value))
  const totalDays = computed(() => computeDaysInRange(dateRange.value))

  /** Full pixel width of the SVG canvas. Grows/shrinks with zoom and available viewport. */
  const svgWidth = computed(() =>
    Math.max(
      totalDays.value * scale.value.pixelsPerDay,
      containerWidth.value - settings.value.roadmapListWidth,
    ),
  )

  /** Dates at each interval boundary, used to draw vertical grid lines and header labels. */
  const intervalStarts = computed(() =>
    computeIntervalStarts(dateRange.value, svgWidth.value, scale.value),
  )

  return { dateRange, svgWidth, intervalStarts, scale }
}
