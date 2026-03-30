// Color validation helpers and a WCAG-based luminance check for determining whether a hex color is light or dark.
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
 * Screen colors are "gamma encoded" - darks are stretched out so they look smoother to human eyes.
 * Before measuring how bright a color actually is, we need to undo that stretching.
 * This converts a 0-1 channel value from "how it looks on screen" to "how much light it actually emits".
 */
const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)

/**
 * Returns true if the given hex color is light enough to risk blending into
 * a light background. Uses WCAG relative luminance.
 */
export function isLightColor(hex: string): boolean {
  const r = toLinear(parseInt(hex.slice(1, 3), 16) / 255)
  const g = toLinear(parseInt(hex.slice(3, 5), 16) / 255)
  const b = toLinear(parseInt(hex.slice(5, 7), 16) / 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.5
}
