import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
    id: string
    name: string
    price: number
    image?: string
    slug: string
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
                const exists = get().items.find((i) => i.id === item.id)
                if (!exists) {
                    set((state) => ({ items: [...state.items, item] }))
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
