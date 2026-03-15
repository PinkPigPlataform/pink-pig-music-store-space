import { connectMongo } from '@/lib/mongodb'
import ProductModel from '@/lib/models/Product'
import CategoryModel from '@/lib/models/Category'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import { Download } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

async function getProducts(locale: string, category?: string) {
  await connectMongo()
  const query: Record<string, unknown> = { active: true, locale }

  if (category) {
    const cat = await CategoryModel.findOne({ value: category, locale })
    if (cat) query.category = cat._id
  }

  return ProductModel.find(query)
    .populate('category', 'label value')
    .sort({ featured: -1, createdAt: -1 })
    .lean()
}

async function getCategories(locale: string) {
  await connectMongo()
  return CategoryModel.find({ active: true, locale }).sort({ label: 1 }).lean()
}

export default async function ProductsPage({
  searchParams,
  params
}: {
  searchParams: Promise<{ category?: string }>
  params: Promise<{ locale: string }>
}) {
  const [{ category }, { locale }] = await Promise.all([searchParams, params])
  const [products, categories, t] = await Promise.all([
    getProducts(locale, category),
    getCategories(locale),
    getTranslations('ProductsPage'),
  ])

  const currency = locale === 'en' ? 'USD' : 'BRL'

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('title')}</h1>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/products"
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !category
              ? 'bg-pink-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {t('all')}
        </Link>
        {(categories as any[]).map((cat) => {
          const catValue = cat.value
          const catLabel = cat.label
          return (
            <Link
              key={cat._id.toString()}
              href={`/products?category=${catValue}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === catValue
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {catLabel}
            </Link>
          )
        })}
      </div>

      {/* Product grid */}
      {products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">{t('noProducts')}</p>
          <Link href="/products" className="text-pink-500 mt-2 inline-block">
            {t('seeAll')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {(products as any[]).map((product) => {
            const pName = product.name
            const pSlug = product.slug
            const catLabel = product.category?.label || ''

            return (
              <Link
                key={product._id.toString()}
                href={`/products/${pSlug}`}
                className="group bg-white rounded-xl overflow-hidden border hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="aspect-square bg-gray-50 relative overflow-hidden">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={pName}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                      <Download className="w-16 h-16" />
                    </div>
                  )}
                  {product.featured && (
                    <span className="absolute top-2 left-2 bg-pink-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                      {t('featured')}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  {catLabel && (
                    <span className="text-xs text-pink-500 font-medium">
                      {catLabel}
                    </span>
                  )}
                  <h2 className="font-semibold text-gray-900 mt-1 line-clamp-2 group-hover:text-pink-500 transition-colors">
                    {pName}
                  </h2>
                  <p className="mt-2 text-lg font-bold">
                    {formatPrice(Math.round(product.price * 100), currency)}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
