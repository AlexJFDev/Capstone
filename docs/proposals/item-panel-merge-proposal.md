# Item Panel Merge Proposal

## Context

`ItemViewerPanel` and `ItemEditorPanel` currently exist as two separate components. The question is whether they should be merged into a single `ItemPanel` component controlled by a `mode: 'view' | 'edit'` prop.

This proposal weighs the two approaches against each other and makes a recommendation. It was informed by the prior decision recorded in `decisions.md` (choosing Proposal B for its per-section control) and by reading the current implementations of both components.

---

## What the Two Components Actually Share

The structural overlap is real:

- The `v-navigation-drawer` wrapper (identical props on both)
- The `v-toolbar` with a close button and title
- The three-section card layout (Details, Schedule, Appearance)
- The `v-card` / `v-card-title` / `v-divider` / `v-card-text` pattern inside each section

## Where They Diverge

| Aspect | ItemViewerPanel | ItemEditorPanel |
|---|---|---|
| **Props** | `item: Item` (resolved object) | `itemId?: string` (ID, may be null for new) |
| **Script logic** | None beyond props | `draft` ref, `save()`, `cancel()` |
| **Body wrapper** | `div` | `v-form` (required for Vuetify validation) |
| **Header title** | `item.name` (dynamic) | `"Edit item"` / `"New item"` |
| **Header actions** | Close only | Close + Save |
| **Details content** | `<p>` display | `v-text-field` + `v-textarea` |
| **Schedule content** | `DateChip` components | Date `v-text-field`s |
| **Appearance content** | `v-chip` | Color `v-text-field` |
| **Footer** | None | Cancel button |

The divergence is not cosmetic — the two components have different prop contracts, different state management needs, and different structural requirements (`v-form` vs `div`).

---

## Option A: Merge into a Single `ItemPanel`

A single component with `mode: 'view' | 'edit'` controlling which content is rendered inside each section.

### Pros

- The `v-navigation-drawer` wrapper and toolbar only exist in one place.
- Structural changes to the card layout (e.g., reordering sections) only need to happen once.
- A future inline view-to-edit transition (same drawer, mode changes) would be straightforward since no component swap is needed.

### Cons

- **Prop contract becomes awkward.** The viewer needs a resolved `Item`; the editor needs an `itemId` to look up and clone into a draft. A merged component would need to accept both and conditionally use them, or accept one shape and derive the other internally — either way, the interface is less obvious than two clean, focused components.
- **Script logic bloat.** The `draft` ref, `save()`, and `cancel()` are only meaningful in edit mode. They'd sit in a component that sometimes doesn't use them, adding noise.
- **`v-form` cannot be conditional without extra wrapping.** The editor needs `v-form` for validation; the viewer doesn't. A merged component would need to wrap the entire body in a `v-if`/`v-else` between `v-form` and `div`, or use a render-function trick — neither is clean.
- **Template fills with `v-if="mode === 'edit'"`** in every section's content. The Details section alone would have four such guards (two inputs replacing one paragraph). Each section becomes a mix of viewer and editor markup, making it harder to follow what either mode actually renders.
- **Per-section extensibility becomes harder.** The reason Proposal B was chosen in the first place was the ability to add per-section controls later. Adding something like a section-level "Edit" button in view mode, or section-level validation feedback in edit mode, is easier when each section's mode-specific content lives in its own component.
- **Harder to reason about.** A merged component does two things. Given that understanding the code is an explicit priority, a component that always does one thing is preferable.

---

## Option B: Keep Them Separate (Current Approach)

### Pros

- Each component has a clean, minimal prop/emit interface.
- Each component's script is only as complex as its own concern.
- Viewer-specific features (e.g., a Delete button, an Edit shortcut) and editor-specific features (form validation, dirty-state detection, draft persistence) can be added to the right component independently.
- Consistent with the existing decision to prefer explicit structure and per-section control.
- Easy to read — open the file, see exactly what it does.

### Cons

- If the section card layout needs to change (e.g., a new section added, or the Schedule/Appearance split adjusted), it must be updated in two places.
- The `v-navigation-drawer` / `v-toolbar` boilerplate is duplicated.

---

## Middle Ground: Extract Shared Section Sub-components

A partial consolidation that addresses the layout-duplication con without merging the panel logic. Each section card — Details, Schedule, Appearance — becomes its own sub-component with a `mode` prop that switches between view and edit content internally.

```
ItemViewerPanel.vue       ItemEditorPanel.vue
       │                         │
       ├── ItemDetailsCard        ├── ItemDetailsCard  (mode="view" / mode="edit")
       ├── ItemScheduleCard       ├── ItemScheduleCard
       └── ItemAppearanceCard     └── ItemAppearanceCard
```

### Pros

- Layout changes happen once, in the section sub-component.
- The panel-level components stay focused on their own concerns (form wrapper, toolbar, footer, state management).
- Mode-specific logic is scoped to the section it belongs to, not spread across a giant template.

### Cons

- More files: three additional sub-components.
- Justified only if the sections themselves are complex enough to warrant it. Currently they are small; the duplication cost is low.
- The `v-form` wrapper still needs to be at the panel level, so the section sub-components would need to work correctly inside or outside a form context.

---

## Recommendation

**Keep them separate (Option B).** The duplication is limited to layout structure, which rarely changes. The divergence in props, state, and control flow is fundamental and would make a merged component meaningfully harder to read and extend. This is consistent with the prior decision to favour explicit structure and per-section control.

The middle-ground sub-component approach is worth revisiting **if** a third panel mode is ever introduced (e.g., a compact "preview" card), or if the section content grows complex enough that duplicating it has a real maintenance cost. At the current scale, it is not warranted.
