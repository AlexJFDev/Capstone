import { isValidColor } from './colors'
import { isValidRange } from './dates'

/** Vuetify rule: field must not be empty. */
export const required = (value: string) =>
  value.trim().length > 0 || 'Required'

/** Vuetify rule: value must be a valid 6-digit hex color. */
export const validColor = (value: string) =>
  isValidColor(value) || 'Must be a valid hex color (e.g. #a1b2c3)'

/** Vuetify rule: value must be a valid date string. */
export const validDate = (value: string) =>
  !isNaN(new Date(value).getTime()) || 'Must be a valid date'

/**
 * Vuetify rule factory: end date must not be before start date.
 * @param getStartDate  Getter for the current start date string to compare against.
 */
export const endDateAfterStart = (getStartDate: () => string) => (value: string) => {
  const start = new Date(getStartDate())
  const end = new Date(value)
  return isValidRange({ start, end }) || 'End date must not be before start date'
}
