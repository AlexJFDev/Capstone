// Defines core domain types (Workspace, Item) and their factory, equality, ID validation, and generation helpers.
function randomColor(): string {
  return `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, '0')}`
}

// === WORKSPACES ===
export interface Workspace {
  name: string
  description: string
  color: string
  // List of item IDs
  items: string[]
}

export function constructEmptyWorkspace(): Workspace {
  return {
    name: '',
    description: '',
    color: randomColor(),
    items: [],
  }
}

export function areWorkspacesEqual(w1: Workspace, w2: Workspace): boolean {
  if (w1 === w2) return true

  return (
    w1.name === w2.name &&
    w1.description === w2.description &&
    w1.color === w2.color &&
    w1.items.length === w2.items.length &&
    w1.items.every((id, i) => id === w2.items[i])
  )
}

const WORKSPACE_UUID_REGEX =
  /^w-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export function isValidWorkspaceId(id: string): boolean {
  return WORKSPACE_UUID_REGEX.test(id)
}
export function validateWorkspaceId(id: string) {
  if (!isValidWorkspaceId(id)) {
    throw new Error(`Invalid workspace id: "${id}"`)
  }
}

export function generateWorkspaceId() {
  return `w-${crypto.randomUUID()}`
}

// === ITEMS ===
export interface Item {
  name: string
  description: string
  startDate: Date
  endDate: Date
  color: string
}

export function constructEmptyItem(): Item {
  const today = new Date(new Date().toISOString().slice(0, 10))
  return {
    name: '',
    description: '',
    startDate: today,
    endDate: today,
    color: randomColor(),
  }
}

export function areItemsEqual(item1: Item, item2: Item): boolean {
  if (item1 === item2) return true

  return (
    item1.name === item2.name &&
    item1.description === item2.description &&
    item1.color === item2.color &&
    item1.startDate.getTime() === item2.startDate.getTime() &&
    item1.endDate.getTime() === item2.endDate.getTime()
  )
}

const ITEM_UUID_REGEX = /^i-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export function isValidItemId(id: string): boolean {
  return ITEM_UUID_REGEX.test(id)
}
export function validateItemId(id: string) {
  if (!isValidItemId(id)) {
    throw new Error(`Invalid item id: "${id}"`)
  }
}

export function generateItemId() {
  return `i-${crypto.randomUUID()}`
}
