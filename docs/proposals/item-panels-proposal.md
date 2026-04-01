# Item Panel Implementation Proposals

## Context

The two panels — `ItemViewerPanel` and `ItemEditorPanel` — are both `v-navigation-drawer` (temporary, right-anchored) components. The goal is for them to share a strongly similar visual structure so that switching from viewing to editing feels like a state change on the same surface, not a navigation to a different UI.

The `Item` data model currently has five fields:

| Field | Type | Notes |
|---|---|---|
| `name` | `string` | Short label |
| `description` | `string` | Longer text |
| `start-date` | `string` | ISO 8601 |
| `end-date` | `string` | ISO 8601 |
| `color` | `string` | Hex color code |

---

## Shared Conventions (apply to both proposals)

### Props & Emits

**ItemViewerPanel**

```typescript
const model = defineModel<boolean>()             // drawer open/closed
const props = defineProps<{ itemId: string | null }>()
const emit = defineEmits<{
  edit: [itemId: string]
  delete: [itemId: string]
}>()
```

**ItemEditorPanel**

```typescript
const model = defineModel<boolean>()             // drawer open/closed
// itemId = null means "create new"; a string means "edit existing"
const props = defineProps<{ itemId: string | null }>()
const emit = defineEmits<{
  save: [item: Item, itemId: string | null]
  cancel: []
}>()
```

### Structural Skeleton (shared by both proposals)

Both panels divide the drawer into three vertical zones:

```
┌─────────────────────────┐
│  HEADER (fixed)         │  v-toolbar: title + primary action + close
├─────────────────────────┤
│                         │
│  BODY (scrollable)      │  main content — fields differ by panel
│                         │
├─────────────────────────┤
│  FOOTER (fixed)         │  secondary actions (edit/delete or save/cancel)
└─────────────────────────┘
```

A fixed header and footer with a scrollable body is the standard Vuetify drawer pattern and keeps action buttons always accessible regardless of content length.

---

## Proposal A: Toolbar + `v-list` Layout

This proposal uses a `v-list` in the body. The viewer uses read-only `v-list-item` rows; the editor replaces each row with a form field. The one-to-one correspondence between rows makes the viewer/editor relationship obvious.

### Layout Diagram

**Viewer**
```
┌─────────────────────────┐
│ ← (close)  Design...   │  v-toolbar, density="compact"
│             [Edit] [⋮] │
├─────────────────────────┤
│ Details                 │  v-list-subheader
│ ┌─────────────────────┐ │
│ │ Description         │ │  v-list-item, two lines
│ │ Create wireframes…  │ │
│ └─────────────────────┘ │
│ Schedule                │  v-list-subheader
│ ┌─────────────────────┐ │
│ │ 📅 Start  Feb 17   │ │  v-list-item with prepend-icon
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 📅 End    Feb 24   │ │
│ └─────────────────────┘ │
│ Appearance              │  v-list-subheader
│ ┌─────────────────────┐ │
│ │ ⬤ Color   #4A90D9  │ │  v-list-item with color chip
│ └─────────────────────┘ │
├─────────────────────────┤
│        [Delete item]    │  v-btn, variant="text", color="error"
└─────────────────────────┘
```

**Editor**
```
┌─────────────────────────┐
│ ← (close)  Edit item   │  v-toolbar, density="compact"
│                  [Save] │
├─────────────────────────┤
│ Details                 │  v-list-subheader
│ ┌─────────────────────┐ │
│ │ Name                │ │  v-text-field, variant="outlined"
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ Description         │ │  v-textarea, variant="outlined"
│ └─────────────────────┘ │
│ Schedule                │  v-list-subheader
│ ┌─────────────────────┐ │
│ │ Start date          │ │  v-text-field type="date"
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ End date            │ │  v-text-field type="date"
│ └─────────────────────┘ │
│ Appearance              │  v-list-subheader
│ ┌─────────────────────┐ │
│ │ Color               │ │  v-text-field type="color" + preview
│ └─────────────────────┘ │
├─────────────────────────┤
│  [Cancel]               │  v-btn, variant="text"
└─────────────────────────┘
```

### Viewer Code Sketch

```vue
<template>
  <v-navigation-drawer v-model="model" temporary location="right">

    <!-- HEADER -->
    <v-toolbar density="compact">
      <v-btn icon="mdi-close" @click="model = false" />
      <v-toolbar-title>{{ item?.name }}</v-toolbar-title>
      <v-spacer />
      <v-btn icon="mdi-pencil" @click="emit('edit', props.itemId!)" />
    </v-toolbar>

    <!-- BODY -->
    <v-list>
      <v-list-subheader>Details</v-list-subheader>
      <v-list-item
        :subtitle="item?.description"
        prepend-icon="mdi-text"
      />

      <v-list-subheader>Schedule</v-list-subheader>
      <v-list-item
        :title="item?.['start-date']"
        prepend-icon="mdi-calendar-start"
      />
      <v-list-item
        :title="item?.['end-date']"
        prepend-icon="mdi-calendar-end"
      />

      <v-list-subheader>Appearance</v-list-subheader>
      <v-list-item prepend-icon="mdi-palette">
        <v-chip :color="item?.color" size="small">{{ item?.color }}</v-chip>
      </v-list-item>
    </v-list>

    <!-- FOOTER -->
    <template #append>
      <v-divider />
      <div class="pa-2">
        <v-btn
          block
          variant="text"
          color="error"
          @click="emit('delete', props.itemId!)"
        >
          Delete item
        </v-btn>
      </div>
    </template>

  </v-navigation-drawer>
</template>
```

### Editor Code Sketch

```vue
<template>
  <v-navigation-drawer v-model="model" temporary location="right">

    <!-- HEADER -->
    <v-toolbar density="compact">
      <v-btn icon="mdi-close" @click="cancel" />
      <v-toolbar-title>{{ props.itemId ? 'Edit item' : 'New item' }}</v-toolbar-title>
      <v-spacer />
      <v-btn variant="text" @click="save">Save</v-btn>
    </v-toolbar>

    <!-- BODY -->
    <v-form ref="formRef" class="pa-4">
      <p class="text-caption text-medium-emphasis mb-2">Details</p>

      <v-text-field
        v-model="draft.name"
        label="Name"
        variant="outlined"
        density="compact"
      />
      <v-textarea
        v-model="draft.description"
        label="Description"
        variant="outlined"
        density="compact"
        rows="3"
      />

      <p class="text-caption text-medium-emphasis mb-2 mt-2">Schedule</p>

      <v-text-field
        v-model="draft['start-date']"
        label="Start date"
        type="date"
        variant="outlined"
        density="compact"
      />
      <v-text-field
        v-model="draft['end-date']"
        label="End date"
        type="date"
        variant="outlined"
        density="compact"
      />

      <p class="text-caption text-medium-emphasis mb-2 mt-2">Appearance</p>

      <v-text-field
        v-model="draft.color"
        label="Color"
        type="color"
        variant="outlined"
        density="compact"
      />
    </v-form>

    <!-- FOOTER -->
    <template #append>
      <v-divider />
      <div class="pa-2">
        <v-btn block variant="text" @click="cancel">Cancel</v-btn>
      </div>
    </template>

  </v-navigation-drawer>
</template>
```

### Trade-offs

| | |
|---|---|
| **Pros** | `v-list` is the idiomatic Vuetify component for key/value display. Field positions are identical between viewer and editor, making the transition feel seamless. Low complexity. |
| **Cons** | `v-list-item` styling for multi-line descriptions can require extra care. The subheaders act as section labels but are visually subtle — may feel less structured for a dense form. |

---

## Proposal B: Toolbar + `v-card` Sections Layout

This proposal groups fields into labeled `v-card` blocks inside the body. Each card covers one logical section (Details, Schedule, Appearance). The cards add visual separation and make future per-section actions (e.g., an "Edit schedule" button) easy to add.

### Layout Diagram

**Viewer**
```
┌─────────────────────────┐
│ ← (close)  Design...   │  v-toolbar, density="compact"
│             [Edit] [⋮] │
├─────────────────────────┤
│ ╔═══════════════════╗   │
│ ║ Details           ║   │  v-card, variant="outlined"
│ ║─────────────────  ║   │  v-card-title / v-divider
│ ║ Create wireframes ║   │  v-card-text
│ ╚═══════════════════╝   │
│ ╔═══════════════════╗   │
│ ║ Schedule          ║   │
│ ║─────────────────  ║   │
│ ║ Feb 17 → Feb 24   ║   │
│ ╚═══════════════════╝   │
│ ╔═══════════════════╗   │
│ ║ Appearance        ║   │
│ ║─────────────────  ║   │
│ ║ ⬤ #4A90D9         ║   │
│ ╚═══════════════════╝   │
├─────────────────────────┤
│        [Delete item]    │
└─────────────────────────┘
```

**Editor** (same card structure, fields replaced with inputs)
```
┌─────────────────────────┐
│ ← (close)  Edit item   │  v-toolbar
│                  [Save] │
├─────────────────────────┤
│ ╔═══════════════════╗   │
│ ║ Details           ║   │  v-card, variant="outlined"
│ ║─────────────────  ║   │
│ ║ [Name field     ] ║   │  v-text-field
│ ║ [Description    ] ║   │  v-textarea
│ ╚═══════════════════╝   │
│ ╔═══════════════════╗   │
│ ║ Schedule          ║   │
│ ║─────────────────  ║   │
│ ║ [Start date     ] ║   │
│ ║ [End date       ] ║   │
│ ╚═══════════════════╝   │
│ ╔═══════════════════╗   │
│ ║ Appearance        ║   │
│ ║─────────────────  ║   │
│ ║ [Color picker   ] ║   │
│ ╚═══════════════════╝   │
├─────────────────────────┤
│  [Cancel]               │
└─────────────────────────┘
```

### Viewer Code Sketch

```vue
<template>
  <v-navigation-drawer v-model="model" temporary location="right">

    <!-- HEADER -->
    <v-toolbar density="compact">
      <v-btn icon="mdi-close" @click="model = false" />
      <v-toolbar-title>{{ item?.name }}</v-toolbar-title>
      <v-spacer />
      <v-btn icon="mdi-pencil" @click="emit('edit', props.itemId!)" />
    </v-toolbar>

    <!-- BODY -->
    <div class="pa-3 d-flex flex-column ga-3">

      <v-card variant="outlined">
        <v-card-title class="text-subtitle-2">Details</v-card-title>
        <v-divider />
        <v-card-text>
          <p class="text-body-2">{{ item?.description }}</p>
        </v-card-text>
      </v-card>

      <v-card variant="outlined">
        <v-card-title class="text-subtitle-2">Schedule</v-card-title>
        <v-divider />
        <v-card-text class="d-flex flex-column ga-1">
          <div class="d-flex align-center ga-2">
            <v-icon size="small">mdi-calendar-start</v-icon>
            <span class="text-body-2">{{ item?.['start-date'] }}</span>
          </div>
          <div class="d-flex align-center ga-2">
            <v-icon size="small">mdi-calendar-end</v-icon>
            <span class="text-body-2">{{ item?.['end-date'] }}</span>
          </div>
        </v-card-text>
      </v-card>

      <v-card variant="outlined">
        <v-card-title class="text-subtitle-2">Appearance</v-card-title>
        <v-divider />
        <v-card-text>
          <v-chip :color="item?.color" label>{{ item?.color }}</v-chip>
        </v-card-text>
      </v-card>

    </div>

    <!-- FOOTER -->
    <template #append>
      <v-divider />
      <div class="pa-2">
        <v-btn block variant="text" color="error" @click="emit('delete', props.itemId!)">
          Delete item
        </v-btn>
      </div>
    </template>

  </v-navigation-drawer>
</template>
```

### Editor Code Sketch

```vue
<template>
  <v-navigation-drawer v-model="model" temporary location="right">

    <!-- HEADER -->
    <v-toolbar density="compact">
      <v-btn icon="mdi-close" @click="cancel" />
      <v-toolbar-title>{{ props.itemId ? 'Edit item' : 'New item' }}</v-toolbar-title>
      <v-spacer />
      <v-btn variant="text" @click="save">Save</v-btn>
    </v-toolbar>

    <!-- BODY -->
    <v-form ref="formRef" class="pa-3 d-flex flex-column ga-3">

      <v-card variant="outlined">
        <v-card-title class="text-subtitle-2">Details</v-card-title>
        <v-divider />
        <v-card-text class="d-flex flex-column ga-2">
          <v-text-field
            v-model="draft.name"
            label="Name"
            variant="outlined"
            density="compact"
            hide-details="auto"
          />
          <v-textarea
            v-model="draft.description"
            label="Description"
            variant="outlined"
            density="compact"
            rows="3"
            hide-details="auto"
          />
        </v-card-text>
      </v-card>

      <v-card variant="outlined">
        <v-card-title class="text-subtitle-2">Schedule</v-card-title>
        <v-divider />
        <v-card-text class="d-flex flex-column ga-2">
          <v-text-field
            v-model="draft['start-date']"
            label="Start date"
            type="date"
            variant="outlined"
            density="compact"
            hide-details="auto"
          />
          <v-text-field
            v-model="draft['end-date']"
            label="End date"
            type="date"
            variant="outlined"
            density="compact"
            hide-details="auto"
          />
        </v-card-text>
      </v-card>

      <v-card variant="outlined">
        <v-card-title class="text-subtitle-2">Appearance</v-card-title>
        <v-divider />
        <v-card-text>
          <v-text-field
            v-model="draft.color"
            label="Color"
            type="color"
            variant="outlined"
            density="compact"
            hide-details="auto"
          />
        </v-card-text>
      </v-card>

    </v-form>

    <!-- FOOTER -->
    <template #append>
      <v-divider />
      <div class="pa-2">
        <v-btn block variant="text" @click="cancel">Cancel</v-btn>
      </div>
    </template>

  </v-navigation-drawer>
</template>
```

### Trade-offs

| | |
|---|---|
| **Pros** | The outlined cards create strong visual grouping. Each section is self-contained, making it easy to add per-section controls later (e.g., collapse, per-section edit mode). Feels more like a form. |
| **Cons** | More DOM nesting and slightly more CSS surface area than the list approach. The card borders can feel heavy inside a drawer if the drawer is narrow. |

---

## Recommendation

**Proposal A** is the simpler path and the better fit right now. `v-list` is exactly what Vuetify provides for key/value presentation inside a navigation drawer, and the one-to-one field alignment between viewer and editor is easy to maintain. The card-based approach (Proposal B) becomes more valuable once sections need independent interactivity.

Regardless of which layout is chosen, the props/emits interface above applies to both and should be implemented the same way.
