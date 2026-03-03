'use client'

import { useEffect, useState } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { formatDate } from '@/lib/utils'
import { Users, Search } from 'lucide-react'

interface Customer {
  _id: string
  name: string
  email: string
  _verified: boolean
  googleId?: string
  createdAt: string
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  async function load(q = '') {
    setLoading(true)
    const res = await fetch(`/api/admin/customers?search=${q}&limit=50`)
    const data = await res.json()
    setCustomers(data.data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <div className="p-4 md:p-6 space-y-5">
      <AdminHeader title="Clientes" />

      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar clientes..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); load(e.target.value) }}
          className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Carregando...</div>
        ) : customers.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Nenhum cliente cadastrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Verificado</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Login via</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Cadastro</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.email}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        c._verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {c._verified ? 'Sim' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 hidden md:table-cell">
                      {c.googleId ? '🔵 Google' : '📧 Email'}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs hidden lg:table-cell">
                      {formatDate(c.createdAt)}
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
