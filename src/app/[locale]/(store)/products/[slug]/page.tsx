import { connectMongo } from '@/lib/mongodb'
import ProductModel from '@/lib/models/Product'
import '@/lib/models/Category'
import { formatPrice } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Download, ShieldCheck } from 'lucide-react'
import AddToCartButton from './add-to-cart-button'
import ProductGallery from './product-gallery'
import YouTubeEmbed from '@/components/store/youtube-embed'

async function getProduct(slug: string, locale: string) {
  await connectMongo()
  return ProductModel.findOne({ 
    slug: slug,
    locale: locale,
    active: true 
  })
    .populate('category', 'label value')
    .lean()
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string, slug: string }> }) {
  const { locale, slug } = await params;
  const product = await getProduct(slug, locale)
  if (!product) return {}

  const p = product as any
  const pName = p.name
  const metaTitle = p.metaTitle
  const metaDesc = p.metaDescription

  return {
    title: metaTitle || pName,
    description: metaDesc,
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string, slug: string }>
}) {
  const { locale, slug } = await params;
  const product = await getProduct(slug, locale)
  if (!product) notFound()

  const p = product as any
  const pName = p.name
  const pSlug = p.slug
  const pDesc = p.description
  const catLabel = p.category?.label || ''

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Images */}
        <div className="lg:col-span-6 xl:col-span-6">
          <ProductGallery images={p.images} productName={pName} />
        </div>

        {/* Info */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col">
          <div>
            {catLabel && (
              <span className="inline-block px-3 py-1 bg-pink-50 text-pink-600 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                {catLabel}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl md:text-[2.5rem] font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
              {pName}
            </h1>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-5xl font-black text-gray-900 tracking-tight">
              {formatPrice(Math.round(p.price * 100))}
            </span>
          </div>

          {/* Buy Box */}
          <div className="mt-8 bg-gray-50/80 border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="mb-6">
              <AddToCartButton
                product={{
                  id: p._id.toString(),
                  name: pName,
                  price: p.price,
                  slug: pSlug,
                  image: p.images?.[0],
                }}
              />
            </div>
            
            <div className="space-y-4 pt-4 border-t border-gray-200/60">
              <div className="flex items-center gap-4 text-sm text-gray-700 font-medium">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                </div>
                Pagamento 100% seguro via Stripe
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-700 font-medium">
                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5 text-pink-600" />
                </div>
                Download imediato após a confirmação
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Content */}
      {p.videoUrl && (
        <div className="mt-16 lg:mt-24 pt-12 border-t border-gray-100 flex justify-center">
          <div className="w-full max-w-4xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <span className="w-1.5 h-8 bg-pink-500 rounded-full inline-block shrink-0"></span>
              {locale === 'en' ? 'See in Action' : 'Veja em Ação'}
            </h3>
            <YouTubeEmbed url={p.videoUrl} title={pName} />
          </div>
        </div>
      )}

      {/* Description */}
      {pDesc && (
        <div className="mt-16 lg:mt-24 pt-12 border-t border-gray-100 mb-10">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <span className="w-1.5 h-8 bg-pink-500 rounded-full inline-block shrink-0"></span>
              Sobre o conteúdo
            </h3>
            <div className="text-gray-600 leading-relaxed whitespace-pre-wrap text-[1.05rem]">
              {pDesc}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
