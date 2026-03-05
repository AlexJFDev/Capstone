// === MISC ===
const COLOR_REGEX = /^#[0-9a-f]{6}$/i
export function isValidColor(color: string): boolean {
  return COLOR_REGEX.test(color)
}
export function validateColor(color: string) {
  if (!isValidColor(color)) {
    throw new Error(`Invalid hex color: "${color}"`)
  }
}

// === WORKSPACES ===
export interface Workspace {
  name: string;
  description: string;
  color: string;
  items: string[]; // List of item IDs
}

export function constructEmptyWorkspace(): Workspace {
  return {
    name: '',
    description: '',
    color: '#000000',
    items: []
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

const WORKSPACE_UUID_REGEX = /^w-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export function isValidWorkspaceKey(key: string): boolean {
  return WORKSPACE_UUID_REGEX.test(key)
}
export function validateWorkspaceKey(key: string) {
  if (!isValidWorkspaceKey(key)) {
    throw new Error(`Invalid workspace key: "${key}"`)
  }
}

export function generateWorkspaceKey() {
  return `w-${crypto.randomUUID()}`
}

// === ITEMS ===
export interface Item {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  color: string;
}

export function constructEmptyItem(): Item {
  return {
    name: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    color: '#000000',
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
export function isValidItemKey(key: string): boolean {
  return ITEM_UUID_REGEX.test(key)
}
export function validateItemKey(key: string) {
  if (!isValidItemKey(key)) {
    throw new Error(`Invalid item key: "${key}"`)
  }
}

export function generateItemKey() {
  return `i-${crypto.randomUUID()}`
}