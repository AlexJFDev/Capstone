# Architecture Guide

A quick-reference for navigating the codebase. Read this before exploring individual files.

## What the app does

Chronicle is a local-first roadmap/project management tool. Users create **workspaces** (projects) and populate them with **items** (tasks/milestones with date ranges). The primary view is a Gantt-style roadmap. A backlog list view is also available. All data is stored in IndexedDB — no backend, no accounts.

## Core data model (`src/types.ts`)

Two entities: `Workspace` and `Item`.

```
Workspace { name, description, color, items: string[] }  ← items holds Item IDs, not inline objects
Item      { name, description, startDate, endDate, color }
```

Key design choices reflected here:
- `Workspace.items` is a list of IDs so items can belong to multiple workspaces.
- IDs have prefixes: `w-<uuid>` for workspaces, `i-<uuid>` for items. This makes IDs self-describing and easy to validate.
- `constructEmpty*()` factory functions create default objects for new-entity forms.
- `are*Equal()` functions do deep equality checks (used to detect unsaved changes).
- `isValid*Id()` / `validate*Id()` validate ID format (validate variant throws on failure).

## Directory map

```
src/
├── types/
│   ├── items.ts                ← Item interface and helpers
│   ├── workspaces.ts           ← Workspace interface and helpers
│   ├── spaces.ts               ← Space interface and helpers
│   ├── visualizations.ts       ← Visualization interface, type union, and helpers
│   └── settings/
│       ├── roadmap.ts          ← RoadmapSettings (pixelsPerDay, gridInterval, roadmapListWidth, sort)
│       └── backlog.ts          ← BacklogSettings (selectedFields, sort)
├── db/index.ts                 ← All IndexedDB access (items, workspaces, settings, visualizations, spaces)
├── main.ts                     ← App entry point; mounts Vue, initialises stores
├── App.vue                     ← Root layout; sidebar nav, router-view
├── router/index.ts             ← Route definitions; guards for workspace-ID and space-ID
├── plugins/vuetify.ts          ← Vuetify theme/component registration
│
├── stores/
│   ├── items/                  ← Item CRUD and queries
│   ├── workspaces/             ← Workspace CRUD, membership, scrubbing
│   ├── spaces/                 ← Space CRUD, visualization/workspace membership, scrubbing
│   ├── visualizations/         ← Visualization CRUD
│   └── interface/              ← UI state (panels, sorting, roadmap settings, speedbump)
│
├── components/
│   ├── roadmap/                ← Gantt chart and all roadmap sub-components
│   ├── items/                  ← Item list, editor panel, viewer panel, add menu
│   ├── workspaces/             ← Workspace list panel, editor panel, card, chip
│   ├── backlog/                ← Backlog list view (v-data-table)
│   ├── inputs/                 ← Reusable v-input-based form controls
│   │   └── ColorInput.vue      ← Color picker with random-color button
│   │   └── DateRangePicker.vue ← Start/end date input pair
│   ├── ColorSwatch.vue         ← Shared color swatch display
│   ├── DateChip.vue            ← Compact formatted date display
│   └── MarkdownRenderer.vue    ← Renders description fields as HTML
│
├── views/
│   ├── WorkspacesView.vue      ← Main page: WorkspacesPanel + roadmap/backlog pane
│   ├── SpaceView.vue           ← Space page: displays space data, visualizations, and workspaces
│   ├── ItemsView.vue           ← Global items list (no workspace context)
│   └── TestView.vue            ← Dev-only sandbox (only visible in dev/preview mode)
│
├── utils/
│   ├── dates.ts                ← Date formatting, range/string validation, MSEC_IN_DAY
│   ├── colors.ts               ← Color validation utilities
│   ├── validation.ts           ← Shared validation helpers
│   └── markdown.ts             ← Markdown-to-HTML conversion
│
└── testing/
    ├── dummy-items.ts          ← Fixture items for tests
    └── dummy-workspaces.ts     ← Fixture workspaces for tests
```

## Store architecture

Each store follows the same composition pattern:

```
stores/{domain}/
├── index.ts            ← defineStore(); wires sub-modules together; defines public API
├── initialization.ts   ← Loads data from IndexedDB on app startup
├── validation.ts       ← doesXExist(), validateXExists() (throws on failure)
├── accessors.ts        ← Read-only getters (all validate existence before returning)
└── mutations.ts        ← add/update/delete; writes to both reactive state and IndexedDB
```

The workspaces store has two extra modules:
- `workspace-membership.ts` — `addItemToWorkspace()`, `removeItemFromWorkspace()`, `moveItem()`
- `scrubbing.ts` — removes stale item IDs from workspaces (called after item deletion)

The spaces store has two extra modules:
- `space-membership.ts` — `addWorkspaceToSpace()`, `removeWorkspaceFromSpace()`, `addVisualizationToSpace()`, `removeVisualizationFromSpace()`
- `scrubbing.ts` — removes stale workspace/visualization IDs from spaces

The interface store sub-modules:
- `roadmap.ts` — `pixelsPerDay`, `gridInterval`, `roadmapListWidth` + update actions; when `activeVisualizationId` is set, settings are read from and saved to that visualization instead of global AppSettings
- `sorting.ts` — sort field and direction for item lists
- `panels.ts` — open/close state for workspace/settings side panels
- `item-panels.ts` — open/close and mode (view vs edit) for the item detail panel
- `speedbump.ts` — confirmation dialog state (used before destructive actions)
- `initialization.ts` — loads persisted settings from IndexedDB

## Persistence (`src/db/index.ts`)

Five IndexedDB object stores:
- `items` — keyed by item ID
- `workspaces` — keyed by workspace ID
- `settings` — single record keyed `"app"` (`AppSettings`)
- `visualizations` — keyed by visualization ID
- `spaces` — keyed by space ID

`AppSettings` persists: `favoriteWorkspaceId`, `pixelsPerDay`, `gridInterval`, `roadmapListWidth`. These global roadmap settings are superseded by per-visualization `RoadmapSettings` when a visualization is active in `SpaceView`.

`toRaw()` is called before writing Vue reactive objects to IndexedDB (IndexedDB cannot serialise Proxy objects).

## Roadmap component tree (`src/components/roadmap/`)

```
RoadmapPane.vue             ← Top-level container; owns scroll sync between header and chart
├── RoadmapHeader.vue       ← SVG date/time axis (kept in sync with chart scroll position)
├── RoadmapItemList.vue     ← Left-side item name list; has draggable resizer handle
│   └── (item rows)
├── RoadmapChart.vue        ← Main Gantt grid; positions bars by date
│   ├── SvgVerticalGridLines.vue  ← Background grid
│   └── RoadmapBar.vue      ← Single draggable/resizable item bar
└── SettingsPanel.vue       ← Zoom, interval, list-width controls

Supporting files:
  constants.ts              ← DEFAULT_PIXELS_PER_DAY, DEFAULT_INTERVAL, DEFAULT_LIST_WIDTH
  roadmap-utils.ts          ← RoadmapInterval type, date-to-pixel conversion helpers
  useRoadmapTimeline.ts     ← Composable: computes visible date range and tick positions
  useContainerWidth.ts      ← Composable: ResizeObserver wrapper for container width
  useDragGesture.ts         ← Composable: pointer-event drag logic (used by RoadmapBar)
```

## "If I need to..." navigation guide

| Task | Start here |
|------|-----------|
| Add a field to Item or Workspace | `src/types/items.ts` or `src/types/workspaces.ts`, then propagate to `src/db/index.ts` and the relevant store |
| Add a field to Space or Visualization | `src/types/spaces.ts` or `src/types/visualizations.ts`, then propagate to `src/db/index.ts` and the relevant store |
| Add a new persisted setting | `AppSettings` in `src/db/index.ts`, `stores/interface/initialization.ts`, `stores/interface/roadmap.ts` or a new sub-module, `SettingsPanel.vue` |
| Change how items are sorted | `src/stores/interface/sorting.ts` |
| Add a route | `src/router/index.ts` |
| Change roadmap rendering | `src/components/roadmap/RoadmapChart.vue` + `RoadmapBar.vue` |
| Change date/pixel math | `src/components/roadmap/roadmap-utils.ts` |
| Add an item action (CRUD) | `src/stores/items/mutations.ts` |
| Add a workspace action | `src/stores/workspaces/mutations.ts` or `workspace-membership.ts` |
| Add a space action (CRUD) | `src/stores/spaces/mutations.ts` or `space-membership.ts` |
| Add a visualization action (CRUD) | `src/stores/visualizations/mutations.ts` |
| Add a confirmation dialog | `src/stores/interface/speedbump.ts` + `src/SpeedbumpDialog.vue` |
| Add test fixtures | `src/testing/dummy-items.ts`, `dummy-workspaces.ts`, `dummy-spaces.ts`, or `dummy-visualizations.ts` |

## Validation convention

Two-function pattern used consistently:
- `isValidX(value): boolean` — returns true/false, no side effects
- `validateX(value): void` — throws `Error` if invalid; used inside store actions

## Key invariants to know

- Items are stored independently of workspaces. Deleting an item requires scrubbing all workspaces afterwards (`scrubAllWorkspaces()`) to remove the stale ID.
- The router validates that a workspace ID in the URL actually exists before navigating; invalid IDs redirect to `/`.
- `WorkspacesView` is used for both `/` (no workspace selected) and `/workspace/:id` (workspace selected).
- The TestView route is only shown in the nav when `import.meta.env.DEV || import.meta.env.MODE === 'preview'`.
- Every store that persists to IndexedDB must have its `initialize*` function called in the `Promise.all` in `src/main.ts`. Omitting it means the store will always start empty after a page reload.
