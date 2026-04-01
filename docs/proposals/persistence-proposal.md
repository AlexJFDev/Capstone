# Persistence Proposal

## Context

Chronicle currently stores all application state in two Pinia stores — `useItemsStore` and `useWorkspacesStore` — which are populated from dummy data on startup and lost on every page reload. A third store, `useInterfaceStore`, manages UI state. Most of it is transient, but one piece — the last viewed workspace — needs to survive a reload.

Both stores are already structured to make the integration straightforward: `initializeItems()` and `initializeWorkspaces()` are the designated loading points (both contain a comment noting they need to be updated when IndexedDB is added), and every mutating action (`addItem`, `updateItem`, `deleteItem`, `addWorkspace`, `updateWorkspace`, `deleteWorkspace`) is a named function, giving clean hooks for write operations.

This proposal compares two approaches for wiring those stores to IndexedDB.

---

## What to Persist

### Data stores

`useItemsStore` and `useWorkspacesStore` must be fully persisted. Every item and workspace the user creates should survive a page reload.

### Interface state

Most of `useInterfaceStore` is intentionally ephemeral — which panels are open, which item is being edited, whether a confirmation dialog is showing. Restarting with all panels closed is the correct behavior, and this state should not be persisted.

One piece of interface state does need to survive a reload: **the last viewed workspace.** `WorkspacesView.vue` contains an explicit comment noting that the current fallback to `workspaceIds[0]` should be replaced with persistence logic once it exists. The last viewed workspace ID is a natural candidate for a lightweight `settings` record in IndexedDB.

### Views (future datatype)

The README describes a planned "Views" datatype — a container for workspaces and interface settings (visualization type, sort order, filters, etc.). When Views are implemented, each View will be a first-class record stored in its own `views` object store, just like items and workspaces. Interface settings per View (e.g. which of Roadmap, Backlog, Kanban, or Calendar is active) will be properties on the View record itself, not a separate interface concern. The database version will need to be incremented and the `onupgradeneeded` handler updated to create the `views` object store at that time.

---

## The Database Shape

Both approaches use the same logical structure regardless of implementation:

- **Database name:** `chronicle`
- **Version:** `1`
- **Object stores:**
  - `items` — keyed by item ID (string), stores the `Item` record
  - `workspaces` — keyed by workspace ID (string), stores the `Workspace` record
  - `settings` — keyed by a well-known string (e.g. `"app"`), stores a single settings record

The `settings` store holds a small object with values that don't belong to a specific workspace or item. Initially this is just:

```ts
interface AppSettings {
  lastViewedWorkspaceId: string | null
}
```

One detail worth noting for items: IndexedDB natively handles JavaScript `Date` objects. The existing `initializeItems()` already performs `new Date(item.startDate)` when loading dummy data; the same conversion will be needed when reading records back from IndexedDB, since the structured clone algorithm preserves dates but only if they were stored as `Date` objects in the first place.

---

## Option A: Manual Implementation (Raw IndexedDB API)

A thin database module is written by hand using the browser's built-in `window.indexedDB` API directly. No third-party package is involved.

### Structure

A new file, `src/db/index.ts`, owns the database connection and exposes typed async functions for each operation. The rest of the app never touches `IDBDatabase` directly.

```
src/
  db/
    index.ts      ← opens the DB, exports read/write helpers
  stores/
    items.ts      ← calls db helpers instead of dummy data
    workspaces.ts ← calls db helpers instead of dummy data
```

### What the module looks like

```ts
// src/db/index.ts

const DB_NAME = 'chronicle'
const DB_VERSION = 1

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('items')) {
        db.createObjectStore('items')
      }
      if (!db.objectStoreNames.contains('workspaces')) {
        db.createObjectStore('workspaces')
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Example helpers (one per operation needed by the stores):

export async function getAllItems(): Promise<Record<string, Item>> { ... }
export async function putItem(id: string, item: Item): Promise<void> { ... }
export async function deleteItem(id: string): Promise<void> { ... }

export async function getAllWorkspaces(): Promise<Record<string, Workspace>> { ... }
export async function putWorkspace(id: string, workspace: Workspace): Promise<void> { ... }
export async function deleteWorkspace(id: string): Promise<void> { ... }

export async function getSettings(): Promise<AppSettings> { ... }
export async function putSettings(settings: Partial<AppSettings>): Promise<void> { ... }
```

Each helper opens a transaction, performs its operation, and returns a Promise that resolves or rejects based on the request's `onsuccess`/`onerror` callbacks.

### Integration with the stores

`initializeItems()` and `initializeWorkspaces()` become `async` and call `getAllItems()`/`getAllWorkspaces()` instead of loading dummy data.

`WorkspacesView.vue` reads `lastViewedWorkspaceId` from `getSettings()` on mount and writes it back via `putSettings()` whenever `activeWorkspace` changes.

Every mutating action gains a matching `await put*(id, value)` or `await delete*(id)` call at the end of its body. For example:

```ts
async function addItem(id: string, item: Item) {
  validateItemId(id)
  items.value[id] = item
  await putItem(id, item)
}
```

### Pros

- **Zero dependencies.** No package to audit, update, or worry about being abandoned.
- **Complete visibility.** Every IndexedDB call is in code you wrote and can read. There is no abstraction layer to look through when debugging.
- **Exactly what is needed.** The app's access pattern is simple: load all records on startup, put or delete individual records on mutation. There are no queries, indexes, or joins. A raw implementation is not substantially more complex than a wrapped one for this use case.
- **Educational value.** Writing the wrapper from scratch is a concrete demonstration of how IndexedDB works, which is relevant context for a capstone project.

### Cons

- **Callback boilerplate.** The raw IndexedDB API is callback-based. Each helper function requires a `new Promise(...)` wrapper with `onsuccess` and `onerror` handlers. This is repetitive.
- **Error handling is your responsibility.** A production-grade implementation should handle version conflicts, quota errors, and blocked upgrades (`onblocked`). Getting this right adds code.
- **More code to write.** Approximately 6–10 helper functions are needed, each with the same Promise-wrapping structure.

---

## Option B: NPM Package (`idb`)

[`idb`](https://github.com/jakearchibald/idb) by Jake Archibald is a ~1.5 kB (minified + gzipped) library that wraps the IndexedDB API with Promises and TypeScript types while keeping the conceptual model identical. It is the most widely used IndexedDB wrapper and is maintained by a Google Chrome developer.

### Structure

Same as Option A, but `src/db/index.ts` uses `openDB` from `idb` instead of wrapping `indexedDB.open` by hand.

### What the module looks like

```ts
// src/db/index.ts

import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

interface ChronicleDB extends DBSchema {
  items: { key: string; value: Item }
  workspaces: { key: string; value: Workspace }
  settings: { key: string; value: AppSettings }
}

let db: IDBPDatabase<ChronicleDB>

export async function getDatabase() {
  if (!db) {
    db = await openDB<ChronicleDB>('chronicle', 1, {
      upgrade(db) {
        db.createObjectStore('items')
        db.createObjectStore('workspaces')
        db.createObjectStore('settings')
      }
    })
  }
  return db
}

export async function getAllItems(): Promise<Record<string, Item>> {
  const db = await getDatabase()
  const keys = await db.getAllKeys('items')
  const values = await db.getAll('items')
  return Object.fromEntries(keys.map((key, i) => [key, values[i]!]))
}

export async function putItem(id: string, item: Item): Promise<void> {
  const db = await getDatabase()
  await db.put('items', item, id)
}
```

The `upgrade` callback replaces `onupgradeneeded`. All other operations (get, put, delete, getAll) are awaitable methods on the typed database object. There is no `new Promise(...)` boilerplate.

### Integration with the stores

Identical to Option A. The store-level changes are the same; only the implementation of the helper functions in `src/db/index.ts` differs.

### Pros

- **No Promise boilerplate.** Every IndexedDB operation is a plain `await` call. The module is noticeably shorter than the manual version.
- **TypeScript schema definition.** The `DBSchema` interface makes the object store types explicit and enforced at the call site. Passing the wrong type to `db.put('items', ...)` is a compile error.
- **Proven and well-documented.** `idb` is widely used in production applications. Edge cases (quota errors, version conflicts, blocked upgrades) are handled correctly by the library.
- **Minimal footprint.** At ~1.5 kB, `idb` is not a meaningful addition to the bundle. It is a utility, not a framework.

### Cons

- **An external dependency.** Any dependency is a maintenance surface. `idb` is stable and the API rarely changes, but it is still a package that needs to be tracked.
- **Slightly more to learn upfront.** The `DBSchema` interface pattern is idiomatic to `idb` and requires a brief orientation even though it closely mirrors how IndexedDB works.

---

## Comparison

| | Option A (Manual) | Option B (`idb`) |
|---|---|---|
| Dependencies | None | `idb` (~1.5 kB) |
| Boilerplate | More (Promise wrapping) | Less (native async/await) |
| TypeScript support | Manual | Schema-enforced via `DBSchema` |
| Conceptual model | Identical to IndexedDB | Identical to IndexedDB |
| Complexity for this use case | Low | Low |
| Learning value | Higher | Moderate |

---

## Recommendation

Either option is appropriate for Chronicle's access pattern. Both produce the same logical structure and roughly the same store-level integration code.

**Option A (manual implementation) is recommended** given that this is a capstone project. Writing the IndexedDB wrapper from scratch provides a clearer demonstration of how the persistence layer works — the Promise wrappers around `IDBOpenDBRequest`, the `onupgradeneeded` lifecycle, the transaction model — all of which are worth understanding directly. The boilerplate cost is real but modest: six functions with the same repeated shape is not a complexity problem.

**Option B (`idb`) becomes the better choice** if the implementation is blocked by edge case handling (quota management, upgrade conflicts, blocked connections) or if the TypeScript schema enforcement is useful for catching mistakes during development. In a production application, `idb` would be the default choice. For this project, the tradeoff between educational value and convenience favors writing it by hand.

Whichever option is chosen, the integration points in the stores are the same. The `src/db/` module boundary means the approach can be swapped later without touching any store code.
