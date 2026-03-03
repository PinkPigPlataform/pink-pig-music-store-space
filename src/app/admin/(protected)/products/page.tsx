'use client'

import { useEffect, useState } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { formatPrice, formatDate } from '@/lib/utils'
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react'

interface Product {
  _id: string
  name: string
  price: number
  active: boolean
  featured: boolean
  category?: { label: string }
  createdAt: string
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  async function load(q = '') {
    setLoading(true)
    const res = await fetch(`/api/admin/products?search=${q}&limit=20`)
    const data = await res.json()
    setProducts(data.data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <div className="p-4 md:p-6 space-y-5">
      <AdminHeader title="Produtos" />

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              load(e.target.value)
            }}
            className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        <button className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors shrink-0">
          <Plus className="w-4 h-4" />
          Novo produto
        </button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Carregando...</div>
        ) : products.length === 0 ? (
          <div className="p-10 text-center">
            <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Nenhum produto cadastrado</p>
            <p className="text-gray-400 text-sm mt-1">Clique em "Novo produto" para começar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Produto</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Categoria</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Preço</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Status</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-400">{formatDate(p.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 hidden md:table-cell">
                      {p.category?.label ?? '—'}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-gray-900">
                      {formatPrice(Math.round(p.price * 100))}
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {p.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        <button className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
