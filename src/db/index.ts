// IndexedDB persistence layer: opens and caches the Chronicle database and exposes CRUD helpers for items, collections, settings, visualizations, and spaces.
import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Item } from '@/types/items'
import type { Collection } from '@/types/collections'
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
  collections: { key: string; value: Collection }
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
 * Runs the v3 schema migration: renames the `workspaces` object store to
 * `collections` and migrates `favoriteWorkspaceId` → `favoriteCollectionId`
 * in the settings record.
 */
// oxlint-disable-next-line max-lines-per-function
async function migrateToV3(
  db: IDBPDatabase<ChronicleDB>,
  transaction: Parameters<Parameters<typeof openDB>[2]['upgrade']>[3],
): Promise<void> {
  if (db.objectStoreNames.contains('workspaces' as never)) {
    const legacyStore = transaction.objectStore('workspaces' as never)
    const collectionsStore = db.createObjectStore('collections')
    const allKeys = await legacyStore.getAllKeys()
    const allValues = await legacyStore.getAll()
    for (let i = 0; i < allKeys.length; i++) {
      await collectionsStore.put(allValues[i], allKeys[i])
    }
    db.deleteObjectStore('workspaces' as never)
  } else if (!db.objectStoreNames.contains('collections')) {
    db.createObjectStore('collections')
  }

  const settingsStore = transaction.objectStore('settings')
  const appSettings = await settingsStore.get('app')
  if (appSettings) {
    const legacySettings = appSettings as AppSettings & {
      favoriteWorkspaceId?: string | null
    }
    if ('favoriteWorkspaceId' in legacySettings) {
      const migratedSettings: AppSettings = {
        favoriteCollectionId: legacySettings.favoriteWorkspaceId ?? null,
        pixelsPerDay: legacySettings.pixelsPerDay,
        gridInterval: legacySettings.gridInterval,
        roadmapListWidth: legacySettings.roadmapListWidth,
      }
      await settingsStore.put(migratedSettings, 'app')
    }
  }
}

/**
 * Returns a promise that resolves to the open database connection.
 * Creates and caches the connection on first call, including running
 * any schema migrations in the `upgrade` callback.
 */
function getDatabase(): Promise<IDBPDatabase<ChronicleDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ChronicleDB>('chronicle', 3, {
      async upgrade(db, oldVersion, _newVersion, transaction) {
        if (oldVersion < 1) {
          db.createObjectStore('items')
          db.createObjectStore('collections')
          db.createObjectStore('settings')
        }
        if (oldVersion < 2) {
          db.createObjectStore('visualizations')
          db.createObjectStore('spaces')
        }
        if (oldVersion < 3) {
          await migrateToV3(db, transaction)
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

// === Collections ===

/** Returns all stored collections as a Record keyed by collection ID. */
export async function getAllCollections(): Promise<Record<string, Collection>> {
  const db = await getDatabase()
  const keys = await db.getAllKeys('collections')
  const values = await db.getAll('collections')
  return Object.fromEntries(keys.map((key, i) => [key, values[i]!]))
}

/**
 * Writes a collection to the store.
 * `toRaw` strips any Vue reactive proxy before storage. See `putItem` for details.
 */
export async function putCollection(id: string, collection: Collection): Promise<void> {
  const db = await getDatabase()
  await db.put('collections', toRaw(collection), id)
}

/** Removes a collection from the store by ID. */
export async function removeCollection(id: string): Promise<void> {
  const db = await getDatabase()
  await db.delete('collections', id)
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

/** Clears all items, collections, settings, visualizations, and spaces from the database. */
export async function clearDatabase(): Promise<void> {
  const db = await getDatabase()
  await db.clear('items')
  await db.clear('collections')
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
