# Vuetify 4 Upgrade Evaluation

**Current version:** `vuetify ^3.11.8`
**Target version:** `vuetify ^4.0.0`

---

## Summary

The app uses 29 Vuetify components and is a good candidate for upgrade. Most breaking changes have low to moderate impact. The biggest required changes are to the **grid system** (`align` prop on `v-row`) and **typography classes** (MD2 → MD3 naming). The default theme is already explicitly set to `'light'`, so the new `'system'` default has no effect.

---

## Required Changes

### 1. `v-row` — `align` prop removed

**Impact: Required**

The `align` prop on `v-row` has been removed. Use utility classes instead.

**Affected files:**
- `src/components/items/ItemList.vue` — 4 instances (lines 42, 73, 84, 97)
- `src/components/items/ItemRow.vue` — 1 instance (line 11)

```diff
- <v-row class="ma-0" align="center">
+ <v-row class="ma-0 align-center">
```

---

### 2. Typography classes — MD2 → MD3 naming

**Impact: Required (visual regression if not updated)**

Typography class names have changed to follow Material Design 3. The following classes are used throughout the app:

| MD2 class (current) | MD3 class (new) | Occurrences |
|---|---|---|
| `text-h6` | `text-headline-small` | 3 (WorkspacesView.vue, ItemsView.vue) |
| `text-subtitle-2` | `text-label-large` | 6 (WorkspaceEditorPanel.vue, ItemEditorPanel.vue, ItemViewerPanel.vue, SettingsPanel.vue) |
| `text-body-2` | `text-body-medium` | 2 (DateChip.vue, ItemViewerPanel.vue) |
| `text-caption` | `text-body-small` | 8 (ItemList.vue, SettingsPanel.vue, AddItemMenu.vue, ItemViewerPanel.vue) |

**Option A (Immediate):** Update all class names to MD3 equivalents.

**Option B (Incremental):** Add a CSS compatibility layer to restore legacy names while migrating:
```css
@layer vuetify-overrides {
  .text-h6 { font: var(--v-typescale-headline-small-font); }
  .text-subtitle-2 { font: var(--v-typescale-label-large-font); }
  .text-body-2 { font: var(--v-typescale-body-medium-font); }
  .text-caption { font: var(--v-typescale-body-small-font); }
}
```

---

### 3. Grid system — CSS layers and `no-gutters`

**Impact: Required (verify behavior)**

The grid system has been overhauled to use CSS `gap` instead of negative margins. The `no-gutters` prop is replaced by `gap="0"`.

**Affected files:**
- `src/components/items/ItemEditorPanel.vue` — line 135: `<v-row no-gutters class="ga-3">`
- `src/components/items/ItemViewerPanel.vue` — line 51: `<v-row no-gutters class="ga-3">`

Note: Both usages also set `class="ga-3"`, so the intent is a controlled gap. In v4 the `gap` prop can be used directly:

```diff
- <v-row no-gutters class="ga-3">
+ <v-row gap="3">
```

---

### 4. CSS layers — custom style overrides

**Impact: Required if the app has any custom CSS that overrides Vuetify styles**

Vuetify 4 wraps all its styles in cascade layers. Any custom CSS not in a layer will automatically take priority — which is good — but explicit `!important` overrides used to beat Vuetify specificity may now be redundant or conflicting.

Currently the app imports `'vuetify/styles'` directly in `src/plugins/vuetify.ts`. No SCSS customization or settings file was found, so this is low risk. Verify after upgrade that no visual regressions appear in custom-styled components.

---

## No Action Required

| Breaking Change | Reason |
|---|---|
| Default theme changed to `'system'` | App explicitly sets `defaultTheme: 'light'` in `src/plugins/vuetify.ts` |
| `v-btn` uppercase text removed | App buttons use mixed-case labels ("Save", "Cancel", "New item") — removing the uppercase transform is desirable |
| `v-form` slot props unreffed | Neither editor form uses the `v-form` default slot with bound slot props |
| `v-snackbar` multi-line prop removed | `v-snackbar` is not used in the app |
| `v-select` item → internalItem slot rename | No custom `#item` slot templates found on selects |
| MD3 elevation (0–24 → 0–5 levels) | No `elevation-N` utility classes used; only `elevation="0"` prop on `v-app-bar` |
| `VContainer` fill-height change | Only `v-container` usage is in `TestView.vue`, not a production view |

---

## Upgrade Steps

1. Update the dependency: `npm install vuetify@^4.0.0`
2. Fix `v-row align` props → utility classes (5 files)
3. Verify `no-gutters` behavior (2 files) and switch to `gap` prop
4. Update typography classes (MD2 → MD3) or add a compatibility CSS shim
5. Run the app and do a visual review pass
6. Remove any `!important` CSS overrides that are no longer needed

---

## Design Improvement Opportunities

### Material Design 3

Vuetify 4 fully adopts MD3. The app currently uses an MD2 visual language. Upgrading presents a good opportunity to embrace the new design tokens, particularly:

- **Typography scale:** MD3 introduces a clearer hierarchy with `display`, `headline`, `body`, and `label` scales. The app uses `text-subtitle-2` for card section headers — these would become `text-label-large`, which has the correct visual weight in MD3.
- **Color system:** MD3 introduces tonal color roles (primary, secondary, tertiary, surface variants). The app's single-color workspace chips and item colors could benefit from tonal variants for better contrast and accessibility.

### Theme — System Preference

The app currently locks to `light` theme. Since the app targets a desktop/pro audience (roadmap management), supporting a dark mode could be valuable. Vuetify 4's new default of `'system'` makes this easier to adopt:

```ts
// src/plugins/vuetify.ts
export default createVuetify({
  theme: {
    defaultTheme: 'system',  // or add a theme toggle
  },
})
```

### Grid — CSS Gap

The new `gap` prop on `v-row` is more expressive than the old negative-margin hack. The app already uses `class="ga-N"` utility classes to set gap; these can be replaced with the prop:

```diff
- <v-row class="ma-0 ga-3">
+ <v-row gap="3">
```

This is cleaner and more intentional.

### VDataTable — Sorting and Filtering

`BacklogList.vue` uses `v-data-table`. Vuetify 4 has enhanced data table features (server-side pagination, improved grouping). If backlog management grows, this is worth revisiting.
