import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Utensils, Flame, Info, Scale } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface MealPlanPageProps {
  params: Promise<{ id: string }>
}

export default async function MealPlanDetailPage({ params }: MealPlanPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: mp, error } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !mp) notFound()

  const plan = mp.plan

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 px-4">
      <Link href="/dashboard/nutrition">
        <Button variant="ghost" className="gap-2 pl-0 text-slate-500 hover:text-slate-900">
          <ChevronLeft size={16} /> Back to Nutrition
        </Button>
      </Link>

      <header className="space-y-4">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">{mp.name}</h1>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-slate-700">
            <Flame size={16} />
            <span className="font-bold">{plan.total_macros.protein}g Protein</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-slate-700">
            <Scale size={16} />
            <span className="font-bold">{plan.total_macros.carbs}g Carbs</span>
          </div>
        </div>
      </header>

      <div className="grid gap-6">
        {plan.meals.map((meal: any, i: number) => (
          <Card key={i} className="overflow-hidden border-slate-200 transition-colors hover:border-slate-300">
            <CardHeader className="bg-slate-50/50 py-4 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-3">
                <div className="rounded-md border bg-white p-1.5 text-slate-700 shadow-sm">
                  <Utensils size={18} />
                </div>
                {meal.name}
              </CardTitle>
              <span className="text-sm font-bold text-slate-500">{meal.calories} kcal</span>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-slate-900 font-semibold">{meal.food}</p>
              <p className="text-sm text-slate-500 mt-1 italic">{meal.macros}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {plan.nutrition_tip && (
        <div className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-100 p-6">
          <Info className="shrink-0 text-slate-600" />
          <div>
            <p className="font-bold text-slate-900">Nutritionist Tip</p>
            <p className="text-sm text-slate-600">{plan.nutrition_tip}</p>
          </div>
        </div>
      )}
    </div>
  )
}