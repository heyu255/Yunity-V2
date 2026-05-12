'use server' // Server action entrypoint for onboarding submissions.

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { calculateBMR, calculateDailyCalories } from '@/lib/bmr-utils'

// Handles onboarding form submissions and writes the initial profile.
export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser() // Auth gate

  if (!user) redirect('/login')

  const age = Number(formData.get('age'))
  const weight = Number(formData.get('weight'))
  const height = Number(formData.get('height'))
  const gender = formData.get('gender') as 'male' | 'female'
  const activityLevel = formData.get('activityLevel') as string
  const goal = formData.get('goal') as string

  if (!age || !weight || !height || isNaN(age) || isNaN(weight) || isNaN(height)) {
    redirect('/error')
  }

  // 1–3. Calculate TDEE with goal adjustment (Mifflin-St Jeor)
  const bmr = calculateBMR(weight, height, age, gender)
  const calories = calculateDailyCalories(bmr, activityLevel, goal)

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

  await supabase.from('weight_entries').insert({
    user_id: user.id,
    weight,
  })

  // Once finished, send them to the dashboard to see their stats
  redirect('/dashboard/nutrition')
}