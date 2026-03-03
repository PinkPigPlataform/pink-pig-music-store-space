'use client'

import { useEffect, useState } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { Plus, Tags, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface Category {
  _id: string
  label: string
  value: string
  active: boolean
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newLabel, setNewLabel] = useState('')

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/categories')
    const data = await res.json()
    setCategories(data.data ?? [])
    setLoading(false)
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newLabel.trim()) return
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: newLabel }),
    })
    const data = await res.json()
    if (res.ok) {
      toast.success('Categoria criada!')
      setNewLabel('')
      setAdding(false)
      load()
    } else {
      toast.error(data.error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deletar esta categoria?')) return
    await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    toast.success('Categoria deletada')
    load()
  }

  useEffect(() => { load() }, [])

  return (
    <div className="p-4 md:p-6 space-y-5">
      <AdminHeader title="Categorias" />

      <div className="flex justify-end">
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova categoria
        </button>
      </div>

      {adding && (
        <form
          onSubmit={handleAdd}
          className="bg-white border border-pink-200 rounded-xl p-4 flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Nome da categoria (ex: Samples, Loops, Beats...)"
            autoFocus
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-pink-500 hover:bg-pink-600 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Carregando...</div>
        ) : categories.length === 0 ? (
          <div className="p-10 text-center">
            <Tags className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Nenhuma categoria ainda</p>
            <p className="text-gray-400 text-sm mt-1">Crie categorias para organizar seus produtos</p>
          </div>
        ) : (
          <div className="divide-y">
            {categories.map((cat) => (
              <div key={cat._id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900">{cat.label}</p>
                  <p className="text-xs text-gray-400 font-mono">{cat.value}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    cat.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {cat.active ? 'Ativa' : 'Inativa'}
                  </span>
                  <button className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
