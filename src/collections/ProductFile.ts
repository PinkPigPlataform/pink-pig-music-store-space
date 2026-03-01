import type { Access, CollectionConfig } from 'payload'
import type { User } from '../payload-types'

const yourPurchased: Access = async ({ req }) => {
  const user = req.user as User | null
  if (user?.role === 'admin') return true
  if (!user) return false

  const { docs: orders } = await req.payload.find({
    collection: 'orders',
    depth: 2,
    where: {
      user: { equals: user.id },
      _isPaid: { equals: true },
    },
  })

  const purchasedFileIds = orders
    .flatMap((order) => order.products)
    .map((product) => {
      if (typeof product === 'string') return null
      return typeof product.product_files === 'string'
        ? product.product_files
        : product.product_files?.id
    })
    .filter(Boolean)

  return { id: { in: purchasedFileIds } }
}

export const ProductFiles: CollectionConfig = {
  slug: 'product_files',
  admin: {
    hidden: ({ user }) => user?.role !== 'admin',
  },
  access: {
    read: yourPurchased,
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  upload: {
    staticDir: 'product_files',
    mimeTypes: [
      'image/*',
      'application/pdf',
      'audio/*',
      'application/zip',
      'application/x-zip-compressed',
      'application/epub+zip',
      'text/plain',
      'application/json',
    ],
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      admin: { condition: () => false },
      hasMany: false,
      required: false,
    },
  ],
}
