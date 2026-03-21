import Link from 'next/link'
import { Dumbbell } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { SidebarNav, BottomNav } from '@/components/NavLinks'
import { TrialBanner } from '@/components/TrialBanner'
import { getTrialStatus } from '@/utils/trial'
import { DateCookieSetter } from '@/components/DateCookieSetter'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const email = user?.email || ''
  const initials = email ? email.split('@')[0].substring(0, 2).toUpperCase() : '??'

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium')
    .eq('id', user!.id)
    .single()

  const isPremium = profile?.is_premium ?? false
  const { isOnTrial, daysLeft } = getTrialStatus(user!.created_at)
  const showTrialBanner = !isPremium && isOnTrial

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar — desktop only */}
      <aside className="sticky top-0 hidden h-screen w-60 flex-col border-r border-slate-200 bg-white md:flex">
        <Link href="/dashboard/fitness" className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-5 hover:opacity-80 transition-opacity">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
            <Dumbbell size={16} className="text-emerald-400" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">Yunity</span>
        </Link>

        <SidebarNav initials={initials} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {showTrialBanner && <TrialBanner daysLeft={daysLeft} />}
        <div className="flex-1 p-4 pb-24 md:p-8 md:pb-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Bottom nav — mobile only */}
      <BottomNav />
      <DateCookieSetter />
    </div>
  )
}
