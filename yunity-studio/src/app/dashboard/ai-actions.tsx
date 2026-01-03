'use server'

import OpenAI from 'openai'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function generateMealPlan() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // 1. Get user metrics from Supabase
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) return

// Update the prompt inside generateMealPlan()
const prompt = `
  Act as a professional nutritionist. 
  Create a 1-day meal plan for:
  - Daily Calorie Target: ${profile.daily_calories_target} kcal
  - Goal: ${profile.goal}
  
  Return ONLY a JSON object with this structure:
  {
    "meals": [
      { "name": "Breakfast", "food": "string", "calories": number, "macros": "C: 40g, P: 30g, F: 10g" }
    ],
    "total_macros": { "carbs": number, "protein": number, "fats": number },
    "nutrition_tip": "string"
  }
`

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // Fast and cheap for MVP
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  })

  const planData = JSON.parse(response.choices[0].message.content || '{}')

  // SAVE to database
  const { error } = await supabase.from('meal_plans').insert({
    user_id: user.id,
    name: `Meal Plan for ${new Date().toLocaleDateString()}`,
    plan: planData,
  })

  if (error) console.error("Error saving meal plan:", error.message)

  revalidatePath('/dashboard/nutrition')
  return planData

}
export async function generateWorkoutPlan() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  if (!profile || !profile.is_premium) throw new Error("PREMIUM_REQUIRED")

  const prompt = `
      Act as a World-Class Personal Trainer. 
      Design a comprehensive 7-day workout split for a user aiming to ${profile.goal}.
      
      Return ONLY a JSON object with this structure:
      {
        "split_name": "string",
        "days": [
          { 
            "day": "string", 
            "focus": "string", 
            "exercises": [
              { "name": "string", "sets": number, "reps": "string", "rest": "string", "tip": "string" }
            ] 
          }
        ]
      }
    `

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  })
  
  const workoutData = JSON.parse(response.choices[0].message.content || '{}')

  // 2. SAVE to the database
  const { error } = await supabase
    .from('workouts')
    .insert({
      user_id: user.id,
      name: `Workout for ${new Date().toLocaleDateString()}`,
      plan: workoutData, // Saving the full JSON object
    })

  if (error) {
    console.error("Error saving workout:", error.message)
    // We don't "throw" here so the user still gets their workout even if save fails
  }

  // 3. Refresh the history list on the page
  revalidatePath('/dashboard/fitness')

  // 4. IMPORTANT: Return the workoutData (the AI JSON), NOT the database row
  return workoutData
}
  
  export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const weight = formData.get('weight')
    const height = formData.get('height')
  
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
  
    await supabase
      .from('profiles')
      .update({ 
        weight_kg: Number(weight), 
        height_cm: Number(height) 
      })
      .eq('id', user.id)
  
    revalidatePath('/dashboard/account')
    revalidatePath('/dashboard/nutrition')
    revalidatePath('/dashboard/fitness')

  }