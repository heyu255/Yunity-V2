import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import WorkoutGenerator from '@/components/WorkoutGenerator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { History, ChevronRight, Calendar } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function FitnessPage() {
  const supabase = await createClient()
  
  // 1. Auth & Profile Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').single()
  const isPremium = profile?.is_premium ?? false

  // 2. Fetch Workout History (Top 5)
  const { data: history } = await supabase
    .from('workouts')
    .select('id, name, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Header Section */}
      <header className="flex justify-between items-end border-b pb-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            AI Personal Trainer
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            {isPremium ? 'Your custom 7-day performance strategy is ready.' : 'Upgrade to unlock custom AI workout plans.'}
          </p>
        </div>
        {isPremium && (
          <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-indigo-100">
            Premium Member
          </span>
        )}
      </header>

      {/* Main Generator Component */}
      <WorkoutGenerator isPremium={isPremium} goal={profile?.goal} />

      {/* Workout History Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-slate-800">
          <History size={20} className="text-indigo-500" />
          <h2 className="text-xl font-bold">Recent Plans</h2>
        </div>

        {history && history.length > 0 ? (
          <div className="grid gap-3">
            {history.map((workout) => (
              <Link 
                key={workout.id} 
                href={`/dashboard/fitness/workout/${workout.id}`}
                className="group block"
              >
                <Card className="hover:border-indigo-300 transition-all hover:shadow-md cursor-pointer border-slate-200">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-100 p-2 rounded-lg group-hover:bg-indigo-50 transition-colors">
                        <Calendar size={18} className="text-slate-500 group-hover:text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {workout.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          Generated on {new Date(workout.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
            <CardContent className="p-10 text-center">
              <p className="text-slate-400 text-sm">No workout history yet. Generate your first plan above!</p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}