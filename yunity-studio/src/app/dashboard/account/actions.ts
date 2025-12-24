'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

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
  
  // 3. CALORIE CALCULATION LOGIC (Mifflin-St Jeor)
  // Base BMR Calculation (Using a default age of 25 for the MVP)
  // Formula: (10 * weight) + (6.25 * height) - (5 * age) + 5
  let bmr = (10 * weight) + (6.25 * height) - (5 * 25) + 5;

  // Apply Activity Multiplier
  const multipliers: Record<string, number> = {
    'Sedentary': 1.2,
    'Lightly Active': 1.375,
    'Moderately Active': 1.55,
    'Very Active': 1.725
  }
  const tdee = bmr * (multipliers[activity] || 1.2);

  // Apply Goal Adjustment
  let targetCalories = Math.round(tdee);
  if (goal === 'Weight Loss') targetCalories -= 500;
  if (goal === 'Muscle Gain') targetCalories += 300;

  console.log("--- 📝 UPDATING PROFILE & CALORIES ---")
  console.log("New Weight:", weight, "New Goal:", goal);
  console.log("Calculated Target:", targetCalories);

  // 4. Perform the Combined Update
  const { data, error } = await supabase
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
  await supabase.from('weight_entries').insert({ 
    user_id: user.id, 
    weight: weight 
  })

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
