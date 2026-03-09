import { connectMongo } from '@/lib/mongodb'
import ProductModel from '@/lib/models/Product'
import { formatPrice } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Download, ShieldCheck } from 'lucide-react'
import AddToCartButton from './add-to-cart-button'

async function getProduct(slug: string) {
  await connectMongo()
  return ProductModel.findOne({ slug, active: true })
    .populate('category', 'label value')
    .lean()
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)
  if (!product) return {}
  const p = product as unknown as { metaTitle?: string; metaDescription?: string; name: string }
  return {
    title: p.metaTitle || p.name,
    description: p.metaDescription,
  }
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string }
}) {
  const product = await getProduct(params.slug)
  if (!product) notFound()

  const p = product as unknown as {
    _id: { toString(): string }
    name: string
    slug: string
    description?: string
    price: number
    images: string[]
    category?: { label: string }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gradient-to-br from-white via-gray-50/80 to-gray-100/50 rounded-3xl overflow-hidden relative border border-white shadow-[0_8px_40px_-10px_rgba(0,0,0,0.08)] ring-1 ring-black/5 flex items-center justify-center">
            {p.images?.[0] ? (
              <Image
                src={p.images[0]}
                alt={p.name}
                fill
                className="object-contain p-8 drop-shadow-[0_15px_25px_rgba(0,0,0,0.15)] transition-transform duration-500 hover:scale-[1.03]"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Download className="w-24 h-24" />
              </div>
            )}
          </div>
          {p.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {p.images.slice(1, 5).map((img, i) => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden relative bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer ring-1 ring-black/5">
                  <Image src={img} alt={`${p.name} ${i + 2}`} fill className="object-contain p-3 drop-shadow-sm" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div>
            {p.category && (
              <span className="inline-block px-3 py-1 bg-pink-50 text-pink-600 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                {p.category.label}
              </span>
            )}
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
              {p.name}
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
                  name: p.name,
                  price: p.price,
                  slug: p.slug,
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

          {/* Description */}
          {p.description && (
            <div className="mt-12 pt-10 border-t border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Sobre o produto</h3>
              <div className="text-gray-600 leading-relaxed whitespace-pre-wrap text-lg">
                {p.description}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
