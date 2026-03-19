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

  const { error } = await supabase.from('workout_logs').insert({
    user_id: user.id,
    workout_id: workoutId,
    day_index: dayIndex,
    day_name: dayName,
    exercise_logs: exerciseLogs,
    unit,
  })

  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/fitness/workout/${workoutId}`)
}
