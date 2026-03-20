import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getTodayMealLog } from './nutrition-actions'
import NutritionClient from './NutritionClient'

export const dynamic = 'force-dynamic'

export default async function NutritionPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  const [profileRes, logRes, burnedRes] = await Promise.all([
    supabase.from('profiles').select('daily_calories_target, goal').eq('id', user.id).single(),
    getTodayMealLog(),
    supabase.from('workout_logs').select('calories_burned').eq('user_id', user.id).gte('created_at', today),
  ])

  if (!profileRes.data) redirect('/onboarding')

  const caloriesBurned = (burnedRes.data ?? [])
    .reduce((sum, log) => sum + (log.calories_burned ?? 0), 0)

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <NutritionClient
        logId={logRes?.id ?? ''}
        initialMeals={logRes?.meals ?? []}
        calorieTarget={profileRes.data.daily_calories_target ?? 2000}
        caloriesBurned={caloriesBurned}
      />
    </div>
  )
}
