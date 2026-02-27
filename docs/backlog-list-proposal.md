# BacklogList Implementation Proposal

## Context

`BacklogList` lives at `src/components/backlog/BacklogList.vue` and currently accepts `itemIds: string[]`
as a prop. The goal is a read-only tabular list of items for use in a future `/items` view, showing
all items independent of workspace membership.

**Columns (left to right):** color swatch, name, truncated description, start date, end date, workspaces.

**Data note:** The "workspaces" column requires a reverse lookup — scanning all workspaces to find which
ones contain each item ID. The workspaces store does not currently expose this. A `computed` in the
component can derive it by filtering `workspaceKeys`. This is an O(items × workspaces) scan, which is
fine at current scale; a reverse index in the store would become worthwhile once item and workspace
counts grow significantly.

---

## Proposal A: `v-data-table`

Vuetify's `v-data-table` maps item IDs to rows via a `headers` array and `:items`. Custom column
slots handle the swatch and workspaces cells. Per-column sorting comes for free.

### Layout Diagram

```
┌─────┬────────────┬─────────────────────┬────────────┬────────────┬────────────────────┐
│  ⬤  │ Name       │ Description         │ Start      │ End        │ Workspaces         │
├─────┼────────────┼─────────────────────┼────────────┼────────────┼────────────────────┤
│ 🔴  │ Design...  │ Create wireframes…  │ Feb 17     │ Feb 24     │ [Q1] [Design]      │
│ 🔵  │ Backend... │ Set up the API…     │ Mar 01     │ Mar 15     │ [Q1]               │
└─────┴────────────┴─────────────────────┴────────────┴────────────┴────────────────────┘
```

### Code Sketch

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useItemsStore } from '@/stores/items'
import { useWorkspacesStore } from '@/stores/workspaces'

const props = defineProps<{ itemIds: string[] }>()

const itemsStore = useItemsStore()
const workspacesStore = useWorkspacesStore()

const headers = [
  { key: 'color',       title: '',            sortable: false, width: '40px' },
  { key: 'name',        title: 'Name',        sortable: true  },
  { key: 'description', title: 'Description', sortable: false },
  { key: 'start-date',  title: 'Start',       sortable: true  },
  { key: 'end-date',    title: 'End',         sortable: true  },
  { key: 'workspaces',  title: 'Workspaces',  sortable: false },
]

const rows = computed(() =>
  props.itemIds.map(id => ({ id, ...itemsStore.getItem(id) }))
)

function workspacesFor(itemId: string) {
  return workspacesStore.workspaceKeys
    .filter(wid => workspacesStore.getWorkspace(wid).items.includes(itemId))
    .map(wid => ({ id: wid, name: workspacesStore.getWorkspaceName(wid) }))
}
</script>

<template>
  <v-data-table :headers="headers" :items="rows" item-value="id">
    <template #item.color="{ item }">
      <span class="color-swatch" :style="{ background: item.color }" />
    </template>
    <template #item.description="{ item }">
      <span class="truncate">{{ item.description }}</span>
    </template>
    <template #[`item['start-date']`]="{ item }">
      {{ item['start-date'].toLocaleDateString() }}
    </template>
    <template #[`item['end-date']`]="{ item }">
      {{ item['end-date'].toLocaleDateString() }}
    </template>
    <template #item.workspaces="{ item }">
      <v-chip v-for="ws in workspacesFor(item.id)" :key="ws.id" size="small" class="mr-1">
        {{ ws.name }}
      </v-chip>
    </template>
  </v-data-table>
</template>

<style scoped>
.color-swatch {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
}
.truncate {
  display: block;
  max-width: 200px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
```

### Trade-offs

| | |
|---|---|
| **Pros** | Sorting by name, start, and end out of the box. Pagination is available if item counts grow. Column definitions are declarative and easy to extend. |
| **Cons** | `v-data-table` has an opinionated internal layout that is harder to customize precisely. The slot naming syntax for hyphenated keys (`item['start-date']`) is non-standard and has had known quirks in Vuetify 3 — it may require workarounds. Less control than a raw table, and harder to reverse if you later want fine-grained row behavior (click to open viewer, hover states, etc.). |

---

## Proposal B: `v-table` with manual rows

Vuetify's `v-table` applies baseline table styles (borders, hover states, density) while leaving all
row and cell content to you. Each row is a manual `<tr>` rendered with `v-for`.

### Layout Diagram

Same visual result as Proposal A — the difference is entirely in implementation.

### Code Sketch

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useItemsStore } from '@/stores/items'
import { useWorkspacesStore } from '@/stores/workspaces'

const props = defineProps<{ itemIds: string[] }>()

const itemsStore = useItemsStore()
const workspacesStore = useWorkspacesStore()

const rows = computed(() =>
  props.itemIds.map(id => ({ id, ...itemsStore.getItem(id) }))
)

function workspacesFor(itemId: string) {
  return workspacesStore.workspaceKeys
    .filter(wid => workspacesStore.getWorkspace(wid).items.includes(itemId))
    .map(wid => ({ id: wid, name: workspacesStore.getWorkspaceName(wid) }))
}

function formatDate(date: Date) {
  return date.toLocaleDateString()
}
</script>

<template>
  <v-table>
    <thead>
      <tr>
        <th class="swatch-col"></th>
        <th>Name</th>
        <th>Description</th>
        <th>Start</th>
        <th>End</th>
        <th>Workspaces</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in rows" :key="row.id">
        <td>
          <span class="color-swatch" :style="{ background: row.color }" />
        </td>
        <td>{{ row.name }}</td>
        <td class="description-cell">{{ row.description }}</td>
        <td>{{ formatDate(row['start-date']) }}</td>
        <td>{{ formatDate(row['end-date']) }}</td>
        <td>
          <v-chip v-for="ws in workspacesFor(row.id)" :key="ws.id" size="small" class="mr-1">
            {{ ws.name }}
          </v-chip>
        </td>
      </tr>
    </tbody>
  </v-table>
</template>

<style scoped>
.swatch-col { width: 40px; }
.color-swatch {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
}
.description-cell {
  max-width: 200px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
```

### Trade-offs

| | |
|---|---|
| **Pros** | Full control over every cell with no slot quirks. Consistent with Roadmap Decision 2 of preferring manual structure over Vuetify layout components where precise control is needed. Row-level interactivity (click to open viewer, hover actions) is trivial to add. Easy to reverse or extend without fighting the component. |
| **Cons** | No built-in sorting or pagination — these would need to be added manually. Slightly more template boilerplate than the declarative `v-data-table` approach. |

---

## Recommendation

**Proposal A.** The Roadmap decision to avoid Vuetify layout components was specific to a custom
timeline canvas — a use case Vuetify is not designed for. A tabular list of records is exactly
`v-data-table`'s purpose, and using it here is idiomatic rather than fighting the framework.
The built-in sorting is genuinely useful for a backlog view, and the declarative `headers` definition
makes adding or reordering columns straightforward. The slot naming quirk for hyphenated keys is a
real but minor annoyance that can be resolved with a small workaround (flattening `start-date` and
`end-date` into `startDate` / `endDate` in the `rows` computed before passing to the table).
