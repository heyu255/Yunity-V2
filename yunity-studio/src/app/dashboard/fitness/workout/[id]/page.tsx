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
  const { id } = await params // route param (workout id)
  const supabase = await createClient()

  // Auth guard: must be logged in
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch the workout by id
  const { data: workout, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !workout) notFound()

  const workoutPlan = workout.plan

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 px-4">
      {/* Navigation */}
      <Link href="/dashboard/fitness">
        <Button variant="ghost" className="gap-2 text-slate-500 hover:text-indigo-600 pl-0">
          <ChevronLeft size={16} /> Back to Trainer
        </Button>
      </Link>

      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          {workoutPlan.split_name || workout.name}
        </h1>
        <p className="text-slate-500 font-medium">
          Plan created on {new Date(workout.created_at).toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </header>

      {/* Render the Nested AI Plan (Days -> Exercises) */}
      <div className="space-y-12">
        {workoutPlan.days ? (
          workoutPlan.days.map((day: any, dayIdx: number) => (
            <section key={dayIdx} className="space-y-6">
              {/* Day Header */}
              <div className="flex items-center gap-4">
                <div className="h-8 w-1 bg-indigo-600 rounded-full" />
                <h2 className="text-2xl font-bold text-slate-900">{day.day}</h2>
                <span className="text-slate-400 font-medium">— {day.focus}</span>
              </div>

              <div className="grid gap-4">
                {day.exercises && day.exercises.length > 0 ? (
                  day.exercises.map((ex: any, exIdx: number) => (
                    <Card key={exIdx} className="border-slate-200 shadow-sm overflow-hidden hover:border-indigo-200 transition-colors">
                      <CardHeader className="bg-slate-50/50 py-4 flex flex-row items-center justify-between border-b">
                        <CardTitle className="text-lg font-bold flex items-center gap-3">
                          <div className="bg-white p-1.5 rounded-md border shadow-sm">
                            <Dumbbell size={18} className="text-indigo-600" />
                          </div>
                          {ex.name}
                        </CardTitle>
                        <div className="flex gap-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                          <span className="bg-white border px-2 py-1 rounded-md flex items-center gap-1">
                            <ListChecks size={14} className="text-indigo-500" /> {ex.sets} Sets × {ex.reps}
                          </span>
                          <span className="bg-white border px-2 py-1 rounded-md flex items-center gap-1">
                            <Clock size={14} className="text-indigo-500" /> {ex.rest} Rest
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
          /* Fallback for old data or mismatched structures */
          <div className="p-10 text-center bg-amber-50 rounded-xl border border-amber-200">
             <p className="text-amber-800 font-bold">Unrecognized Plan Format</p>
             <p className="text-amber-600 text-sm mt-1">We couldn't parse this specific workout split structure.</p>
             <pre className="text-left mt-6 text-[10px] bg-slate-900 text-slate-300 p-4 rounded-lg overflow-auto max-h-60">
                {JSON.stringify(workoutPlan, null, 2)}
             </pre>
          </div>
        )}
      </div>
    </div>
  )
}