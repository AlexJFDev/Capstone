import { ref, computed } from "vue"

export type SortOption = 'custom' | 'startDate' | 'endDate' | 'name'
export type SortDirection = 'asc' | 'desc'

export function useInterfaceSorting() {
  const sortOption = ref<SortOption>('custom')
  const sortDirection = ref<SortDirection>('asc')
  function setSortOption(option: SortOption) { sortOption.value = option }
  function setSortDirection(direction: SortDirection) { sortDirection.value = direction }
  const sortingIsCustom = computed(() => sortOption.value === 'custom')
  const sortDirectionIsAscending = computed(() => sortDirection.value === 'asc')

  return { sortOption, sortDirection, setSortOption, setSortDirection, sortingIsCustom, sortDirectionIsAscending }
}
