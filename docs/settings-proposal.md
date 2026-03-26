# Settings UI Proposal

Three settings need to be exposed: `pixelsPerDay` (number), `gridInterval` ('day' | 'week' | 'month'), and `roadmapListWidth` (number).

The settings update live — `updateRoadmapScale` and `updateRoadmapListWidth` in the interface store persist immediately to IndexedDB, so no Save/Cancel flow is needed.

---

## Proposal A: Navigation Drawer

A `SettingsPanel.vue` using `v-navigation-drawer`, following the same pattern as `WorkspacesPanel` and `ItemEditorPanel`.

- Add `settingsOpen` ref and `openSettings` / `closeSettings` to the interface store
- Register `<SettingsPanel>` in `App.vue` alongside the other panels
- The Settings button in `WorkspacesView` calls `userInterface.openSettings()`

**Pros**
- Identical pattern to every other panel in the app — no new conventions introduced
- Ample space; easy to add more settings later without redesigning the UI
- Lives in `App.vue` so it persists across navigation

**Cons**
- Heavyweight for only 3 controls

---

## Proposal B: Dropdown Menu

A `SettingsMenu.vue` using `v-menu`, following the same pattern as `AddItemMenu`. The Settings button acts as the activator directly in `WorkspacesView`. No store state needed for open/close.

**Pros**
- Lightweight; no new store state required
- Fast to open, stays close to the button that triggered it

**Cons**
- `v-menu` is compact and cramped for sliders or number inputs
- No consistent precedent for settings-style controls inside a menu in this codebase
- Harder to expand if more settings are added

---

## Proposal C: Dialog

A `SettingsDialog.vue` using `v-dialog`, similar to `SpeedbumpDialog`. Opened via a store method (`openSettings`) and registered in `App.vue`.

**Pros**
- Draws clear attention to the fact that the user is changing persistent settings
- More space than a menu, less intrusive than a full drawer

**Cons**
- Modals interrupt flow and feel heavy for non-destructive settings
- Not consistent with the existing pattern for panels in this app (other non-destructive UI uses drawers, not dialogs; dialogs are reserved for the speedbump confirmation)

---

## Recommendation: Proposal A

The navigation drawer is the right choice for the same reason the item panels use it: it is the established pattern in this app for any UI that exposes controls over persistent state. The three settings today will likely be joined by others (e.g. date format, theme), so building on the existing panel foundation is more future-proof than a compact menu. The overhead of adding `settingsOpen` to the store is minimal and keeps the open/close logic consistent with every other panel.
