'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { AdminHeader } from '@/components/admin/header'
import { formatPrice, formatDate } from '@/lib/utils'
import { Plus, Search, Edit, Trash2, Package, X, Loader2, ImagePlus, Star, File, Upload, ArrowUp, ArrowDown, GripVertical, Copy, ShieldCheck } from 'lucide-react'
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
  videoUrl?: string
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
  images: string[]
  videoUrl: string
}

const EMPTY_FORM: FormState = {
  name: '', description: '', locale: 'pt', price: '', category: '',
  digitalFile: '', active: true, featured: false, images: [],
  videoUrl: '',
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
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const [donorProduct, setDonorProduct] = useState<Product | null>(null)
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
      images: p.images ?? [],
      videoUrl: p.videoUrl || '',
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
        setForm(f => ({ ...f, images: [...f.images, data.url] }))
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
    const files = Array.from(e.target.files ?? [])
    files.forEach(file => processImage(file))
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
    const files = Array.from(e.dataTransfer.files ?? [])
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        processImage(file)
      } else {
        toast.error(`"${file.name}" não é uma imagem válida.`)
      }
    })
  }

  async function removeImage(index: number, url: string) {
    // Tentativa de deletar do Cloudinary
    try {
      // Extrair public_id da URL: pink-pig/products/filename.ext
      const parts = url.split('/')
      const folderIdx = parts.indexOf('pink-pig')
      if (folderIdx !== -1) {
        const publicPath = parts.slice(folderIdx).join('/')
        const publicId = publicPath.split('.')[0] // Remove extensão
        
        await fetch(`/api/admin/upload/image?publicId=${encodeURIComponent(publicId)}`, {
          method: 'DELETE'
        })
      }
    } catch (error) {
      console.error('Falha ao remover do Cloudinary:', error)
    }

    setForm(f => ({
      ...f,
      images: f.images.filter((_, i) => i !== index)
    }))
    toast.success('Imagem removida')
  }

  function moveImage(index: number, direction: 'up' | 'down') {
    setForm(f => {
      const newImages = [...f.images]
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= newImages.length) return f
      
      const temp = newImages[index]
      newImages[index] = newImages[targetIndex]
      newImages[targetIndex] = temp
      
      return { ...f, images: newImages }
    })
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
    if (!form.name || !form.price || !form.category || form.images.length === 0) {
      toast.error('Preencha nome, preço, categoria e adicione ao menos uma imagem')
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
      images: form.images,
      videoUrl: form.videoUrl,
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
              <div className="space-y-4">
                <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                      <label className="text-sm font-bold text-gray-900 tracking-tight">Galeria de Imagens</label>
                      <p className="text-[10px] text-gray-400 font-medium">Gerencie e ordene as fotos do produto</p>
                    </div>
                    <div className="relative group/import w-full sm:w-auto">
                      <select 
                        className="w-full sm:w-[200px] appearance-none text-xs border border-pink-200 rounded-full pl-9 pr-4 py-2 bg-white outline-none focus:ring-4 focus:ring-pink-500/10 cursor-pointer hover:border-pink-300 transition-all text-pink-600 font-bold shadow-sm truncate"
                        value={donorProduct?._id || ""}
                        onChange={(e) => {
                          const pId = e.target.value;
                          const donor = products.find(p => p._id === pId);
                          setDonorProduct(donor || null);
                        }}
                      >
                        <option value="">{donorProduct ? 'Trocar origem...' : 'Importar de outro...'}</option>
                        {products
                          .filter(p => p._id !== editing?._id && p.images?.length)
                          .map(p => (
                            <option key={p._id} value={p._id}>
                              [{p.locale.toUpperCase()}] {p.name}
                            </option>
                          ))
                        }
                      </select>
                      <Copy className="w-3.5 h-3.5 text-pink-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Selective Import Picker */}
                  {donorProduct && (
                    <div className="pt-3 border-t border-gray-200/50 mt-1 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                          Escolher fotos de: <span className="text-pink-500">{donorProduct.name}</span>
                        </p>
                        <div className="flex gap-2">
                          <button 
                            type="button"
                            onClick={() => {
                              const newImages = (donorProduct.images || []).filter(img => !form.images.includes(img));
                              if (newImages.length > 0) {
                                setForm(f => ({ ...f, images: [...f.images, ...newImages] }));
                                toast.success(`${newImages.length} fotos adicionadas!`);
                              }
                              setDonorProduct(null);
                            }}
                            className="text-[9px] font-bold text-pink-600 hover:text-pink-700 underline"
                          >
                            Adicionar Todas
                          </button>
                          <button type="button" onClick={() => setDonorProduct(null)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {donorProduct.images?.map((img, i) => {
                          const isAdded = form.images.includes(img);
                          return (
                            <div key={i} className="relative shrink-0 group/donor">
                              <div className={cn(
                                "w-14 h-14 rounded-lg border-2 bg-white overflow-hidden transition-all",
                                isAdded ? "border-green-500 opacity-50 shadow-inner scale-90" : "border-gray-100 hover:border-pink-200 shadow-sm"
                              )}>
                                <img src={img} alt="donor" className="w-full h-full object-contain p-1" />
                              </div>
                              {!isAdded && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setForm(f => ({ ...f, images: [...f.images, img] }));
                                    toast.success('Imagem adicionada!');
                                  }}
                                  className="absolute inset-0 flex items-center justify-center bg-pink-500/80 text-white opacity-0 group-hover/donor:opacity-100 transition-opacity rounded-lg"
                                >
                                  <Plus className="w-6 h-6 stroke-[3]" />
                                </button>
                              )}
                              {isAdded && (
                                <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5 shadow-sm">
                                  <ShieldCheck className="w-2.5 h-2.5" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Image List */}
                {form.images.length > 0 && (
                  <div className="space-y-2">
                    {form.images.map((url, idx) => (
                      <div 
                        key={idx} 
                        draggable
                        onDragStart={() => setDraggedIdx(idx)}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOverIdx(idx);
                        }}
                        onDragEnd={() => {
                          setDraggedIdx(null);
                          setDragOverIdx(null);
                        }}
                        onDrop={() => {
                          if (draggedIdx !== null && draggedIdx !== idx) {
                            const newImages = [...form.images];
                            const [movedItem] = newImages.splice(draggedIdx, 1);
                            newImages.splice(idx, 0, movedItem);
                            setForm(f => ({ ...f, images: newImages }));
                            toast.success('Ordem atualizada!');
                          }
                          setDraggedIdx(null);
                          setDragOverIdx(null);
                        }}
                        className={cn(
                          "flex items-center gap-3 p-2 bg-white border rounded-xl group transition-all cursor-grab active:cursor-grabbing",
                          draggedIdx === idx && "opacity-40 border-dashed border-pink-500 scale-95",
                          dragOverIdx === idx && draggedIdx !== idx && "border-solid border-pink-500 bg-pink-50/50 -translate-y-1"
                        )}
                      >
                        <div className="text-gray-300 group-hover:text-pink-400 p-1.5 transition-colors cursor-grab active:cursor-grabbing">
                          <GripVertical className="w-5 h-5" />
                        </div>
                        <div className="w-14 h-14 rounded-lg border bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                          <img src={url} alt={`preview ${idx}`} className="max-w-full max-h-full object-contain p-1" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {idx === 0 && (
                              <span className="bg-pink-100 text-pink-600 text-[9px] font-bold px-1.5 py-0.5 rounded leading-none">
                                CAPA
                              </span>
                            )}
                            <p className="text-xs font-semibold text-gray-900 truncate">
                              {url.split('/').pop()}
                            </p>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1">Posição {idx + 1}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => moveImage(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-gray-300 hover:text-pink-500 disabled:opacity-20 transition-colors"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveImage(idx, 'down')}
                            disabled={idx === form.images.length - 1}
                            className="p-1 text-gray-300 hover:text-pink-500 disabled:opacity-20 transition-colors"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <div className="w-px h-4 bg-gray-100 mx-0.5" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx, url)}
                            className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

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
                  <input ref={imageRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                  {uploading ? (
                    <div className="flex items-center justify-center gap-2 text-pink-500 py-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm text-pink-500">Enviando imagens...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 py-2 text-gray-400">
                      <ImagePlus className="w-8 h-8 text-gray-300" />
                      <p className="text-sm font-medium">Clique ou arraste para enviar imagens</p>
                      <p className="text-xs">Múltiplos arquivos permitidos — via Cloudinary</p>
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

              {/* YouTube Video URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link do Vídeo (Youtube)</label>
                <div className="relative">
                  <input
                    type="url"
                    value={form.videoUrl}
                    onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full border border-gray-200 rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <div className="absolute right-3 top-2.5">
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                    </svg>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Opcional. Se preenchido, um player de vídeo aparecerá na página do produto.</p>
              </div>

              {/* Price + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço ({form.locale === 'en' ? 'USD $' : 'BRL R$'}) *
                  </label>
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
