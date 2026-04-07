# VueUse Evaluation

[VueUse](https://vueuse.org/) is a collection of Vue composables. This document evaluates VueUse's offerings against the existing codebase and identifies specific opportunities to adopt composables that would replace custom implementations or add useful functionality.

## Summary

VueUse offers several composables that overlap with code already written in this project. The strongest candidates are ones where the existing hand-rolled implementation is doing exactly what a VueUse composable already provides. Weaker candidates are ones where the app's domain logic is too specific for a general-purpose composable to fit well.

---

## Strong Opportunities

### 1. `useResizeObserver` → replace `useContainerWidth`

**Location:** `src/components/roadmap/useContainerWidth.ts`

The `useContainerWidth` composable manually creates a `ResizeObserver` inside `onMounted`, observes an element, updates a `ref`, and disconnects in `onBeforeUnmount`. This is almost exactly what `useResizeObserver` from VueUse provides.

```ts
// Current implementation (27 lines)
import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'
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
```

`useResizeObserver` handles the lifecycle management and cleanup automatically. `useContainerWidth` could be simplified to a thin wrapper or removed entirely if callers accept a `Ref<Element | null>` instead of a getter function. VueUse also accepts template refs directly, which aligns with how `useRoadmapTimeline` already uses `rootRef`.

---

### 2. `useConfirmDialog` → replace `useInterfaceSpeedbump`

**Location:** `src/stores/interface/speedbump.ts`

The `useInterfaceSpeedbump` composable implements a promise-based confirmation dialog pattern: a `confirm(message)` function returns a `Promise<boolean>`, with internal `resolve` wiring and state refs for `speedbumpOpen` and `speedbumpMessage`. This is exactly the pattern VueUse's `useConfirmDialog` provides.

```ts
// Current implementation
export function useInterfaceSpeedbump() {
  const speedbumpOpen = ref(false)
  const speedbumpMessage = ref('')
  let speedbumpResolve: ((confirmed: boolean) => void) | null = null

  function confirm(message: string): Promise<boolean> { ... }
  function resolveSpeedbump(confirmed: boolean) { ... }
  return { speedbumpOpen, speedbumpMessage, confirm, resolveSpeedbump }
}
```

VueUse's `useConfirmDialog` exposes `reveal()`, `confirm()`, `cancel()`, and `isRevealed` — the same semantics with less boilerplate.

---

### 3. `useEventListener` → simplify `startDragGesture`

**Location:** `src/components/roadmap/useDragGesture.ts`

`startDragGesture` manually calls `document.addEventListener` for `mousemove` and `mouseup`, and removes them on mouseup. VueUse's `useEventListener` handles event listener attachment and automatic cleanup. While `startDragGesture` is an imperative helper (not a composable), the event listener management inside it could be simplified using `useEventListener` to reduce the risk of listener leaks if the component unmounts mid-drag.

---

## Moderate Opportunities

### 4. `useToggle` → panel open/close state

**Location:** `src/stores/interface/panels.ts`

The panels module defines several boolean `ref`s (e.g., `settingsOpen`, `workspacesOpen`, `workspaceEditorOpen`) each paired with open/close functions. VueUse's `useToggle` returns a `[state, toggle]` pair and reduces boilerplate for simple boolean toggles. This would be most useful for `settingsOpen` and `workspacesOpen` where no additional side-effects occur on open/close.

---

### 5. `useVModel` or `useModel` → item/workspace editor panels

**Location:** `src/components/items/ItemEditorPanel.vue`, `src/components/workspaces/WorkspaceEditorPanel.vue`

These components use `defineModel<boolean>()` for the open/close state. Since the project targets Vue 3.4+, `defineModel()` is already the idiomatic approach. However, if the project ever needs to support more complex two-way binding patterns (for example, when the item panel needs to also expose the current item ID as a model), `useVModel` from VueUse could be useful. This is a low-priority opportunity at present.

---

### 6. `useScroll` → roadmap scroll synchronization

**Location:** `src/components/roadmap/RoadmapPane.vue`

The ARCHITECTURE.md notes that `RoadmapPane` "owns scroll sync between header and chart". `useScroll` from VueUse provides reactive `x` and `y` scroll position refs for a given element, which could simplify whatever scroll synchronization logic is in place. This composable should be evaluated once the scroll sync implementation is reviewed.

---

## Weak Opportunities (Likely Not Worth Adopting)

### 7. `useStorage` → persistence

The app uses IndexedDB via `idb` for persistence, which was a deliberate architectural decision (see `docs/decisions.md`). VueUse's `useStorage` targets `localStorage`/`sessionStorage` and is not a replacement for IndexedDB. This should not be adopted.

### 8. `useDraggable` → roadmap item reordering and bar resizing

**Location:** `src/components/roadmap/RoadmapItemList.vue`, `src/components/roadmap/RoadmapBar.vue`

The drag interactions are highly domain-specific: item reordering maps pixel delta to row-height steps and calls store mutations; bar resizing converts pixel delta to day counts and clamps against the opposing date. VueUse's `useDraggable` provides generic `x`/`y` position tracking, which would not reduce the domain logic. The custom `startDragGesture` utility is a better fit here.

### 9. `useDark` / `useColorMode` → theming

The app uses Vuetify for theming. Vuetify manages dark/light mode independently through its own theme API. Introducing VueUse's theme composables would create a conflict.

---

## Recommendation

The two highest-value adoptions are:

1. **`useResizeObserver`** to replace `useContainerWidth` — direct swap with less code.
2. **`useConfirmDialog`** to replace `useInterfaceSpeedbump` — direct swap of a manually implemented pattern.

Both would reduce custom code, improve alignment with established patterns, and rely on a well-maintained library rather than bespoke implementations. Adoption of VueUse as a dependency should be formally decided before implementing either of these.
