import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getTodayMealLog, getPastMealLogs, type MealEntry, type FrequentMeal } from './nutrition-actions'
import NutritionClient from './NutritionClient'

export const dynamic = 'force-dynamic'

export default async function NutritionPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  const [profileRes, logRes, burnedRes, pastLogs] = await Promise.all([
    supabase.from('profiles').select('daily_calories_target, goal, protein_target, carbs_target, fats_target').eq('id', user.id).single(),
    getTodayMealLog(),
    supabase.from('workout_logs').select('calories_burned').eq('user_id', user.id).gte('created_at', today),
    getPastMealLogs(30),
  ])

  if (!profileRes.data) redirect('/onboarding')

  const caloriesBurned = (burnedRes.data ?? [])
    .reduce((sum, log) => sum + (log.calories_burned ?? 0), 0)

  // Compute top 10 frequent meals from past logs
  const counts = new Map<string, { meal: MealEntry; count: number }>()
  for (const log of pastLogs) {
    for (const meal of (log.meals as MealEntry[])) {
      const key = meal.food.toLowerCase().trim()
      const existing = counts.get(key)
      if (existing) existing.count++
      else counts.set(key, { meal, count: 1 })
    }
  }
  const frequentMeals: FrequentMeal[] = [...counts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map(({ meal, count }) => ({ ...meal, count }))

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <NutritionClient
        logId={logRes?.id ?? ''}
        initialMeals={logRes?.meals ?? []}
        calorieTarget={profileRes.data.daily_calories_target ?? 2000}
        caloriesBurned={caloriesBurned}
        proteinTarget={profileRes.data.protein_target ?? undefined}
        carbsTarget={profileRes.data.carbs_target ?? undefined}
        fatsTarget={profileRes.data.fats_target ?? undefined}
        pastLogs={pastLogs}
        frequentMeals={frequentMeals}
      />
    </div>
  )
}
