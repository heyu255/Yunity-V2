import Link from 'next/link'
import { Utensils, Dumbbell, LogOut } from 'lucide-react'
import { LogoutButton } from '@/components/LogoutButton'
import { createClient } from '@/utils/supabase/server'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Fetch user data server-side for the initials
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const email = user?.email || ''

  // Helper to get initials (e.g., "john@gmail.com" -> "JO")
  const initials = email ? email.split('@')[0].substring(0, 2).toUpperCase() : '??'

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white hidden md:flex flex-col sticky top-0 h-screen">
        {/* Logo Section */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-black text-blue-600 tracking-tighter italic">YUNITY STUDIO</h2>
        </div>

        {/* Primary Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <Link 
            href="/dashboard/nutrition" 
            className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all font-semibold group"
          >
            <Utensils size={18} className="group-hover:scale-110 transition-transform" /> 
            <span className="text-sm">AI Nutrition</span>
          </Link>
          <Link 
            href="/dashboard/fitness" 
            className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all font-semibold group"
          >
            <Dumbbell size={18} className="group-hover:scale-110 transition-transform" /> 
            <span className="text-sm">AI Fitness Trainer</span>
          </Link>
        </nav>

        {/* User & Settings Section (Aligned Bottom) */}
        <div className="p-4 mt-auto border-t bg-slate-50/50">
          <div className="flex flex-col gap-1 w-full">
            
            {/* Account Link with Initials */}
            <Link 
              href="/dashboard/account" 
              className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg transition-all font-medium group border border-transparent hover:border-slate-200"
            >
              <div className="flex items-center justify-center w-8 h-8 min-w-[32px] rounded-md bg-slate-200 group-hover:bg-blue-100 transition-colors">
                 <span className="text-[11px] font-bold text-slate-600 group-hover:text-blue-600">
                    {initials}
                 </span>
              </div>
              <span className="text-sm">Account Settings</span>
            </Link>
            
            {/* Logout Button */}
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}