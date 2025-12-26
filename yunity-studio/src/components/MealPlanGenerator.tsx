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
        <Card className="border-none bg-orange-50/50 shadow-sm">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><Zap size={20} /></div>
            <div>
              <p className="text-xs font-bold text-orange-800 uppercase tracking-tight">Carbohydrates</p>
              <p className="text-2xl font-black text-orange-900">{macros.carbs}g</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-red-50/50 shadow-sm">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-2 bg-red-100 rounded-lg text-red-600"><Beef size={20} /></div>
            <div>
              <p className="text-xs font-bold text-red-800 uppercase tracking-tight">Protein</p>
              <p className="text-2xl font-black text-red-900">{macros.protein}g</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-yellow-50/50 shadow-sm">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600"><Droplets size={20} /></div>
            <div>
              <p className="text-xs font-bold text-yellow-800 uppercase tracking-tight">Fats</p>
              <p className="text-2xl font-black text-yellow-900">{macros.fats}g</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      {!plan ? (
        /* Empty State / "Ready?" section - DISAPPEARS after plan generated */
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-center bg-white">
          <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center mb-6">
            <Sparkles className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Ready for your AI Meal Plan?</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-8">
            Our AI will architect a custom 1-day menu specifically to hit your {calories} kcal target.
          </p>
          <Button 
            onClick={handleGenerate} 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-full shadow-lg shadow-blue-200 transition-all"
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
              <Utensils className="h-5 w-5 text-blue-600" /> 
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
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
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
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/50 to-white p-6 shadow-sm">
            <div className="flex gap-4 items-start">
              <div className="bg-blue-600 p-2 rounded-xl shadow-md shadow-blue-200">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-black text-blue-900 text-xs uppercase tracking-widest mb-1">Nutritionist Insight</h4>
                <p className="text-slate-600 leading-relaxed text-sm italic italic">
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