// src/config/tenant.ts
// Source of truth for all tenant/white-label configuration.
// Override any value via environment variables.

export interface TenantCategory {
    label: string
    value: string
    featured: { name: string; href: string; imageSrc: string }[]
}

const parseCategories = (): TenantCategory[] => {
    try {
        const raw = process.env.NEXT_PUBLIC_PRODUCT_CATEGORIES
        return raw ? JSON.parse(raw) : []
    } catch {
        return []
    }
}

export const tenantConfig = {
    storeName: process.env.NEXT_PUBLIC_STORE_NAME ?? 'My Digital Store',
    storeTagline: process.env.NEXT_PUBLIC_STORE_TAGLINE ?? 'High-quality digital products.',
    storeDescription: process.env.NEXT_PUBLIC_STORE_DESCRIPTION ?? 'Welcome to our store. Every product is verified by our team.',
    supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'support@example.com',
    currency: process.env.NEXT_PUBLIC_CURRENCY ?? 'USD',
    primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR ?? '#ec4899',
    logoUrl: process.env.NEXT_PUBLIC_LOGO_URL ?? '',
    copyrightOwner: process.env.NEXT_PUBLIC_COPYRIGHT_OWNER ?? process.env.NEXT_PUBLIC_STORE_NAME ?? 'My Digital Store',
    copyrightUrl: process.env.NEXT_PUBLIC_COPYRIGHT_URL ?? '',
    twitterHandle: process.env.NEXT_PUBLIC_TWITTER_HANDLE ?? '',
    categories: parseCategories(),
} as const
