import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import MealPlanGenerator from '@/components/MealPlanGenerator'

export default async function NutritionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').single()
  if (!profile) redirect('/onboarding')

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Your personalized AI nutrition planner</h1>
        <p className="text-slate-500">
          Smart macros to hit your {profile.daily_calories_target} kcal target.
        </p>
      </header>

      <MealPlanGenerator calories={profile.daily_calories_target} />
    </div>
  )
}