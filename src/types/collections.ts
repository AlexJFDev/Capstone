// Defines collection type factory, equality, ID validation, and generation helpers.

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

export function areCollectionsEqual(w1: Collection, w2: Collection): boolean {
  if (w1 === w2) return true

  return (
    w1.name === w2.name &&
    w1.description === w2.description &&
    w1.color === w2.color &&
    w1.items.length === w2.items.length &&
    w1.items.every((id, i) => id === w2.items[i])
  )
}

const COLLECTION_UUID_REGEX =
  /^w-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export function isValidCollectionId(id: string): boolean {
  return COLLECTION_UUID_REGEX.test(id)
}
export function validateCollectionId(id: string) {
  if (!isValidCollectionId(id)) {
    throw new Error(`Invalid collection id: "${id}"`)
  }
}

export function generateCollectionId() {
  return `w-${crypto.randomUUID()}`
}
