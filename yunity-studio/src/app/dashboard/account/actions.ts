'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateNutritionGoals(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const dailyCalories = Math.max(500, Number(formData.get('daily_calories_target')) || 2000)
  const proteinTarget = Math.max(0, Number(formData.get('protein_target')) || 0)
  const carbsTarget = Math.max(0, Number(formData.get('carbs_target')) || 0)
  const fatsTarget = Math.max(0, Number(formData.get('fats_target')) || 0)

  await supabase
    .from('profiles')
    .update({
      daily_calories_target: dailyCalories,
      protein_target: proteinTarget || null,
      carbs_target: carbsTarget || null,
      fats_target: fatsTarget || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  revalidatePath('/dashboard/account')
  revalidatePath('/dashboard/nutrition')
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  // 1. Identify the User
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // 2. Extract and Convert Values
  const weight = Number(formData.get('weight_kg'))
  const height = Number(formData.get('height_cm'))
  const activity = formData.get('activity_level') as string
  const goal = formData.get('goal') as string

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('weight_kg')
    .eq('id', user.id)
    .single()
  
  // 3. CALORIE CALCULATION LOGIC (Mifflin-St Jeor)
  // Base BMR Calculation (Using a default age of 25 for the MVP)
  // Formula: (10 * weight) + (6.25 * height) - (5 * age) + 5
  const bmr = (10 * weight) + (6.25 * height) - (5 * 25) + 5;

  // Apply Activity Multiplier
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725
  }
  const tdee = bmr * (multipliers[activity] || 1.2);

  // Apply Goal Adjustment
  let targetCalories = Math.round(tdee);
  if (goal === 'lose') targetCalories -= 500;
  if (goal === 'gain') targetCalories += 300;

  console.log("--- 📝 UPDATING PROFILE & CALORIES ---")
  console.log("New Weight:", weight, "New Goal:", goal);
  console.log("Calculated Target:", targetCalories);

  // 4. Perform the Combined Update
  const { error } = await supabase
    .from('profiles')
    .update({ 
      weight_kg: weight, 
      height_cm: height,
      activity_level: activity,
      goal: goal,
      daily_calories_target: targetCalories, // THE MISSING PIECE
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()

  // 5. Save Weight Entry to History (for your progress chart)
  const previousWeight = Number(currentProfile?.weight_kg)
  if (Number.isFinite(weight) && Math.abs(weight - previousWeight) >= 0.01) {
    await supabase.from('weight_entries').insert({
      user_id: user.id,
      weight: weight
    })
  }

  // 6. Refresh ALL relevant UI paths
  if (!error) {
    revalidatePath('/dashboard/account')
    revalidatePath('/dashboard/nutrition')
    revalidatePath('/dashboard/fitness')
    console.log("✅ Profile and Calories Synced Successfully")
  } else {
    console.log("❌ Update Failed:", error.message)
  }
}
