'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export type PR = {
  weight: number
  reps: number
  unit: string
  oneRM: number
}

export async function getWorkoutHistory(limit = 40) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: logs } = await supabase
    .from('workout_logs')
    .select('id, workout_id, day_index, day_name, exercise_logs, unit, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (!logs || logs.length === 0) return []

  const workoutIds = [...new Set(logs.map(l => l.workout_id))]
  const { data: workouts } = await supabase
    .from('workouts')
    .select('id, name, plan')
    .in('id', workoutIds)

  const workoutMap: Record<string, { name: string; plan: any }> = {}
  for (const w of (workouts ?? [])) {
    workoutMap[w.id] = { name: w.name, plan: w.plan }
  }

  return logs.map(log => ({
    ...log,
    workoutName: workoutMap[log.workout_id]?.name ?? 'Deleted Plan',
    dayFocus: workoutMap[log.workout_id]?.plan?.days?.[log.day_index]?.focus ?? log.day_name,
  }))
}

export async function getPersonalRecords(): Promise<Record<string, PR>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: logs } = await supabase
    .from('workout_logs')
    .select('exercise_logs, unit')
    .eq('user_id', user.id)

  if (!logs) return {}

  const prs: Record<string, PR> = {}
  for (const log of logs) {
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

  return prs
}

export async function getExercisePRs(exerciseNames: string[]): Promise<Record<string, PR>> {
  const allPRs = await getPersonalRecords()
  const result: Record<string, PR> = {}
  for (const name of exerciseNames) {
    const key = name.toLowerCase().trim()
    if (allPRs[key]) result[key] = allPRs[key]
  }
  return result
}

export type TodayExercise = {
  name: string
  target: string
  last: { weight: number; reps: number; unit: string; totalVolume: number } | null
  allTimePR: { weight: number; reps: number; oneRM: number } | null
  suggestWeight: number | null
}

export type TodayContext = {
  focus: string
  dayName: string
  isRest: boolean
  hasHistory: boolean
  exercises: TodayExercise[]
  totalVolumeLastSession: number
}

export async function getTodayPlanContext(planDays: any[], dayIndexOverride?: number): Promise<TodayContext | null> {
  if (!planDays?.length) return null

  let todayDay: any
  if (dayIndexOverride !== undefined && dayIndexOverride >= 0 && dayIndexOverride < planDays.length) {
    todayDay = planDays[dayIndexOverride]
  } else {
    const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const todayName = DAY_NAMES[new Date().getDay()]
    todayDay = planDays.find((d: any) => d.day === todayName)
  }
  if (!todayDay) return null

  if (!todayDay.exercises || todayDay.exercises.length === 0) {
    return { focus: todayDay.focus || 'Recovery', dayName: todayDay.day, isRest: true, hasHistory: false, exercises: [], totalVolumeLastSession: 0 }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: logs } = await supabase
    .from('workout_logs')
    .select('exercise_logs, unit, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(150)

  if (!logs) return null

  const exercises = todayDay.exercises.slice(0, 5)
  const result: TodayExercise[] = []
  let totalVolumeLastSession = 0

  for (const ex of exercises) {
    const normalized = ex.name.toLowerCase().trim()
    let lastSession: TodayExercise['last'] = null
    let allTimePR: TodayExercise['allTimePR'] = null

    for (const log of logs) {
      const found = (log.exercise_logs ?? []).find((e: any) => e.name?.toLowerCase().trim() === normalized)
      if (!found) continue

      const completedSets = (found.sets ?? []).filter((s: any) => s.completed && s.weight && s.reps)
      if (!completedSets.length) continue

      const bestSet = completedSets.sort((a: any, b: any) => b.weight - a.weight)[0]
      const vol = completedSets.reduce((s: number, set: any) => s + set.weight * set.reps, 0)

      if (!lastSession) {
        lastSession = { weight: bestSet.weight, reps: bestSet.reps, unit: log.unit, totalVolume: vol }
        totalVolumeLastSession += vol
      }

      // All-time PR (best 1RM across all logs)
      for (const set of completedSets) {
        const oneRM = set.weight * (1 + set.reps / 30)
        if (!allTimePR || oneRM > allTimePR.oneRM) {
          allTimePR = { weight: set.weight, reps: set.reps, oneRM: Math.round(oneRM * 10) / 10 }
        }
      }
    }

    // Progressive overload suggestion: +2.5kg
    const suggestWeight = lastSession ? Math.round((lastSession.weight + 2.5) * 2) / 2 : null

    result.push({ name: ex.name, target: `${ex.sets}×${ex.reps}`, last: lastSession, allTimePR, suggestWeight })
  }

  const hasHistory = result.some(e => e.last !== null)
  return { focus: todayDay.focus, dayName: todayDay.day, isRest: false, hasHistory, exercises: result, totalVolumeLastSession }
}

export async function getExerciseHistory(exerciseName: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: logs } = await supabase
    .from('workout_logs')
    .select('exercise_logs, unit, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(200)

  if (!logs) return []

  const normalized = exerciseName.toLowerCase().trim()
  const history: { date: string; maxWeight: number; maxOneRM: number; unit: string }[] = []

  for (const log of logs) {
    for (const ex of (log.exercise_logs ?? [])) {
      if (ex.name?.toLowerCase().trim() !== normalized) continue
      let maxWeight = 0
      let maxOneRM = 0
      for (const set of (ex.sets ?? [])) {
        if (!set.completed || !set.weight) continue
        const r = set.reps ?? 1
        const oneRM = set.weight * (1 + r / 30)
        if (set.weight > maxWeight) maxWeight = set.weight
        if (oneRM > maxOneRM) maxOneRM = oneRM
      }
      if (maxWeight > 0) {
        history.push({
          date: log.created_at.split('T')[0],
          maxWeight,
          maxOneRM: Math.round(maxOneRM * 10) / 10,
          unit: log.unit,
        })
      }
    }
  }

  return history
}

export async function resetWorkoutData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.from('workout_logs').delete().eq('user_id', user.id)
  await supabase.from('workouts').delete().eq('user_id', user.id)
}
