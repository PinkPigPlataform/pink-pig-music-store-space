import Link from 'next/link'
import { connectMongo } from '@/lib/mongodb'
import ProductModel from '@/lib/models/Product'
import '@/lib/models/Category'
import { formatPrice } from '@/lib/utils'
import { ArrowRight, ShieldCheck, Download, Zap } from 'lucide-react'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

async function getHomeProducts(locale: string) {
  await connectMongo()
  return ProductModel.find({ active: true, locale, featured: true })
    .populate('category', 'label')
    .sort({ createdAt: -1 })
    .limit(8)
    .lean()
}

export default async function StorePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const [products, t] = await Promise.all([
    getHomeProducts(locale),
    getTranslations('HomePage'),
  ])

  const currency = locale === 'en' ? 'USD' : 'BRL'

  const features = [
    { icon: Zap, title: t('feature1Title'), desc: t('feature1Desc') },
    { icon: ShieldCheck, title: t('feature2Title'), desc: t('feature2Desc') },
    { icon: Download, title: t('feature3Title'), desc: t('feature3Desc') },
  ]

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-pink-50 via-white to-rose-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
            {t('heroTitle')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
              {t('heroHighlight')}
            </span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            {t('heroSubtitle')}
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold px-8 py-3.5 rounded-full transition-colors shadow-lg shadow-pink-200"
            >
              {t('heroCta')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-100 rounded-xl mb-4">
                <Icon className="w-6 h-6 text-pink-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {products.length > 0 && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">{t('sectionTitle')}</h2>
              <Link
                href="/products"
                className="text-pink-500 hover:text-pink-600 font-medium flex items-center gap-1"
              >
                {t('seeAll')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(products as any[]).map((product) => {
                const pName = product.name
                const pSlug = product.slug
                const catLabel = product.category?.label || ''

                return (
                  <Link
                    key={product._id.toString()}
                    href={`/products/${pSlug}`}
                    className="group bg-white rounded-xl overflow-hidden border hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={pName}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Download className="w-12 h-12" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      {catLabel && (
                        <span className="text-xs text-pink-500 font-medium">
                          {catLabel}
                        </span>
                      )}
                      <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2">
                        {pName}
                      </h3>
                      <p className="mt-2 text-lg font-bold text-gray-900">
                        {formatPrice(Math.round(product.price * 100), currency)}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
