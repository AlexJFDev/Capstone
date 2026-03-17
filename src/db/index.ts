import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Item, Workspace } from '@/types'
import { toRaw } from 'vue'

/**
 * Application-level settings persisted across sessions.
 * Stored as a single record in the `settings` object store under the key `"app"`.
 */
export interface AppSettings {
  lastViewedWorkspaceId: string | null
}

/**
 * Schema for the Chronicle IndexedDB database.
 * Defines the three object stores and their key/value types.
 */
interface ChronicleDB extends DBSchema {
  items: { key: string; value: Item }
  workspaces: { key: string; value: Workspace }
  settings: { key: string; value: AppSettings }
}

/**
 * Cached promise for the open database connection.
 * Ensures the database is only opened once per session.
 */
let dbPromise: Promise<IDBPDatabase<ChronicleDB>> | null = null

/**
 * Returns a promise that resolves to the open database connection.
 * Creates and caches the connection on first call, including running
 * any schema migrations in the `upgrade` callback.
 */
function getDatabase(): Promise<IDBPDatabase<ChronicleDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ChronicleDB>('chronicle', 1, {
      upgrade(db) {
        db.createObjectStore('items')
        db.createObjectStore('workspaces')
        db.createObjectStore('settings')
      },
    })
  }
  return dbPromise
}

// === Items ===

/** Returns all stored items as a Record keyed by item ID. */
export async function getAllItems(): Promise<Record<string, Item>> {
  const db = await getDatabase()
  const keys = await db.getAllKeys('items')
  const values = await db.getAll('items')
  return Object.fromEntries(keys.map((key, i) => [key, values[i]!]))
}

/**
 * Writes an item to the store.
 * `toRaw` strips any Vue reactive proxy before storage, since the structured
 * clone algorithm used by IndexedDB cannot serialize Proxy objects.
 */
export async function putItem(id: string, item: Item): Promise<void> {
  const db = await getDatabase()
  await db.put('items', toRaw(item), id)
}

/** Removes an item from the store by ID. */
export async function removeItem(id: string): Promise<void> {
  const db = await getDatabase()
  await db.delete('items', id)
}

// === Workspaces ===

/** Returns all stored workspaces as a Record keyed by workspace ID. */
export async function getAllWorkspaces(): Promise<Record<string, Workspace>> {
  const db = await getDatabase()
  const keys = await db.getAllKeys('workspaces')
  const values = await db.getAll('workspaces')
  return Object.fromEntries(keys.map((key, i) => [key, values[i]!]))
}

/**
 * Writes a workspace to the store.
 * `toRaw` strips any Vue reactive proxy before storage. See `putItem` for details.
 */
export async function putWorkspace(id: string, workspace: Workspace): Promise<void> {
  const db = await getDatabase()
  await db.put('workspaces', toRaw(workspace), id)
}

/** Removes a workspace from the store by ID. */
export async function removeWorkspace(id: string): Promise<void> {
  const db = await getDatabase()
  await db.delete('workspaces', id)
}

// === Clear ===

/** Clears all items and workspaces from the database. */
export async function clearDatabase(): Promise<void> {
  const db = await getDatabase()
  await db.clear('items')
  await db.clear('workspaces')
}

// === Settings ===

/**
 * Returns the application settings record, or `undefined` if it has not been
 * written yet (i.e. on first launch).
 */
export async function getSettings(): Promise<AppSettings | undefined> {
  const db = await getDatabase()
  return db.get('settings', 'app')
}

/**
 * Merges the provided partial settings into the existing settings record.
 * If no settings record exists yet, it is initialized with default values.
 */
export async function putSettings(settings: Partial<AppSettings>): Promise<void> {
  const db = await getDatabase()
  const current = (await db.get('settings', 'app')) ?? { lastViewedWorkspaceId: null }
  await db.put('settings', { ...current, ...settings }, 'app')
}
