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

  const plan = JSON.parse(response.choices[0].message.content || '{}')

  // 3. (Optional for now) You could save this to a 'meal_plans' table. 
  // For the MVP, we will just return it to the UI.
  return plan

}
export async function generateWorkoutPlan() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
  
    const { data: profile } = await supabase.from('profiles').select('*').single()
    if (!profile || !profile.is_premium) throw new Error("PREMIUM_REQUIRED")
  
    const prompt = `
      Act as a World-Class Personal Trainer. 
      Design a comprehensive 7-day workout split for a user aiming to ${profile.goal}.
      
      Return ONLY a JSON object with this structure:
      {
        "split_name": "string (e.g. PPL, Upper/Lower)",
        "days": [
          { 
            "day": "Monday", 
            "focus": "Target Muscle Groups", 
            "exercises": [
              { "name": "Exercise Name", "sets": 3, "reps": "10-12", "rest": "60s", "tip": "Form cue" }
            ] 
          },
          ... (include all 7 days, use empty exercises array for Rest Days)
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
    const { data: savedWorkout, error } = await supabase
    .from('workouts')
    .insert({
      user_id: user.id,
      name: `Workout for ${new Date().toLocaleDateString()}`,
      plan: workoutData,
    })
    .select()
    .single();

  if (error) console.error("Error saving workout:", error.message);
  return savedWorkout;

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
  }