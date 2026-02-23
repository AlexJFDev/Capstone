// === MISC ===
const COLOR_REGEX = /^#[0-9a-f]{6}$/i
export function isValidColor(color: string): boolean {
  return COLOR_REGEX.test(color)
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

const WORKSPACE_UUID_REGEX = /^w-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export function isValidWorkspaceKey(key: string): boolean {
  return WORKSPACE_UUID_REGEX.test(key)
}

// === ITEMS ===
export interface Item {
  name: string;
  description: string;
  'start-date': Date;
  'end-date': Date;
  color: string;
}

export function constructEmptyItem(): Item {
  return {
    name: '',
    description: '',
    'start-date': new Date(),
    'end-date': new Date(),
    color: '#000000',
  }
}

const ITEM_UUID_REGEX = /^i-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export function isValidItemKey(key: string): boolean {
  return ITEM_UUID_REGEX.test(key)
}