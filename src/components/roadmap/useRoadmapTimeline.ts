// Composable that derives dateRange, svgWidth, and intervalStarts for roadmap SVG components based on item dates and container width.
import { computed, type Ref } from 'vue'
import { computeDateRange, computeDaysInRange, computeIntervalStarts } from './roadmap-utils'
import { useItemsStore } from '@/stores/items'
import { useInterfaceStore } from '@/stores/interface'
import { useContainerWidth } from './useContainerWidth'

/**
 * Shared timeline computations for roadmap SVG components.
 *
 * Tracks the container width via a ResizeObserver on the root element's grandparent
 * (matching the scroll-container layout used by RoadmapChart and RoadmapHeader),
 * then derives the full set of values needed to render a consistent timeline:
 * dateRange, svgWidth, and intervalStarts.
 *
 * Scale and list width are read directly from the interface store.
 *
 * @param itemIds - Reactive list of item IDs whose date range defines the timeline window.
 * @param rootRef - Template ref for the component's root element; used to locate the scroll container.
 */
export function useRoadmapTimeline(itemIds: Ref<string[]>, rootRef: Ref<HTMLElement | null>) {
  const itemsStore = useItemsStore()
  const interfaceStore = useInterfaceStore()
  const containerWidth = useContainerWidth(
    () => rootRef.value?.parentElement?.parentElement ?? null,
  )

  const items = computed(() => itemsStore.getItems(itemIds.value))
  const dateRange = computed(() => computeDateRange(items.value, interfaceStore.roadmapScale))
  const totalDays = computed(() => computeDaysInRange(dateRange.value))

  /** Full pixel width of the SVG canvas. Grows/shrinks with zoom and available viewport. */
  const svgWidth = computed(() =>
    Math.max(
      totalDays.value * interfaceStore.roadmapScale.pixelsPerDay,
      containerWidth.value - interfaceStore.roadmapListWidth,
    ),
  )

  /** Dates at each interval boundary, used to draw vertical grid lines and header labels. */
  const intervalStarts = computed(() =>
    computeIntervalStarts(dateRange.value, svgWidth.value, interfaceStore.roadmapScale),
  )

  return { dateRange, svgWidth, intervalStarts }
}
