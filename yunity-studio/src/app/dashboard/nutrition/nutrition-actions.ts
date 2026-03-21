'use server'

import OpenAI from 'openai'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export type MealEntry = {
  id: string
  name: string    // "Breakfast", "Lunch", etc.
  food: string    // free-text description
  calories: number
  protein: number
  carbs: number
  fats: number
}

export type MealIdea = {
  food: string
  calories: number
  protein: number
  carbs: number
  fats: number
}

export type PastLog = {
  id: string
  date: string
  meals: MealEntry[]
}

export type FrequentMeal = MealEntry & { count: number }

export async function getTodayMealLog(date?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = date ?? new Date().toISOString().split('T')[0]

  const { data: existing } = await supabase
    .from('meal_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  if (existing) return existing

  const { data: created } = await supabase
    .from('meal_logs')
    .insert({ user_id: user.id, date: today, meals: [] })
    .select()
    .single()

  if (created) return created

  // Insert may have lost a race (unique constraint). Re-fetch the winner.
  const { data: refetched } = await supabase
    .from('meal_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  return refetched
}

export async function getPastMealLogs(limit = 30, date?: string): Promise<PastLog[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const today = date ?? new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('meal_logs')
    .select('id, date, meals')
    .eq('user_id', user.id)
    .lt('date', today)
    .order('date', { ascending: false })
    .limit(limit)

  return (data ?? []) as PastLog[]
}

export async function saveMealLog(logId: string, meals: MealEntry[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  if (!logId) throw new Error('No meal log ID — cannot save')

  const { data, error } = await supabase
    .from('meal_logs')
    .update({ meals })
    .eq('id', logId)
    .eq('user_id', user.id)
    .select('id')

  if (error) throw new Error(error.message)
  if (!data || data.length === 0) throw new Error('Meal log not saved — RLS UPDATE policy may be missing on meal_logs')

  revalidatePath('/dashboard/nutrition')
}

export async function estimateNutrition(foodDescription: string): Promise<{ calories: number; protein: number; carbs: number; fats: number } | null> {
  const prompt = `You are a nutritionist. Estimate the nutritional content of this food/meal:
"${foodDescription}"

Be realistic and accurate based on typical portion sizes.
Return ONLY a JSON object:
{ "calories": number, "protein": number, "carbs": number, "fats": number }`

  const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const response = await openaiClient.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  const data = JSON.parse(response.choices[0].message.content || '{}')
  if (!data.calories) return null
  return {
    calories: Math.round(data.calories),
    protein: Math.round(data.protein),
    carbs: Math.round(data.carbs),
    fats: Math.round(data.fats),
  }
}

export async function generateMealIdea(mealType: string, preferences: string): Promise<MealIdea[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('daily_calories_target, goal')
    .eq('id', user.id)
    .single()

  const target = profile?.daily_calories_target ?? 2000
  const mealCalories = Math.round(
    mealType === 'Breakfast' ? target * 0.25
    : mealType === 'Lunch' ? target * 0.35
    : mealType === 'Dinner' ? target * 0.30
    : target * 0.10 // snack
  )

  const prompt = `You are a nutritionist. Generate 3 ${mealType} meal ideas for someone with:
- Daily calorie target: ${target} kcal
- Goal: ${profile?.goal ?? 'maintain'}
- Target ~${mealCalories} kcal for this ${mealType}
${preferences ? `- Preferences: ${preferences}` : ''}

Return ONLY a JSON object:
{
  "ideas": [
    { "food": "string (name + short description)", "calories": number, "protein": number, "carbs": number, "fats": number }
  ]
}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  const data = JSON.parse(response.choices[0].message.content || '{}')
  return data.ideas ?? []
}
