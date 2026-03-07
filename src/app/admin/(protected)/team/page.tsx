'use client'

import { useEffect, useState } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { useSession } from 'next-auth/react'
import {
  Plus, Trash2, Edit, ShieldCheck, Shield, Headphones,
  X, Loader2, CheckCircle2, Eye, EyeOff, ToggleLeft, ToggleRight
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────
interface TeamMember {
  _id: string
  name: string
  email: string
  role: 'super_admin' | 'admin' | 'support'
  isActive: boolean
  avatar?: string | null
  createdAt: string
}

const ROLE_INFO = {
  super_admin: {
    label: 'Super Admin',
    icon: ShieldCheck,
    color: 'text-purple-600 bg-purple-50',
    desc: 'Acesso total — finanças, equipe, configurações',
  },
  admin: {
    label: 'Admin',
    icon: Shield,
    color: 'text-blue-600 bg-blue-50',
    desc: 'Produtos, categorias, pedidos, clientes, arquivos',
  },
  support: {
    label: 'Suporte',
    icon: Headphones,
    color: 'text-green-600 bg-green-50',
    desc: 'Pedidos e clientes — somente visualização',
  },
}

// ─── Main ─────────────────────────────────────────────────
export default function AdminTeamPage() {
  const { data: session } = useSession()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<TeamMember | null>(null)
  const [showPw, setShowPw] = useState(false)
  const [saving, setSaving] = useState(false)

  // Create form
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin' as 'admin' | 'support' })
  // Edit form
  const [editForm, setEditForm] = useState({ name: '', role: 'admin' as 'admin' | 'support', newPassword: '' })

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/team')
    const data = await res.json()
    setMembers(data.data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // ── Create ──────────────────────────────────────────────
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/admin/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) {
      toast.success(`${form.name} adicionado à equipe!`)
      setModalOpen(false)
      setForm({ name: '', email: '', password: '', role: 'admin' })
      load()
    } else {
      toast.error(data.error ?? 'Erro ao criar')
    }
    setSaving(false)
  }

  // ── Toggle active ────────────────────────────────────────
  async function handleToggleActive(member: TeamMember) {
    const res = await fetch(`/api/admin/team/${member._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !member.isActive }),
    })
    if (res.ok) {
      toast.success(member.isActive ? 'Conta desativada' : 'Conta ativada')
      load()
    } else {
      const d = await res.json()
      toast.error(d.error ?? 'Erro')
    }
  }

  // ── Edit ─────────────────────────────────────────────────
  function openEdit(member: TeamMember) {
    setEditTarget(member)
    setEditForm({ name: member.name, role: member.role as 'admin' | 'support', newPassword: '' })
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editTarget) return
    setSaving(true)
    const payload: Record<string, unknown> = { name: editForm.name, role: editForm.role }
    if (editForm.newPassword) payload.newPassword = editForm.newPassword

    const res = await fetch(`/api/admin/team/${editTarget._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (res.ok) {
      toast.success('Membro atualizado!')
      setEditTarget(null)
      load()
    } else {
      toast.error(data.error ?? 'Erro ao salvar')
    }
    setSaving(false)
  }

  // ── Delete ────────────────────────────────────────────────
  async function handleDelete(member: TeamMember) {
    if (!confirm(`Remover "${member.name}" permanentemente?`)) return
    const res = await fetch(`/api/admin/team/${member._id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Membro removido')
      load()
    } else {
      const d = await res.json()
      toast.error(d.error ?? 'Erro')
    }
  }

  const isSelf = (m: TeamMember) => m.email === session?.user?.email

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl">
      <AdminHeader title="Equipe" />

      {/* Role legend */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(Object.entries(ROLE_INFO) as [keyof typeof ROLE_INFO, typeof ROLE_INFO[keyof typeof ROLE_INFO]][]).map(([key, info]) => {
          const Icon = info.icon
          return (
            <div key={key} className="bg-white border rounded-xl p-4 flex items-start gap-3">
              <span className={`p-2 rounded-lg ${info.color}`}>
                <Icon className="w-4 h-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-800">{info.label}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{info.desc}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Header bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">
          Membros ({members.length})
        </h2>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar membro
        </button>
      </div>

      {/* Members list */}
      <div className="bg-white border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Carregando...</div>
        ) : members.length === 0 ? (
          <div className="p-10 text-center text-gray-400">Nenhum membro ainda</div>
        ) : (
          <div className="divide-y">
            {members.map((member) => {
              const info = ROLE_INFO[member.role]
              const Icon = info.icon
              const self = isSelf(member)
              return (
                <div key={member._id} className="flex items-center gap-4 px-5 py-4">
                  {/* Avatar */}
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center shrink-0">
                      <span className="text-white text-sm font-bold">
                        {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900 truncate">{member.name}</p>
                      {self && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">você</span>
                      )}
                      {!member.isActive && (
                        <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full shrink-0">inativo</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{member.email}</p>
                  </div>

                  {/* Role badge */}
                  <span className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${info.color} shrink-0`}>
                    <Icon className="w-3 h-3" />
                    {info.label}
                  </span>

                  {/* Date */}
                  <span className="text-xs text-gray-400 hidden md:block shrink-0">
                    {formatDate(member.createdAt)}
                  </span>

                  {/* Actions — hidden for self and super_admin targets */}
                  {!self && member.role !== 'super_admin' && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleToggleActive(member)}
                        title={member.isActive ? 'Desativar' : 'Ativar'}
                        className="p-1.5 text-gray-400 hover:text-yellow-500 transition-colors"
                      >
                        {member.isActive
                          ? <ToggleRight className="w-4 h-4" />
                          : <ToggleLeft className="w-4 h-4" />
                        }
                      </button>
                      <button
                        onClick={() => openEdit(member)}
                        title="Editar"
                        className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(member)}
                        title="Remover"
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-base font-bold text-gray-900">Adicionar membro</h2>
              <button onClick={() => setModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
                <input
                  type="text" required value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Maria Silva"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email" required value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="maria@exemplo.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha temporária</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'} required minLength={8}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nível de acesso</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['admin', 'support'] as const).map(r => {
                    const info = ROLE_INFO[r]
                    const Icon = info.icon
                    const selected = form.role === r
                    return (
                      <button key={r} type="button" onClick={() => setForm(f => ({ ...f, role: r }))}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${selected ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                        <Icon className="w-4 h-4 shrink-0" />
                        {info.label}
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-gray-400 mt-2">{ROLE_INFO[form.role].desc}</p>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2.5 rounded-xl text-sm">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-base font-bold text-gray-900">Editar — {editTarget.name}</h2>
              <button onClick={() => setEditTarget(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleEdit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input type="text" required value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nível de acesso</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['admin', 'support'] as const).map(r => {
                    const info = ROLE_INFO[r]
                    const Icon = info.icon
                    return (
                      <button key={r} type="button" onClick={() => setEditForm(f => ({ ...f, role: r }))}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${editForm.role === r ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                        <Icon className="w-4 h-4 shrink-0" />
                        {info.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nova senha <span className="text-gray-400 font-normal">(deixe vazio para não alterar)</span>
                </label>
                <input type="password" minLength={8} value={editForm.newPassword}
                  onChange={e => setEditForm(f => ({ ...f, newPassword: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setEditTarget(null)}
                  className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2.5 rounded-xl text-sm">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
