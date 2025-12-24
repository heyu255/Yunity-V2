'use client'

import { useState, useEffect } from 'react'
import { generateWorkoutPlan } from '@/app/dashboard/ai-actions'
import { createCheckoutSession } from '@/app/dashboard/stripe-actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lock, Loader2, Dumbbell, Calendar, CheckCircle2, RefreshCw } from 'lucide-react'

interface WorkoutGeneratorProps {
  isPremium: boolean
  goal: string
  initialPlan: any
}

export default function WorkoutGenerator({ isPremium, goal, initialPlan }: WorkoutGeneratorProps) {
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState(initialPlan)

  // FIX: This effect ensures the plan stays visible when navigating between pages
  useEffect(() => {
    if (initialPlan) {
      setPlan(initialPlan)
    }
  }, [initialPlan])

  async function handleGenerate() {
    setLoading(true)
    try {
      const data = await generateWorkoutPlan()
      setPlan(data)
    } catch (error) {
      console.error("Failed to generate plan:", error)
    } finally {
      setLoading(false)
    }
  }

  // Premium Lock State
  if (!isPremium) {
    return (
      <Card className="border-2 border-indigo-100 bg-indigo-50/30 p-12 text-center">
        <Lock className="mx-auto h-12 w-12 text-indigo-600 mb-4" />
        <h2 className="text-2xl font-bold text-indigo-900">Unlock Your 7-Day Trainer</h2>
        <p className="text-slate-600 mb-8 max-w-sm mx-auto">
          Access custom weekly splits, sets, and reps designed by AI for your {goal} goal.
        </p>
        <Button 
          onClick={() => createCheckoutSession()} 
          className="bg-indigo-600 px-8 py-6 text-lg rounded-full hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          Upgrade to Premium
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Regenerate Button (Only shows if a plan exists) */}
      {plan && (
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
             <Calendar className="text-indigo-600" size={20} />
             <span className="font-bold text-slate-700">Active 7-Day Strategy</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleGenerate} 
            disabled={loading}
            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 gap-2 font-semibold"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw size={14} />}
            New Plan
          </Button>
        </div>
      )}

      {/* Main Content Area */}
      {!plan ? (
        <Button 
          onClick={handleGenerate} 
          disabled={loading} 
          className="w-full py-20 bg-white border-2 border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 transition-all flex flex-col gap-4"
        >
          {loading ? (
            <Loader2 className="h-10 w-10 animate-spin" />
          ) : (
            <Dumbbell className="h-10 w-10" />
          )}
          <span className="text-xl font-bold">Build My 7-Day {goal} Split</span>
        </Button>
      ) : (
        <Tabs defaultValue={plan.days[0]?.day} className="w-full">
          <TabsList className="grid grid-cols-7 w-full h-14 bg-slate-100 p-1.5 rounded-xl">
            {plan.days.map((d: any) => (
              <TabsTrigger 
                key={d.day} 
                value={d.day} 
                className="text-[10px] md:text-xs font-bold uppercase tracking-wider"
              >
                {d.day.substring(0, 3)}
              </TabsTrigger>
            ))}
          </TabsList>

          {plan.days.map((d: any) => (
            <TabsContent 
              key={d.day} 
              value={d.day} 
              className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/80 border-b py-4">
                  <CardTitle className="flex justify-between items-center">
                    <span className="text-xl font-black text-indigo-900 tracking-tight">{d.day}</span>
                    <span className="text-sm font-semibold text-slate-500 bg-white px-3 py-1 rounded-full border shadow-sm">
                      {d.focus}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4 bg-white">
                  {d.exercises.length > 0 ? (
                    <div className="grid gap-3">
                      {d.exercises.map((ex: any, i: number) => (
                        <div 
                          key={i} 
                          className="flex items-start gap-4 p-4 rounded-xl border border-transparent hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group"
                        >
                          <div className="mt-1 bg-indigo-100 p-1.5 rounded-lg group-hover:bg-indigo-600 transition-colors">
                            <CheckCircle2 size={16} className="text-indigo-600 group-hover:text-white" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-bold text-slate-900 leading-none">{ex.name}</p>
                            <p className="text-sm text-slate-500 font-medium">
                              {ex.sets} sets × {ex.reps} • <span className="text-indigo-400">{ex.rest} rest</span>
                            </p>
                            {ex.tip && (
                              <p className="text-xs text-slate-400 mt-2 italic bg-slate-50 p-2 rounded border-l-2 border-indigo-200">
                                💡 <span className="font-semibold text-slate-600">Tip:</span> {ex.tip}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 space-y-3">
                      <div className="text-4xl">🧘</div>
                      <p className="text-slate-900 font-bold text-lg">Active Recovery Day</p>
                      <p className="text-slate-500 text-sm max-w-xs mx-auto">
                        Your body grows while you rest. Focus on mobility, hydration, and sleep today.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}