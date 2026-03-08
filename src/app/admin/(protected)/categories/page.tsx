'use client'

import { useEffect, useState } from 'react'
import { AdminHeader } from '@/components/admin/header'
import {
  Plus, Tags, Edit, Trash2, X, Loader2,
  CheckCircle2, ChevronRight, FolderOpen, Folder,
} from 'lucide-react'
import { toast } from 'sonner'

// ─── Types ─────────────────────────────────────────────────
interface Category {
  _id: string
  label: string
  value: string
  description?: string
  active: boolean
  order: number
  parent: { _id: string; label: string } | null
}

interface TreeNode extends Category {
  children: TreeNode[]
}

// ─── Helpers ───────────────────────────────────────────────
function buildTree(flat: Category[]): TreeNode[] {
  const roots: TreeNode[] = []
  const map = new Map<string, TreeNode>()

  flat.forEach(c => map.set(c._id, { ...c, children: [] }))
  flat.forEach(c => {
    const node = map.get(c._id)!
    if (c.parent?._id) {
      map.get(c.parent._id)?.children.push(node)
    } else {
      roots.push(node)
    }
  })
  return roots
}

const EMPTY_FORM = { label: '', description: '', active: true, parent: '' }

// ─── Main page ─────────────────────────────────────────────
export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/categories')
    const data = await res.json()
    setCategories(data.data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // ── Modal helpers ─────────────────────────────────────────
  function openCreate(parentId = '') {
    setEditing(null)
    setForm({ ...EMPTY_FORM, parent: parentId })
    setModalOpen(true)
  }

  function openEdit(cat: Category) {
    setEditing(cat)
    setForm({
      label: cat.label,
      description: cat.description ?? '',
      active: cat.active,
      parent: cat.parent?._id ?? '',
    })
    setModalOpen(true)
  }

  function closeModal() { setModalOpen(false); setEditing(null) }

  // ── Save ──────────────────────────────────────────────────
  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const payload = {
      label: form.label,
      description: form.description || undefined,
      active: form.active,
      parent: form.parent || null,
    }

    const url = editing ? `/api/admin/categories/${editing._id}` : '/api/admin/categories'
    const method = editing ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()

    if (res.ok) {
      toast.success(editing ? 'Categoria atualizada!' : 'Categoria criada!')
      closeModal()
      load()
    } else {
      toast.error(data.error ?? 'Erro ao salvar')
    }
    setSaving(false)
  }

  // ── Delete ────────────────────────────────────────────────
  async function handleDelete(cat: Category) {
    const hasChildren = categories.some(c => c.parent?._id === cat._id)
    const msg = hasChildren
      ? `Deletar "${cat.label}"? As subcategorias serão movidas para o nível raiz.`
      : `Deletar "${cat.label}"?`
    if (!confirm(msg)) return

    const res = await fetch(`/api/admin/categories/${cat._id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Categoria deletada')
      load()
    } else {
      toast.error('Erro ao deletar')
    }
  }

  // ── Toggle expand ─────────────────────────────────────────
  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // ── Build tree ────────────────────────────────────────────
  const tree = buildTree(categories)
  const rootCats = categories.filter(c => !c.parent)

  // ─── Render row ───────────────────────────────────────────
  function renderRow(node: TreeNode, isChild = false) {
    const hasChildren = node.children.length > 0
    const isOpen = expanded.has(node._id)

    return (
      <div key={node._id}>
        <div className={`flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors ${isChild ? 'pl-12 bg-gray-50/50' : ''}`}>
          {/* Icon + expand */}
          <div className="flex items-center gap-2 w-5 shrink-0">
            {!isChild && hasChildren ? (
              <button onClick={() => toggleExpand(node._id)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
              </button>
            ) : (
              <span className="w-4">
                {isChild
                  ? <span className="text-gray-300 text-xs ml-1">└</span>
                  : hasChildren ? <FolderOpen className="w-4 h-4 text-amber-400" /> : <Folder className="w-4 h-4 text-gray-300" />
                }
              </span>
            )}
          </div>

          {/* Icon for parent rows */}
          {!isChild && (
            hasChildren
              ? <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
              : <Tags className="w-4 h-4 text-gray-300 shrink-0" />
          )}

          {/* Label + desc */}
          <div className="flex-1 min-w-0">
            <span className={`font-medium text-gray-900 text-sm ${isChild ? 'text-gray-700' : ''}`}>
              {node.label}
            </span>
            {node.description && (
              <span className="ml-2 text-xs text-gray-400">{node.description}</span>
            )}
            <span className="ml-2 text-xs text-gray-300 font-mono">{node.value}</span>
          </div>

          {/* Children count */}
          {hasChildren && !isChild && (
            <span className="text-xs text-gray-400 shrink-0">
              {node.children.length} {node.children.length === 1 ? 'subcategoria' : 'subcategorias'}
            </span>
          )}

          {/* Status */}
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${node.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {node.active ? 'Ativa' : 'Inativa'}
          </span>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {!isChild && (
              <button
                onClick={() => openCreate(node._id)}
                title="Adicionar subcategoria"
                className="p-1.5 text-gray-300 hover:text-pink-500 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
            <button onClick={() => openEdit(node)} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors">
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => handleDelete(node)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Children rows */}
        {hasChildren && isOpen && (
          <div className="border-l-2 border-gray-100 ml-8">
            {node.children.map(child => renderRow(child, true))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-4xl">
      <AdminHeader title="Categorias" />

      {/* Info banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 flex items-start gap-2">
        <Tags className="w-4 h-4 mt-0.5 shrink-0" />
        <span>
          Hierarquia de <strong>2 níveis</strong>: Categorias raiz → Subcategorias.
          Clique em <Plus className="w-3 h-3 inline mx-0.5" /> ao lado de uma categoria para adicionar subcategoria.
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex justify-end">
        <button
          onClick={() => openCreate()}
          className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova categoria
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Carregando...</div>
        ) : tree.length === 0 ? (
          <div className="p-10 text-center">
            <Tags className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Nenhuma categoria ainda</p>
            <p className="text-gray-400 text-sm mt-1">Crie categorias para organizar seus produtos</p>
          </div>
        ) : (
          <div className="divide-y">{tree.map(node => renderRow(node))}</div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-base font-bold text-gray-900">
                {editing ? 'Editar categoria' : form.parent ? 'Nova subcategoria' : 'Nova categoria'}
              </h2>
              <button onClick={closeModal}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              {/* Parent selector (only for create, or when editing) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Categoria pai <span className="text-gray-400 font-normal">(opcional — deixe vazio para categoria raiz)</span>
                </label>
                <select
                  value={form.parent}
                  onChange={e => setForm(f => ({ ...f, parent: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                >
                  <option value="">— Categoria raiz —</option>
                  {rootCats
                    .filter(c => c._id !== editing?._id) // can't be own parent
                    .map(c => (
                      <option key={c._id} value={c._id}>{c.label}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome *</label>
                <input
                  type="text" required value={form.label}
                  onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  placeholder="Ex: Trap, Lofi, Percussão..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição</label>
                <input
                  type="text" value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Descrição opcional..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.active}
                  onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                  className="w-4 h-4 rounded accent-pink-500"
                />
                <span className="text-sm font-medium text-gray-700">Ativa</span>
              </label>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={closeModal}
                  className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2.5 rounded-xl text-sm">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {editing ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
