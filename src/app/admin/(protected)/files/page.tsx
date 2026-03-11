'use client'

import { useEffect, useRef, useState } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { Upload, File, Loader2, Trash2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

interface DigitalFile {
  _id: string
  name: string
  size?: number
  mime?: string
  url: string
  createdAt: string
}

function formatSize(bytes?: number) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function AdminFilesPage() {
  const [files, setFiles] = useState<DigitalFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [cleaning, setCleaning] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/files')
    const data = await res.json()
    setFiles(data.data ?? [])
    setLoading(false)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/admin/files', { method: 'POST', body: formData })
    if (res.ok) {
      toast.success('Arquivo enviado!')
      load()
    } else {
      const d = await res.json()
      toast.error(d.error ?? 'Erro no upload')
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Deletar "${name}" permanentemente?`)) return
    const res = await fetch(`/api/admin/files/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Arquivo deletado')
      load()
    } else {
      toast.error('Erro ao deletar')
    }
  }

  async function handleCleanup() {
    setCleaning(true)
    const res = await fetch('/api/admin/files/cleanup', { method: 'POST' })
    const data = await res.json()
    if (res.ok) {
      if (data.count === 0) {
        toast.success('Nenhum arquivo órfão encontrado')
      } else {
        toast.success(`${data.count} arquivo(s) órfão(s) removido(s): ${data.removed.join(', ')}`)
        load()
      }
    } else {
      toast.error('Erro ao verificar arquivos')
    }
    setCleaning(false)
  }

  useEffect(() => { load() }, [])

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <AdminHeader title="Arquivos Digitais" />
        <button
          onClick={handleCleanup}
          disabled={cleaning}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-2 transition-colors disabled:opacity-50"
        >
          {cleaning ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          {cleaning ? 'Verificando...' : 'Verificar órfãos'}
        </button>
      </div>

      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-pink-200 rounded-xl p-8 text-center cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-colors"
      >
        <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-pink-500">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="font-medium text-sm">Enviando arquivo...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <Upload className="w-8 h-8 text-pink-400" />
            <p className="font-medium">Clique para enviar um arquivo</p>
            <p className="text-sm text-gray-400">ZIP, PDF, MP3, WAV, etc. — via Vercel Blob</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Carregando...</div>
        ) : files.length === 0 ? (
          <div className="p-10 text-center">
            <File className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Nenhum arquivo enviado</p>
            <p className="text-gray-400 text-sm mt-1">Use o botão acima para enviar arquivos digitais</p>
          </div>
        ) : (
          <div className="divide-y">
            {files.map((f) => (
              <div key={f._id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                    <File className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{f.name}</p>
                    <p className="text-xs text-gray-400">{formatSize(f.size)} • {f.mime ?? 'arquivo'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-pink-500 hover:underline"
                  >
                    Ver
                  </a>
                  <button
                    onClick={() => handleDelete(f._id, f.name)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    title="Deletar"
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
