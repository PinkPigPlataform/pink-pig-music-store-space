import { tenantConfig } from './tenant'

export { tenantConfig } from './tenant'

// Retains full backward compatibility — all existing imports of PRODUCT_CATEGORIES continue to work.
export const PRODUCT_CATEGORIES = tenantConfig.categories
