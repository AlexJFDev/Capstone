// Provides read-only accessor functions (getSpace, getSpaceName, getSpaceColor) for the spaces store.
import type { Space } from '@/types/spaces'
import type { Ref } from 'vue'

export function useSpacesAccessors(
  spaces: Ref<Record<string, Space>>,
  validateSpaceExists: (id: string) => void,
) {
  function getSpace(id: string): Space {
    validateSpaceExists(id)
    return spaces.value[id]!
  }

  function getSpaceName(id: string): string {
    return getSpace(id).name
  }

  function getSpaceColor(id: string): string {
    return getSpace(id).color
  }

  return { getSpace, getSpaceName, getSpaceColor }
}
