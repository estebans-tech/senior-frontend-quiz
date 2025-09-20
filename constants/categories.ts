export const ALLOWED_CATEGORIES = ['basic', 'contracts-&-tooling', 'data-&-delivery', 'leadership-&-strategy',
  'operations-&-impact', 'platform-&-rendering', 'security-&integrity', 'ux-&-components'] as const

// export const ALLOWED_CATEGORIES = ['basic', 'ai-&-on-device-ml', 'accessibility-&-semantics', 
//  'architecture-&-state-management', 'data-&-networking', 'design-systems-&-component-api', 'edge-&-protocols',
//  'experimentation-&-product-impact', 'forms-&-validation', 'microfrontends-&-federation',
//  'native-bridges-&-webviews', 'performance-&-web-vitals', 'privacy-&-compliance',
//  'pwa-&-offline-resilience', 'real-time-ux', 'rendering-paradigm-&-runtimes', 'seo-&-discovery-modern-apps',
//  'testing-&-quality', 'tooling-&-build-systems', 'typescript-&-api-contracts', 'supply-chain-security',
//  'speculation-&-loading-priorities',
//  'web-graphics-&-media', 'web-platform', 'web-security'] as const

export type Category = (typeof ALLOWED_CATEGORIES)[number]

// Praktisk runtime-guard:
export const CATEGORY_SET = new Set<string>(ALLOWED_CATEGORIES as readonly string[])
export const isCategory = (x: string): x is Category => CATEGORY_SET.has(x)