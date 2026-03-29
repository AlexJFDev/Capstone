# Component Testing Proposal

## Context

Component testing sits between unit tests and E2E tests. It mounts individual Vue components
in isolation — verifying that props render correctly, that user interactions emit the right
events, and that conditional logic produces the right output — without launching a full browser
or running through user flows.

The infrastructure is already in place: `@vue/test-utils` and `vitest` are installed, and
`vitest.config.ts` is configured with a `jsdom` environment. The only additional setup is
registering the Vuetify plugin so that Vuetify components render without errors.

Chronicle's components fall into two clear categories by complexity:

**Presentational (leaf) components** — props in, rendered HTML out. No store access, no
routing. These are the simplest to test:
- `ColorSwatch.vue` — renders a div with a background color
- `DateChip.vue` — formats a date and renders it alongside a calendar icon
- `MarkdownRenderer.vue` — renders a markdown string as HTML

**Connected (smart) components** — depend on one or more Pinia stores and sometimes the
router. These require more setup:
- `WorkspaceCard.vue` — reads from `useWorkspacesStore` and `useInterfaceStore`, uses router
- `ItemList.vue`, `ItemRow.vue` — read from `useItemsStore`
- `WorkspacesPanel.vue`, `WorkspaceEditorPanel.vue` — read and write stores

This proposal compares two options that differ in how much of that second category is included.

---

## Shared setup

Both options require the Vuetify plugin to be provided to every mounted component. The
standard pattern is a small helper used across all component test files:

```ts
// src/testing/mount.ts
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({ components, directives })

export function mountWithPlugins(component: any, options: Record<string, any> = {}) {
  return mount(component, {
    global: {
      plugins: [vuetify, ...(options.plugins ?? [])],
    },
    ...options,
  })
}
```

`jsdom` does not implement `ResizeObserver`. Components that observe container dimensions
(like `RoadmapPane`) need a global stub added once in a Vitest setup file:

```ts
// vitest.setup.ts  (registered in vitest.config.ts as setupFiles)
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
```

---

## Option A: Presentational components only

Test only the leaf components that have no store or router dependencies.
`ColorSwatch`, `DateChip`, and `MarkdownRenderer` each take simple props and produce
deterministic HTML — the simplest possible component tests.

### Structure

```
src/
  components/
    __tests__/
      ColorSwatch.test.ts
      DateChip.test.ts
      MarkdownRenderer.test.ts
```

### What the tests look like

```ts
// src/components/__tests__/ColorSwatch.test.ts

import { describe, it, expect } from 'vitest'
import { mountWithPlugins } from '@/testing/mount'
import ColorSwatch from '../ColorSwatch.vue'

describe('ColorSwatch', () => {
  it('sets the background color from the prop', () => {
    const wrapper = mountWithPlugins(ColorSwatch, { props: { color: '#4A90D9' } })
    expect(wrapper.find('.color-swatch').attributes('style')).toContain('background-color: rgb(74, 144, 217)')
  })
})
```

```ts
// src/components/__tests__/DateChip.test.ts

import { describe, it, expect } from 'vitest'
import { mountWithPlugins } from '@/testing/mount'
import DateChip from '../DateChip.vue'

describe('DateChip', () => {
  it('formats the date using the default short-american style', () => {
    const wrapper = mountWithPlugins(DateChip, { props: { date: '2026-03-15' } })
    expect(wrapper.text()).toContain('03-15-2026')
  })

  it('formats the date using an explicit style prop', () => {
    const wrapper = mountWithPlugins(DateChip, {
      props: { date: '2026-03-15', style: 'long-american' },
    })
    expect(wrapper.text()).toContain('March 15th, 2026')
  })
})
```

```ts
// src/components/__tests__/MarkdownRenderer.test.ts

import { describe, it, expect } from 'vitest'
import { mountWithPlugins } from '@/testing/mount'
import MarkdownRenderer from '../MarkdownRenderer.vue'

describe('MarkdownRenderer', () => {
  it('renders bold markdown as <strong>', () => {
    const wrapper = mountWithPlugins(MarkdownRenderer, { props: { content: '**hello**' } })
    expect(wrapper.find('strong').text()).toBe('hello')
  })

  it('renders an empty string without error', () => {
    const wrapper = mountWithPlugins(MarkdownRenderer, { props: { content: '' } })
    expect(wrapper.text()).toBe('')
  })
})
```

### Pros

- **Minimal setup.** Only the Vuetify plugin is needed. No Pinia, no router, no db mock.
- **Tests are stable.** Leaf components have few dependencies; they break only when their
  own logic or template changes.
- **Fast.** Mounting a `<div>` with a background color takes microseconds.

### Cons

- **Low coverage of interesting logic.** The components being tested here are wrappers around
  one or two lines of logic. The conditional rendering, store interactions, and user events
  in `WorkspaceCard`, `ItemRow`, and the panel components go entirely untested.
- **Does not catch integration mistakes.** A bug where a component passes the wrong prop to
  a child, or reads the wrong field from a store, is invisible here.

---

## Option B: Presentational and connected components

Option B tests everything in Option A and adds tests for connected components that depend on
Pinia stores and (where relevant) the router. A shared factory function handles the full
plugin setup so individual test files stay concise.

### Structure

```
src/
  components/
    __tests__/
      ColorSwatch.test.ts
      DateChip.test.ts
      MarkdownRenderer.test.ts
    workspaces/
      __tests__/
        WorkspaceCard.test.ts
        WorkspacesPanel.test.ts
    items/
      __tests__/
        ItemRow.test.ts
        ItemList.test.ts
```

### Extended mount helper

Connected components need Pinia and the router alongside Vuetify. The mount helper is
extended to accept them, and the db module is mocked globally so stores can be initialized
without IndexedDB:

```ts
// src/testing/mount.ts
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'

const vuetify = createVuetify({ components, directives })

// A minimal in-memory router sufficient for most component tests
function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div />' } }],
  })
}

export function mountWithPlugins(component: any, options: Record<string, any> = {}) {
  return mount(component, {
    global: {
      plugins: [vuetify, createPinia(), makeRouter()],
    },
    ...options,
  })
}
```

```ts
// vitest.mock.ts  (or inline at the top of each connected test file)
vi.mock('@/db', () => ({
  getAllItems:      vi.fn().mockResolvedValue({}),
  putItem:         vi.fn().mockResolvedValue(undefined),
  removeItem:      vi.fn().mockResolvedValue(undefined),
  getAllWorkspaces: vi.fn().mockResolvedValue({}),
  putWorkspace:    vi.fn().mockResolvedValue(undefined),
  removeWorkspace: vi.fn().mockResolvedValue(undefined),
  getSettings:     vi.fn().mockResolvedValue(null),
  putSettings:     vi.fn().mockResolvedValue(undefined),
}))
```

### What the tests look like

```ts
// src/components/workspaces/__tests__/WorkspaceCard.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountWithPlugins } from '@/testing/mount'
import { useWorkspacesStore } from '@/stores/workspaces'
import { setActivePinia, createPinia } from 'pinia'
import WorkspaceCard from '../WorkspaceCard.vue'

vi.mock('@/db', () => ({
  getAllWorkspaces: vi.fn().mockResolvedValue({}),
  putWorkspace:    vi.fn().mockResolvedValue(undefined),
  removeWorkspace: vi.fn().mockResolvedValue(undefined),
  getAllItems:      vi.fn().mockResolvedValue({}),
  putItem:         vi.fn().mockResolvedValue(undefined),
  removeItem:      vi.fn().mockResolvedValue(undefined),
  getSettings:     vi.fn().mockResolvedValue(null),
  putSettings:     vi.fn().mockResolvedValue(undefined),
}))

const workspaceId = 'w-a1b2c3d4-e5f6-4890-abcd-ef1234567890'

describe('WorkspaceCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const store = useWorkspacesStore()
    store.addWorkspace(workspaceId, {
      name: 'Q1 Planning',
      description: 'Goals for **Q1**',
      color: '#4A90D9',
      items: [],
    })
  })

  it('displays the workspace name', () => {
    const wrapper = mountWithPlugins(WorkspaceCard, { props: { workspaceId } })
    expect(wrapper.text()).toContain('Q1 Planning')
  })

  it('renders description markdown', () => {
    const wrapper = mountWithPlugins(WorkspaceCard, { props: { workspaceId } })
    expect(wrapper.find('strong').text()).toBe('Q1')
  })
})
```

### Pros

- **Covers the components users actually interact with.** Card rendering, hover states,
  conditional icon display, and emitted panel-open events are all testable here.
- **Catches prop/store wiring mistakes.** If a component reads the wrong field from a store
  or passes an incorrect prop to a child, the test fails.
- **Stays faster than E2E.** No browser launch, no network, no full app initialization.

### Cons

- **More setup per test file.** Each connected test needs the db mock and a beforeEach that
  seeds the relevant store state.
- **Mocks can drift.** The `vi.mock('@/db')` stub must stay in sync with the real exports of
  `src/db/`. If a function is renamed or added, the mock must be updated.
- **`jsdom` has limits.** CSS visibility (used by `.actions.visible` in `WorkspaceCard`) is
  not computed by `jsdom`. Tests relying on computed styles must use class assertions
  (`wrapper.classes()`) rather than checking rendered visibility.

---

## Comparison

|                            | Option A (Leaf components)  | Option B (All components)             |
|----------------------------|-----------------------------|---------------------------------------|
| Setup overhead             | Low (Vuetify only)          | Medium (Vuetify + Pinia + router + mock) |
| Components covered         | ColorSwatch, DateChip, MarkdownRenderer | All of Option A + WorkspaceCard, ItemRow, ItemList, panels |
| Store wiring bugs caught   | No                          | Yes                                   |
| User interaction testing   | Minimal                     | Yes (click, emit)                     |
| Maintenance burden         | Low                         | Medium                                |
| Speed                      | Very fast                   | Fast                                  |

---

## Recommendation

**Option B is recommended**, but start by implementing Option A's three tests first to
validate the setup, then extend to the connected components. The connected components —
especially `WorkspaceCard` and `ItemRow` — contain enough conditional template logic
(favorite star visibility, hover actions, item display) to make component tests genuinely
useful. Option A alone tests components that are thin wrappers around already-tested utility
functions and gives little additional confidence.

The heaviest components (`RoadmapPane`, `RoadmapChart`) are best left to E2E tests.
Their behavior depends on measured layout dimensions that `jsdom` cannot provide, making
component tests for them fragile.
