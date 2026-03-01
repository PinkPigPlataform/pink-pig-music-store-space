import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
    slug: 'categories',
    admin: {
        useAsTitle: 'label',
        description: 'Product categories shown in the store navigation.',
    },
    access: {
        read: () => true,
        create: ({ req }) => req.user?.role === 'admin',
        update: ({ req }) => req.user?.role === 'admin',
        delete: ({ req }) => req.user?.role === 'admin',
    },
    fields: [
        { name: 'label', type: 'text', required: true },
        {
            name: 'value',
            type: 'text',
            required: true,
            admin: { description: 'Slug without spaces, e.g. music_books' },
        },
        { name: 'description', type: 'textarea' },
        {
            name: 'featured',
            type: 'array',
            fields: [
                { name: 'name', type: 'text', required: true },
                { name: 'href', type: 'text', required: true },
                { name: 'imageSrc', type: 'text' },
            ],
        },
    ],
}
