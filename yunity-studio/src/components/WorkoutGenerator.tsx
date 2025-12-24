'use client'
import { useState } from 'react'
import { generateWorkoutPlan } from '@/app/dashboard/ai-actions'
import { createCheckoutSession } from '@/app/dashboard/stripe-actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lock, Loader2, Dumbbell, Calendar, CheckCircle2 } from 'lucide-react'

export default function WorkoutGenerator({ isPremium, goal }: { isPremium: boolean, goal: string }) {
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<any>(null)

  async function handleGenerate() {
    setLoading(true)
    const data = await generateWorkoutPlan() // Make sure this function is updated in ai-actions.ts to return 7 days
    setPlan(data)
    setLoading(false)
  }

  if (!isPremium) {
    return (
      <Card className="border-2 border-indigo-100 bg-indigo-50/30 p-12 text-center">
        <Lock className="mx-auto h-12 w-12 text-indigo-600 mb-4" />
        <h2 className="text-2xl font-bold text-indigo-900">Unlock Your 7-Day Trainer</h2>
        <p className="text-slate-600 mb-8 max-w-sm mx-auto">Access custom weekly splits, sets, and reps designed by AI for your {goal} goal.</p>
        <Button onClick={() => createCheckoutSession()} className="bg-indigo-600 px-8 py-6 text-lg rounded-full">
          Upgrade to Premium
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {!plan ? (
        <Button onClick={handleGenerate} disabled={loading} className="w-full py-12 bg-white border-2 border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50">
          {loading ? <Loader2 className="animate-spin" /> : <Dumbbell className="mr-2" />}
          Build My 7-Day {goal} Split
        </Button>
      ) : (
        <Tabs defaultValue="Monday" className="w-full">
          <TabsList className="grid grid-cols-7 w-full h-12 bg-slate-100 p-1">
            {plan.days.map((d: any) => (
              <TabsTrigger key={d.day} value={d.day} className="text-[10px] md:text-xs">
                {d.day.substring(0, 3)}
              </TabsTrigger>
            ))}
          </TabsList>
          {plan.days.map((d: any) => (
            <TabsContent key={d.day} value={d.day} className="mt-6 animate-in fade-in slide-in-from-bottom-2">
              <Card>
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle className="flex justify-between items-center">
                    <span className="text-indigo-600">{d.day}</span>
                    <span className="text-sm font-normal text-slate-500">{d.focus}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {d.exercises.length > 0 ? d.exercises.map((ex: any, i: number) => (
                    <div key={i} className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="mt-1 bg-green-100 p-1 rounded-full"><CheckCircle2 size={14} className="text-green-600" /></div>
                      <div>
                        <p className="font-bold text-slate-900">{ex.name}</p>
                        <p className="text-sm text-slate-500">{ex.sets} sets x {ex.reps} • {ex.rest} rest</p>
                        <p className="text-xs text-indigo-500 mt-1 italic">Pro Tip: {ex.tip}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-slate-400 font-medium">Rest Day - Recovery is part of the process!</div>
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