'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type SetLog = {
  set_number: number
  reps: number | null
  weight: number | null
  completed: boolean
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

  let totalMinutes = 0

  for (const ex of exerciseLogs) {
    const completedSets = ex.sets.filter(s => s.completed).length
    if (completedSets === 0) continue

    // Compound: ~45s work + ~2min rest = ~2.75 min/set, MET ~6
    // Isolation: ~30s work + ~75s rest = ~2 min/set, MET ~4
    const isCompound = COMPOUND_PATTERN.test(ex.name)
    totalMinutes += completedSets * (isCompound ? 2.75 : 2.0)
  }

  if (totalMinutes === 0) return 0

  // Weighted average MET for a mixed resistance session ≈ 5.0
  const met = 5.0
  return Math.round(met * weightKg * (totalMinutes / 60))
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
}
