// Defines Collection type factory, equality, ID validation, and generation helpers.

import { generateRandomColor } from '@/utils/colors'

export interface Collection {
  name: string
  description: string
  color: string
  // List of item IDs
  items: string[]
}

export function constructEmptyCollection(): Collection {
  return {
    name: '',
    description: '',
    color: generateRandomColor(),
    items: [],
  }
}

export function areCollectionsEqual(c1: Collection, c2: Collection): boolean {
  if (c1 === c2) return true

  return (
    c1.name === c2.name &&
    c1.description === c2.description &&
    c1.color === c2.color &&
    c1.items.length === c2.items.length &&
    c1.items.every((id, i) => id === c2.items[i])
  )
}

const COLLECTION_UUID_REGEX =
  /^c-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export function isValidCollectionId(id: string): boolean {
  return COLLECTION_UUID_REGEX.test(id)
}
export function validateCollectionId(id: string) {
  if (!isValidCollectionId(id)) {
    throw new Error(`Invalid collection id: "${id}"`)
  }
}

export function generateCollectionId() {
  return `c-${crypto.randomUUID()}`
}
