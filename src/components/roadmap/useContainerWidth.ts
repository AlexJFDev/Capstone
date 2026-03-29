import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

/**
 * Tracks the content width of a DOM element via ResizeObserver.
 *
 * @param getElement - Called on mount to resolve the element to observe.
 *                     Using a getter (rather than a Ref) keeps the composable
 *                     decoupled from how the caller locates the element.
 * @returns A readonly ref that stays in sync with the element's content width.
 */
export function useContainerWidth(getElement: () => Element | null): Ref<number> {
  const width = ref(0)
  let resizeObserver: ResizeObserver | null = null

  onMounted(() => {
    const el = getElement()
    if (!el) return
    resizeObserver = new ResizeObserver((entries) => {
      width.value = entries[0]?.contentRect.width ?? 0
    })
    resizeObserver.observe(el)
  })
  onBeforeUnmount(() => resizeObserver?.disconnect())

  return width
}
