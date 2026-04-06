// Provides doesSpaceExist and validateSpaceExists helpers for the spaces store.
import { isValidSpaceId, type Space } from '@/types/spaces'
import type { Ref } from 'vue'

export function useSpacesValidation(spaces: Ref<Record<string, Space>>) {
  function doesSpaceExist(id: string): boolean {
    isValidSpaceId(id)
    return id in spaces.value
  }

  function validateSpaceExists(id: string) {
    if (!doesSpaceExist(id)) {
      throw new Error(`Unknown space id: "${id}"`)
    }
  }

  return { doesSpaceExist, validateSpaceExists }
}
