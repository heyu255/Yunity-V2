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
        <Button variant="ghost" className="gap-2 text-slate-500 hover:text-orange-600 pl-0">
          <ChevronLeft size={16} /> Back to Nutrition
        </Button>
      </Link>

      <header className="space-y-4">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">{mp.name}</h1>
        <div className="flex flex-wrap gap-3">
          <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-xl border border-orange-100 flex items-center gap-2">
            <Flame size={16} />
            <span className="font-bold">{plan.total_macros.protein}g Protein</span>
          </div>
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-2">
            <Scale size={16} />
            <span className="font-bold">{plan.total_macros.carbs}g Carbs</span>
          </div>
        </div>
      </header>

      <div className="grid gap-6">
        {plan.meals.map((meal: any, i: number) => (
          <Card key={i} className="border-slate-200 overflow-hidden hover:border-orange-200 transition-colors">
            <CardHeader className="bg-slate-50/50 py-4 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-3">
                <div className="bg-white p-1.5 rounded-md border shadow-sm text-orange-600">
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
        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex gap-4">
          <Info className="text-indigo-500 shrink-0" />
          <div>
            <p className="font-bold text-indigo-900">Nutritionist Tip</p>
            <p className="text-indigo-700 text-sm">{plan.nutrition_tip}</p>
          </div>
        </div>
      )}
    </div>
  )
}