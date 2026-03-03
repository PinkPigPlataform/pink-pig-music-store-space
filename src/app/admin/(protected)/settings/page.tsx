import { AdminHeader } from '@/components/admin/header'
import { Settings } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div className="p-4 md:p-6 space-y-5">
      <AdminHeader title="Configurações" />
      <div className="bg-white rounded-xl border shadow-sm p-10 text-center">
        <Settings className="w-12 h-12 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">Configurações</p>
        <p className="text-gray-400 text-sm mt-1">Em breve</p>
      </div>
    </div>
  )
}
