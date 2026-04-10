// Defines collection type factory, equality, ID validation, and generation helpers.

import { generateRandomColor } from '@/utils/colors'

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
    color: generateRandomColor(),
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
