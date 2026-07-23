import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
    id: string
    name: string
    price: number
    image?: string
    slug: string
    locale?: string
    currency?: string
}

interface CartStore {
    items: CartItem[]
    addItem: (item: CartItem) => void
    removeItem: (id: string) => void
    clearCart: () => void
    total: () => number
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item) => {
                const normCurrency = (
                    item.currency || (item.locale === 'en' ? 'USD' : 'BRL')
                ).toUpperCase()
                const normLocale = item.locale || (normCurrency === 'USD' ? 'en' : 'pt')
                const itemToAdd: CartItem = {
                    ...item,
                    locale: normLocale,
                    currency: normCurrency,
                }

                const currentItems = get().items
                if (currentItems.length > 0) {
                    const existingCurrency = (
                        currentItems[0].currency ||
                        (currentItems[0].locale === 'en' ? 'USD' : 'BRL')
                    ).toUpperCase()

                    if (existingCurrency !== normCurrency) {
                        // Reset cart if currency differs to prevent mixed-currency carts
                        set({ items: [itemToAdd] })
                        return
                    }
                }

                const exists = currentItems.find((i) => i.id === item.id)
                if (!exists) {
                    set((state) => ({ items: [...state.items, itemToAdd] }))
                }
            },
            removeItem: (id) =>
                set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
            clearCart: () => set({ items: [] }),
            total: () =>
                get().items.reduce((sum, item) => sum + item.price, 0),
        }),
        { name: 'cart-storage' }
    )
)
