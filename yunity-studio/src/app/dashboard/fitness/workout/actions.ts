'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { estimateCaloriesBurned, type SetLog, type ExerciseLog } from '@/lib/calorie-utils'

export type { SetLog, ExerciseLog }

export async function logWorkout(
  workoutId: string | null,
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
    workout_id: workoutId ?? null,
    day_index: dayIndex >= 0 ? dayIndex : null,
    day_name: dayName,
    exercise_logs: exerciseLogs,
    unit,
    calories_burned: caloriesBurned,
  })

  if (error) throw new Error(error.message)

  if (workoutId) revalidatePath(`/dashboard/fitness/workout/${workoutId}`)
  revalidatePath('/dashboard/fitness')
}
