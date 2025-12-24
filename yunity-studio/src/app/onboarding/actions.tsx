'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const age = Number(formData.get('age'))
  const weight = Number(formData.get('weight'))
  const height = Number(formData.get('height'))
  const gender = formData.get('gender') as 'male' | 'female'
  const activityLevel = formData.get('activityLevel') as string
  const goal = formData.get('goal') as string

  // 1. Calculate BMR (Mifflin-St Jeor Equation)
  let bmr = (10 * weight) + (6.25 * height) - (5 * age)
  bmr = gender === 'male' ? bmr + 5 : bmr - 161

  // 2. Activity Multipliers
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
  }
  let calories = Math.round(bmr * (multipliers[activityLevel] || 1.2))

  // 3. Goal Adjustment
  if (goal === 'lose') calories -= 500
  if (goal === 'gain') calories += 500

  // 4. Save to the 'profiles' table we just created
  const { error } = await supabase
    .from('profiles')
    .insert([{
      id: user.id,
      age,
      weight_kg: weight,
      height_cm: height,
      gender,
      activity_level: activityLevel,
      goal,
      daily_calories_target: calories,
    }])

  if (error) {
    console.error('Onboarding Error:', error.message)
    redirect('/error')
  }

  // Once finished, send them to the dashboard to see their stats
  redirect('/dashboard/nutrition')
}