import Link from 'next/link'
import { Utensils, Dumbbell, User } from 'lucide-react'
import { LogoutButton } from '@/components/LogoutButton'
import { createClient } from '@/utils/supabase/server'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const email = user?.email || ''
  const initials = email ? email.split('@')[0].substring(0, 2).toUpperCase() : '??'

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar — desktop only */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="border-b p-6">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Yunity Studio</h2>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/dashboard/nutrition"
            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900"
          >
            <Utensils size={18} className="group-hover:scale-110 transition-transform" />
            <span className="text-base">Nutrition</span>
          </Link>
          <Link
            href="/dashboard/fitness"
            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900"
          >
            <Dumbbell size={18} className="group-hover:scale-110 transition-transform" />
            <span className="text-base">Fitness</span>
          </Link>
        </nav>

        <div className="mt-auto border-t bg-slate-50/50 p-4">
          <div className="flex flex-col gap-1 w-full">
            <Link
              href="/dashboard/account"
              className="group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 font-medium text-slate-600 transition-all hover:border-slate-200 hover:bg-white hover:text-slate-900"
            >
              <div className="flex h-8 min-w-[32px] w-8 items-center justify-center rounded-md bg-slate-200 transition-colors group-hover:bg-slate-300">
                <span className="text-[11px] font-bold text-slate-700">{initials}</span>
              </div>
              <span className="text-base">Account Settings</span>
            </Link>
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 pb-24 md:p-8 md:pb-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom nav — mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-slate-200 bg-white">
        <Link
          href="/dashboard/nutrition"
          className="flex-1 flex flex-col items-center gap-1 py-3 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Utensils size={20} />
          <span className="text-[10px] font-semibold">Nutrition</span>
        </Link>
        <Link
          href="/dashboard/fitness"
          className="flex-1 flex flex-col items-center gap-1 py-3 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Dumbbell size={20} />
          <span className="text-[10px] font-semibold">Fitness</span>
        </Link>
        <Link
          href="/dashboard/account"
          className="flex-1 flex flex-col items-center gap-1 py-3 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <User size={20} />
          <span className="text-[10px] font-semibold">Account</span>
        </Link>
      </nav>
    </div>
  )
}
