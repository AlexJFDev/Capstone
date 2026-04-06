// Defines Space type factory, equality, ID validation, and generation helpers.

import { generateRandomColor } from '@/utils/colors'

export interface Space {
  name: string
  description: string
  color: string
  workspaceIds: string[]
  visualizationIds: string[]
}

export function constructNewSpace(): Space {
  return {
    name: '',
    description: '',
    color: generateRandomColor(),
    workspaceIds: [],
    visualizationIds: [],
  }
}

export function areSpacesEqual(space1: Space, space2: Space): boolean {
  if (space1 === space2) return true

  return (
    space1.name === space2.name &&
    space1.description === space2.description &&
    space1.color === space2.color &&
    space1.workspaceIds.length === space2.workspaceIds.length &&
    space1.workspaceIds.every((id, i) => id === space2.workspaceIds[i]) &&
    space1.visualizationIds.length === space2.visualizationIds.length &&
    space1.visualizationIds.every((id, i) => id === space2.visualizationIds[i])
  )
}

const SPACE_UUID_REGEX = /^s-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export function isValidSpaceId(id: string): boolean {
  return SPACE_UUID_REGEX.test(id)
}
export function validateSpaceId(id: string) {
  if (!isValidSpaceId(id)) {
    throw new Error(`Invalid space id: "${id}"`)
  }
}

export function generateSpaceId() {
  return `s-${crypto.randomUUID()}`
}
