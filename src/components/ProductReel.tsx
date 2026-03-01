import { TQueryValidator } from '@/lib/validators/query-validator'
import { Product } from '@/payload-types'
import Link from 'next/link'
import ProductListing from './ProductListing'
import { getPayloadClient } from '@/lib/payload'

interface ProductReelProps {
  title: string
  subtitle?: string
  href?: string
  query: TQueryValidator
  shopLabel?: string
}

const FALLBACK_LIMIT = 4

const ProductReel = async (props: ProductReelProps) => {
  const { title, subtitle, href, query, shopLabel } = props
  const payload = await getPayloadClient()

  const { sort, limit = FALLBACK_LIMIT, ...queryOpts } = query

  const parsedQueryOpts: Record<string, { equals: string }> = {}
  Object.entries(queryOpts).forEach(([key, value]) => {
    if (value) parsedQueryOpts[key] = { equals: value }
  })

  const { docs } = await payload.find({
    collection: 'products',
    where: {
      approvedForSale: { equals: 'approved' },
      ...parsedQueryOpts,
    },
    sort,
    depth: 1,
    limit,
  })

  const products = docs as Product[]

  return (
    <section className='py-12'>
      <div className='md:flex md:items-center md:justify-between mb-4'>
        <div className='max-w-2xl px-4 lg:max-w-4xl lg:px-0'>
          {title ? (
            <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>
              {title}
            </h1>
          ) : null}
          {subtitle ? (
            <p className='mt-2 text-sm text-muted-foreground'>
              {subtitle}
            </p>
          ) : null}
        </div>

        {href ? (
          <Link
            href={href}
            className='hidden text-sm font-medium text-pink-600 hover:text-pink-500 md:block'>
            {shopLabel || 'Shop the collection'}{' '}
            <span aria-hidden='true'>&rarr;</span>
          </Link>
        ) : null}
      </div>

      <div className='relative'>
        <div className='mt-6 flex items-center w-full'>
          <div className='w-full grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 md:gap-y-10 lg:gap-x-8'>
            {products.map((product, i) => (
              <ProductListing
                key={`product-${i}`}
                product={product}
                index={i}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductReel
