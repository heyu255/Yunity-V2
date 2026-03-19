import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Dumbbell, Clock, ListChecks, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface WorkoutPageProps {
  params: Promise<{ id: string }>
}

export default async function WorkoutDetailPage({ params }: WorkoutPageProps) {
  const { id } = await params
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

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 px-4">
      <Link href="/dashboard/fitness">
        <Button variant="ghost" className="gap-2 pl-0 text-slate-500 hover:text-slate-900">
          <ChevronLeft size={16} /> Back to Trainer
        </Button>
      </Link>

      <header className="space-y-2">
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {workout.name}
        </h1>
        <p className="text-slate-500 font-medium">
          {workoutPlan.split_name} · Created {new Date(workout.created_at).toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </header>

      <div className="space-y-12">
        {workoutPlan.days ? (
          workoutPlan.days.map((day: any, dayIdx: number) => (
            <section key={dayIdx} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-8 w-1 rounded-full bg-slate-700" />
                <h2 className="text-2xl font-bold text-slate-900">{day.day}</h2>
                <span className="text-slate-400 font-medium">— {day.focus}</span>
              </div>

              <div className="grid gap-4">
                {day.exercises && day.exercises.length > 0 ? (
                  day.exercises.map((ex: any, exIdx: number) => (
                    <Card key={exIdx} className="overflow-hidden border-slate-200 shadow-sm transition-colors hover:border-slate-300">
                      <CardHeader className="bg-slate-50/50 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b">
                        <CardTitle className="text-lg font-bold flex items-center gap-3">
                          <div className="bg-white p-1.5 rounded-md border shadow-sm shrink-0">
                            <Dumbbell size={18} className="text-slate-700" />
                          </div>
                          {ex.name}
                        </CardTitle>
                        <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                          <span className="bg-white border px-2 py-1 rounded-md flex items-center gap-1">
                            <ListChecks size={14} className="text-slate-500" /> {ex.sets} Sets × {ex.reps}
                          </span>
                          <span className="bg-white border px-2 py-1 rounded-md flex items-center gap-1">
                            <Clock size={14} className="text-slate-500" /> {ex.rest} Rest
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4 bg-white">
                        <div className="flex gap-2 items-start text-sm text-slate-600 leading-relaxed">
                          <Info size={16} className="text-slate-400 mt-0.5 shrink-0" />
                          <p>
                            <span className="font-bold text-slate-900 mr-1">Trainer Tip:</span>
                            {ex.tip || ex.instructions || "Focus on controlled eccentric movement and mind-muscle connection."}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl mb-2">🧘</span>
                    <p className="font-bold text-slate-900">Active Recovery Day</p>
                    <p className="text-sm text-slate-500">Hydrate, stretch, and allow your muscles to repair.</p>
                  </div>
                )}
              </div>
            </section>
          ))
        ) : (
          <div className="p-10 text-center bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-amber-800 font-bold">Unrecognized Plan Format</p>
            <pre className="text-left mt-6 text-[10px] bg-slate-900 text-slate-300 p-4 rounded-lg overflow-auto max-h-60">
              {JSON.stringify(workoutPlan, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
