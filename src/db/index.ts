// IndexedDB persistence layer: opens and caches the Chronicle database and exposes CRUD helpers for items, workspaces, settings, visualizations, and spaces.
import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Item } from '@/types/items'
import type { Workspace } from '@/types/collections'
import type { Visualization } from '@/types/visualizations'
import type { Space } from '@/types/spaces'
import { toRaw } from 'vue'
import type { RoadmapInterval } from '@/components/roadmap/roadmap-utils'
import {
  DEFAULT_INTERVAL,
  DEFAULT_LIST_WIDTH,
  DEFAULT_PIXELS_PER_DAY,
} from '@/components/roadmap/constants'

/**
 * Application-level settings persisted across sessions.
 * Stored as a single record in the `settings` object store under the key `"app"`.
 */
export interface AppSettings {
  favoriteCollectionId: string | null
  pixelsPerDay: number
  gridInterval: RoadmapInterval
  roadmapListWidth: number
}

/**
 * Schema for the Chronicle IndexedDB database.
 * Defines the five object stores and their key/value types.
 */
interface ChronicleDB extends DBSchema {
  items: { key: string; value: Item }
  workspaces: { key: string; value: Workspace }
  settings: { key: string; value: AppSettings }
  visualizations: { key: string; value: Visualization }
  spaces: { key: string; value: Space }
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
    dbPromise = openDB<ChronicleDB>('chronicle', 2, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore('items')
          db.createObjectStore('workspaces')
          db.createObjectStore('settings')
        }
        if (oldVersion < 2) {
          db.createObjectStore('visualizations')
          db.createObjectStore('spaces')
        }
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

// === Visualizations ===

/** Returns all stored visualizations as a Record keyed by visualization ID. */
export async function getAllVisualizations(): Promise<Record<string, Visualization>> {
  const db = await getDatabase()
  const keys = await db.getAllKeys('visualizations')
  const values = await db.getAll('visualizations')
  return Object.fromEntries(keys.map((key, i) => [key, values[i]!]))
}

/**
 * Writes a visualization to the store.
 * `toRaw` strips any Vue reactive proxy before storage. See `putItem` for details.
 */
export async function putVisualization(id: string, visualization: Visualization): Promise<void> {
  const db = await getDatabase()
  await db.put('visualizations', toRaw(visualization), id)
}

/** Removes a visualization from the store by ID. */
export async function removeVisualization(id: string): Promise<void> {
  const db = await getDatabase()
  await db.delete('visualizations', id)
}

// === Spaces ===

/** Returns all stored spaces as a Record keyed by space ID. */
export async function getAllSpaces(): Promise<Record<string, Space>> {
  const db = await getDatabase()
  const keys = await db.getAllKeys('spaces')
  const values = await db.getAll('spaces')
  return Object.fromEntries(keys.map((key, i) => [key, values[i]!]))
}

/**
 * Writes a space to the store.
 * `toRaw` strips any Vue reactive proxy before storage. See `putItem` for details.
 */
export async function putSpace(id: string, space: Space): Promise<void> {
  const db = await getDatabase()
  await db.put('spaces', toRaw(space), id)
}

/** Removes a space from the store by ID. */
export async function removeSpace(id: string): Promise<void> {
  const db = await getDatabase()
  await db.delete('spaces', id)
}

// === Clear ===

/** Clears all items, workspaces, settings, visualizations, and spaces from the database. */
export async function clearDatabase(): Promise<void> {
  const db = await getDatabase()
  await db.clear('items')
  await db.clear('workspaces')
  await db.clear('settings')
  await db.clear('visualizations')
  await db.clear('spaces')
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

export function makeDefaultSettings(): AppSettings {
  return {
    favoriteCollectionId: null,
    pixelsPerDay: DEFAULT_PIXELS_PER_DAY,
    gridInterval: DEFAULT_INTERVAL,
    roadmapListWidth: DEFAULT_LIST_WIDTH,
  }
}

/**
 * Merges the provided partial settings into the existing settings record.
 * If no settings record exists yet, it is initialized with default values.
 */
export async function putSettings(settings: Partial<AppSettings>): Promise<void> {
  const db = await getDatabase()
  const current = (await db.get('settings', 'app')) ?? makeDefaultSettings()
  await db.put('settings', { ...current, ...settings }, 'app')
}
