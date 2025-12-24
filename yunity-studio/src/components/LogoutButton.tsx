'use client'

import { logout } from '@/app/login/actions'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  return (
    <button
      onClick={async () => await logout()}
      className="flex items-center gap-3 px-3 py-2.5 w-full text-slate-600 hover:text-red-600 hover:bg-red-50/50 rounded-lg transition-all font-medium group border border-transparent hover:border-red-100 text-left"
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-slate-100 group-hover:bg-red-100 transition-colors">
        <LogOut size={18} className="group-hover:text-red-600 text-slate-500" />
      </div>
      <span className="text-sm">Log Out</span>
    </button>
  )
}