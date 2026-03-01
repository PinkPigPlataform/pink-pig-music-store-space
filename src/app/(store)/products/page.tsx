import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import ProductReel from '@/components/ProductReel'
import { PRODUCT_CATEGORIES } from '@/config'
import { Suspense } from 'react'
import ProductReelSkeleton from '@/components/ProductReelSkeleton'

type Param = string | string[] | undefined

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: Param }>
}

const parse = (param: Param) => {
  if (typeof param === 'string') return param
  return undefined
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const sort = parse(params.sort)
  const category = parse(params.category)

  const label = PRODUCT_CATEGORIES.find(({ value }) => value === category)?.label

  return (
    <MaxWidthWrapper>
      <Suspense
        fallback={
          <ProductReelSkeleton
            title={label ?? 'Browse high-quality assets'}
            count={40}
          />
        }>
        <ProductReel
          title={label ?? 'Browse high-quality assets'}
          query={{
            category,
            limit: 40,
            sort: sort === 'desc' || sort === 'asc' ? sort : undefined,
          }}
        />
      </Suspense>
    </MaxWidthWrapper>
  )
}
