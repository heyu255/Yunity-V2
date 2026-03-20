'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type SetLog = {
  set_number: number
  reps: number | null
  weight: number | null
  completed: boolean
  duration_min?: number | null
  distance?: number | null
}

export type ExerciseLog = {
  name: string
  sets: SetLog[]
}

/**
 * Estimates calories burned during a resistance training session.
 * Uses the MET (Metabolic Equivalent of Task) formula:
 *   Calories = MET × weight_kg × duration_hours
 *
 * Duration is estimated from completed sets × avg minutes per set
 * (active work time + rest), which varies by exercise type.
 * Compound lifts get a higher MET and longer assumed rest.
 */
function estimateCaloriesBurned(exerciseLogs: ExerciseLog[], weightKg: number): number {
  const COMPOUND_PATTERN = /squat|deadlift|bench|row|pull.?up|chin.?up|overhead press|ohp|lunge|hip thrust|leg press|dip|clean|snatch|press/i
  const CARDIO_PATTERN = /jog|run|walk|cycl|bik|swim|jump rope|skip|elliptical|stair|treadmill|cardio|hiit|sprint/i

  let totalCalories = 0

  for (const ex of exerciseLogs) {
    const completedSets = ex.sets.filter(s => s.completed)
    if (completedSets.length === 0) continue

    const name = ex.name.toLowerCase()

    if (CARDIO_PATTERN.test(name)) {
      // Use actual logged duration; fall back to 20 min if not entered
      const totalDurationMin = completedSets.reduce((sum, s) => sum + (s.duration_min ?? 20), 0)
      let cardioMET = 7.5
      if (/walk/.test(name)) cardioMET = 3.5
      else if (/cycl|bik/.test(name)) cardioMET = 6.0
      else if (/swim/.test(name)) cardioMET = 6.0
      else if (/hiit|sprint/.test(name)) cardioMET = 9.0
      totalCalories += Math.round(cardioMET * weightKg * (totalDurationMin / 60))
    } else {
      const isCompound = COMPOUND_PATTERN.test(name)
      const totalMinutes = completedSets.length * (isCompound ? 2.75 : 2.0)
      totalCalories += Math.round(5.0 * weightKg * (totalMinutes / 60))
    }
  }

  return totalCalories
}

export async function logWorkout(
  workoutId: string,
  dayIndex: number,
  dayName: string,
  exerciseLogs: ExerciseLog[],
  unit: 'kg' | 'lbs'
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user weight for calorie estimate (fallback to 70kg if not set)
  const { data: profile } = await supabase
    .from('profiles')
    .select('weight_kg')
    .eq('id', user.id)
    .single()

  const weightKg = profile?.weight_kg ?? 70

  // Convert lbs weights to kg for the calorie calculation if needed
  const logsInKg: ExerciseLog[] = unit === 'lbs'
    ? exerciseLogs.map(ex => ({
        ...ex,
        sets: ex.sets.map(s => ({ ...s, weight: s.weight ? s.weight * 0.453592 : s.weight }))
      }))
    : exerciseLogs

  const caloriesBurned = estimateCaloriesBurned(logsInKg, weightKg)

  const { error } = await supabase.from('workout_logs').insert({
    user_id: user.id,
    workout_id: workoutId,
    day_index: dayIndex,
    day_name: dayName,
    exercise_logs: exerciseLogs,
    unit,
    calories_burned: caloriesBurned,
  })

  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/fitness/workout/${workoutId}`)
  revalidatePath('/dashboard/fitness')
}
