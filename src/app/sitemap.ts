import { MetadataRoute } from 'next'
import { getPayloadClient } from '@/lib/payload'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

    const payload = await getPayloadClient()
    const { docs: products } = await payload.find({
        collection: 'products',
        limit: 1000,
    })

    const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
        url: `${baseUrl}/product/${product.id}`,
        lastModified: product.updatedAt,
    }))

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 1,
        },
        {
            url: `${baseUrl}/products`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        ...productEntries,
    ]
}
