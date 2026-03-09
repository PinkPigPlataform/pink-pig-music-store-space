import { connectMongo } from '@/lib/mongodb'
import ProductModel from '@/lib/models/Product'
import CategoryModel from '@/lib/models/Category'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import { Download } from 'lucide-react'

async function getProducts(category?: string) {
  await connectMongo()
  const query: Record<string, unknown> = { active: true }

  if (category) {
    const cat = await CategoryModel.findOne({ value: category })
    if (cat) query.category = cat._id
  }

  return ProductModel.find(query)
    .populate('category', 'label value')
    .sort({ featured: -1, createdAt: -1 })
    .lean()
}

async function getCategories() {
  await connectMongo()
  return CategoryModel.find({ active: true }).sort({ label: 1 }).lean()
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const [products, categories] = await Promise.all([
    getProducts(searchParams.category),
    getCategories(),
  ])

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Produtos</h1>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/products"
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !searchParams.category
              ? 'bg-pink-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todos
        </Link>
        {(categories as unknown as Array<{ _id: { toString(): string }; label: string; value: string }>).map(
          (cat) => (
            <Link
              key={cat._id.toString()}
              href={`/products?category=${cat.value}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                searchParams.category === cat.value
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </Link>
          )
        )}
      </div>

      {/* Product grid */}
      {products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">Nenhum produto encontrado</p>
          <Link href="/products" className="text-pink-500 mt-2 inline-block">
            Ver todos os produtos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {(products as unknown as Array<{
            _id: { toString(): string }
            name: string
            slug: string
            price: number
            images: string[]
            category?: { label: string }
            featured?: boolean
          }>).map((product) => (
            <Link
              key={product._id.toString()}
              href={`/products/${product.slug}`}
              className="group bg-white rounded-xl overflow-hidden border hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="aspect-square bg-gray-50 relative overflow-hidden">
                {product.images?.[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-200">
                    <Download className="w-16 h-16" />
                  </div>
                )}
                {product.featured && (
                  <span className="absolute top-2 left-2 bg-pink-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    Destaque
                  </span>
                )}
              </div>
              <div className="p-4">
                {product.category && (
                  <span className="text-xs text-pink-500 font-medium">
                    {product.category.label}
                  </span>
                )}
                <h2 className="font-semibold text-gray-900 mt-1 line-clamp-2 group-hover:text-pink-500 transition-colors">
                  {product.name}
                </h2>
                <p className="mt-2 text-lg font-bold">
                  {formatPrice(Math.round(product.price * 100))}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
