'use client'

import { useEffect, useState, useCallback } from 'react'
import { AdminHeader } from '@/components/admin/header'
import {
  Plus, Tags, Edit, Trash2, X, Loader2,
  CheckCircle2, ChevronRight, FolderOpen, Folder,
} from 'lucide-react'
import { toast } from 'sonner'

// ─── Types ─────────────────────────────────────────────────
interface Category {
  _id: string
  label: any
  value: any
  description?: any
  locale: string
  active: boolean
  order: number
  parent: { _id: string; label: string; value: string } | null
}

interface TreeNode extends Category {
  children: TreeNode[]
}

const EMPTY_FORM = { label: '', description: '', locale: 'pt', active: true, parent: '' }

// ─── Build tree from flat list ─────────────────────────────
function buildTree(flat: Category[]): TreeNode[] {
  const map = new Map<string, TreeNode>()
  flat.forEach(c => map.set(c._id, { ...c, children: [] }))

  const roots: TreeNode[] = []
  flat.forEach(c => {
    const node = map.get(c._id)!
    if (c.parent?._id && map.has(c.parent._id)) {
      map.get(c.parent._id)!.children.push(node)
    } else {
      roots.push(node)
    }
  })
  return roots
}

// ─── Main page ─────────────────────────────────────────────
export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  // ── Data ──────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      setCategories(data.data ?? [])
    } catch {
      toast.error('Erro ao carregar categorias')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // ── Modal ─────────────────────────────────────────────────
  function openCreate(parentId = '') {
    setEditing(null)
    setForm({ ...EMPTY_FORM, parent: parentId })
    setModalOpen(true)
  }

  function openEdit(cat: Category) {
    setEditing(cat)
    setForm({
      label: cat.label || '',
      description: cat.description || '',
      locale: cat.locale || 'pt',
      active: cat.active,
      parent: cat.parent?._id ?? '',
    })
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditing(null)
    setForm(EMPTY_FORM)
  }

  // ── Save (create & edit) ──────────────────────────────────
  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.label.trim()) { toast.error('Nome obrigatório'); return }
    setSaving(true)

    const payload = {
      label: form.label.trim(),
      locale: form.locale,
      description: form.description.trim() || undefined,
      active: form.active,
      parent: form.parent || null,
    }

    const url = editing
      ? `/api/admin/categories/${editing._id}`
      : '/api/admin/categories'
    const method = editing ? 'PUT' : 'POST'

    try {
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
    } catch {
      toast.error('Erro de conexão')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ────────────────────────────────────────────────
  async function handleDelete(cat: Category) {
    const hasChildren = categories.some(c => c.parent?._id === cat._id)
    const catName = cat.label
    const msg = hasChildren
      ? `"${catName}" tem subcategorias que serão movidas para o nivel raiz. Confirmar exclusão?`
      : `Deletar "${catName}"? Esta ação não pode ser desfeita.`
    if (!confirm(msg)) return

    try {
      const res = await fetch(`/api/admin/categories/${cat._id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Categoria deletada'); load() }
      else { const d = await res.json(); toast.error(d.error ?? 'Erro ao deletar') }
    } catch {
      toast.error('Erro de conexão')
    }
  }

  // ── Tree helpers ──────────────────────────────────────────
  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const tree = buildTree(categories)
  const rootCats = categories.filter(c => !c.parent)

  // ─── Row renderer ─────────────────────────────────────────
  function renderRow(node: TreeNode, isChild = false) {
    const hasChildren = node.children.length > 0
    const isOpen = expanded.has(node._id)

    return (
      <div key={node._id}>
        <div className={`
          group flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-3 hover:bg-gray-50 transition-colors
          ${isChild ? 'pl-8 sm:pl-14 bg-gray-50/40 border-l-2 border-gray-100' : ''}
        `}>

          {/* Expand chevron — only for root nodes with children */}
          <div className="w-5 shrink-0 flex items-center justify-center">
            {!isChild && hasChildren ? (
              <button
                onClick={() => toggleExpand(node._id)}
                className="text-gray-400 hover:text-gray-700 transition-colors"
                title={isOpen ? 'Colapsar' : 'Expandir'}
              >
                <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
              </button>
            ) : (
              <span className="text-gray-300 text-xs">{isChild ? '└' : ''}</span>
            )}
          </div>

          {/* Folder icon */}
          <div className="shrink-0">
            {isChild
              ? <Tags className="w-4 h-4 text-gray-300" />
              : hasChildren
                ? <FolderOpen className="w-4 h-4 text-amber-400" />
                : <Folder className="w-4 h-4 text-gray-300" />
            }
          </div>

          {/* Label + description + slug */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="font-medium text-gray-900 text-sm">{node.label}</span>
              {(node.description) && (
                <span className="text-xs text-gray-400 hidden sm:inline">{node.description}</span>
              )}
            </div>
            <span className="text-xs text-gray-300 font-mono">{node.value}</span>
            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 uppercase">
              {node.locale || 'pt'}
            </span>
          </div>

          {/* Children count badge */}
          {hasChildren && !isChild && (
            <span className="hidden sm:block text-xs text-gray-400 shrink-0">
              {node.children.length} sub{node.children.length > 1 ? 'categorias' : 'categoria'}
            </span>
          )}

          {/* Active badge */}
          <span className={`
            text-xs px-2 py-0.5 rounded-full font-medium shrink-0
            ${node.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}
          `}>
            {node.active ? 'Ativa' : 'Inativa'}
          </span>

          {/* Actions */}
          <div className="flex items-center gap-0.5 shrink-0">
            {/* Add subcategory — only for root nodes */}
            {!isChild && (
              <button
                onClick={() => { openCreate(node._id); setExpanded(prev => new Set(prev).add(node._id)) }}
                title="Adicionar subcategoria"
                className="p-1.5 text-gray-300 hover:text-pink-500 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => openEdit(node)}
              title="Editar"
              className="p-1.5 text-gray-300 hover:text-blue-500 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDelete(node)}
              title="Deletar"
              className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Children (expanded) */}
        {hasChildren && isOpen && (
          <div>{node.children.map(child => renderRow(child, true))}</div>
        )}
      </div>
    )
  }

  // ─── Page ─────────────────────────────────────────────────
  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5">
      <AdminHeader title="Categorias" />

      {/* Info tip */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-amber-700 flex items-start gap-2">
        <Tags className="w-4 h-4 mt-0.5 shrink-0" />
        <span>
          Hierarquia de <strong>2 níveis</strong>. Clique em{' '}
          <code className="bg-amber-100 text-amber-800 px-1 rounded text-xs">+</code>{' '}
          ao lado de uma categoria raiz para adicionar subcategoria.
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
          <div className="p-10 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-300 mx-auto" />
          </div>
        ) : tree.length === 0 ? (
          <div className="p-10 text-center">
            <Tags className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Nenhuma categoria ainda</p>
            <p className="text-gray-400 text-sm mt-1">
              Crie categorias para organizar seus produtos
            </p>
          </div>
        ) : (
          <div className="divide-y">{tree.map(node => renderRow(node))}</div>
        )}
      </div>

      {/* ─── Modal ────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-base font-bold text-gray-900">
                {editing
                  ? 'Editar categoria'
                  : form.parent
                    ? `Nova subcategoria`
                    : 'Nova categoria'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSave} className="px-5 py-5 space-y-4">

              {/* Parent selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Categoria pai
                  <span className="ml-1 text-gray-400 font-normal text-xs">
                    (vazio = categoria raiz)
                  </span>
                </label>
                <select
                  value={form.parent}
                  onChange={e => setForm(f => ({ ...f, parent: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                >
                  <option value="">— Categoria raiz (sem pai) —</option>
                  {rootCats
                    .filter(c => c._id !== editing?._id)
                    .map(c => {
                      const cLabel = c.label;
                      return <option key={c._id} value={c._id}>{cLabel}</option>
                    })
                  }
                </select>
              </div>

              {/* Name & Locale */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nome <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.label}
                    onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                    placeholder="Ex: Beats, Trap..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Idioma <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.locale}
                    onChange={e => setForm(f => ({ ...f, locale: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                  >
                    <option value="pt">Português (PT)</option>
                    <option value="en">Inglês (EN)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Descrição <span className="text-gray-400 font-normal text-xs">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Breve descrição..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              {/* Active toggle */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                  className="w-4 h-4 rounded accent-pink-500"
                />
                <span className="text-sm font-medium text-gray-700">Categoria ativa</span>
              </label>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2.5 rounded-xl text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  {saving
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <CheckCircle2 className="w-4 h-4" />
                  }
                  {editing ? 'Salvar alterações' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
