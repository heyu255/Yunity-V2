export const dynamic = 'force-dynamic'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WorkoutLogger } from '@/components/WorkoutLogger'

export default async function FreeWorkoutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20 px-4">
      <Link href="/dashboard/fitness">
        <Button variant="ghost" className="gap-2 pl-0 text-slate-500 hover:text-slate-900">
          <ChevronLeft size={16} /> Back to Dashboard
        </Button>
      </Link>

      <header className="space-y-1">
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Free Workout
        </p>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Build Your Workout</h1>
        <p className="text-slate-500">Add exercises below and log your sets</p>
      </header>

      <WorkoutLogger
        workoutId={null}
        dayIndex={-1}
        dayName="Free Workout"
        exercises={[]}
        availableExercises={[]}
      />
    </div>
  )
}
