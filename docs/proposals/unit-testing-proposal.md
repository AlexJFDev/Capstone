# Unit Testing Proposal

## Context

Chronicle already has the unit testing infrastructure in place from the Vue project scaffold:
`vitest` and `@vue/test-utils` are installed, a `vitest.config.ts` is configured with a `jsdom`
environment, a `tsconfig.vitest.json` is set up, and the `test:unit` npm script runs `vitest`.

The only remaining question is **scope**: what gets tested and what kind of setup each test
requires. This proposal compares two approaches that differ in breadth and complexity.

In both options, test files live alongside the code they test in `__tests__/` subdirectories,
which matches the pattern already specified in `tsconfig.vitest.json`
(`"include": ["src/**/__tests__/*"]`). For example, tests for `src/utils/dates.ts` would live
in `src/utils/__tests__/dates.test.ts`.

---

## What is worth testing

Before comparing approaches, it is useful to identify what the app actually contains that merits
unit tests. Chronicle has two clear categories:

**Pure logic functions** — functions with no side effects that take inputs and return outputs.
These are trivial to test and give the highest confidence per line of test code written:

- `src/utils/dates.ts` — `formatDate`, `isValidRange`, `isValidDateString`,
  `dateToShortISOString`, `isValidRange`
- `src/utils/colors.ts` — `isValidColor`, `isLightColor`
- `src/utils/validation.ts` — all the Vuetify rule functions (`required`, `validColor`, etc.)
- `src/types.ts` — `isValidItemId`, `isValidWorkspaceId`, `areItemsEqual`, `areWorkspacesEqual`
- `src/components/roadmap/roadmap-utils.ts` — `snapIntervalStart`, `snapIntervalEnd`,
  `computeDateRange`, `computeDaysInRange`, `computeIntervalStarts`, `xForDate`

**Pinia stores** — the stores contain business logic (validation, cross-store dependencies,
item/workspace relationship rules) beyond simple state reads and writes. Testing this logic
requires Pinia's testing utilities and a mock of the `@/db` module.

---

## Option A: Test pure utility functions only

Write unit tests exclusively for the pure logic functions listed above. No Vue components are
mounted, no Pinia stores are involved, and the database layer is never touched. This is the
simplest possible starting point and requires no additional setup beyond what is already
installed.

### Structure

```
src/
  utils/
    __tests__/
      dates.test.ts
      colors.test.ts
      validation.test.ts
  types/
    __tests__/
      types.test.ts
  components/
    roadmap/
      __tests__/
        roadmap-utils.test.ts
```

### What the tests look like

```ts
// src/utils/__tests__/dates.test.ts

import { describe, it, expect } from 'vitest'
import { formatDate, isValidRange, isValidDateString, dateToShortISOString } from '../dates'

describe('formatDate', () => {
  it('formats a date in long-american style', () => {
    expect(formatDate('2026-03-15', 'long-american')).toBe('March 15th, 2026')
  })

  it('formats a date in short-european style', () => {
    expect(formatDate('2026-03-15', 'short-european')).toBe('15-03-2026')
  })

  it('uses correct ordinal suffix for 11th, 12th, 13th', () => {
    expect(formatDate('2026-01-11', 'long-american')).toBe('January 11th, 2026')
    expect(formatDate('2026-01-12', 'long-american')).toBe('January 12th, 2026')
    expect(formatDate('2026-01-13', 'long-american')).toBe('January 13th, 2026')
  })
})

describe('isValidRange', () => {
  it('returns true when end is after start', () => {
    expect(isValidRange({ start: new Date('2026-01-01'), end: new Date('2026-01-31') })).toBe(true)
  })

  it('returns true when start equals end', () => {
    expect(isValidRange({ start: new Date('2026-01-01'), end: new Date('2026-01-01') })).toBe(true)
  })

  it('returns false when end is before start', () => {
    expect(isValidRange({ start: new Date('2026-01-31'), end: new Date('2026-01-01') })).toBe(false)
  })
})
```

```ts
// src/components/roadmap/__tests__/roadmap-utils.test.ts

import { describe, it, expect } from 'vitest'
import { snapIntervalStart, snapIntervalEnd, computeDateRange, computeDaysInRange } from '../roadmap-utils'
import type { RoadmapScale } from '../roadmap-utils'

const weekScale: RoadmapScale = {
  pixelsPerDay: 80,
  headerLabel: (d) => d.toISOString(),
  gridInterval: 'week',
}

describe('computeDateRange', () => {
  it('returns a range spanning today when given no items', () => {
    const range = computeDateRange([], weekScale)
    expect(range.start <= new Date()).toBe(true)
    expect(range.end >= new Date()).toBe(true)
  })

  it('spans from the earliest start to the latest end', () => {
    const items = [
      { name: '', description: '', color: '#000000',
        startDate: new Date('2026-02-10'), endDate: new Date('2026-02-20') },
      { name: '', description: '', color: '#ffffff',
        startDate: new Date('2026-02-05'), endDate: new Date('2026-02-25') },
    ]
    const range = computeDateRange(items, weekScale)
    expect(range.start <= new Date('2026-02-05')).toBe(true)
    expect(range.end >= new Date('2026-02-25')).toBe(true)
  })
})

describe('computeDaysInRange', () => {
  it('returns the correct number of days', () => {
    const range = { start: new Date('2026-01-01'), end: new Date('2026-01-08') }
    expect(computeDaysInRange(range)).toBe(7)
  })
})
```

### Pros

- **Zero additional setup.** The existing `vitest.config.ts` is sufficient. No Pinia
  initialization, no Vue mounting, no mocking.
- **Fast to run.** Pure function tests complete in milliseconds and have no I/O.
- **High value per test.** The functions being tested contain real logic that is easy to
  get wrong — ordinal suffixes, UTC handling in `formatDate`, edge cases in `isValidRange`,
  interval snapping in `snapIntervalStart`/`End`.
- **Low maintenance burden.** Pure functions rarely change their signatures; tests rarely need
  to be updated when unrelated code changes.

### Cons

- **Store logic goes untested.** The validation and cross-store dependency logic in
  `useItemsStore` and `useWorkspacesStore` (e.g., that `updateItem` validates the color and
  date range, or that `deleteWorkspace` removes the workspace from items) are not covered.
- **No regression coverage for component behavior.** Bugs in how a component renders props or
  responds to user actions are not caught.

---

## Option B: Test utility functions and Pinia stores

Option B covers everything in Option A, and adds tests for the Pinia stores. Store tests
exercise the business-logic layers that live inside `useItemsStore` and `useWorkspacesStore`:
input validation, cross-store dependencies, computed properties, and the behavior of mutating
actions. The database layer is replaced with a `vi.mock` so tests run without IndexedDB.

### Structure

```
src/
  utils/
    __tests__/          ← same as Option A
  components/
    roadmap/
      __tests__/        ← same as Option A
  stores/
    __tests__/
      items.test.ts
      workspaces.test.ts
```

### Mocking the database

The stores import their database helpers from `@/db`. Since `jsdom` does not implement
IndexedDB, all db calls must be replaced with no-op stubs:

```ts
// at the top of stores/__tests__/items.test.ts

vi.mock('@/db', () => ({
  getAllItems:      vi.fn().mockResolvedValue({}),
  putItem:         vi.fn().mockResolvedValue(undefined),
  removeItem:      vi.fn().mockResolvedValue(undefined),
  getAllWorkspaces: vi.fn().mockResolvedValue({}),
  putWorkspace:    vi.fn().mockResolvedValue(undefined),
  removeWorkspace: vi.fn().mockResolvedValue(undefined),
}))
```

### What the tests look like

```ts
// src/stores/__tests__/items.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useItemsStore } from '../items'
import type { Item } from '@/types'

vi.mock('@/db', () => ({
  getAllItems:  vi.fn().mockResolvedValue({}),
  putItem:     vi.fn().mockResolvedValue(undefined),
  removeItem:  vi.fn().mockResolvedValue(undefined),
}))

const validItem: Item = {
  name: 'Test Item',
  description: '',
  startDate: new Date('2026-01-01'),
  endDate: new Date('2026-01-31'),
  color: '#4A90D9',
}

const validId = 'i-a1b2c3d4-e5f6-4890-abcd-ef1234567890'

describe('useItemsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts with no items', () => {
    const store = useItemsStore()
    expect(store.itemIds).toHaveLength(0)
  })

  it('adds an item and makes it retrievable', () => {
    const store = useItemsStore()
    store.addItem(validId, validItem)
    expect(store.getItem(validId)).toEqual(validItem)
  })

  it('throws when adding an item with an invalid id', () => {
    const store = useItemsStore()
    expect(() => store.addItem('bad-id', validItem)).toThrow()
  })

  it('throws when retrieving a non-existent item', () => {
    const store = useItemsStore()
    expect(() => store.getItem(validId)).toThrow()
  })

  it('throws when updating an item with an invalid color', () => {
    const store = useItemsStore()
    store.addItem(validId, validItem)
    expect(() => store.updateItem(validId, { color: 'not-a-color' })).toThrow()
  })
})
```

### Pros

- **Covers business logic in stores.** Validation rules, cross-store relationship checks
  (e.g., `deleteWorkspace` removing the workspace's items), and computed properties are all
  exercised.
- **Catches regressions in store behavior.** If a future refactor accidentally breaks the
  validation inside `updateItem`, the tests catch it immediately.
- **`setActivePinia` is lightweight.** Pinia's testing utilities don't require mounting Vue
  or setting up a full app instance. Each test gets a fresh, isolated Pinia instance.

### Cons

- **Requires mocking `@/db`.** The database module must be stubbed out. If the db module's
  exported function names change, the mock must be updated in sync.
- **More test surface to maintain.** Store APIs are more likely to change than pure utility
  functions. Tests must be updated when actions are added, renamed, or their signatures change.
- **Does not cover component behavior.** Rendering, template logic, and user interaction are
  still not tested.

---

## Comparison

|                              | Option A (Utilities only)    | Option B (Utilities + Stores)      |
|------------------------------|------------------------------|-------------------------------------|
| Additional setup required    | None                         | `vi.mock('@/db')`, `setActivePinia` |
| Functions tested             | Pure utility functions       | Utility functions + store actions   |
| Store validation logic       | Not covered                  | Covered                             |
| Component behavior           | Not covered                  | Not covered                         |
| Test maintenance burden      | Low                          | Medium                              |
| Speed                        | Very fast                    | Fast                                |
| Risk of false positives      | Very low                     | Low (mocks can drift from real db)  |

---

## Recommendation

**Start with Option A.** The pure utility functions — especially `formatDate`, the ordinal
suffix logic, `isValidRange`, `snapIntervalStart`/`End`, and `computeDateRange` — contain
real edge-case logic that is genuinely easy to get wrong and that is entirely independent of
Vue, Pinia, or IndexedDB. Writing these tests first demonstrates value immediately and requires
no setup work beyond what is already in place.

**Extend to Option B** once Option A is in place. The stores are the right next layer because
they are the primary home of business logic that isn't expressible as a pure function — input
validation, cross-store enforcement, and computed relationships. The `vi.mock('@/db')` pattern
is straightforward and the `setActivePinia` + `createPinia()` approach is the standard Pinia
testing pattern.

Component tests (using `@vue/test-utils` to mount components) are a natural third step after
the stores are covered, but they require more setup (the Vuetify plugin must be registered in
a test wrapper) and are better suited to a separate proposal once the simpler layers are
established.
