'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  // 1. Identify the User
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.log("❌ Update Failed: No authenticated user found.")
    return
  }

  // 2. Extract values from Form (Mapping HTML names to Variables)
  const weight = formData.get('weight_kg')
  const height = formData.get('height_cm')
  const activity = formData.get('activity_level')
  const goal = formData.get('goal')

  console.log("--- 📝 FORM SUBMISSION ---")
  console.log("Targeting User ID:", user.id)
  console.log("Data to Save:", { weight, height, activity, goal })

  // 3. Perform the Update
  // .update() only works if a row with this 'id' already exists
  const { data, error } = await supabase
    .from('profiles')
    .update({ 
      weight_kg: weight ? Number(weight) : null, 
      height_cm: height ? Number(height) : null,
      activity_level: activity as string,
      goal: goal as string,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id) // This is the 'Where' clause
    .select()

  // 4. Handle Results
  if (error) {
    console.log("❌ SUPABASE ERROR:", error.message)
    return
  }

  if (data && data.length === 0) {
    console.log("⚠️ WARNING: Update successful but 0 rows changed. (Does the profile row exist?)")
  } else {
    console.log("✅ DATABASE UPDATED:", data)
  }

  // 5. Refresh the UI
  revalidatePath('/dashboard/account')
}