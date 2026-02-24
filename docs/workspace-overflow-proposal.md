# Workspace Item Overflow Proposal

## Context

`WorkspaceCard` renders an `ItemList` with `maxItems` defaulting to 10. When a workspace has more items than `maxItems`, the list shows a "View X more" row at the bottom. That row's `viewMore` handler is currently a no-op.

This proposal compares approaches for what "View more" should do. It was written with `decisions.md` in mind: UI decisions are proposed here, architecture decisions are the developer's responsibility, and explicit structure is preferred over clever solutions.

---

## The Setting

`WorkspacesPanel` is a 500px-wide `v-navigation-drawer` containing workspace cards stacked vertically. The cards sit inside a scrollable `div`. The "View more" row is inside `ItemList`, which is inside `v-card-text` inside `WorkspaceCard`.

The relevant constraints:
- The drawer is 500px wide — horizontal space is limited.
- The drawer is `temporary` — it sits over the main content, not beside it.
- The app already has a panel system (`useInterfaceStore`) with distinct viewer and editor panels.

---

## Option A: Inline Expansion

Clicking "View more" removes the `maxItems` cap for that card, revealing all items in-place. A "Show less" affordance (a chevron-up row at the bottom, or a cap re-applied on hover) collapses it again.

### How it works

`ItemList` receives a prop (or the parent `WorkspaceCard` raises `maxItems` to `Infinity`) when the user clicks "View more". All items render in the same card body, and the drawer scrolls as needed to accommodate them.

### Pros

- **Stays in context.** The user never leaves the workspace browser. After reviewing all items, they can continue to the next card without any navigation.
- **Simple state.** A single local `ref<boolean>` in `WorkspaceCard` (or `ItemList`) controls expanded/collapsed state. No store changes needed.
- **Reversible.** The user can collapse the card again and see the overview.
- **Consistent with the card metaphor.** Cards that expand to reveal detail are a familiar pattern.

### Cons

- **Drawer can become very long.** If a workspace has 50 items, the card grows to fill the full item list. In a 500px-wide drawer, 50 rows of items is a lot of vertical scrolling before the user reaches the next card.
- **Visual weight imbalance.** One expanded card dominates the panel, making it harder to browse other workspaces at a glance.
- **No path to richer detail per item.** The inline list only shows what `ItemList` already shows (color swatch + name). If more per-item context is ever needed, the card layout constrains it.

---

## Option B: Dedicated Workspace Detail Pane

Clicking "View more" opens a new drawer or pane dedicated to that workspace's full item list. The current `WorkspacesPanel` is either closed or remains open beneath the new pane.

### How it works

A new component — e.g. `WorkspaceDetailPanel` — is added to the panel system. `useInterfaceStore` gains a `workspaceDetailOpen` ref and an `openWorkspaceDetail(workspaceId)` action. The pane renders the workspace's full item list with no cap.

### Pros

- **Scalable to any number of items.** The dedicated pane has no layout constraint imposed by surrounding cards. It can render 200 items just as cleanly as 5.
- **Room to grow.** A dedicated pane has space for sorting controls, filter chips, bulk actions, or grouping — none of which fit comfortably inside a 500px card.
- **Keeps the workspace browser clean.** The overview panel stays compact. Expanding into a pane is a deliberate navigation decision, not a visual overflow.

### Cons

- **Adds a component and store state.** A new panel component and two new store fields (`workspaceDetailOpen`, `detailWorkspaceId`) are required. This is the same overhead as adding any other panel in this app, but it's non-trivial.
- **Navigation friction.** The user leaves the overview context to see one workspace's full list. Returning means closing the detail pane and finding their place in the card list again.
- **Layer management.** The app now has a drawer (`WorkspacesPanel`) that could be open at the same time as a detail pane. The visual and state relationship between them needs to be decided (close the drawer when the detail opens? keep both open?).
- **Possibly over-engineered for the problem.** If the expected real-world item count per workspace is 10–30, a pane is significant infrastructure for a problem that may rarely arise.

---

## Alternative Approaches

### C: Paginate within the card

"View more" advances to the next page of items (e.g., items 11–20), with prev/next controls. The card stays a fixed height.

**Pros:** Card height is always bounded; the layout is completely stable.

**Cons:** Pagination is cognitively heavier than a simple expand. The user must page through items rather than scrolling naturally. Implementing prev/next state adds more complexity than either Option A or B for a problem that doesn't need it.

**Verdict:** Not warranted for a list of items in a card. Pagination makes sense for tables with dozens of columns and hundreds of rows — not for a name list.

### D: Link "View more" to the roadmap view

Clicking "View more" switches the active workspace to that workspace and closes the drawer, landing the user on the roadmap — which shows all items in the left panel list.

**Pros:** Zero new infrastructure. The roadmap already has an unlimited item list. The user ends up somewhere useful.

**Cons:** This isn't "viewing more items in the workspace card" — it's a navigation action. It conflates two separate user intents: "I want to see all items in this workspace" and "I want to switch to this workspace". The roadmap view is also a Gantt chart, not a plain item list, which may not be what the user wants when they click "View more" in the browser panel.

**Verdict:** Too indirect. Appropriate as a supplemental action (the existing `mdi-open-in-new` button already handles "go to this workspace"), but not as the meaning of "View more".

---

## Recommendation

**Option A (inline expansion)** is the better fit for the current scope.

The key reasoning, informed by this project's decision history:

1. **Simplicity is valued.** Past decisions (keeping item panels separate, rejecting the merge, choosing explicit structure) consistently favour the approach that does one thing clearly over the approach that introduces infrastructure for future flexibility. Option B adds a component and store state to solve a problem that may not exist at scale.

2. **The override use case is rare.** A workspace with more than 10 items is the edge case, not the norm. Option A handles it with a local ref. Option B builds a full panel for it.

3. **The drawer context is appropriate.** The user is in the workspace browser to review workspaces. Expanding a card in-place keeps them there. The vertical scroll that results from a large expansion is acceptable — the drawer already scrolls, and long lists are the honest representation of large workspaces.

4. **The "View more" row already exists in `ItemList`.** Implementing Option A means wiring a `ref` in `WorkspaceCard` and removing the item cap. Option B requires a new component, new store state, and layer management decisions that touch the global panel system.

Option B becomes the right answer if: (a) a workspace is expected to regularly hold 50+ items, (b) per-item actions or metadata are needed beyond what fits in an `ItemList` row, or (c) a true "workspace detail view" is planned as a feature independent of the overflow problem. If any of those conditions arise, the pane approach is worth revisiting at that point.
