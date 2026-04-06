// Defines BacklogSettings type factory and equality.


export interface BacklogSettings {
  // User will select which fields they want to display on a backlog.
  selectedFields: string[]
  sortField: string | null
  sortIsAscending: boolean
}

export function constructDefaultBacklogSettings(): BacklogSettings {
  return {
    selectedFields: [ 'name', 'color' ],
    sortField: null,
    sortIsAscending: false,
  }
}

export function areBacklogSettingsEqual(settings1: BacklogSettings, settings2: BacklogSettings) {
  if (settings1 === settings2) return true

  return (
    settings1.sortField === settings2.sortField &&
    settings1.sortIsAscending === settings2.sortIsAscending &&
    settings1.selectedFields.length === settings2.selectedFields.length &&
    settings1.selectedFields.every((field, i) => field === settings2.selectedFields[i])
  )
}