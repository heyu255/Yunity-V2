'use server'

import OpenAI from 'openai'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getTrialStatus } from '@/utils/trial'

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
export async function generateWorkoutPlan(notes?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  const { isOnTrial } = getTrialStatus(user.created_at)
  if (!profile || (!profile.is_premium && !isOnTrial)) throw new Error("PREMIUM_REQUIRED")

  // ── Fetch training history context ──────────────────────
  const [{ data: recentLogs }, { data: previousPlans }] = await Promise.all([
    supabase
      .from('workout_logs')
      .select('exercise_logs, unit, day_name, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30),
    supabase
      .from('workouts')
      .select('name, plan, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(2),
  ])

  // Build PR summary: exercise → best weight × reps (estimated 1RM)
  const prs: Record<string, { weight: number; reps: number; unit: string; oneRM: number }> = {}
  for (const log of (recentLogs ?? [])) {
    for (const ex of (log.exercise_logs ?? [])) {
      const key = ex.name?.toLowerCase().trim()
      if (!key) continue
      for (const set of (ex.sets ?? [])) {
        if (!set.completed || !set.weight || !set.reps) continue
        const oneRM = set.weight * (1 + set.reps / 30)
        if (!prs[key] || oneRM > prs[key].oneRM) {
          prs[key] = { weight: set.weight, reps: set.reps, unit: log.unit, oneRM }
        }
      }
    }
  }

  // Recent session summary (last 8 sessions — day focus + top exercise weights)
  const recentSessions = (recentLogs ?? []).slice(0, 8).map(log => {
    const topSets = (log.exercise_logs ?? []).slice(0, 4).map((ex: any) => {
      const best = (ex.sets ?? [])
        .filter((s: any) => s.completed && s.weight && s.reps)
        .sort((a: any, b: any) => b.weight - a.weight)[0]
      return best ? `${ex.name}: ${best.weight}${log.unit}×${best.reps}` : ex.name
    })
    return `${log.day_name} (${new Date(log.created_at).toLocaleDateString()}): ${topSets.join(', ')}`
  })

  const previousPlanNames = (previousPlans ?? []).map(p => p.name).join(', ')
  const previousSplitName = previousPlans?.[0]?.plan?.split_name ?? null
  const previousExercises = previousPlans?.[0]?.plan?.days
    ?.flatMap((d: any) => d.exercises?.map((e: any) => e.name) ?? [])
    ?.join(', ') ?? null

  const hasPRs = Object.keys(prs).length > 0
  const hasHistory = recentSessions.length > 0

  const contextBlock = (hasPRs || hasHistory) ? `
--- USER TRAINING HISTORY ---
${hasHistory ? `Recent sessions (most recent first):
${recentSessions.join('\n')}` : ''}

${hasPRs ? `Personal records (estimated 1RM in brackets):
${Object.entries(prs).map(([name, pr]) => `- ${name}: ${pr.weight}${pr.unit} × ${pr.reps} reps (~${Math.round(pr.oneRM)}${pr.unit} 1RM)`).join('\n')}` : ''}

${previousSplitName ? `Previous plan: "${previousSplitName}" — exercises: ${previousExercises}` : ''}
${previousPlanNames ? `Plan history: ${previousPlanNames}` : ''}

IMPORTANT: Use this data to:
1. Progress the weights/reps beyond the user's current PRs (apply progressive overload).
2. Vary the exercise selection from previous plans to prevent adaptation.
3. Keep the same muscle group structure unless notes say otherwise.
4. Reference their actual performance in the coaching tips (e.g. "You hit 80kg last week — aim for 82.5kg").
--- END HISTORY ---
` : ''

  const prompt = `
Act as a World-Class Personal Trainer.
Design a comprehensive 7-day workout split for a user aiming to ${profile.goal}.
${profile.weight_kg ? `User weight: ${profile.weight_kg}kg.` : ''}
${profile.height_cm ? `User height: ${profile.height_cm}cm.` : ''}
${notes ? `\nImportant personal notes from the user: ${notes}\nTake these into account when selecting exercises, intensity, and structure.` : ''}
${contextBlock}

Return ONLY a JSON object with this structure:
{
  "split_name": "string",
  "days": [
    {
      "day": "string",
      "focus": "string",
      "exercises": [
        { "name": "string", "sets": number, "reps": "string", "rest": "string", "tip": "string", "type": "strength|cardio|timed|bodyweight" }
      ]
    }
  ]
}

For the "type" field:
- "strength": weighted exercises logged with weight + reps (e.g. bench press, squat, deadlift, rows)
- "cardio": logged with duration + distance (e.g. running, cycling, rowing, HIIT, jump rope)
- "timed": static holds logged with duration in seconds (e.g. plank, wall sit, dead hang)
- "bodyweight": logged with reps only, no weight (e.g. push-ups, pull-ups, burpees, crunches)
`

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  })

  const workoutData = JSON.parse(response.choices[0].message.content || '{}')
  return workoutData
}

export async function refineDayPlan(workoutId: string, dayIndex: number, instructions: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: workout } = await supabase
    .from('workouts')
    .select('plan')
    .eq('id', workoutId)
    .eq('user_id', user.id)
    .single()
  if (!workout?.plan) return null

  const currentDay = workout.plan.days[dayIndex]
  if (!currentDay) return null

  const prompt = `You are a personal trainer. The user has this workout day:

Day: ${currentDay.day}
Focus: ${currentDay.focus}
Exercises:
${(currentDay.exercises ?? []).map((ex: any) => `- ${ex.name}: ${ex.sets} sets × ${ex.reps}, rest ${ex.rest}. Tip: ${ex.tip ?? ''}`).join('\n')}

The user wants to change this day with these instructions:
"${instructions}"

Apply their request (swap/remove/add exercises as asked) and return ONLY a JSON object:
{
  "day": "${currentDay.day}",
  "focus": "string",
  "exercises": [
    { "name": "string", "sets": number, "reps": "string", "rest": "string", "tip": "string", "type": "strength|cardio|timed|bodyweight" }
  ]
}

For "type": strength=weight+reps, cardio=duration+distance, timed=hold duration in seconds, bodyweight=reps only.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  const updatedDay = JSON.parse(response.choices[0].message.content || '{}')
  const updatedDays = [...workout.plan.days]
  updatedDays[dayIndex] = updatedDay

  const { error: refineUpdateError } = await supabase
    .from('workouts')
    .update({ plan: { ...workout.plan, days: updatedDays } })
    .eq('id', workoutId)
    .eq('user_id', user.id)

  if (refineUpdateError) throw new Error(refineUpdateError.message)

  revalidatePath('/dashboard/fitness')
  revalidatePath(`/dashboard/fitness/workout/${workoutId}`)
  return updatedDay
}

export async function removeDayFromPlan(workoutId: string, dayIndex: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: workout } = await supabase
    .from('workouts').select('plan').eq('id', workoutId).eq('user_id', user.id).single()
  if (!workout?.plan) return

  const updatedDays = workout.plan.days.filter((_: any, i: number) => i !== dayIndex)
  await supabase
    .from('workouts')
    .update({ plan: { ...workout.plan, days: updatedDays } })
    .eq('id', workoutId).eq('user_id', user.id)

  revalidatePath('/dashboard/fitness')
  revalidatePath(`/dashboard/fitness/workout/${workoutId}`)
}

export async function addDayToPlan(workoutId: string, focus: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: workout } = await supabase
    .from('workouts').select('plan').eq('id', workoutId).eq('user_id', user.id).single()
  if (!workout?.plan) return null

  const dayNumber = workout.plan.days.length + 1

  const prompt = `You are a personal trainer. Generate a single workout day with focus: "${focus}".
Return ONLY a JSON object:
{
  "day": "Day ${dayNumber}",
  "focus": "${focus}",
  "exercises": [
    { "name": "string", "sets": number, "reps": "string", "rest": "string", "tip": "string", "type": "strength|cardio|timed|bodyweight" }
  ]
}

For "type": strength=weight+reps, cardio=duration+distance, timed=hold duration in seconds, bodyweight=reps only.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  const newDay = JSON.parse(response.choices[0].message.content || '{}')
  const updatedDays = [...workout.plan.days, newDay]

  await supabase
    .from('workouts')
    .update({ plan: { ...workout.plan, days: updatedDays } })
    .eq('id', workoutId).eq('user_id', user.id)

  revalidatePath('/dashboard/fitness')
  revalidatePath(`/dashboard/fitness/workout/${workoutId}`)
  return newDay
}

export async function updateWorkoutDay(workoutId: string, dayIndex: number, exercises: any[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: workout, error: fetchError } = await supabase
    .from('workouts')
    .select('plan')
    .eq('id', workoutId)
    .eq('user_id', user.id)
    .single()
  if (fetchError || !workout?.plan) return null

  const updatedDays = [...workout.plan.days]
  updatedDays[dayIndex] = { ...updatedDays[dayIndex], exercises }

  const { data: updatedRows, error: updateError } = await supabase
    .from('workouts')
    .update({ plan: { ...workout.plan, days: updatedDays } })
    .eq('id', workoutId)
    .eq('user_id', user.id)
    .select('id')

  if (updateError) {
    console.error('updateWorkoutDay error:', updateError.message)
    throw new Error(updateError.message)
  }
  if (!updatedRows || updatedRows.length === 0) {
    throw new Error('No rows updated — check Supabase RLS UPDATE policy for workouts table')
  }

  revalidatePath('/dashboard/fitness')
  revalidatePath(`/dashboard/fitness/workout/${workoutId}`)
  return updatedDays[dayIndex]
}

export async function saveWorkoutPlan(name: string, plan: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase.from('workouts').insert({
    user_id: user.id,
    name: name.trim() || 'My Workout Plan',
    plan,
  })

  if (error) console.error('Error saving workout:', error.message)

  revalidatePath('/dashboard/fitness')
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