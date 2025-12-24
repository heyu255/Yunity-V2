import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Dumbbell, Clock, ListChecks } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface WorkoutPageProps {
  params: Promise<{ id: string }>
}

export default async function WorkoutDetailPage({ params }: WorkoutPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Check Auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Fetch the specific workout
  // Row Level Security (RLS) ensures the user can only fetch their own workout
  const { data: workout, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !workout) {
    notFound() // Shows the Next.js 404 page if ID is invalid or doesn't belong to user
  }

  // The 'plan' is the JSON we saved from OpenAI
  const workoutPlan = workout.plan

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Navigation */}
      <Link href="/dashboard/fitness">
        <Button variant="ghost" className="gap-2 text-slate-500 hover:text-indigo-600 pl-0">
          <ChevronLeft size={16} /> Back to Trainer
        </Button>
      </Link>

      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold text-slate-900">{workout.name}</h1>
        <p className="text-slate-500">
          Generated on {new Date(workout.created_at).toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </header>

      {/* Render the AI Plan */}
      <div className="grid gap-6">
        {/* Check if your AI JSON has 'days' or 'exercises' and map accordingly */}
        {workoutPlan.exercises ? (
          workoutPlan.exercises.map((ex: any, idx: number) => (
            <Card key={idx} className="border-slate-200">
              <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Dumbbell size={18} className="text-indigo-500" />
                  {ex.name}
                </CardTitle>
                <div className="flex gap-4 text-sm font-medium text-slate-600">
                  <span className="flex items-center gap-1">
                    <ListChecks size={14} /> {ex.sets} Sets
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {ex.rest} Rest
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-slate-600 text-sm leading-relaxed">
                  <span className="font-bold text-slate-900">Instructions:</span> {ex.instructions}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="p-10 text-center bg-slate-50 rounded-xl border-2 border-dashed">
             <p className="text-slate-500">This workout format is being processed. Check back in a moment.</p>
             <pre className="text-left mt-4 text-xs bg-slate-900 text-white p-4 rounded overflow-auto">
                {JSON.stringify(workoutPlan, null, 2)}
             </pre>
          </div>
        )}
      </div>
    </div>
  )
}