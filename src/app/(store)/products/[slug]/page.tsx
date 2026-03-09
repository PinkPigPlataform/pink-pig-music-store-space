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
          <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative">
            {p.images?.[0] ? (
              <Image
                src={p.images[0]}
                alt={p.name}
                fill
                className="object-contain p-6"
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
                <div key={i} className="aspect-square rounded-lg overflow-hidden relative bg-white border border-gray-200">
                  <Image src={img} alt={`${p.name} ${i + 2}`} fill className="object-contain p-2" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {p.category && (
            <span className="text-sm text-pink-500 font-medium mb-2">
              {p.category.label}
            </span>
          )}
          <h1 className="text-3xl font-bold text-gray-900">{p.name}</h1>

          <div className="mt-4 text-4xl font-extrabold text-gray-900">
            {formatPrice(Math.round(p.price * 100))}
          </div>

          {p.description && (
            <div className="mt-6 text-gray-600 leading-relaxed whitespace-pre-wrap font-medium">
              {p.description}
            </div>
          )}

          <AddToCartButton
            product={{
              id: p._id.toString(),
              name: p.name,
              price: p.price,
              slug: p.slug,
              image: p.images?.[0],
            }}
          />

          <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            Pagamento seguro via Stripe
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
            <Download className="w-4 h-4 text-pink-400" />
            Download imediato após confirmação
          </div>
        </div>
      </div>
    </div>
  )
}
