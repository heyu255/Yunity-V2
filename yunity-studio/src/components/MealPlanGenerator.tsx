'use client' // Client component: handles UI state and triggers server action

import { useState } from 'react'
import { generateMealPlan } from '@/app/dashboard/ai-actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Loader2, Utensils, Zap, Flame, Beef, Droplets } from 'lucide-react'

export default function MealPlanGenerator({ calories, initialPlan }: { calories: number, initialPlan: any }) {
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState(initialPlan) // prefill with latest saved plan (or null)

  // Standard macro split (Carbs 40%, Protein 30%, Fats 30%) derived from calories
  const macros = {
    carbs: Math.round((calories * 0.4) / 4),
    protein: Math.round((calories * 0.3) / 4),
    fats: Math.round((calories * 0.3) / 9),
  }

  // Calls the server action to fetch a fresh AI meal plan, then renders it.
  async function handleGenerate() {
    setLoading(true)
    const data = await generateMealPlan()
    setPlan(data)
    setLoading(false)
  }

  return (
    <div className="space-y-8">
      {/* Macro Goals Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none bg-slate-100/70 shadow-sm">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="rounded-lg bg-amber-100 p-2 text-amber-700 ring-1 ring-amber-200"><Zap size={20} /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-tight text-slate-600">Carbohydrates</p>
              <p className="text-2xl font-black text-slate-900">{macros.carbs}g</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-slate-100/70 shadow-sm">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="rounded-lg bg-rose-100 p-2 text-rose-700 ring-1 ring-rose-200"><Beef size={20} /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-tight text-slate-600">Protein</p>
              <p className="text-2xl font-black text-slate-900">{macros.protein}g</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-slate-100/70 shadow-sm">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="rounded-lg bg-cyan-100 p-2 text-cyan-700 ring-1 ring-cyan-200"><Droplets size={20} /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-tight text-slate-600">Fats</p>
              <p className="text-2xl font-black text-slate-900">{macros.fats}g</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      {!plan ? (
        /* Empty State / "Ready?" section - DISAPPEARS after plan generated */
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-center bg-white">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <Sparkles className="h-8 w-8 text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Ready for your AI Meal Plan?</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-8">
            Our AI will architect a custom 1-day menu specifically to hit your {calories} kcal target.
          </p>
          <Button 
            onClick={handleGenerate} 
            disabled={loading}
            className="h-12 rounded-full bg-slate-900 px-8 text-white shadow-lg transition-all hover:bg-slate-800"
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Architecting...</>
            ) : (
              "Generate AI Plan"
            )}
          </Button>
        </div>
      ) : (
        /* The Generated Result Section */
        <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <Utensils className="h-5 w-5 text-slate-700" /> 
              Daily Menu Strategy
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setPlan(null)} className="text-slate-400 hover:text-red-500">
              Reset Plan
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {plan.meals.map((meal: any, i: number) => (
              <Card key={i} className="border-none shadow-md bg-white">
                <CardHeader className="pb-2 bg-slate-50/50 rounded-t-xl">
                  <CardTitle className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
                    {meal.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="font-bold text-lg text-slate-900 leading-tight mb-3">{meal.food}</p>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                      {meal.calories} kcal
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {meal.macros}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* New Soft UI Suggestion Box */}
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm">
            <div className="flex gap-4 items-start">
              <div className="rounded-xl bg-slate-900 p-2 shadow-md">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="mb-1 text-xs font-black uppercase tracking-widest text-slate-900">Nutritionist Insight</h4>
                <p className="text-sm italic leading-relaxed text-slate-600">
                  "{plan.nutrition_tip}"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}