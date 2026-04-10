// Provides addSpace, updateSpace, and deleteSpace mutations for the spaces store, with validation and DB persistence.
import { putSpace, removeSpace } from '@/db'
import { validateSpaceId, type Space } from '@/types/spaces'
import { validateColor } from '@/utils/colors'
import type { Ref } from 'vue'

export function useSpacesMutations(
  spaces: Ref<Record<string, Space>>,
  getSpace: (id: string) => Space,
  validateSpaceExists: (id: string) => void,
) {
  function addSpace(id: string, space: Space) {
    validateSpaceId(id)
    spaces.value[id] = space
    putSpace(id, spaces.value[id]!)
  }

  function updateSpace(id: string, updates: Partial<Space>) {
    validateSpaceExists(id)

    if (updates.color) {
      validateColor(updates.color)
    }

    Object.assign(getSpace(id), updates)
    putSpace(id, getSpace(id))
  }

  function deleteSpace(id: string) {
    validateSpaceExists(id)
    delete spaces.value[id]
    removeSpace(id)
  }

  return { addSpace, updateSpace, deleteSpace }
}
