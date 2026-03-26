# Item Labels Proposal

Implementation plan for issue #56.

## Overview

Labels are a new first-class datatype that can be attached to items. Each label has a name and a color. Labels appear as pills throughout the UI: in `RoadmapItemList`, `BacklogList`, `ItemViewerPanel`, and `ItemEditorPanel`. A `/labels` route will allow full label management.

---

## Data Layer

### New `Label` type (`src/types.ts`)

```ts
export interface Label {
  name: string;
  color: string;
}

export function constructEmptyLabel(): Label {
  return { name: '', color: randomColor() }
}

export function generateLabelId() {
  return `l-${crypto.randomUUID()}`
}

const LABEL_UUID_REGEX = /^l-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export function isValidLabelId(id: string): boolean {
  return LABEL_UUID_REGEX.test(id)
}
export function validateLabelId(id: string) {
  if (!isValidLabelId(id)) throw new Error(`Invalid label id: "${id}"`)
}
```

### Update `Item` type

```ts
export interface Item {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  color: string;
  labels: string[]; // list of label IDs
}
```

`constructEmptyItem` will initialize `labels: []`. `areItemsEqual` will compare label arrays.

### New labels store (`src/stores/items/labels.ts`)

Labels live alongside items in the items store (as mentioned in the issue). A dedicated composable `useLabels` will be composed into `useItemsStore`:

```ts
// src/stores/items/labels.ts
export function useLabels() {
  const labels = ref<Record<string, Label>>({})
  const labelIds = computed(() => Object.keys(labels.value))

  function getLabel(id: string): Label { ... }
  function addLabel(id: string, label: Label): void { ... }
  function updateLabel(id: string, updates: Partial<Label>): void { ... }
  function deleteLabel(id: string): void { ... } // also removes from all items
  function doesLabelExist(id: string): boolean { ... }

  return { labels, labelIds, getLabel, addLabel, updateLabel, deleteLabel, doesLabelExist }
}
```

The labels `ref` is passed alongside `items` inside `useItemsStore` and all methods are included in the store's `return {}`.

### Item label management

Two mutation helpers will be added to `useItemsMutations` (or a separate `useItemLabelManagement` composable, mirroring how workspaces handle item membership):

```ts
function addLabelToItem(itemId: string, labelId: string): void
function removeLabelFromItem(itemId: string, labelId: string): void
```

### Persistence (`src/db/index.ts`)

A new `labels` object store is added to the `ChronicleDB` schema. The database version bumps from `1` to `2`, with a migration that creates the `labels` store. Two new DB functions are added: `getAllLabels`, `putLabel`, `removeLabel`.

---

## New Component: `LabelChip.vue`

A simple display component (analogous to `WorkspaceChip`/`DateChip`):

```vue
<!-- src/components/labels/LabelChip.vue -->
<!-- Props: labelId: string -->
<!-- Renders: <v-chip label :color="labelsStore.getLabel(labelId).color" size="small"> -->
```

## New Component: `AddLabelMenu.vue`

Analogous to `AddItemMenu.vue`. Uses a `v-menu` with:
- A sticky **New label** button at the top that opens a nested `v-menu` containing:
  - A name text field
  - A color picker (`type="color"`)
  - Cancel and Submit buttons
- A scrollable list of existing labels (showing a `LabelChip` + name) that toggles membership on click (checkmark shown for already-assigned labels)
- A sticky **Edit labels** button at the bottom that navigates to `/labels`

```
Props: itemId: string
Slot: activator (passed through to v-menu)
```

---

## Route: `/labels`

A new `LabelsView` at `src/views/LabelsView.vue`. Registered as:

```ts
{ path: '/labels', name: 'labels', component: () => import('../views/LabelsView.vue') }
```

The view shows all labels in a `v-data-table` with columns: color swatch, name, item count, actions (edit name/color inline, delete). Deleting a label removes it from all items.

A navigation entry is added to the app's sidebar/nav so users can reach `/labels` directly.

---

## UI Integration

### `RoadmapItemList.vue`

Between the item name and the settings cog, render `<LabelChip>` pills for each label on the item. Since the row has a fixed height, overflow is hidden (`text-overflow: hidden`, no wrap). Labels are shown only if the row is wide enough (no change to layout logic needed — they simply flex between name and cog).

### `BacklogList.vue`

A new `labels` column is added to `headers`:

```ts
{ key: 'labels', title: 'Labels', sortable: false }
```

The row data already spreads `itemsStore.getItem(id)` which now includes `labels`. The template slot renders `<LabelChip>` for each label ID.

### `ItemViewerPanel.vue`

A new `v-card` section titled **Labels** is added below the existing two rows. It renders `<LabelChip>` for each label on the item. If there are no labels, a faint "No labels" placeholder is shown.

### `ItemEditorPanel.vue`

A new `v-card` section titled **Labels** is added to the form. It renders current label pills with an X to remove each, plus an `<AddLabelMenu>` trigger button (e.g., `mdi-plus`). The draft's `labels` array is mutated directly (add/remove label IDs); no new validation rule is needed.

---

## Migration Concern

Existing `Item` records in IndexedDB do not have a `labels` field. The `initializeItems` function should default `labels` to `[]` when loading items that lack it:

```ts
items.value = Object.fromEntries(
  Object.entries(loaded).map(([id, item]) => [id, { labels: [], ...item }])
)
```

---

## Summary of Files Changed/Created

| File | Change |
|---|---|
| `src/types.ts` | Add `Label` type + helpers; add `labels` to `Item` |
| `src/stores/items/labels.ts` | New composable for label CRUD |
| `src/stores/items/index.ts` | Compose `useLabels`; expose label methods |
| `src/stores/items/mutations.ts` | Add `addLabelToItem`, `removeLabelFromItem` |
| `src/stores/items/initialization.ts` | Default `labels: []` on load |
| `src/db/index.ts` | Add `labels` store, bump DB version to 2, add DB helpers |
| `src/components/labels/LabelChip.vue` | New component |
| `src/components/labels/AddLabelMenu.vue` | New component |
| `src/views/LabelsView.vue` | New view |
| `src/router/index.ts` | Register `/labels` route |
| `src/App.vue` | Add Labels nav entry |
| `src/components/roadmap/RoadmapItemList.vue` | Render label pills |
| `src/components/backlog/BacklogList.vue` | Add labels column |
| `src/components/items/ItemViewerPanel.vue` | Add Labels card |
| `src/components/items/ItemEditorPanel.vue` | Add Labels card with `AddLabelMenu` |
