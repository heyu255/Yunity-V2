'use client'

import { useState } from 'react'
import { generateWorkoutPlan, saveWorkoutPlan } from '@/app/dashboard/ai-actions'
import { createCheckoutSession } from '@/app/dashboard/stripe-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lock, Loader2, Dumbbell, CheckCircle2, Save, RefreshCw, StickyNote } from 'lucide-react'
import { toast } from 'sonner'

const Textarea = ({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={`w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none ${props.className ?? ''}`}
  />
)

interface WorkoutGeneratorProps {
  isPremium: boolean
  goal: string
  initialPlan: any
  initialPlanName?: string | null
  editorMode?: boolean
}

export default function WorkoutGenerator({ isPremium, goal, initialPlan, initialPlanName, editorMode }: WorkoutGeneratorProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [plan, setPlan] = useState(initialPlan)
  const [isSaved, setIsSaved] = useState(!!initialPlan)
  const [planName, setPlanName] = useState('')
  const [activePlanName, setActivePlanName] = useState(initialPlanName ?? null)
  const [notes, setNotes] = useState('')

  async function handleGenerate() {
    setLoading(true)
    try {
      const data = await generateWorkoutPlan(notes.trim() || undefined)
      setPlan(data)
      setIsSaved(false)
      setPlanName('')
    } catch (error) {
      console.error('Failed to generate plan:', error)
      toast.error('Failed to generate plan. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!plan) return
    setSaving(true)
    try {
      await saveWorkoutPlan(planName, plan)
      setIsSaved(true)
      setActivePlanName(planName.trim() || 'My Workout Plan')
      toast.success('Plan saved!')
    } catch {
      toast.error('Failed to save plan. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!isPremium) {
    return (
      <Card className="border-2 border-slate-200 bg-slate-100/60 p-12 text-center">
        <Lock className="mx-auto mb-4 h-12 w-12 text-slate-700" />
        <h2 className="text-2xl font-bold text-slate-900">Unlock Your 7-Day Trainer</h2>
        <p className="text-slate-600 mb-8 max-w-sm mx-auto">
          Access custom weekly splits, sets, and reps designed by AI for your {goal} goal.
        </p>
        <Button
          onClick={() => createCheckoutSession()}
          className="rounded-full bg-slate-900 px-8 py-6 text-lg text-white transition-all hover:bg-slate-800"
        >
          Upgrade to Premium
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Save bar — shown after generating until saved */}
      {plan && !isSaved && (
        <div className="animate-in slide-in-from-top-2 fade-in flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <Save size={18} className="text-amber-600 shrink-0" />
          <Input
            placeholder="Name this plan (e.g. Push Pull Legs)"
            value={planName}
            onChange={e => setPlanName(e.target.value)}
            className="h-8 border-amber-200 bg-white text-sm"
          />
          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="shrink-0 bg-slate-900 hover:bg-slate-700 text-white gap-1.5"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Plan
          </Button>
        </div>
      )}

      {/* Regenerate button + notes — only when showing a saved plan */}
      {plan && isSaved && (
        <div className="animate-in slide-in-from-top-2 fade-in space-y-3">
          {/* Customization notes — prominent */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <StickyNote size={15} className="text-amber-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-900">Customize your next plan</p>
                <p className="text-xs text-amber-700">Tell the AI about injuries, equipment, preferences, or anything you want different.</p>
              </div>
            </div>
            <Textarea
              rows={3}
              placeholder="e.g. I have a bad knee, dumbbells only, shorter sessions, no pull-ups..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              disabled={loading}
              className="border-amber-200 bg-white focus:ring-amber-400"
            />
          </div>

          {/* Generate new plan button */}
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full gap-2 bg-slate-900 hover:bg-slate-700 text-white font-semibold py-2.5"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw size={14} />}
            {loading ? 'Generating...' : 'Generate a New Plan'}
          </Button>
        </div>
      )}

      {/* Notes + Generate — no plan yet */}
      {!plan && (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <StickyNote size={15} className="text-slate-400" />
              Customization Notes <span className="font-normal text-slate-400">(optional)</span>
            </div>
            <Textarea
              rows={3}
              placeholder="e.g. I have a bad knee, I only have dumbbells, I prefer shorter sessions, no pull-ups..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="flex w-full flex-col gap-4 border-2 border-dashed border-slate-300 bg-white py-20 text-slate-700 transition-all hover:border-slate-500 hover:bg-slate-50"
          >
            {loading ? (
              <Loader2 className="h-10 w-10 animate-spin" />
            ) : (
              <Dumbbell className="h-10 w-10" />
            )}
            <span className="text-xl font-bold">
              {loading ? 'Building your plan...' : `Build My 7-Day ${goal} Split`}
            </span>
          </Button>
        </div>
      )}

      {/* Plan tabs — hidden in editor mode to avoid duplicate weekly view */}
      {plan && !editorMode && (
        <Tabs defaultValue={plan.days[0]?.day} className="w-full">
          <div className="overflow-x-auto pb-1">
          <TabsList className="grid grid-cols-7 w-full min-w-[420px] h-14 bg-slate-100 p-1.5 rounded-xl">
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
          </div>

          {plan.days.map((d: any) => (
            <TabsContent
              key={d.day}
              value={d.day}
              className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/80 border-b py-4">
                  <CardTitle className="flex justify-between items-center">
                    <span className="text-xl font-black tracking-tight text-slate-900">{d.day}</span>
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
                          className="group flex items-start gap-4 rounded-xl border border-transparent p-4 transition-all hover:border-slate-200 hover:bg-slate-50"
                        >
                          <div className="mt-1 rounded-lg bg-slate-200 p-1.5 transition-colors group-hover:bg-slate-900">
                            <CheckCircle2 size={16} className="text-slate-700 group-hover:text-white" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-bold text-slate-900 leading-none">{ex.name}</p>
                            <p className="text-sm text-slate-500 font-medium">
                              {ex.sets} sets × {ex.reps} • <span className="text-slate-500">{ex.rest} rest</span>
                            </p>
                            {ex.tip && (
                              <p className="mt-2 rounded border-l-2 border-slate-300 bg-slate-50 p-2 text-xs italic text-slate-400">
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
