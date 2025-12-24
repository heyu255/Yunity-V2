import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import MealPlanGenerator from '@/components/MealPlanGenerator'
import { Card, CardContent } from '@/components/ui/card'
import { Utensils, ChevronRight, History, Calendar, Flame } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function NutritionPage() {
  const supabase = await createClient()
  
  // 1. Auth & Profile Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').single()
  if (!profile) redirect('/onboarding')

  // 2. Fetch Recent Meal Plans (Top 5)
  const { data: history } = await supabase
    .from('meal_plans')
    .select('id, name, created_at, plan')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* Header Section */}
      <header className="space-y-2 border-b pb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Nutrition Dashboard
        </h1>
        <p className="text-slate-500">
          Smart macros to hit your <span className="text-orange-600 font-bold">{profile.daily_calories_target} kcal</span> daily target.
        </p>
      </header>

      {/* Main AI Generator Component */}
      <MealPlanGenerator calories={profile.daily_calories_target} />

      {/* Meal Plan History Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800">
            <History size={20} className="text-orange-500" />
            <h2 className="text-xl font-bold">Recent Meal Plans</h2>
          </div>
        </div>

        {history && history.length > 0 ? (
          <div className="grid gap-4">
            {history.map((mp) => (
              <Link 
                key={mp.id} 
                href={`/dashboard/nutrition/meal-plan/${mp.id}`}
                className="group block"
              >
                <Card className="hover:border-orange-300 transition-all hover:shadow-md cursor-pointer border-slate-200">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-100 p-2.5 rounded-xl group-hover:bg-orange-50 transition-colors">
                        <Utensils size={20} className="text-slate-500 group-hover:text-orange-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                          {mp.name}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Calendar size={12} /> {new Date(mp.created_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-orange-600 font-medium">
                            <Flame size={12} /> {mp.plan.total_macros.protein}g Protein
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
            <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border">
              <Utensils size={20} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No meal plans saved yet.</p>
            <p className="text-slate-400 text-sm mt-1">Generate your first daily plan above.</p>
          </div>
        )}
      </section>
    </div>
  )
}