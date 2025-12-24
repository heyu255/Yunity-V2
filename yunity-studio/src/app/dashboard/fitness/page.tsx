import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import WorkoutGenerator from '@/components/WorkoutGenerator'

export default async function FitnessPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').single()
  
  // If you manually flip is_premium to true in Supabase right now, 
  // this page will unlock immediately.
  const isPremium = profile?.is_premium ?? false

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">AI Personal Trainer</h1>
          <p className="text-slate-500">Premium 7-Day Performance Strategy</p>
        </div>
        {isPremium && (
          <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Premium Member
          </span>
        )}
      </header>

      <WorkoutGenerator isPremium={isPremium} goal={profile?.goal} />
    </div>
  )
}