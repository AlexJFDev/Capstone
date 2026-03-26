# E2E Testing Proposal

## Context

End-to-end tests launch the real application in a browser and drive it through user flows —
clicking buttons, filling forms, navigating between views — and assert on what appears on
screen. They are the only test layer that exercises the full stack: the browser, Vue router,
Pinia stores, and IndexedDB all run as they do in production.

Playwright is already installed and configured. `playwright.config.ts` sets up three browser
targets (Chromium, Firefox, WebKit), connects to the Vite dev server at `localhost:5173`
locally and the preview server on CI, and has retry and trace-on-failure behavior configured.
A single test file exists — `e2e/vue.spec.ts` — containing one placeholder test left over
from the Vue project scaffold:

```ts
test('visits the app root url', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toHaveText('You did it!')
})
```

This test does not reflect the actual app. It will fail against the current codebase. The
first task in either option below is replacing it with real tests.

---

## What is worth testing at the E2E level

E2E tests are slow (each test takes several seconds) and expensive to maintain, so they
should cover behaviors that lower layers cannot. The right candidates are full user flows
that cross multiple components and stores:

- Creating, editing, and deleting a workspace
- Adding an item to a workspace and seeing it appear on the roadmap
- Navigating to a specific workspace via URL (`/workspace/:id`)
- The empty state when no workspaces exist
- The items view (`/items`)

Behaviors that are already covered by unit or component tests (date formatting, color
validation, store logic) should not be duplicated here.

---

## Option A: Critical path only

Write a small, focused set of tests covering the core user flows. One test file per
top-level feature area. The goal is confidence that the app's primary use cases work
end-to-end, not exhaustive coverage of every UI state.

### Structure

```
e2e/
  workspaces.spec.ts   ← create, edit, delete, navigate
  items.spec.ts        ← add item, edit item, delete item
  empty-state.spec.ts  ← no workspaces, no items
```

### What the tests look like

```ts
// e2e/workspaces.spec.ts

import { test, expect } from '@playwright/test'

test.describe('Workspaces', () => {
  test('shows the empty state when no workspaces exist', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('No workspaces yet')).toBeVisible()
  })

  test('creates a workspace and shows it in the panel', async ({ page }) => {
    await page.goto('/')

    // Open the workspace creator
    await page.getByRole('button', { name: 'New workspace' }).click()

    // Fill in the form
    await page.getByLabel('Name').fill('Q1 Planning')
    await page.getByRole('button', { name: 'Save' }).click()

    // Workspace appears in the sidebar / card list
    await expect(page.getByText('Q1 Planning')).toBeVisible()
  })

  test('navigates to a workspace via its URL', async ({ page }) => {
    // Assumes a workspace has been created in a previous step or via a fixture
    await page.goto('/')
    await page.getByRole('button', { name: 'Open in new tab' }).first().click()
    await expect(page.url()).toContain('/workspace/')
    await expect(page.getByText('Q1 Planning')).toBeVisible()
  })

  test('deletes a workspace and returns to the empty state', async ({ page }) => {
    await page.goto('/')
    // Open editor, delete
    await page.getByRole('button', { name: 'Edit workspace' }).first().click()
    await page.getByRole('button', { name: 'Delete' }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()

    await expect(page.getByText('No workspaces yet')).toBeVisible()
  })
})
```

```ts
// e2e/items.spec.ts

import { test, expect } from '@playwright/test'

test.describe('Items', () => {
  test.beforeEach(async ({ page }) => {
    // Create a workspace to work within
    await page.goto('/')
    await page.getByRole('button', { name: 'New workspace' }).click()
    await page.getByLabel('Name').fill('Test Workspace')
    await page.getByRole('button', { name: 'Save' }).click()
  })

  test('adds an item and sees it on the roadmap', async ({ page }) => {
    await page.getByRole('button', { name: 'Add item' }).click()
    await page.getByLabel('Name').fill('New Feature')
    await page.getByRole('button', { name: 'Save' }).click()

    await expect(page.getByText('New Feature')).toBeVisible()
  })
})
```

### Pros

- **Fast to write and maintain.** A small number of tests, each covering one meaningful
  flow. New tests are added only when a major new feature ships.
- **High signal-to-noise.** If a critical-path test fails, something genuinely important is
  broken. Failures are actionable.
- **Realistic execution time.** A suite of ~10 tests across three browsers runs in under
  two minutes locally.

### Cons

- **Low coverage of edge cases.** Empty states beyond "no workspaces", form validation
  feedback, roadmap scale controls, and the items view are not tested.
- **Tests are order-dependent.** Tests that create state need to set it up themselves or use
  a shared fixture. Without careful isolation, failures in one test can affect others.

---

## Option B: Comprehensive behavioral coverage

Option B covers everything in Option A and adds tests for edge cases, all views, and
secondary interactions. Tests are organized by view, with each file covering the full range
of behaviors in that view.

### Structure

```
e2e/
  fixtures/
    index.ts           ← shared setup helpers (create workspace, create item)
  workspaces.spec.ts   ← CRUD, navigation, favorite, empty state
  items.spec.ts        ← CRUD for items within workspaces, items view (/items)
  roadmap.spec.ts      ← scale controls, item bar rendering, drag-to-resize list
  settings.spec.ts     ← settings panel open/close, scale changes persist
```

### Fixtures

Playwright's fixture system allows shared setup to be declared once and reused across tests.
A `createWorkspace` fixture seeds the database state before a test runs:

```ts
// e2e/fixtures/index.ts

import { test as base, expect } from '@playwright/test'

type Fixtures = {
  workspaceId: string
}

export const test = base.extend<Fixtures>({
  workspaceId: async ({ page }, use) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'New workspace' }).click()
    await page.getByLabel('Name').fill('Fixture Workspace')
    await page.getByRole('button', { name: 'Save' }).click()

    // Extract the workspace ID from the URL or data attribute if needed
    const url = page.url()
    const id = url.split('/workspace/')[1] ?? ''
    await use(id)
  },
})

export { expect }
```

### What the additional tests look like

```ts
// e2e/roadmap.spec.ts

import { test, expect } from './fixtures'

test.describe('Roadmap', () => {
  test('shows the item bar after adding an item', async ({ page, workspaceId }) => {
    await page.goto(`/workspace/${workspaceId}`)
    await page.getByRole('button', { name: 'Add item' }).click()
    await page.getByLabel('Name').fill('Milestone')
    await page.getByRole('button', { name: 'Save' }).click()

    // The item row and bar appear in the roadmap
    await expect(page.getByText('Milestone')).toBeVisible()
  })

  test('changing the scale interval updates the header labels', async ({ page, workspaceId }) => {
    await page.goto(`/workspace/${workspaceId}`)
    await page.getByRole('button', { name: 'Settings' }).click()

    await page.getByLabel('Interval').selectOption('month')
    // Monthly labels should now appear in the header
    await expect(page.getByText(/January|February|March/)).toBeVisible()
  })
})
```

```ts
// e2e/settings.spec.ts

import { test, expect } from './fixtures'

test.describe('Settings', () => {
  test('opens and closes the settings panel', async ({ page, workspaceId }) => {
    await page.goto(`/workspace/${workspaceId}`)
    await page.getByRole('button', { name: 'Settings' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })
})
```

### Pros

- **Full behavioral coverage.** Every major user-visible behavior has at least one test.
  Regressions in any view or interaction are caught before they reach users.
- **Fixtures reduce duplication.** Shared setup is written once and reused. Tests are
  shorter and easier to read.
- **Documents intended behavior.** The test suite serves as a living specification of what
  the app is supposed to do.

### Cons

- **Slow.** A suite of ~30 tests across three browsers can take 5–10 minutes on CI.
- **Higher maintenance burden.** UI changes (button labels, form field names, layout) require
  updating locators. The more tests there are, the more updates are needed.
- **IndexedDB isolation between tests is fragile.** Playwright does not clear IndexedDB
  between tests by default. Tests that leave state behind can interfere with subsequent
  tests. Mitigation options include using `page.evaluate(() => indexedDB.deleteDatabase('chronicle'))`
  in a `beforeEach`, or using Playwright's `storageState` option with a clean profile per
  test.

---

## Comparison

|                              | Option A (Critical path)       | Option B (Comprehensive)              |
|------------------------------|--------------------------------|---------------------------------------|
| Number of tests (estimate)   | ~10                            | ~30                                   |
| Views covered                | Workspaces, empty state        | All views                             |
| Edge cases covered           | No                             | Yes                                   |
| Fixtures / shared setup      | Inline `beforeEach`            | Playwright fixture system             |
| Local run time (3 browsers)  | ~1 minute                      | ~5–10 minutes                         |
| Maintenance burden           | Low                            | Medium–High                           |

---

## Recommendation

**Start with Option A.** The placeholder test (`'You did it!'`) must be replaced immediately
since it fails against the current app. Option A's critical-path tests cover the behaviors
that matter most — workspace and item CRUD, navigation, and the empty state — and give a
meaningful safety net with a small investment.

**The most important first step** is establishing IndexedDB isolation between tests. Without
it, tests that create workspaces or items will leave state that causes subsequent tests to
fail or see unexpected content. Adding a `beforeEach` that wipes the database
(`indexedDB.deleteDatabase('chronicle')` followed by a page reload) should be the first
thing written, before any individual test.

**Extend toward Option B** as the app stabilizes. The roadmap and settings tests in Option B
are particularly valuable because those interactions are difficult to cover at the component
level due to `jsdom` layout constraints. Add them one file at a time as each feature area
matures.
