import type {
  CollectionConfig,
  CollectionBeforeChangeHook,
} from 'payload'
import { PRODUCT_CATEGORIES } from '../../config/index'
import type { Product } from '../../payload-types'
import { stripe } from '../../lib/stripe'
import { tenantConfig } from '../../config/tenant'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: { useAsTitle: 'name' },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      async (args) => {
        if (args.operation === 'create') {
          const data = args.data as Product

          const createdProduct = await stripe.products.create({
            name: data.name,
            default_price_data: {
              currency: tenantConfig.currency.toLowerCase(),
              unit_amount: Math.round(data.price * 100),
            },
          })

          return {
            ...data,
            stripeId: createdProduct.id,
            priceId: createdProduct.default_price as string,
          }
        } else if (args.operation === 'update') {
          const data = args.data as Product

          const updatedProduct = await stripe.products.update(data.stripeId!, {
            name: data.name,
            default_price: data.priceId!,
          })

          return {
            ...data,
            stripeId: updatedProduct.id,
            priceId: updatedProduct.default_price as string,
          }
        }
      },
    ] as CollectionBeforeChangeHook[],
  },
  fields: [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Product details',
    },
    {
      name: 'price',
      label: `Price in ${tenantConfig.currency}`,
      min: 0,
      max: 1000,
      type: 'number',
      required: true,
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      options: PRODUCT_CATEGORIES.map(({ label, value }) => ({ label, value })),
      required: true,
    },
    {
      name: 'product_files',
      label: 'Product file(s)',
      type: 'relationship',
      required: true,
      relationTo: 'product_files',
      hasMany: false,
    },
    {
      name: 'priceId',
      access: { create: () => false, read: () => false, update: () => false },
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'stripeId',
      access: { create: () => false, read: () => false, update: () => false },
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'images',
      type: 'array',
      label: 'Product images',
      minRows: 1,
      maxRows: 4,
      required: true,
      labels: { singular: 'Image', plural: 'Images' },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
  ],
}
