'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { AdminHeader } from '@/components/admin/header'
import { Camera, User, Mail, Lock, Loader2, Shield, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

interface AdminProfile {
  name: string
  email: string
  role: string
  avatar: string | null
  createdAt: string
}

export default function AdminSettingsPage() {
  const { update: updateSession } = useSession()
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const avatarRef = useRef<HTMLInputElement>(null)

  // Profile form
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    fetch('/api/admin/me')
      .then(r => r.json())
      .then(data => {
        if (data?.data) {
          setProfile(data.data)
          setName(data.data.name)
          setEmail(data.data.email)
        }
        setLoading(false)
      })
  }, [])

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/admin/me/avatar', { method: 'POST', body: fd })
    const data = await res.json()
    if (res.ok) {
      setProfile(p => p ? { ...p, avatar: data.url } : p)
      toast.success('Foto atualizada!')
    } else {
      toast.error(data.error ?? 'Erro no upload')
    }
    setAvatarUploading(false)
    if (avatarRef.current) avatarRef.current.value = ''
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    const res = await fetch('/api/admin/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    })
    const data = await res.json()
    if (res.ok) {
      setProfile(p => p ? { ...p, name: data.data.name, email: data.data.email } : p)
      // Refresh the JWT so header/sidebar reflect new name immediately
      await updateSession({ name: data.data.name })
      toast.success('Perfil atualizado!')
    } else {
      toast.error(data.error ?? 'Erro ao salvar')
    }
    setSavingProfile(false)
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }
    setSavingPassword(true)
    const res = await fetch('/api/admin/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    const data = await res.json()
    if (res.ok) {
      toast.success('Senha alterada com sucesso!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      toast.error(data.error ?? 'Erro ao alterar senha')
    }
    setSavingPassword(false)
  }

  const initials = (profile?.name ?? 'A').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const roleLabel = profile?.role === 'super_admin' ? 'Super Admin' : 'Admin'

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl">
      <AdminHeader title="Meu Perfil" />

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        </div>
      ) : (
        <>
          {/* Avatar card */}
          <div className="bg-white border rounded-2xl p-6 flex items-center gap-6">
            <div className="relative group">
              <input
                ref={avatarRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-pink-100"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center ring-4 ring-pink-100">
                  <span className="text-white text-2xl font-bold">{initials}</span>
                </div>
              )}
              <button
                onClick={() => avatarRef.current?.click()}
                disabled={avatarUploading}
                className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {avatarUploading
                  ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                  : <Camera className="w-5 h-5 text-white" />
                }
              </button>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">{profile?.name}</h2>
              <p className="text-sm text-gray-500">{profile?.email}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <Shield className="w-3.5 h-3.5 text-pink-500" />
                <span className="text-xs font-semibold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">
                  {roleLabel}
                </span>
              </div>
            </div>

            <div className="ml-auto text-right hidden sm:block">
              <p className="text-xs text-gray-400">Conta criada em</p>
              <p className="text-sm font-medium text-gray-700">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('pt-BR') : '—'}
              </p>
            </div>
          </div>

          {/* Info form */}
          <div className="bg-white border rounded-2xl p-6">
            <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
              <User className="w-4 h-4 text-pink-500" />
              Informações pessoais
            </h3>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome completo</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-shadow"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm disabled:opacity-60 transition-colors"
                >
                  {savingProfile
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <CheckCircle2 className="w-4 h-4" />
                  }
                  Salvar alterações
                </button>
              </div>
            </form>
          </div>

          {/* Password form */}
          <div className="bg-white border rounded-2xl p-6">
            <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Lock className="w-4 h-4 text-pink-500" />
              Alterar senha
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha atual</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-shadow"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nova senha</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Mín. 8 caracteres"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar nova senha</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repita a senha"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-shadow"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm disabled:opacity-60 transition-colors"
                >
                  {savingPassword
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Lock className="w-4 h-4" />
                  }
                  Alterar senha
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
