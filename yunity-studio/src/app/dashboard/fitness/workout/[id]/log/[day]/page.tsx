import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WorkoutLogger } from '@/components/WorkoutLogger'
import { getExercisePRs, getLastSessionForExercises } from '@/app/dashboard/fitness/fitness-actions'

interface Props {
  params: Promise<{ id: string; day: string }>
}

export default async function WorkoutLogPage({ params }: Props) {
  const { id, day } = await params
  const dayIndex = parseInt(day)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: workout, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !workout) notFound()

  const workoutPlan = workout.plan
  const dayData = workoutPlan.days?.[dayIndex]

  if (!dayData) notFound()

  // Recovery days have nothing to log
  if (!dayData.exercises || dayData.exercises.length === 0) {
    redirect(`/dashboard/fitness/workout/${id}`)
  }

  const exerciseNames = dayData.exercises.map((ex: any) => ex.name)
  const [previousBests, lastSessions] = await Promise.all([
    getExercisePRs(exerciseNames),
    getLastSessionForExercises(exerciseNames),
  ])

  // All exercises from the plan across all days (for the add-exercise dropdown)
  const allPlanExercises: { name: string; sets: number; reps: string; rest: string }[] =
    (workoutPlan.days ?? []).flatMap((d: any) => d.exercises ?? [])

  // Dedupe by name, exclude exercises already in today's session
  const todayNames = new Set(dayData.exercises.map((e: any) => e.name.toLowerCase()))
  const seen = new Set<string>()
  const availableExercises = allPlanExercises.filter(ex => {
    const key = ex.name.toLowerCase()
    if (todayNames.has(key) || seen.has(key)) return false
    seen.add(key)
    return true
  })

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20 px-4">
      <Link href="/dashboard/fitness">
        <Button variant="ghost" className="gap-2 pl-0 text-slate-500 hover:text-slate-900">
          <ChevronLeft size={16} /> Back to Dashboard
        </Button>
      </Link>

      <header className="space-y-1">
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          {workoutPlan.split_name} · {dayData.day}
        </p>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{dayData.focus}</h1>
        <p className="text-slate-500">{dayData.exercises.length} exercises · Log your sets below</p>
      </header>

      <WorkoutLogger
        workoutId={id}
        dayIndex={dayIndex}
        dayName={dayData.day}
        exercises={dayData.exercises}
        previousBests={previousBests}
        lastSessions={lastSessions}
        availableExercises={availableExercises}
      />
    </div>
  )
}
