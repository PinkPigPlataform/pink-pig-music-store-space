'use client'

import { useEffect, useRef, useState } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { formatPrice, formatDate } from '@/lib/utils'
import { Plus, Search, Edit, Trash2, Package, X, Loader2, ImagePlus, Star, File, Upload } from 'lucide-react'
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────
interface Category { _id: string; label: any; locale: string; parent?: { _id: string; label: any } | null }
interface DigitalFile { _id: string; name: string }
interface Product {
  _id: string
  name: any
  price: number
  locale: string
  active: boolean
  featured: boolean
  category?: { _id: string; label: any }
  digitalFile?: { _id: string; name: string }
  images?: string[]
  description?: any
  createdAt: string
}
interface FormState {
  name: string
  description: string
  locale: string
  price: string
  category: string
  digitalFile: string
  active: boolean
  featured: boolean
  imageUrl: string
}

const EMPTY_FORM: FormState = {
  name: '', description: '', locale: 'pt', price: '', category: '',
  digitalFile: '', active: true, featured: false, imageUrl: '',
}

// ─── Main Page ────────────────────────────────────────────
export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [digitalFiles, setDigitalFiles] = useState<DigitalFile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [isFileDragging, setIsFileDragging] = useState(false)
  const imageRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Data loading ─────────────────────────────────────────
  async function loadProducts(q = '') {
    setLoading(true)
    const res = await fetch(`/api/admin/products?search=${q}&limit=50`)
    const data = await res.json()
    setProducts(data.data ?? [])
    setLoading(false)
  }

  async function loadMeta() {
    const [catRes, fileRes] = await Promise.all([
      fetch('/api/admin/categories'),
      fetch('/api/admin/files'),
    ])
    const [catData, fileData] = await Promise.all([catRes.json(), fileRes.json()])
    setCategories(catData.data ?? [])
    setDigitalFiles(fileData.data ?? [])
  }

  useEffect(() => { loadProducts(); loadMeta() }, [])

  // ── Modal helpers ─────────────────────────────────────────
  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    setForm({
      name: p.name || '',
      description: p.description || '',
      locale: p.locale || 'pt',
      price: (p.price).toString(),
      category: p.category?._id ?? '',
      digitalFile: p.digitalFile?._id ?? '',
      active: p.active,
      featured: p.featured,
      imageUrl: p.images?.[0] ?? '',
    })
    setModalOpen(true)
  }

  function closeModal() { setModalOpen(false); setEditing(null) }

  // ── Image upload ──────────────────────────────────────────
  async function processImage(file: File) {
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/admin/upload/image', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok) {
        setForm(f => ({ ...f, imageUrl: data.url }))
        toast.success('Imagem enviada!')
      } else {
        toast.error(data.error ?? 'Erro no upload')
      }
    } catch {
      toast.error('Erro de conexão ao enviar imagem')
    } finally {
      setUploading(false)
      if (imageRef.current) imageRef.current.value = ''
    }
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processImage(file)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      processImage(file)
    } else if (file) {
      toast.error('Por favor, selecione uma imagem válida.')
    }
  }

  // ── Digital File upload ───────────────────────────────────
  async function processDigitalFile(file: File) {
    if (!file) return
    setUploadingFile(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/admin/files', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok) {
        const newFile = data.data
        setDigitalFiles(prev => [newFile, ...prev])
        setForm(f => ({ ...f, digitalFile: newFile._id }))
        toast.success('Arquivo digital enviado!')
      } else {
        toast.error(data.error ?? 'Erro no envio do arquivo')
      }
    } catch {
      toast.error('Erro de conexão ao enviar arquivo')
    } finally {
      setUploadingFile(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function handleDigitalFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processDigitalFile(file)
  }

  function handleFileDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsFileDragging(true)
  }

  function handleFileDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setIsFileDragging(false)
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsFileDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processDigitalFile(file)
  }

  // ── Save ──────────────────────────────────────────────────
  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.price || !form.category) {
      toast.error('Preencha nome, preço e categoria')
      return
    }
    setSaving(true)
    const payload = {
      name: form.name,
      locale: form.locale,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
      digitalFile: form.digitalFile || null,
      active: form.active,
      featured: form.featured,
      images: form.imageUrl ? [form.imageUrl] : [],
    }

    const url = editing ? `/api/admin/products/${editing._id}` : '/api/admin/products'
    const method = editing ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()

    if (res.ok) {
      toast.success(editing ? 'Produto atualizado!' : 'Produto criado!')
      closeModal()
      loadProducts(search)
    } else {
      toast.error(data.error ?? 'Erro ao salvar')
    }
    setSaving(false)
  }

  // ── Delete ────────────────────────────────────────────────
  async function handleDelete(id: string, name: string) {
    if (!confirm(`Deletar "${name}"? Esta ação não pode ser desfeita.`)) return
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    toast.success('Produto deletado')
    loadProducts(search)
  }

  // ─── Render ───────────────────────────────────────────────
  return (
    <div className="p-4 md:p-6 space-y-5">
      <AdminHeader title="Produtos" />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); loadProducts(e.target.value) }}
            className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Novo produto
        </button>
      </div>

      {/* Table */}
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
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Idioma</th>
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
                      <div className="flex items-center gap-3">
                        {p.images?.[0] ? (
                          <div className="w-20 h-20 rounded-lg border border-gray-100 bg-white overflow-hidden shadow-sm shrink-0 flex items-center justify-center">
                            <img src={p.images[0]} alt={p.name} className="max-w-full max-h-full object-contain p-1" />
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center shadow-sm shrink-0">
                            <Package className="w-6 h-6 text-gray-300" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 flex items-center gap-1.5">
                            {p.name}
                            {p.featured && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
                          </p>
                          <p className="text-xs text-gray-400">{formatDate(p.createdAt)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 hidden md:table-cell">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-600 uppercase">
                        {p.locale || 'pt'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 hidden md:table-cell">
                      {(() => {
                        if (!p.category) return '—'
                        const fullCat = categories.find(c => c._id === p.category?._id)
                        return fullCat?.parent 
                          ? <><span className="text-gray-400">{fullCat.parent.label} &rsaquo; </span>{fullCat.label}</>
                          : <span className="font-medium text-gray-700">{fullCat?.label || p.category.label}</span>
                      })()}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-gray-900">
                      {formatPrice(Math.round(p.price * 100), p.locale === 'en' ? 'USD' : 'BRL')}
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors" title="Editar">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(p._id, p.name)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Deletar">
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-lg font-semibold text-gray-900">
                {editing ? 'Editar produto' : 'Novo produto'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleSave} className="px-6 py-5 space-y-5">

              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Imagem do produto</label>
                <div
                  onClick={() => imageRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-pink-400 hover:bg-pink-50'
                  }`}
                >
                  <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  {form.imageUrl ? (
                    <div className="flex items-center gap-3">
                      <img src={form.imageUrl} alt="preview" className="w-16 h-16 rounded bg-gray-50 object-contain" />
                      <div className="text-left">
                        <p className="text-sm text-green-600 font-medium">Imagem carregada ✓</p>
                        <p className="text-xs text-gray-400">Clique para trocar</p>
                      </div>
                    </div>
                  ) : uploading ? (
                    <div className="flex items-center justify-center gap-2 text-pink-500 py-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm">Enviando...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 py-2 text-gray-400">
                      <ImagePlus className="w-8 h-8 text-gray-300" />
                      <p className="text-sm">Clique para enviar imagem</p>
                      <p className="text-xs">JPG, PNG, WebP — via Cloudinary</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Name & Locale */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                    placeholder="Ex: Drum Kit Trap 2025"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Idioma *</label>
                  <select
                    value={form.locale}
                    onChange={e => setForm(f => ({ ...f, locale: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                  >
                    <option value="pt">Português (PT)</option>
                    <option value="en">Inglês (EN)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  placeholder="Descreva o produto..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                />
              </div>

              {/* Price + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    required
                    placeholder="49.90"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                  >
                    <option value="">Selecionar...</option>
                    {categories
                      .filter(c => (c.locale || 'pt') === form.locale)
                      .filter(c => !c.parent).map(root => {
                      const rootLabel = root.label;
                      return (
                      <optgroup key={root._id} label={rootLabel} className="font-semibold text-gray-900 bg-gray-50/50">
                        <option value={root._id} className="font-normal text-gray-600 bg-white">SELECIONAR: {rootLabel} (Geral)</option>
                        {categories
                          .filter(c => (c.locale || 'pt') === form.locale)
                          .filter(sub => sub.parent?._id === root._id).map(sub => {
                          const subLabel = sub.label;
                          return (
                          <option key={sub._id} value={sub._id} className="font-medium text-gray-700 bg-white">
                            └ {subLabel}
                          </option>
                        )})}
                      </optgroup>
                    )})}
                  </select>
                </div>
              </div>

              {/* Digital File */}
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">Arquivo digital (PDF, ZIP, WAV...)</label>
                
                {form.digitalFile && !uploadingFile ? (
                  <div className="border border-green-200 bg-green-50 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <File className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="text-sm font-semibold text-green-700 line-clamp-1 max-w-[280px]">
                          {digitalFiles.find(f => f._id === form.digitalFile)?.name || 'Arquivo selecionado'} 
                        </p>
                        <p className="text-xs text-green-600/80">Arquivo vinculado</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setForm(f => ({ ...f, digitalFile: '' }))} 
                      className="text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Drag and Drop Zone */}
                    <div
                      onClick={() => !uploadingFile && fileInputRef.current?.click()}
                      onDragOver={handleFileDragOver}
                      onDragLeave={handleFileDragLeave}
                      onDrop={handleFileDrop}
                      className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors mb-3 ${
                        isFileDragging
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-pink-400 hover:bg-pink-50'
                      } ${uploadingFile ? 'opacity-80 pointer-events-none' : ''}`}
                    >
                      <input ref={fileInputRef} type="file" className="hidden" onChange={handleDigitalFileUpload} />
                      
                      {uploadingFile ? (
                        <div className="flex flex-col items-center justify-center gap-2 text-pink-500 py-2">
                           <Loader2 className="w-6 h-6 animate-spin" />
                           <span className="text-sm font-medium">Enviando para Nuvem (Vercel Blob)...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1 py-2 text-gray-400">
                           <Upload className="w-8 h-8 text-gray-300" />
                           <p className="text-sm">Arraste o arquivo ou clique para fazer upload</p>
                           <p className="text-xs text-gray-400">Substitui a versão antiga se você estiver atualizando o e-book.</p>
                        </div>
                      )}
                    </div>

                    {/* Ou select */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0">Reaproveitar existente:</span>
                      <select
                        value={form.digitalFile}
                        onChange={e => setForm(f => ({ ...f, digitalFile: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                      >
                        <option value="">Nenhum arquivo vinculado</option>
                        {digitalFiles.map(f => (
                          <option key={f._id} value={f._id}>{f.name}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* Toggles */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                    className="w-4 h-4 rounded accent-pink-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Ativo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
                    className="w-4 h-4 rounded accent-pink-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Destaque ⭐</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2.5 rounded-lg text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editing ? 'Salvar alterações' : 'Criar produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
