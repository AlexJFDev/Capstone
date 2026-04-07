// Vuetify form validation rules for required fields, hex colors, date strings, and date ranges.
import { isValidColor } from './colors'
import { isValidRange, type DateRange } from './dates'

/** Vuetify rule: field must not be empty. */
export const required = (value: string) => value.trim().length > 0 || 'Required'

/** Vuetify rule: value must be a valid 6-digit hex color. */
export const validColor = (value: string) =>
  isValidColor(value) || 'Must be a valid hex color (e.g. #a1b2c3)'

/** Vuetify rule: value must be a valid date string. */
export const validDate = (value: string) =>
  !isNaN(new Date(value).getTime()) || 'Must be a valid date'

/** Vuetify rule: end date must not be before start date. */
export const endDateAfterStart = (range: DateRange) => {
  return isValidRange(range) || 'End date must not be before start date'
}

/** Vuetify rule: range dates must be valid */
export const rangeDatesValid = (range: DateRange) => {
  const startValid = !isNaN(range.start.getTime())
  const endValid = !isNaN(range.end.getTime())

  if (!startValid && !endValid) return 'Both dates are invalid'
  if (!startValid) return 'Start date is invalid'
  if (!endValid) return 'End date is invalid'

  return true
}
