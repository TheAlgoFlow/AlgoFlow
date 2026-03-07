/**
 * Single source of truth for category accent and text colours.
 * Used across atoms, molecules, organisms, and pages.
 */
export const CATEGORY_COLORS: Record<string, string> = {
  sorting:           '#CCFF00',
  searching:         '#FF6B00',
  'data-structures': '#F900FF',
  dp:                '#5200FF',
}

export const CATEGORY_TEXT_COLORS: Record<string, string> = {
  sorting:           '#4a6600',
  searching:         '#FF6B00',
  'data-structures': '#c000cc',
  dp:                '#5200FF',
}

/** Returns both colour values for a given category id */
export function getCategoryTheme(categoryId: string) {
  return {
    color:     CATEGORY_COLORS[categoryId]     ?? '#5200FF',
    textColor: CATEGORY_TEXT_COLORS[categoryId] ?? '#5200FF',
  }
}
