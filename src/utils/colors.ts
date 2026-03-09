
// === VALIDATION ===

const COLOR_REGEX = /^#[0-9a-f]{6}$/i

/** Returns true if the string is a valid 6-digit hex color (e.g. `#a1b2c3`). */
export function isValidColor(color: string): boolean {
  return COLOR_REGEX.test(color)
}

/** Throws if the string is not a valid 6-digit hex color. */
export function validateColor(color: string) {
  if (!isValidColor(color)) {
    throw new Error(`Invalid hex color: "${color}"`)
  }
}

// === HELPERS ===

/**
 * Returns true if the given hex color is light enough to risk blending into
 * a light background. Uses WCAG relative luminance.
 */
export function isLightColor(hex: string): boolean {
  const toLinear = (c: number) => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  const r = toLinear(parseInt(hex.slice(1, 3), 16) / 255)
  const g = toLinear(parseInt(hex.slice(3, 5), 16) / 255)
  const b = toLinear(parseInt(hex.slice(5, 7), 16) / 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.5
}