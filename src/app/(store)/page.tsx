import { Suspense } from 'react'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import ProductReel from '@/components/ProductReel'
import { HomeHero, HomePerks } from '@/components/HomeContent'

export default function Home() {
  return (
    <>
      <MaxWidthWrapper>
        <HomeHero />

        <Suspense>
          <ProductReel
            query={{ sort: 'desc', limit: 4 }}
            href='/products?sort=recent'
            title='Brand New'
            shopLabel='Shop the collection'
          />
        </Suspense>
      </MaxWidthWrapper>

      <HomePerks />
    </>
  )
}
