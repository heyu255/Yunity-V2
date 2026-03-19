import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import WorkoutGenerator from '@/components/WorkoutGenerator'
import { StartWorkoutPicker } from '@/components/StartWorkoutPicker'
import { Card, CardContent } from '@/components/ui/card'
import { History, ChevronRight, Calendar } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function FitnessPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  const isPremium = profile?.is_premium ?? false

  // Fetch all saved plans (need full plan data for StartWorkoutPicker)
  const { data: allWorkouts } = await supabase
    .from('workouts')
    .select('id, name, created_at, plan')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const latestWorkout = allWorkouts && allWorkouts.length > 0 ? allWorkouts[0].plan : null
  const latestWorkoutName = allWorkouts && allWorkouts.length > 0 ? allWorkouts[0].name : null
  // Older plans for the history list (skip first — it's shown inline)
  const olderWorkouts = allWorkouts && allWorkouts.length > 1 ? allWorkouts.slice(1) : []

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <header className="flex justify-between items-end border-b pb-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-slate-900">
            Fitness Dashboard
          </h1>
          <p className="text-slate-500 mt-2 text-base sm:text-lg">
            {isPremium ? 'Your custom 7-day performance strategy is ready.' : 'Upgrade to unlock custom AI workout plans.'}
          </p>
        </div>
        {isPremium && (
          <span className="rounded-full bg-slate-900 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-white">
            Premium Member
          </span>
        )}
      </header>

      {/* ── Active Plan ─────────────────────────────────── */}
      <section className="rounded-2xl border-2 border-slate-900 bg-white overflow-hidden">
        {/* Section header bar */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Active Plan</span>
          </div>
          {allWorkouts && allWorkouts.length > 0 && (
            <StartWorkoutPicker workouts={allWorkouts} />
          )}
        </div>
        {/* Generator */}
        <div className="p-6">
          <WorkoutGenerator isPremium={isPremium} goal={profile?.goal} initialPlan={latestWorkout} initialPlanName={latestWorkoutName} />
        </div>
      </section>

      {/* ── Past Plans ───────────────────────────────────── */}
      {olderWorkouts.length > 0 && (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 overflow-hidden">
          <div className="px-6 py-4 border-b border-dashed border-slate-300 flex items-center gap-2">
            <History size={16} className="text-slate-400" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Plan Archive</h2>
          </div>
          <div className="p-6 grid gap-3">
            {olderWorkouts.map((workout) => (
              <Link
                key={workout.id}
                href={`/dashboard/fitness/workout/${workout.id}`}
                className="group block"
              >
                <Card className="cursor-pointer bg-white border-slate-200 transition-all hover:border-slate-400 hover:shadow-sm">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-100 p-2 rounded-lg transition-colors group-hover:bg-slate-200">
                        <Calendar size={18} className="text-slate-400 group-hover:text-slate-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 transition-colors group-hover:text-slate-900">
                          {workout.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(workout.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-slate-400" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
