export const ALLOWED_CATEGORIES = ['basic'] as const

export type Category = (typeof ALLOWED_CATEGORIES)[number]

// Praktisk runtime-guard:
export const CATEGORY_SET = new Set<string>(ALLOWED_CATEGORIES as readonly string[])
export const isCategory = (x: string): x is Category => CATEGORY_SET.has(x)