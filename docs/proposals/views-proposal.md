# Views Feature Proposal

This document proposes the implementation of the "View" datatype described in the README.
A View acts as a named, persisted container for a set of Workspaces together with
visualization-type and display settings.

---

## What a View is (shared assumptions)

Regardless of which options are chosen below, a View will:

- Have `name`, `description`, and `color` fields (matching the pattern of Workspace)
- Hold a list of Workspace IDs (not inline copies — same reference model as Workspace → Items)
- Have a `v-<uuid>` ID prefix for self-describing IDs
- Be persisted in a new IndexedDB object store (`views`)

The four long-term visualization types are Roadmap, Backlog, Kanban, and Calendar.
Kanban and Calendar require significant new components and are out of scope for the
initial implementation. This proposal covers Roadmap and Backlog only.

---

## Decision 1: Visualization type — on the View or switchable within the View?

### Option A: One visualization type per View

Each View has a single `vizType: 'roadmap' | 'backlog'` field.
Switching visualization means creating or navigating to a different View.

```typescript
interface View {
  name: string
  description: string
  color: string
  workspaces: string[]
  vizType: 'roadmap' | 'backlog'
}
```

**Pros**
- Simpler data model; no nesting
- Each View has a clear, singular purpose
- Easy to add Kanban/Calendar later by extending the union type

**Cons**
- A user who wants to see the same workspaces in both Roadmap and Backlog needs two Views

### Option B: Multiple visualization types per View (tabs)

Each View includes settings for one or more visualization types.
A tab bar lets the user switch between them within the same View.
Each visualization type has its own settings object.

```typescript
interface View {
  name: string
  description: string
  color: string
  workspaces: string[]
  roadmap?: RoadmapViewSettings
  backlog?: BacklogViewSettings
}
```

**Pros**
- Matches the README description most closely ("four different visualizations would be available")
- A single View of "Work Q2" can show the Roadmap for planning and the Backlog for triage
- Per-visualization settings are naturally scoped

**Cons**
- More complex data model; optional nested objects
- Requires at least one visualization to be enabled (need validation)
- The tab UI adds surface area to implement

### Recommendation

**Option B.** The README describes Views as having multiple available visualizations.
A View represents _what you are looking at_, not _how you are looking at it_.
Option A would force users to create duplicate Views just to switch between Roadmap
and Backlog on the same workspaces, which defeats the purpose.

---

## Decision 2: Settings migration — global or per-View?

Currently, `pixelsPerDay`, `gridInterval`, and `roadmapListWidth` are stored in
`AppSettings` and are shared across the entire app.

### Option A: Keep settings global

No migration. The existing `AppSettings` continues to hold these values.
All Views share the same roadmap display settings.

**Pros**
- No DB migration needed
- No changes to the interface store's persistence logic
- Simpler — avoids the overhead of per-View settings for what many users may treat as global preferences

**Cons**
- Changing zoom in one View changes it everywhere
- Defeats part of the purpose of Views as isolated configurations

### Option B: Move roadmap settings into the View

`pixelsPerDay`, `gridInterval`, and `roadmapListWidth` move from `AppSettings`
into `RoadmapViewSettings` on each View.
The global `AppSettings` retains only `favoriteViewId` (replacing `favoriteWorkspaceId`).

**Pros**
- Each View truly owns its display configuration
- Consistent with the README's framing of Views as containers for "interface settings"

**Cons**
- Requires a DB schema migration (version bump to 2)
- The interface store's roadmap sub-module needs to become view-aware
- New Views need sensible defaults (use the constants already in `roadmap/constants.ts`)

### Recommendation

**Option B.** The whole point of Views is that they isolate interface settings.
Keeping roadmap settings global would make the View concept feel incomplete.
The migration is straightforward: bump the DB version, copy the current global
settings into a default View on upgrade.

---

## Decision 3: Routing

### Option A: Views replace the current workspace-centric routing

```
/                          → home (views list or redirect to default view)
/view/:viewId              → view selected
/items                     → global items list (unchanged)
```

The existing `/workspace/:id` route is removed. Workspaces are only accessed
from within a View.

**Pros**
- Clean; Views become the primary navigation unit as intended
- Removes the ambiguity of the current dual-purpose WorkspacesView

**Cons**
- Breaking change to existing URLs
- The global "all workspaces" page goes away; managing workspaces requires being in a View

### Option B: Views live alongside workspace routes

```
/                          → home (unchanged — workspace list / no selection)
/workspace/:workspaceId    → workspace selected (unchanged)
/view/:viewId              → view selected
/items                     → global items list (unchanged)
```

**Pros**
- Non-breaking; existing workspace routes remain valid
- Users can still browse workspaces independently of Views

**Cons**
- Two parallel navigation hierarchies can be confusing
- The "home" page concept becomes ambiguous

### Option C: Views are the root; workspaces remain accessible through a panel

```
/                          → home (default View, or empty state)
/view/:viewId              → view selected
/items                     → global items list (unchanged)
```

Workspaces are managed exclusively through the `WorkspacesPanel` side-drawer
(which already exists). No route needed for individual workspaces.
The `/workspace/:id` route is removed.

**Pros**
- Clean routing with Views as the top-level unit
- The `WorkspacesPanel` already exists and handles workspace management
- Removes an unnecessary route (individual workspace URLs had limited utility)

**Cons**
- Breaking change to workspace-specific URLs (minor, since the app is local-only)

### Recommendation

**Option C.** Views should be the primary navigation unit; the workspace route
was always a secondary access pattern. Since the data is local-only, breaking
the URL format has no external impact. Managing workspaces via the existing
panel is sufficient.

---

## Decision 4: Navigation UI

### Option A: App bar becomes view-aware

The current app bar has "Items" and "Workspaces" buttons. Replace "Workspaces"
with a "Views" section or a view-switcher dropdown.

The "Workspaces" button (currently opens the WorkspacesPanel) remains, but the
app bar also shows the active View name.

### Option B: Left navigation rail

Replace the top-bar navigation with a left-side `v-navigation-drawer` in
`rail` mode (icon-only, expandable). Views appear as list items in the rail;
clicking one navigates to that View. A footer item opens Workspaces management.

**Pros**
- Scales better as the number of Views grows
- More space for view names than a horizontal app bar
- Rails are a common Vuetify pattern

**Cons**
- Larger change to App.vue and overall layout
- Rail takes horizontal space away from the roadmap

### Option C: Keep the app bar; add a Views panel (drawer)

A new `ViewsPanel` component following the same pattern as `WorkspacesPanel`.
A "Views" button in the app bar opens it. Clicking a view in the panel navigates
to that view and closes the panel.

**Pros**
- Consistent with existing panel pattern — no new UI conventions
- No change to the main layout
- Easy to add a "New View" button to the panel

**Cons**
- Two-click navigation (open panel, click view) is slightly less efficient

### Recommendation

**Option C.** It is the smallest delta from the current UI and follows the
established panel pattern exactly. A rail can be considered later if the number
of Views grows large enough to warrant it.

---

## Proposed implementation order

Given the decisions above (B, B, C, C), the implementation should proceed in this order:

1. **Types** — Add `View` interface, ID helpers, factory function, and equality function to `src/types.ts`
2. **DB** — Version-bump the IndexedDB schema to 2; add a `views` object store; migrate roadmap settings from `AppSettings` into a default View during upgrade
3. **Views store** — New `src/stores/views/` following the same four-file pattern (index, initialization, validation, accessors, mutations)
4. **Interface store** — Update roadmap sub-module to read/write settings from the active View rather than AppSettings
5. **Router** — Add `/view/:viewId` route; remove `/workspace/:id`; add navigation guard for view IDs
6. **ViewsPanel** — New `WorkspacesPanel`-style drawer for listing and selecting Views; add "Views" button to app bar
7. **ViewView** — New page view (`src/views/ViewView.vue`) that renders the active View's workspaces in the selected visualization type, with tabs to switch between Roadmap and Backlog
8. **View editor** — New `ViewEditorPanel` for creating and editing Views (name, description, color, workspace membership, enabled visualizations)
9. **Home page** — Update the empty/home state: if no Views exist show a prompt to create one; otherwise redirect to the default View

