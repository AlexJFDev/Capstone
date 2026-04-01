# RoadmapPane Implementation Proposal

## Context

`RoadmapPane` receives a `workspaceId` and renders a Gantt chart. The current spec defines:

- Two halves with a visible border between them.
- **Left**: fixed-width item list. Hover reveals up/down reorder buttons (left) and a settings button (right). A "Add item" row at the very top and bottom; the **bottom row must always be visible**.
- **Right**: SVG Gantt chart. Week header (Sundays) at the top that **must always be visible**. Horizontal scroll if the chart is wider than available space. Width resizes with available space.
- Row borders appear to cross the entire width of the pane.
- All buttons are no-ops for now.
- Scale starts at week level but must be designed to support changes in the future.

---

## What Is Settled

- **SVG for the chart.** The bars, grid lines, and header labels are expressed as SVG. This is not a UI decision.
- **Fixed pixels-per-day at the current scale.** Since the right panel scrolls horizontally, the chart has a fixed internal coordinate system (e.g. 30px/day at week scale). Coordinates for bars and grid lines are computed from item dates against this scale.
- **Sub-components.** Following the established pattern in this codebase: `RoadmapItemRow` for individual item rows, `RoadmapChart` for the SVG, keeping `RoadmapPane` as the orchestrator. This is an architecture decision, not proposed here.
- **Row height is shared.** Both halves use the same fixed row height constant so that item names align exactly with their bars. The row border crossing the full width works naturally when both sides share this height and the same vertical scroll position.

---

## Decision 1: Layout and Scroll Architecture

The "always visible" requirements for both the week header and the bottom add-item row determine the layout. The pane must be divided into three fixed zones:

```
┌─────────────────────────────────────────────────┐
│  FIXED TOP                                      │
│  ┌───────────────┬─────────────────────────┐    │
│  │ (empty)       │  Week header            │    │
│  └───────────────┴─────────────────────────┘    │
├─────────────────────────────────────────────────┤
│  SCROLLABLE BODY (flex: 1, overflow: hidden)    │
│  ┌───────────────┬─────────────────────────┐    │
│  │ Left          │  Right                  │    │
│  │ overflow-y:   │  overflow: auto         │    │
│  │ auto          │  (both axes)            │    │
│  │               │                         │    │
│  │ [Add item]    │                         │    │
│  │ [Item A]      │  ─ ─ ─ [███] ─ ─ ─ ─   │    │
│  │ [Item B]      │  ─ ─ ─ ─ ─ ─ [████████]│    │
│  └───────────────┴─────────────────────────┘    │
├─────────────────────────────────────────────────┤
│  FIXED BOTTOM                                   │
│  ┌───────────────┬─────────────────────────┐    │
│  │ [Add item]    │  (empty)                │    │
│  └───────────────┴─────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

The outer pane is `display: flex; flex-direction: column; overflow: hidden`. The scrollable body takes `flex: 1` and is `overflow: hidden` itself, with the left and right panels inside it managing their own scroll.

### The scroll sync problem

Three scroll relationships must be maintained:

| What | With what | Direction |
|---|---|---|
| Right panel (chart body) | Week header | Horizontal |
| Left panel (item rows) | Right panel (chart body) | Vertical |

Neither relationship can be handled with CSS alone — `position: sticky` does not work inside `overflow: auto` ancestors, and two separate scroll containers do not share state.

**Both require a JavaScript scroll event listener.** When the right panel scrolls horizontally, its `scrollLeft` is copied to the week header container. When the right panel scrolls vertically, its `scrollTop` is copied to the left panel (or vice versa). In Vue 3 this is done with `useTemplateRef` and a `watchEffect` / event listener registered in `onMounted`.

There is no simpler layout that satisfies all three requirements (always-visible header, always-visible bottom row, horizontal scroll on the chart). This is not a decision point — it is a consequence of the spec.

---

## Decision 2: Left Panel Row Component

Each row in the left panel shows an item name. On hover, up/down reorder buttons appear on the left and a settings button appears on the right.

### Option A: Plain `div` rows with `@mouseenter` / `@mouseleave`

```
<div
  class="item-row"
  @mouseenter="hovered = true"
  @mouseleave="hovered = false"
>
  <div class="reorder-btns" v-show="hovered">
    <v-btn icon="mdi-chevron-up" ... />
    <v-btn icon="mdi-chevron-down" ... />
  </div>
  <span class="item-name">{{ item.name }}</span>
  <v-btn icon="mdi-cog" v-show="hovered" ... />
</div>
```

The `RoadmapItemRow` component holds a local `hovered` ref. Row height is set by an explicit CSS rule matching the shared constant used by the SVG.

**Pros:** Precise control over layout and height — critical for bar alignment. Straightforward.

**Cons:** A local ref per row for hover state. Minor, but worth noting.

### Option B: Vuetify `v-hover` wrapping a structured `div`

```
<v-hover v-slot="{ isHovering, props }">
  <div class="item-row" v-bind="props">
    <div class="reorder-btns" v-show="isHovering"> ... </div>
    <span>{{ item.name }}</span>
    <v-btn icon="mdi-cog" v-show="isHovering" ... />
  </div>
</v-hover>
```

`v-hover` provides reactive hover state without a manual ref. The inner element is still a plain `div`, preserving full height control.

**Pros:** Clean reactive hover state via Vuetify. No manual `@mouseenter`/`@mouseleave`.

**Cons:** Adds a wrapper component (`v-hover`) for what is essentially a one-line convenience. The inner `div` still needs all the same layout CSS.

---

## Decision 3: Scale Architecture

The spec requires week scale now but explicitly calls for future support of other scales (e.g. day, month). The scale affects:

- How many pixels represent one day (`pixelsPerDay`)
- What the header shows (Sunday dates at week scale, day numbers at day scale, month names at month scale)
- The granularity of the dashed grid lines

### Option A: Scale constant in `RoadmapChart`

A single `PIXELS_PER_DAY` constant lives inside `RoadmapChart`. Changing scale later means extracting it into a prop.

**Pros:** Simpler now.

**Cons:** The refactor needed to support other scales touches the component's interface. The "support in the future" intent is not reflected in the current design.

### Option B: Scale object as a prop on `RoadmapChart`

A `scale` prop is defined from the start:

```typescript
interface RoadmapScale {
  pixelsPerDay: number
  headerLabel: (date: Date) => string      // formats a column header
  gridInterval: 'day' | 'week' | 'month'  // where to draw grid lines
}

const WEEK_SCALE: RoadmapScale = {
  pixelsPerDay: 30,
  headerLabel: (d) => d.toLocaleDateString(...),
  gridInterval: 'week',
}
```

`RoadmapPane` passes `WEEK_SCALE` to `RoadmapChart`. Adding a new zoom level later means defining a new object and passing it in — no changes to `RoadmapChart`'s internals.

**Pros:** The component interface reflects the intent. Adding new scales later requires no structural changes.

**Cons:** Slightly more upfront code for a feature not yet needed. The interface must be defined carefully enough that future scales fit without revision.

---

## Recommendations

**Decision 1** is resolved by the spec — a three-zone layout with JS scroll sync is required. No choice here.

**Decision 2: Option A** (plain `div` with `@mouseenter`/`@mouseleave`). The precision of layout control is the priority in this component. `v-hover` is a minor convenience that doesn't meaningfully reduce code — the inner `div` and all its layout CSS remain either way. Based on past decisions in this project, explicit structure is preferred when control matters.

**Decision 3: Option B** (scale object as a prop). The spec explicitly calls out future scale support. Designing for it now costs little and avoids a later interface change. A well-defined `RoadmapScale` interface makes the chart's rendering logic self-documenting — the component never needs to know it is in "week mode", only what pixel density and label format to use.
